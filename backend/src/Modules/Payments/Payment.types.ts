export interface CreatePaymentDto {
  merchantId:      string;
  userId?:         string;
  amountFiat?:     string;  // fiat amount merchant wants to receive (e.g. 5000 KES)
  amountUsdc?:     string;  // direct USDC input (legacy / API use)
  fiatCurrency:    string;
  phone?:          string;
  reference?:      string;
  idempotencyKey?: string;
  metadata?:       Record<string, unknown>;
}

export interface PaymentResponse {
  id:             string;
  paymentId:      string;
  depositAddress: string;
  amountUsdc:     string;
  fiatAmount?:    string;
  fiatCurrency?:  string;
  currency?:      string;
  phone?:         string;
  reference?:     string;
  expiresAt:      Date;
  network:        string;
  token:          string;
}
