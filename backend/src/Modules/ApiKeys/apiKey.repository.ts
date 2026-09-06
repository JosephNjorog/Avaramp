import { prisma } from "../../shared/database/prisma";

export class ApiKeyRepository {
  async create(data: { merchantId: string; name: string; prefix: string; hashedKey: string }) {
    return prisma.apiKey.create({ data });
  }

  async listByMerchant(merchantId: string) {
    return prisma.apiKey.findMany({
      where: { merchantId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return prisma.apiKey.findUnique({ where: { id } });
  }

  async findActiveByHash(hashedKey: string) {
    return prisma.apiKey.findFirst({
      where: { hashedKey, revokedAt: null },
      include: { merchant: true },
    });
  }

  async revoke(id: string) {
    return prisma.apiKey.update({ where: { id }, data: { revokedAt: new Date() } });
  }

  async touchLastUsed(id: string) {
    return prisma.apiKey.update({ where: { id }, data: { lastUsedAt: new Date() } });
  }
}
