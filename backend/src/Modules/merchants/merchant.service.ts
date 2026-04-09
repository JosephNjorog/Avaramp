import crypto from "crypto";
import { MerchantRepository } from "./merchant.repository";
import { CreateMerchantDto } from "./merchant.types";
import { NotFoundError } from "../../shared/Utils/Errors";

const repo = new MerchantRepository();

export class MerchantService {
  async createMerchant(dto: CreateMerchantDto) {
    const webhookSecret = crypto.randomBytes(32).toString("hex");

    return repo.create({
      name:          dto.name,
      email:         dto.email         ?? `${Date.now()}@placeholder.avaramp.io`,
      walletAddress: dto.walletAddress ?? `0x${crypto.randomBytes(20).toString("hex")}`,
      mpesaTill:     dto.mpesaTill     ?? dto.phone ?? "",
      webhookUrl:    dto.webhookUrl,
      webhookSecret,
    });
  }

  async getMerchant(id: string) {
    const merchant = await repo.findById(id);
    if (!merchant) throw new NotFoundError("Merchant");
    return merchant;
  }

  async getMerchantByUserId(userId: string) {
    const merchant = await repo.findByUserId(userId);
    if (!merchant) throw new NotFoundError("Merchant");
    return merchant;
  }
}
