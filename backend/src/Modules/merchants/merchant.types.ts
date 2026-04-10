export interface CreateMerchantDto {
  name:             string;
  email?:           string;
  walletAddress?:   string;
  // Payout destination
  payoutType?:      "phone" | "till" | "paybill"; // default: "till"
  payoutAccount?:   string;   // phone, till number, or paybill number
  payoutAccountRef?: string;  // paybill only — account reference
  payoutCurrency?:  string;   // KES | NGN | GHS | TZS | UGX
  // Legacy / convenience aliases
  mpesaTill?:       string;
  webhookUrl?:      string;
  phone?:           string;
}
