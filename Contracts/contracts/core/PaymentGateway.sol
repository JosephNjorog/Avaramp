// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IPaymentGateway.sol";
import "../interfaces/IMerchantRegistry.sol";

/**
 * @title  PaymentGateway
 * @author AvaRamp
 * @notice Core contract for USDC payment processing on Avalanche C-Chain.
 *
 * @dev Flow:
 *   1. Backend generates a unique paymentId off-chain and derives a deposit
 *      address for the payer.
 *   2. Payer approves this contract then calls `deposit()` (or the backend
 *      sweeps from the HD-derived address into the gateway on their behalf).
 *   3. Backend M-Pesa settlement worker confirms mobile money delivery, then
 *      calls `settle()` which releases net USDC to the merchant.
 *   4. If anything goes wrong `refund()` returns gross USDC to the depositor
 *      and `markFailed()` records the failure without moving funds.
 *
 * Revenue model:
 *   Every deposit splits `grossAmount * protocolFeeBps / 10_000` into
 *   `accruedFees`. AvaRamp founders call `withdrawTreasury()` (TREASURY_ROLE)
 *   to pull accumulated USDC to a multisig / treasury address.
 */
contract PaymentGateway is IPaymentGateway, AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ── Roles ────────────────────────────────────────────────────────────────
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");

    // ── Constants ────────────────────────────────────────────────────────────
    uint256 public constant MAX_FEE_BPS = 500; // 5 %

    // ── State ────────────────────────────────────────────────────────────────
    IERC20              public immutable usdc;
    IMerchantRegistry   public immutable registry;

    uint256 public protocolFeeBps; // default fee (basis points)
    uint256 public accruedFees;    // total USDC held for treasury withdrawal
    address public treasury;       // address that receives withdrawn fees

    mapping(bytes32 => Payment) private _payments;

    // ── Constructor ──────────────────────────────────────────────────────────

    /**
     * @param admin_       Address granted DEFAULT_ADMIN_ROLE + TREASURY_ROLE.
     * @param usdc_        USDC token address (6 decimals on Avalanche).
     * @param registry_    Deployed MerchantRegistry address.
     * @param feeBps_      Initial protocol fee in basis points (e.g. 150 = 1.5 %).
     * @param treasury_    Initial treasury / multisig address.
     */
    constructor(
        address admin_,
        address usdc_,
        address registry_,
        uint256 feeBps_,
        address treasury_
    ) {
        require(admin_    != address(0), "Invalid admin");
        require(usdc_     != address(0), "Invalid USDC");
        require(registry_ != address(0), "Invalid registry");
        require(treasury_ != address(0), "Invalid treasury");
        require(feeBps_   <= MAX_FEE_BPS, "Fee > 5%");

        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(OPERATOR_ROLE,      admin_);
        _grantRole(TREASURY_ROLE,      admin_);

        usdc           = IERC20(usdc_);
        registry       = IMerchantRegistry(registry_);
        protocolFeeBps = feeBps_;
        treasury       = treasury_;
    }

    // ── Depositor ────────────────────────────────────────────────────────────

    /**
     * @notice Deposit USDC for a payment. Caller must have pre-approved this
     *         contract for `amount` USDC.
     *
     * @param paymentId  Off-chain UUID encoded as bytes32.
     * @param merchant   Registered merchant wallet address.
     * @param amount     Gross USDC amount (6 decimals).
     */
    function deposit(
        bytes32 paymentId,
        address merchant,
        uint256 amount
    ) external override nonReentrant whenNotPaused {
        require(amount > 0,                          "Amount is zero");
        require(_payments[paymentId].createdAt == 0, "Duplicate paymentId");
        require(registry.isActive(merchant),         "Merchant not active");

        // Determine effective fee for this merchant
        uint256 feeBps   = registry.effectiveFee(merchant, protocolFeeBps);
        uint256 fee      = (amount * feeBps) / 10_000;
        uint256 net      = amount - fee;

        // Pull USDC from depositor into this contract
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        // Accumulate protocol fee
        accruedFees += fee;

        // Record payment
        _payments[paymentId] = Payment({
            paymentId:   paymentId,
            depositor:   msg.sender,
            merchant:    merchant,
            grossAmount: amount,
            protocolFee: fee,
            netAmount:   net,
            createdAt:   block.timestamp,
            status:      PaymentStatus.PENDING
        });

        emit PaymentCreated(paymentId, msg.sender, merchant, amount, fee, net);
    }

    // ── Operator ─────────────────────────────────────────────────────────────

    /**
     * @notice Mark a payment settled and release net USDC to the merchant.
     *         Called by the backend after M-Pesa delivery is confirmed.
     */
    function settle(bytes32 paymentId)
        external override onlyRole(OPERATOR_ROLE) nonReentrant
    {
        Payment storage p = _payments[paymentId];
        require(p.createdAt != 0,                    "Unknown payment");
        require(p.status == PaymentStatus.PENDING,   "Not pending");

        p.status = PaymentStatus.SETTLED;

        // Release net amount to merchant
        usdc.safeTransfer(p.merchant, p.netAmount);

        // Notify registry of volume
        registry.recordSettlement(p.merchant, p.netAmount);

        emit PaymentSettled(paymentId, p.merchant, p.netAmount);
    }

    /**
     * @notice Refund the gross USDC back to the depositor (no fee taken).
     *         Used when M-Pesa delivery fails and cannot be recovered.
     */
    function refund(bytes32 paymentId)
        external override onlyRole(OPERATOR_ROLE) nonReentrant
    {
        Payment storage p = _payments[paymentId];
        require(p.createdAt != 0,                    "Unknown payment");
        require(p.status == PaymentStatus.PENDING,   "Not pending");

        p.status = PaymentStatus.REFUNDED;

        // Return the fee we earlier added to accruedFees
        accruedFees -= p.protocolFee;

        // Return full gross amount to depositor
        usdc.safeTransfer(p.depositor, p.grossAmount);

        emit PaymentRefunded(paymentId, p.depositor, p.grossAmount);
    }

    /**
     * @notice Mark a payment as failed without moving funds.
     *         Net USDC remains in the contract and is swept by admin manually.
     *         Used for on-chain edge cases; prefer `refund()` in normal flow.
     */
    function markFailed(bytes32 paymentId)
        external override onlyRole(OPERATOR_ROLE)
    {
        Payment storage p = _payments[paymentId];
        require(p.createdAt != 0,                    "Unknown payment");
        require(p.status == PaymentStatus.PENDING,   "Not pending");

        p.status = PaymentStatus.FAILED;
        emit PaymentFailed(paymentId);
    }

    // ── Treasury (founder revenue) ───────────────────────────────────────────

    /**
     * @notice Withdraw accumulated protocol fees to the treasury address.
     *         Only callable by TREASURY_ROLE (founder multisig).
     *
     * @param amount  USDC amount to withdraw (6 decimals). Must be <= accruedFees.
     */
    function withdrawTreasury(uint256 amount)
        external override onlyRole(TREASURY_ROLE) nonReentrant
    {
        require(amount > 0,              "Zero amount");
        require(amount <= accruedFees,   "Insufficient fees");

        accruedFees -= amount;
        usdc.safeTransfer(treasury, amount);

        emit TreasuryWithdrawn(treasury, amount);
    }

    // ── Admin configuration ──────────────────────────────────────────────────

    /**
     * @notice Update the default protocol fee.
     *         Individual merchants can have a lower override via MerchantRegistry.
     */
    function setProtocolFee(uint256 newBps)
        external override onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(newBps <= MAX_FEE_BPS, "Fee > 5%");
        emit ProtocolFeeUpdated(protocolFeeBps, newBps);
        protocolFeeBps = newBps;
    }

    /**
     * @notice Update the treasury address (e.g. rotate multisig).
     */
    function setTreasury(address newTreasury)
        external override onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(newTreasury != address(0), "Zero address");
        emit TreasuryUpdated(treasury, newTreasury);
        treasury = newTreasury;
    }

    /**
     * @notice Pause all deposits (emergencies only). Settlements + refunds still work.
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // ── Read ─────────────────────────────────────────────────────────────────

    function getPayment(bytes32 paymentId)
        external view override returns (Payment memory)
    {
        return _payments[paymentId];
    }
}
