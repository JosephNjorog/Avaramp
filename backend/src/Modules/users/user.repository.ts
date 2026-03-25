import { prisma } from "../../shared/database/prisma";
export class UserRepository {
  async create(data: any)          { return prisma.user.create({ data }); }
  async findById(id: string)       { return prisma.user.findUnique({ where: { id } }); }
  async findByEmail(email: string) { return prisma.user.findUnique({ where: { email } }); }
}
