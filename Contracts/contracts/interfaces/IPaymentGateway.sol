// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IPaymentGateway
/// @notice External interface for the AvaRamp PaymentGateway contract.
interface IPaymentGateway {
    // ── Enums ────────────────────────────────────────────────────────────────

    enum PaymentStatus { PENDING, CONFIRMED, SETTLED, REFUNDED, FAILED }

    // ── Structs ──────────────────────────────────────────────────────────────

    struct Payment {
        bytes32       paymentId;
        address       depositor;
        address       merchant;
        uint256       grossAmount;   // USDC deposited (6 dec)
        uint256       protocolFee;   // fee retained by treasury
        uint256       netAmount;     // grossAmount - protocolFee
        uint256       createdAt;
        PaymentStatus status;
    }

    // ── Events ───────────────────────────────────────────────────────────────

    event PaymentCreated(
        bytes32 indexed paymentId,
        address indexed depositor,
        address indexed merchant,
        uint256 grossAmount,
        uint256 protocolFee,
        uint256 netAmount
    );
    event PaymentSettled(bytes32 indexed paymentId, address indexed merchant, uint256 netAmount);
    event PaymentRefunded(bytes32 indexed paymentId, address indexed depositor, uint256 amount);
    event PaymentFailed(bytes32 indexed paymentId);
    event TreasuryWithdrawn(address indexed to, uint256 amount);
    event ProtocolFeeUpdated(uint256 oldBps, uint256 newBps);
    event TreasuryUpdated(address oldTreasury, address newTreasury);

    // ── Functions ────────────────────────────────────────────────────────────

    function deposit(bytes32 paymentId, address merchant, uint256 amount) external;
    function settle(bytes32 paymentId) external;
    function refund(bytes32 paymentId) external;
    function markFailed(bytes32 paymentId) external;
    function withdrawTreasury(uint256 amount) external;
    function setProtocolFee(uint256 newBps) external;
    function setTreasury(address newTreasury) external;
    function getPayment(bytes32 paymentId) external view returns (Payment memory);
    function accruedFees() external view returns (uint256);
}
