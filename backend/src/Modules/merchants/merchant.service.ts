import crypto from "crypto";
import { MerchantRepository } from "./merchant.repository";
import { CreateMerchantDto } from "./merchant.types";
import { NotFoundError } from "../../shared/Utils/Errors";

const repo = new MerchantRepository();

export class MerchantService {
  async createMerchant(dto: CreateMerchantDto) {
    const webhookSecret = crypto.randomBytes(32).toString("hex");

    // Resolve payout account: explicit payoutAccount > phone
    const payoutAccount = dto.payoutAccount ?? dto.phone ?? "";
    const payoutType    = dto.payoutType    ?? "till";
    const payoutCurrency = dto.payoutCurrency ?? "KES";

    return repo.create({
      name:             dto.name,
      email:            dto.email         ?? `${Date.now()}@placeholder.avaramp.io`,
      walletAddress:    dto.walletAddress ?? `0x${crypto.randomBytes(20).toString("hex")}`,
      payoutType,
      payoutAccount,
      payoutAccountRef: dto.payoutAccountRef,
      payoutCurrency,
      mobileNetwork:    dto.mobileNetwork,
      webhookUrl:       dto.webhookUrl,
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

  async updatePayoutSettings(
    merchantId: string,
    data: {
      payoutType?: "phone" | "till" | "paybill";
      payoutAccount?: string;
      payoutAccountRef?: string;
      payoutCurrency?: string;
      mobileNetwork?: string;
    }
  ) {
    return repo.update(merchantId, data);
  }
}
