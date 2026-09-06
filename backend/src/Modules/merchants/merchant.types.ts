export interface CreateMerchantDto {
  name:             string;
  email?:           string;
  walletAddress?:   string;
  // Payout destination
  payoutType?:      "phone" | "till" | "paybill"; // default: "till"
  payoutAccount?:   string;   // phone, till number, or paybill number
  payoutAccountRef?: string;  // paybill only — account reference
  payoutCurrency?:  string;   // KES | NGN | GHS | TZS | UGX
  mobileNetwork?:   string;   // carrier for "phone" payouts, e.g. "Safaricom", "MTN"
  webhookUrl?:      string;
  phone?:           string;
}
