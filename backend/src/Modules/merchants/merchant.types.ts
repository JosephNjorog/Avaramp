export interface CreateMerchantDto {
  name:          string;
  email?:        string;
  walletAddress?: string;
  mpesaTill?:    string;
  webhookUrl?:   string;
  phone?:        string;
}
