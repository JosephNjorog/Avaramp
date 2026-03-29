import crypto from "crypto";
import { MerchantRepository } from "./merchant.repository";
import { CreateMerchantDto } from "./merchant.types";
import { ConflictError, NotFoundError } from "../../shared/Utils/Errors";

const repo = new MerchantRepository();

export class MerchantService {
  async createMerchant(dto: CreateMerchantDto) {
    const existing = await repo.findByEmail(dto.email);
    if (existing) throw new ConflictError("Merchant with this email already exists");

    // Generate a random webhook secret for HMAC signing
    const webhookSecret = crypto.randomBytes(32).toString("hex");

    return repo.create({
      name:          dto.name,
      email:         dto.email,
      walletAddress: dto.walletAddress,
      mpesaTill:     dto.mpesaTill,
      webhookUrl:    dto.webhookUrl,
      webhookSecret,
    });
  }

  async getMerchant(id: string) {
    const merchant = await repo.findById(id);
    if (!merchant) throw new NotFoundError("Merchant");
    return merchant;
  }
}
