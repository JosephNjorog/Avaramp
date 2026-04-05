import { UserRepository } from "./user.repository";
import { ConflictError, NotFoundError } from "../../shared/Utils/Errors";
import { prisma } from "../../shared/database/prisma";

const repo = new UserRepository();

export interface CreateUserDto {
  email: string;
  phone?: string;
}

export interface UpdateUserDto {
  phone?: string;
  email?: string;
}

export class UserService {
  async createUser(dto: CreateUserDto) {
    const existing = await repo.findByEmail(dto.email);
    if (existing) throw new ConflictError("User with this email already exists");
    return repo.create({ email: dto.email, phone: dto.phone });
  }

  async getUser(id: string) {
    const user = await repo.findById(id);
    if (!user) throw new NotFoundError("User");
    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await repo.findById(id);
    if (!user) throw new NotFoundError("User");

    if (dto.email && dto.email !== user.email) {
      const conflict = await repo.findByEmail(dto.email);
      if (conflict) throw new ConflictError("Email already in use");
    }

    return prisma.user.update({
      where: { id },
      data:  {
        ...(dto.email && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
      },
      select: { id: true, email: true, phone: true, kycStatus: true, createdAt: true, updatedAt: true },
    });
  }

  async getWebhookDeliveries(userId: string, limit = 50, offset = 0) {
    // Find all payments belonging to this user and return their webhook deliveries
    const [deliveries, total] = await Promise.all([
      prisma.webhookDelivery.findMany({
        where:   { payment: { userId } },
        orderBy: { sentAt: "desc" },
        take:    limit,
        skip:    offset,
        include: { payment: { select: { id: true, merchantId: true, fiatCurrency: true } } },
      }),
      prisma.webhookDelivery.count({ where: { payment: { userId } } }),
    ]);
    return { deliveries, total, limit, offset };
  }
}
