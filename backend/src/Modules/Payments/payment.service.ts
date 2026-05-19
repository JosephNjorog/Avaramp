import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { PaymentRepository } from "./Payment.repository";
import { CreatePaymentDto, PaymentResponse } from "./Payment.types";
import { fxService } from "../Fx/fx.service";
import { settlementQueue } from "../../shared/queue/queues";
import { NotFoundError, ValidationError } from "../../shared/Utils/Errors";
import { prisma } from "../../shared/database/prisma";
import { logger } from "../../shared/Utils/Logger";

const repo = new PaymentRepository();

// Payments expire after 30 minutes
const EXPIRY_MINUTES = 30;

const PAYSTACK_BASE   = "https://api.paystack.co";
const paystackSecret  = () => process.env.PAYSTACK_SECRET_KEY!;
const FRONTEND_URL    = () => process.env.FRONTEND_URL || "http://localhost:3001";

// ── Initialize a Paystack transaction (collect money from customer) ───────────
async function initializePaystackTransaction(opts: {
  paymentId:   string;
  email:       string;
  amountFiat:  string;
  currency:    string;
  reference:   string;
  phone?:      string;
}): Promise<{ authorizationUrl: string; accessCode: string }> {
  // Paystack amounts are in the smallest currency unit (× 100)
  const amountInSmallestUnit = Math.round(parseFloat(opts.amountFiat) * 100);

  const payload: Record<string, unknown> = {
    email:        opts.email,
    amount:       amountInSmallestUnit,
    currency:     opts.currency,
    reference:    opts.reference,
    callback_url: `${FRONTEND_URL()}/pay/${opts.paymentId}`,
    metadata: {
      payment_id: opts.paymentId,
      phone:      opts.phone ?? "",
    },
  };

  const { data } = await axios.post(
    `${PAYSTACK_BASE}/transaction/initialize`,
    payload,
    { headers: { Authorization: `Bearer ${paystackSecret()}` } }
  );

  if (!data.status) {
    throw new Error(`Paystack init failed: ${data.message}`);
  }

  return {
    authorizationUrl: data.data.authorization_url,
    accessCode:       data.data.access_code,
  };
}

export class PaymentService {
  async createPayment(dto: CreatePaymentDto): Promise<PaymentResponse> {
    // Verify merchant exists and is active
    const merchant = await prisma.merchant.findUnique({ where: { id: dto.merchantId } });
    if (!merchant || !merchant.isActive) {
      throw new ValidationError("Merchant not found or inactive");
    }

    // Resolve fiat amount and USDC equivalent (kept for ledger / analytics)
    let amountUsdc: string;
    let fiatAmount: string;
    let rate: number;

    if (dto.amountFiat) {
      rate       = await fxService.getRate(dto.fiatCurrency);
      amountUsdc = (parseFloat(dto.amountFiat) / rate).toFixed(6);
      fiatAmount = parseFloat(dto.amountFiat).toFixed(2);
    } else {
      const converted = await fxService.convert(dto.amountUsdc ?? "0", dto.fiatCurrency);
      amountUsdc = dto.amountUsdc ?? "0";
      fiatAmount = converted.fiatAmount;
      rate       = converted.rate;
    }

    const paymentId  = uuidv4();
    const expiresAt  = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);

    // ── Paystack: initialize transaction to collect payment from customer ──────
    const paystackRef = `avr_${paymentId.replace(/-/g, "").slice(0, 20)}`;

    let authorizationUrl = "";

    if (process.env.PAYSTACK_SKIP_SETTLEMENT === "true") {
      // Dev / test mode: skip real Paystack call
      authorizationUrl = `${FRONTEND_URL()}/pay/${paymentId}?skip=1`;
      logger.warn({ paymentId }, "PAYSTACK_SKIP — using placeholder authorization URL");
    } else {
      try {
        const result = await initializePaystackTransaction({
          paymentId,
          email:      merchant.email,
          amountFiat: fiatAmount,
          currency:   dto.fiatCurrency,
          reference:  paystackRef,
          phone:      dto.phone,
        });
        authorizationUrl = result.authorizationUrl;
      } catch (err: any) {
        logger.error({ paymentId, err: err.message }, "Paystack init failed");
        throw new ValidationError(`Could not initialize payment: ${err.message}`);
      }
    }

    // depositAddress stores the paystackRef so the DB unique constraint is satisfied
    // and existing code that joins on depositAddress continues to work
    const payment = await repo.create({
      id:              paymentId,
      merchantId:      dto.merchantId,
      userId:          dto.userId,
      amountUsdc,
      amountFiat:      fiatAmount,
      fiatCurrency:    dto.fiatCurrency,
      phone:           dto.phone,
      reference:       dto.reference,
      depositAddress:  `paystack:${paystackRef}`,
      depositPk:       "",
      paystackRef,
      authorizationUrl,
      fxRate:          rate,
      fiatAmount,
      expiresAt,
      idempotencyKey:  dto.idempotencyKey,
      metadata:        dto.metadata,
    });

    return {
      id:               payment.id,
      paymentId:        payment.id,
      depositAddress:   payment.depositAddress,
      amountUsdc:       payment.amountUsdc,
      fiatAmount:       payment.amountFiat,
      fiatCurrency:     payment.fiatCurrency,
      currency:         payment.fiatCurrency,
      phone:            payment.phone ?? undefined,
      reference:        payment.reference ?? undefined,
      expiresAt:        payment.expiresAt,
      paystackRef:      payment.paystackRef ?? undefined,
      authorizationUrl: payment.authorizationUrl ?? undefined,
      network:          "paystack",
      token:            payment.fiatCurrency,
    };
  }

  async getPayment(id: string) {
    const payment = await repo.findById(id);
    if (!payment) throw new NotFoundError("Payment");
    const { depositPk: _pk, ...safe } = payment as any;
    return safe;
  }

  async listPayments(filters: {
    merchantId?: string;
    userId?:     string;
    status?:     string;
    limit?:      number;
    offset?:     number;
  }) {
    const { PaymentStatus } = await import("@prisma/client");
    const status = filters.status && (PaymentStatus as any)[filters.status]
      ? (PaymentStatus as any)[filters.status]
      : undefined;
    return repo.list({ ...filters, status });
  }

  async getAnalyticsSummary(merchantId?: string) {
    return repo.getAnalyticsSummary(merchantId);
  }
}
