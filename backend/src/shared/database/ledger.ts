// backend/src/shared/database/ledger.ts

import { prisma } from "./prisma";

export type LedgerEntryType =
    | "USDC_RECEIVED"
    | "FX_CONVERSION"
    | "PROTOCOL_FEE"
    | "MPESA_SETTLED"
    | "REFUND_ISSUED"
    | "MERCHANT_WITHDRAWAL";

interface DoubleEntry {
    paymentId: string;
    type: LedgerEntryType;
    debitAcct: string;   // e.g. "merchant:uuid" | "treasury" | "escrow"
    creditAcct: string;
    amount: string;
    currency: string;
    metadata?: object;
}

export class LedgerService {

    /**
     * Every financial move creates TWO entries.
     * Debit one account, credit another.
     * The books must always balance.
     */
    async record(entry: DoubleEntry) {
        return prisma.$transaction([

            // DEBIT side
            prisma.ledgerEntry.create({
                data: {
                    paymentId: entry.paymentId,
                    type:      entry.type,
                    side:      "DEBIT",
                    account:   entry.debitAcct,
                    amount:    entry.amount,
                    amountRaw: BigInt(Math.round(parseFloat(entry.amount) * 1_000_000)),
                    currency:  entry.currency,
                    metadata:  entry.metadata ?? {},
                },
            }),

            // CREDIT side
            prisma.ledgerEntry.create({
                data: {
                    paymentId: entry.paymentId,
                    type:      entry.type,
                    side:      "CREDIT",
                    account:   entry.creditAcct,
                    amount:    entry.amount,
                    amountRaw: BigInt(Math.round(parseFloat(entry.amount) * 1_000_000)),
                    currency:  entry.currency,
                    metadata:  entry.metadata ?? {},
                },
            }),
        ]);
    }

    /** Verify books balance — run this in health checks */
    async auditBalance(): Promise<{ balanced: boolean; delta: string }> {
        const [debits, credits] = await Promise.all([
            prisma.ledgerEntry.aggregate({
                where: { side: "DEBIT" },
                _sum: { amountRaw: true },
            }),
            prisma.ledgerEntry.aggregate({
                where: { side: "CREDIT" },
                _sum: { amountRaw: true },
            }),
        ]);

        const debitTotal = debits._sum.amountRaw ?? BigInt(0);
        const creditTotal = credits._sum.amountRaw ?? BigInt(0);
        const delta = debitTotal - creditTotal;

        return {
            balanced: delta === BigInt(0),
            delta: delta.toString(),
        };
    }
}

export const ledger = new LedgerService();

