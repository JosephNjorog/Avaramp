import crypto from "crypto";
import { ApiKeyRepository } from "./apiKey.repository";
import { NotFoundError, ValidationError } from "../../shared/Utils/Errors";

const repo = new ApiKeyRepository();
const LIVE_PREFIX = "avr_live_";
const TEST_PREFIX = "avr_test_";

export function hashKey(fullKey: string): string {
  return crypto.createHash("sha256").update(fullKey).digest("hex");
}

export class ApiKeyService {
  async create(merchantId: string, name: string, mode: "live" | "test" = "live") {
    if (!name?.trim()) throw new ValidationError("Key name is required");

    const isTest = mode === "test";
    const keyPrefix = isTest ? TEST_PREFIX : LIVE_PREFIX;
    const secret = crypto.randomBytes(24).toString("hex");
    const fullKey = `${keyPrefix}${secret}`;
    const prefix = fullKey.slice(0, keyPrefix.length + 8);

    const record = await repo.create({
      merchantId,
      name: name.trim(),
      prefix,
      hashedKey: hashKey(fullKey),
      isTest,
    });

    // Plaintext key is returned exactly once — never persisted, never retrievable again
    return { id: record.id, name: record.name, prefix: record.prefix, isTest: record.isTest, key: fullKey, createdAt: record.createdAt };
  }

  async list(merchantId: string) {
    const keys = await repo.listByMerchant(merchantId);
    return keys.map(({ hashedKey: _h, ...safe }) => safe);
  }

  async revoke(merchantId: string, id: string) {
    const key = await repo.findById(id);
    if (!key || key.merchantId !== merchantId) throw new NotFoundError("API key");
    if (key.revokedAt) return key;
    return repo.revoke(id);
  }
}

export const apiKeyService = new ApiKeyService();
