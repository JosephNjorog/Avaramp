import { v4 as uuidv4 } from "uuid";
import { PaymentRepository } from "./Payment.repository";
import { CreatePaymentDto, PaymentResponse } from "./Payment.types";
import { walletService } from "../blockchain/wallet.service";
import { fxService } from "../Fx/fx.service";
import { paymentQueue } from "../../shared/queue/queues";
import { NotFoundError, ValidationError, KycRequiredError } from "../../shared/Utils/Errors";
import { prisma } from "../../shared/database/prisma";
import { KYC_THRESHOLD_USDC } from "../../shared/constants";

const repo = new PaymentRepository();

// Payments expire after 30 minutes
const EXPIRY_MINUTES = 30;

export class PaymentService {
  async createPayment(dto: CreatePaymentDto): Promise<PaymentResponse> {
    // Verify merchant exists and is active
    const merchant = await prisma.merchant.findUnique({
      where: { id: dto.merchantId },
      include: { user: true },
    });
    if (!merchant || !merchant.isActive) {
      throw new ValidationError("Merchant not found or inactive");
    }

    // Determine amountUsdc and fiatAmount:
    // - If merchant provided a fiat amount (e.g. 5000 KES), convert → USDC
    // - If merchant provided USDC directly, convert → fiat for display
    let amountUsdc: string;
    let fiatAmount: string;
    let rate: number;

    if (dto.amountFiat) {
      // Merchant entered fiat → derive USDC = fiatAmount / rate
      rate       = await fxService.getRate(dto.fiatCurrency);
      amountUsdc = (parseFloat(dto.amountFiat) / rate).toFixed(6);
      fiatAmount = parseFloat(dto.amountFiat).toFixed(2);
    } else {
      // Legacy: merchant entered USDC → derive fiat = usdc * rate
      const converted = await fxService.convert(dto.amountUsdc ?? "0", dto.fiatCurrency);
      amountUsdc = dto.amountUsdc ?? "0";
      fiatAmount = converted.fiatAmount;
      rate       = converted.rate;
    }

    // Large payments require the merchant's account to be KYC-verified
    if (parseFloat(amountUsdc) >= KYC_THRESHOLD_USDC && merchant.user?.kycStatus !== "VERIFIED") {
      throw new KycRequiredError(
        `Payments of ${KYC_THRESHOLD_USDC} USDC or more require a verified account. Verify your account in Settings to continue.`
      );
    }

    // Generate a fresh deposit wallet for this payment
    const { address: depositAddress, encryptedPk: depositPk } =
      walletService.generateDepositWallet();

    const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);
    const isTest = dto.isTest ?? false;

    const payment = await repo.create({
      id:             uuidv4(),
      merchantId:     dto.merchantId,
      userId:         dto.userId,
      amountUsdc,
      amountFiat:     fiatAmount,
      fiatCurrency:   dto.fiatCurrency,
      phone:          dto.phone,
      reference:      dto.reference,
      depositAddress,
      depositPk,
      fxRate:         rate,
      fiatAmount,
      expiresAt,
      idempotencyKey: dto.idempotencyKey,
      metadata:       dto.metadata,
      isTest,
    });

    // Enqueue the deposit watcher (retries every 30s for up to EXPIRY_MINUTES)
    // Test-mode payments still flow through the same worker — it short-circuits
    // the real chain lookup for them (see payment.worker.ts).
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
      phone:          payment.phone ?? undefined,
      reference:      payment.reference ?? undefined,
      expiresAt:      payment.expiresAt,
      network:        "avalanche",
      token:          "USDC",
      isTest:         payment.isTest,
    };
  }

  async getStatementCsv(merchantId: string): Promise<string> {
    const payments = await repo.findSettledForStatement(merchantId);
    const header = "id,reference,amountUsdc,amountFiat,fiatCurrency,feeBps,feeAmount,settlementReference,settledAt\n";
    const rows = payments
      .map((p) => {
        const cells = [
          p.id,
          p.reference ?? "",
          p.amountUsdc,
          p.amountFiat,
          p.fiatCurrency,
          p.feeBps ?? "",
          p.feeAmount ?? "",
          p.settlementReference ?? "",
          p.settledAt?.toISOString() ?? "",
        ];
        return cells.map((c) => `"${c}"`).join(",");
      })
      .join("\n");
    return header + rows;
  }

  async getPayment(id: string) {
    const payment = await repo.findById(id);
    if (!payment) throw new NotFoundError("Payment");
    // Strip encrypted private key + sensitive merchant fields from public response
    const { depositPk: _pk, merchant, ...safe } = payment as any;
    const { webhookSecret: _ws, payoutAccount: _pa, payoutAccountRef: _par, ...safeMerchant } = merchant ?? {};
    return { ...safe, merchant: safeMerchant };
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
