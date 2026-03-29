import { Worker, Job } from "bullmq";
import { connection, settlementQueue } from "../queues";
import { prisma } from "../../database/prisma";
import { logger } from "../../Utils/Logger";
import { GlacierService } from "../../../Modules/blockchain/glacier.service";
import { ledger } from "../../database/ledger";

const glacier = new GlacierService();

// Avalanche USDC contract address (C-Chain mainnet)
const USDC_ADDRESS = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6C";

export const paymentWorker = new Worker(
  "payments",
  async (job: Job) => {
    if (job.name !== "watch-deposit") {
      logger.warn(`Unknown payment job: ${job.name}`);
      return;
    }

    const { paymentId } = job.data;
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new Error(`Payment not found: ${paymentId}`);

    // Already past terminal state — nothing to do
    if (["CONFIRMED", "SETTLED", "EXPIRED", "REFUNDED", "FAILED"].includes(payment.status)) {
      return { skipped: true, status: payment.status };
    }

    // Expired?
    if (new Date() > payment.expiresAt) {
      await prisma.payment.update({ where: { id: paymentId }, data: { status: "EXPIRED" } });
      logger.info({ paymentId }, "Payment expired");
      return { expired: true };
    }

    // Poll Glacier for USDC transfers to the deposit address
    const transfers = await glacier.getERC20Transfers(payment.depositAddress, USDC_ADDRESS);

    if (!transfers || transfers.length === 0) {
      // No deposit yet — throw so BullMQ retries with backoff
      throw new Error("Awaiting deposit");
    }

    // Find the first transfer that meets or exceeds the expected amount
    const expected = parseFloat(payment.amountUsdc as string);
    const match = transfers.find((tx: any) => {
      const received = parseFloat(tx.value) / 1e6; // USDC has 6 decimals
      return received >= expected;
    });

    if (!match) throw new Error("Awaiting sufficient deposit");

    const received = (parseFloat(match.value) / 1e6).toFixed(6);

    // Record on-chain transaction
    await prisma.transaction.create({
      data: {
        paymentId,
        txHash:      match.txHash ?? match.transactionHash,
        blockNumber: parseInt(match.blockNumber ?? "0"),
        fromAddress: match.from?.address ?? match.from ?? "",
        toAddress:   payment.depositAddress,
        amount:      received,
        token:       "USDC",
        chainId:     43114,
      },
    });

    // Mark payment confirmed
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status:         "CONFIRMED",
        confirmedTxHash: match.txHash ?? match.transactionHash,
        confirmedAt:     new Date(),
        onChainAmount:   received,
      },
    });

    // Record USDC receipt in the ledger
    await ledger.record({
      paymentId,
      type:       "USDC_RECEIVED",
      debitAcct:  "escrow",
      creditAcct: `merchant:${payment.merchantId}`,
      amount:     received,
      currency:   "USDC",
      metadata:   { txHash: match.txHash ?? match.transactionHash },
    });

    // Enqueue settlement
    await settlementQueue.add("settle-payment", { paymentId });
    logger.info({ paymentId, txHash: match.txHash }, "Deposit confirmed — settlement enqueued");
    return { confirmed: true };
  },
  { connection, concurrency: 20 }
);

paymentWorker.on("failed", (job, err) => {
  if (err.message !== "Awaiting deposit" && err.message !== "Awaiting sufficient deposit") {
    logger.error({ jobId: job?.id, paymentId: job?.data?.paymentId, err: err.message }, "Payment job failed");
  }
});
