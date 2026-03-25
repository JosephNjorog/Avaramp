import { prisma } from "../../shared/database/prisma";
export class SettlementRepository {
  async findByPaymentId(paymentId: string) {
    return prisma.payment.findUnique({
      where:   { id: paymentId },
      include: { merchant: true, ledgerEntries: true },
    });
  }
  async markSettled(paymentId: string, data: any) {
    return prisma.payment.update({
      where: { id: paymentId },
      data:  { status: "SETTLED", settledAt: new Date(), ...data },
    });
  }
}
