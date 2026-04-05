// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IMerchantRegistry
/// @notice External interface for the AvaRamp MerchantRegistry contract.
interface IMerchantRegistry {
    struct Merchant {
        address wallet;
        string  name;
        uint16  feeBps;        // custom override; 0 = use protocol default
        bool    active;
        uint256 registeredAt;
        uint256 totalSettled;  // lifetime USDC settled through this merchant (6 dec)
    }

    event MerchantRegistered(address indexed wallet, string name, uint16 feeBps);
    event MerchantDeactivated(address indexed wallet);
    event MerchantReactivated(address indexed wallet);
    event MerchantFeeOverridden(address indexed wallet, uint16 newBps);

    function register(address wallet, string calldata name, uint16 feeBps) external;
    function deactivate(address wallet) external;
    function reactivate(address wallet) external;
    function setFeeOverride(address wallet, uint16 newBps) external;
    function recordSettlement(address wallet, uint256 amount) external;
    function isActive(address wallet) external view returns (bool);
    function getMerchant(address wallet) external view returns (Merchant memory);
    function effectiveFee(address wallet, uint256 defaultBps) external view returns (uint256);
}
