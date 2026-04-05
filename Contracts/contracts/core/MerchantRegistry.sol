// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "../interfaces/IMerchantRegistry.sol";

/**
 * @title  MerchantRegistry
 * @author AvaRamp
 * @notice Keeps the on-chain registry of approved merchants.
 *         Only the PaymentGateway (GATEWAY_ROLE) and admins may mutate state.
 *
 * @dev Merchants are whitelisted by the AvaRamp operator before they can
 *      receive deposits through the PaymentGateway. This gives AvaRamp
 *      compliance control without custody of funds.
 */
contract MerchantRegistry is IMerchantRegistry, AccessControl {

    // ── Roles ────────────────────────────────────────────────────────────────
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant GATEWAY_ROLE  = keccak256("GATEWAY_ROLE");

    // ── State ────────────────────────────────────────────────────────────────
    mapping(address => Merchant) private _merchants;
    address[] private _merchantList;

    uint256 public totalMerchants;

    // ── Constructor ──────────────────────────────────────────────────────────
    constructor(address admin) {
        require(admin != address(0), "Invalid admin");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(OPERATOR_ROLE,      admin);
    }

    // ── Write — Operator/Admin only ──────────────────────────────────────────

    /**
     * @notice Register a new merchant.
     * @param wallet  The merchant's receiving address.
     * @param name    Human-readable business name stored on-chain.
     * @param feeBps  Custom protocol fee in basis points. 0 = use gateway default.
     *                Max 500 (5 %).
     */
    function register(
        address wallet,
        string  calldata name,
        uint16  feeBps
    ) external onlyRole(OPERATOR_ROLE) {
        require(wallet != address(0),              "Invalid wallet");
        require(bytes(name).length > 0,            "Name required");
        require(feeBps <= 500,                     "Max fee 5%");
        require(!_merchants[wallet].active,        "Already registered");

        _merchants[wallet] = Merchant({
            wallet:       wallet,
            name:         name,
            feeBps:       feeBps,
            active:       true,
            registeredAt: block.timestamp,
            totalSettled: 0
        });
        _merchantList.push(wallet);
        totalMerchants++;

        emit MerchantRegistered(wallet, name, feeBps);
    }

    function deactivate(address wallet) external onlyRole(OPERATOR_ROLE) {
        require(_merchants[wallet].active, "Not active");
        _merchants[wallet].active = false;
        emit MerchantDeactivated(wallet);
    }

    function reactivate(address wallet) external onlyRole(OPERATOR_ROLE) {
        require(!_merchants[wallet].active, "Already active");
        _merchants[wallet].active = true;
        emit MerchantReactivated(wallet);
    }

    /**
     * @notice Override a merchant's protocol fee. Use 0 to restore default.
     */
    function setFeeOverride(address wallet, uint16 newBps)
        external onlyRole(OPERATOR_ROLE)
    {
        require(_merchants[wallet].registeredAt > 0, "Unknown merchant");
        require(newBps <= 500, "Max 5%");
        _merchants[wallet].feeBps = newBps;
        emit MerchantFeeOverridden(wallet, newBps);
    }

    /**
     * @notice Called by the PaymentGateway after each successful settlement
     *         to track lifetime volume per merchant.
     */
    function recordSettlement(address wallet, uint256 amount)
        external onlyRole(GATEWAY_ROLE)
    {
        _merchants[wallet].totalSettled += amount;
    }

    // ── Grant gateway role (admin only) ──────────────────────────────────────

    function setGateway(address gateway) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(gateway != address(0), "Invalid gateway");
        _grantRole(GATEWAY_ROLE, gateway);
    }

    // ── Read ─────────────────────────────────────────────────────────────────

    function isActive(address wallet) external view returns (bool) {
        return _merchants[wallet].active;
    }

    function getMerchant(address wallet) external view returns (Merchant memory) {
        return _merchants[wallet];
    }

    /**
     * @notice Returns the fee in bps that applies to this merchant.
     *         If the merchant has a custom override (feeBps > 0), use that.
     *         Otherwise fall back to the gateway's defaultBps.
     */
    function effectiveFee(address wallet, uint256 defaultBps)
        external view returns (uint256)
    {
        uint16 override_ = _merchants[wallet].feeBps;
        return override_ > 0 ? override_ : defaultBps;
    }

    /**
     * @notice Paginated merchant list for off-chain indexing.
     */
    function getMerchants(uint256 offset, uint256 limit)
        external view returns (Merchant[] memory list)
    {
        uint256 len = _merchantList.length;
        if (offset >= len) return new Merchant[](0);
        uint256 end = offset + limit > len ? len : offset + limit;
        list = new Merchant[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            list[i - offset] = _merchants[_merchantList[i]];
        }
    }
}
