import crypto from "crypto";
import jwt    from "jsonwebtoken";
import { ethers } from "ethers";
import { prisma } from "../../shared/database/prisma";
import { connection as redis } from "../../shared/queue/queues";
import { UnauthorizedError, ValidationError } from "../../shared/Utils/Errors";

const NONCE_TTL_SECS = 300;          // 5 minutes
const TOKEN_TTL      = "30d";        // payer sessions last longer

function nonceKey(address: string) {
  return `siwe:nonce:${address.toLowerCase()}`;
}

export function buildSiweMessage(address: string, nonce: string): string {
  const issuedAt = new Date().toISOString();
  return [
    "Welcome to AvaRamp Pay!",
    "",
    "Sign in to track your payments and manage your wallets.",
    "This will NOT trigger a blockchain transaction or cost any gas.",
    "",
    `Wallet: ${address}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
  ].join("\n");
}

export class SiweService {
  /** Issue a one-time nonce for the given wallet address. */
  async getNonce(address: string): Promise<{ nonce: string; message: string }> {
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
      throw new ValidationError("Invalid Ethereum address");
    }

    const nonce   = crypto.randomBytes(16).toString("hex");
    const message = buildSiweMessage(address, nonce);

    await redis.set(nonceKey(address), nonce, "EX", NONCE_TTL_SECS);

    return { nonce, message };
  }

  /** Verify a signed SIWE message and return a JWT for the payer. */
  async verify(dto: {
    address:   string;
    message:   string;
    signature: string;
  }): Promise<{ token: string; user: object; isNew: boolean }> {
    const { address, message, signature } = dto;

    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
      throw new ValidationError("Invalid Ethereum address");
    }

    // 1. Check nonce exists and is fresh
    const stored = await redis.get(nonceKey(address));
    if (!stored) {
      throw new UnauthorizedError("Nonce expired or not issued — request a new one");
    }

    // 2. Verify the nonce appears in the message
    if (!message.includes(`Nonce: ${stored}`)) {
      throw new UnauthorizedError("Message nonce mismatch");
    }

    // 3. Recover signer address from signature
    let recovered: string;
    try {
      recovered = ethers.verifyMessage(message, signature);
    } catch {
      throw new UnauthorizedError("Invalid signature");
    }

    if (recovered.toLowerCase() !== address.toLowerCase()) {
      throw new UnauthorizedError("Signature does not match provided address");
    }

    // 4. Consume nonce — one-time use only
    await redis.del(nonceKey(address));

    // 5. Upsert user
    const existing = await prisma.user.findUnique({
      where: { walletAddress: address.toLowerCase() },
    });

    let user: any;
    let isNew = false;

    if (existing) {
      user = existing;
    } else {
      user = await prisma.user.create({
        data: {
          walletAddress: address.toLowerCase(),
          kycStatus:     "PENDING",
          role:          "USER",
        },
      });
      isNew = true;
    }

    // 6. Issue JWT — same secret as merchant JWTs, role distinguishes them
    const token = jwt.sign(
      { sub: user.id, walletAddress: address.toLowerCase(), role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: TOKEN_TTL }
    );

    const { passwordHash: _h, ...safeUser } = user;
    return { token, user: safeUser, isNew };
  }

  /** Return the current payer profile (called with their JWT). */
  async getProfile(userId: string): Promise<object> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedError("User not found");
    const { passwordHash: _h, ...safe } = user as any;
    return safe;
  }

  /** Attach an optional phone or email to the payer account. */
  async updateProfile(userId: string, dto: { phone?: string; email?: string }): Promise<object> {
    const user = await prisma.user.update({
      where: { id: userId },
      data:  { phone: dto.phone, email: dto.email },
    });
    const { passwordHash: _h, ...safe } = user as any;
    return safe;
  }
}
