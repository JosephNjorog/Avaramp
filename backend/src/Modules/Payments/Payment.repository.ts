import { prisma } from "../../shared/database/prisma";
import { PaymentStatus } from "@prisma/client";
export class PaymentRepository {
  async create(data: any) {
    return prisma.payment.create({ data });
  }
  async findById(id: string) {
    return prisma.payment.findUnique({
      where:   { id },
      include: { transactions: true, ledgerEntries: true, merchant: true },
    });
  }
  async findPending() {
    return prisma.payment.findMany({
      where: { status: PaymentStatus.PENDING }, 1
      take:  50,
    });
  }
  async updateStatus(id: string, status: PaymentStatus, data?: any) {
    return prisma.payment.update({
      where: { id },
      data:  { status, ...data },
    });
  }
}
