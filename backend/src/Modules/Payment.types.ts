export interface CreatePaymentDto {
  merchantId:     string;
  userId?:        string;
  amountUsdc:     string;
  amountFiat:     string;
  fiatCurrency:   string;
  idempotencyKey?: string;
  metadata?:      Record<string, unknown>;
}
export interface PaymentResponse {
  paymentId:       string;
  depositAddress:  string;
  amountUsdc:      string;
  expiresAt:       Date;
  network:         string;
  token:           string;
}
