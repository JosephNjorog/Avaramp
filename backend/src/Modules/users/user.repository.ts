import { prisma } from "../../shared/database/prisma";

const SAFE_SELECT = {
  id: true, email: true, phone: true,
  kycStatus: true, createdAt: true, updatedAt: true,
} as const;

export class UserRepository {
  async create(data: any)          { return prisma.user.create({ data }); }
  async findById(id: string)       { return prisma.user.findUnique({ where: { id }, select: SAFE_SELECT }); }
  async findByEmail(email: string) { return prisma.user.findUnique({ where: { email } }); }
}
