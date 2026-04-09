import { prisma } from "../../shared/database/prisma";
export class MerchantRepository {
  async create(data: any)              { return prisma.merchant.create({ data }); }
  async findById(id: string)           { return prisma.merchant.findUnique({ where: { id } }); }
  async findByEmail(email: string)     { return prisma.merchant.findUnique({ where: { email } }); }
  async findByUserId(userId: string)   { return prisma.merchant.findUnique({ where: { userId } }); }
  async findAll()                      { return prisma.merchant.findMany({ where: { isActive: true } }); }
}
