import { v4 as uuidv4 } from "uuid";
import { PaymentRepository } from "./Payment.repository";
import { CreatePaymentDto, PaymentResponse } from "./Payment.types";
import { walletService } from "../blockchain/wallet.service";
import { fxService } from "../Fx/fx.service";
import { paymentQueue } from "../../shared/queue/queues";
import { NotFoundError, ValidationError } from "../../shared/Utils/Errors";
import { prisma } from "../../shared/database/prisma";

const repo = new PaymentRepository();

// Payments expire after 30 minutes
const EXPIRY_MINUTES = 30;

export class PaymentService {
  async createPayment(dto: CreatePaymentDto): Promise<PaymentResponse> {
    // Verify merchant exists and is active
    const merchant = await prisma.merchant.findUnique({ where: { id: dto.merchantId } });
    if (!merchant || !merchant.isActive) {
      throw new ValidationError("Merchant not found or inactive");
    }

    // Fetch live FX rate to calculate fiat amount
    const { fiatAmount, rate } = await fxService.convert(dto.amountUsdc, dto.fiatCurrency);

    // Generate a fresh deposit wallet for this payment
    const { address: depositAddress, encryptedPk: depositPk } =
      walletService.generateDepositWallet();

    const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);

    const payment = await repo.create({
      id:             uuidv4(),
      merchantId:     dto.merchantId,
      userId:         dto.userId,
      amountUsdc:     dto.amountUsdc,
      amountFiat:     fiatAmount,
      fiatCurrency:   dto.fiatCurrency,
      phone:          dto.phone,
      reference:      dto.reference,
      depositAddress,
      depositPk,
      fxRate:         rate,
      expiresAt,
      idempotencyKey: dto.idempotencyKey,
      metadata:       dto.metadata,
    });

    // Enqueue the deposit watcher (retries every 30s for up to EXPIRY_MINUTES)
    await paymentQueue.add(
      "watch-deposit",
      { paymentId: payment.id },
      {
        attempts: EXPIRY_MINUTES * 2,
        backoff:  { type: "fixed", delay: 30_000 },
        jobId:    `watch-${payment.id}`,
      }
    );

    return {
      id:             payment.id,
      paymentId:      payment.id,
      depositAddress: payment.depositAddress,
      amountUsdc:     payment.amountUsdc,
      fiatAmount:     payment.amountFiat,
      fiatCurrency:   payment.fiatCurrency,
      currency:       payment.fiatCurrency,
      phone:          payment.phone,
      reference:      payment.reference,
      expiresAt:      payment.expiresAt,
      network:        "avalanche",
      token:          "USDC",
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
    userId?: string;
    status?: string;
    limit?: number;
    offset?: number;
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
