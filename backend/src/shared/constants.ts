// Platform fee taken on every settlement, in basis points (300 = 3%).
// Per-merchant discounts (Growth/Enterprise tiers) override this via Merchant.feeOverrideBps.
export const DEFAULT_FEE_BPS = 300;

// Payments at or above this USDC-equivalent amount require the merchant's
// linked user account to have kycStatus === "VERIFIED".
export const KYC_THRESHOLD_USDC = 500;
