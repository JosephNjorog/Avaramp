
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PaymentGateway
 * @notice Accepts USDC deposits, emits payment events, and allows 
 *         treasury withdrawals. Deployed on Avalanche C-Chain.
 */
contract PaymentGateway is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ─── Roles ───────────────────────────────────────────────
    bytes32 public constant TREASURY_ROLE   = keccak256("TREASURY_ROLE");
    bytes32 public constant OPERATOR_ROLE   = keccak256("OPERATOR_ROLE");
    bytes32 public constant MERCHANT_ROLE   = keccak256("MERCHANT_ROLE");

    // ─── State ────────────────────────────────────────────────
    IERC20 public immutable usdc;          // USDC on C-Chain
    address public treasury;
    uint256 public protocolFeeBps;         // e.g. 50 = 0.5%
    
    struct Payment {
        bytes32  paymentId;       // Unique off-chain reference
        address  payer;
        address  merchant;
        uint256  amount;
        uint256  fee;
        uint256  timestamp;
        PaymentStatus status;
    }

    enum PaymentStatus { PENDING, CONFIRMED, SETTLED, REFUNDED, FAILED }

    mapping(bytes32 => Payment)  public payments;
    mapping(address => uint256)  public merchantBalances;
    mapping(bytes32 => bool)     public processedIds; // Idempotency

    // ─── Events ───────────────────────────────────────────────
    event PaymentDeposited(
        bytes32 indexed paymentId,
        address indexed payer,
        address indexed merchant,
        uint256 amount,
        uint256 fee,
        uint256 timestamp
    );
    event PaymentSettled(bytes32 indexed paymentId, uint256 amount);
    event PaymentRefunded(bytes32 indexed paymentId, address to, uint256 amount);
    event TreasuryWithdrawal(address indexed to, uint256 amount);
    event MerchantWithdrawal(address indexed merchant, uint256 amount);
    event ProtocolFeeUpdated(uint256 oldBps, uint256 newBps);

    // ─── Constructor ──────────────────────────────────────────
    constructor(
        address _usdc,
        address _treasury,
        uint256 _feeBps
    ) {
        usdc             = IERC20(_usdc);
        treasury         = _treasury;
        protocolFeeBps   = _feeBps;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TREASURY_ROLE,      _treasury);
        _grantRole(OPERATOR_ROLE,      msg.sender);
    }

    // ─── Core Functions ───────────────────────────────────────

    /**
     * @notice Called by payer wallet — deposits USDC for a payment.
     * @param paymentId   Off-chain UUID (bytes32 encoded)
     * @param merchant    Registered merchant address
     * @param amount      USDC amount (6 decimals)
     */
    function deposit(
        bytes32 paymentId,
        address merchant,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        require(!processedIds[paymentId], "Payment already processed");
        require(hasRole(MERCHANT_ROLE, merchant), "Unregistered merchant");
        require(amount > 0, "Amount must be > 0");

        processedIds[paymentId] = true;

        uint256 fee        = (amount * protocolFeeBps) / 10_000;
        uint256 netAmount  = amount - fee;

        // Pull USDC from payer
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        // Credit merchant balance (net), fee stays for treasury
        merchantBalances[merchant] += netAmount;

        payments[paymentId] = Payment({
            paymentId : paymentId,
            payer     : msg.sender,
            merchant  : merchant,
            amount    : amount,
            fee       : fee,
            timestamp : block.timestamp,
            status    : PaymentStatus.CONFIRMED
        });

        emit PaymentDeposited(
            paymentId, msg.sender, merchant,
            amount, fee, block.timestamp
        );
    }

    /**
     * @notice Mark payment as settled (called by backend operator
     *         after M-Pesa settlement is confirmed).
     */
    function markSettled(bytes32 paymentId)
        external onlyRole(OPERATOR_ROLE)
    {
        Payment storage p = payments[paymentId];
        require(p.status == PaymentStatus.CONFIRMED, "Not confirmable");
        p.status = PaymentStatus.SETTLED;
        emit PaymentSettled(paymentId, p.amount - p.fee);
    }

    /**
     * @notice Refund a failed/disputed payment back to payer.
     */
    function refund(bytes32 paymentId)
        external onlyRole(OPERATOR_ROLE) nonReentrant
    {
        Payment storage p = payments[paymentId];
        require(
            p.status == PaymentStatus.CONFIRMED ||
            p.status == PaymentStatus.PENDING,
            "Not refundable"
        );
        p.status = PaymentStatus.REFUNDED;
        merchantBalances[p.merchant] -= (p.amount - p.fee);
        usdc.safeTransfer(p.payer, p.amount);
        emit PaymentRefunded(paymentId, p.payer, p.amount);
    }

    /**
     * @notice Treasury withdraws accumulated protocol fees.
     */
    function treasuryWithdraw(uint256 amount)
        external onlyRole(TREASURY_ROLE) nonReentrant
    {
        uint256 totalMerchantFunds = _totalMerchantBalances();
        uint256 contractBal        = usdc.balanceOf(address(this));
        uint256 available          = contractBal - totalMerchantFunds;
        require(amount <= available, "Insufficient fee balance");
        usdc.safeTransfer(treasury, amount);
        emit TreasuryWithdrawal(treasury, amount);
    }

    /**
     * @notice Merchant withdraws their earned balance.
     */
    function merchantWithdraw(uint256 amount)
        external nonReentrant whenNotPaused
    {
        require(merchantBalances[msg.sender] >= amount, "Insufficient balance");
        merchantBalances[msg.sender] -= amount;
        usdc.safeTransfer(msg.sender, amount);
        emit MerchantWithdrawal(msg.sender, amount);
    }

    // ─── Admin ────────────────────────────────────────────────
    function setProtocolFee(uint256 newBps) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newBps <= 500, "Max 5%");
        emit ProtocolFeeUpdated(protocolFeeBps, newBps);
        protocolFeeBps = newBps;
    }

    function pause()   external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    // ─── Internal ─────────────────────────────────────────────
    function _totalMerchantBalances() internal view returns (uint256 total) {
        // In prod: maintain a running counter for gas efficiency
        // This is simplified for clarity
    }
}

