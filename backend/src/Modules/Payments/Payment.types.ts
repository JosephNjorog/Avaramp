export interface CreatePaymentDto {
  merchantId:      string;
  userId?:         string;
  amountUsdc:      string;
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
