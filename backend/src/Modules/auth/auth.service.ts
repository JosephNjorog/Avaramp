import crypto from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../../shared/database/prisma";
import { ConflictError, UnauthorizedError } from "../../shared/Utils/Errors";

const ITERATIONS  = 100_000;
const KEY_LEN     = 64;
const DIGEST      = "sha512";
const TOKEN_TTL   = "7d";

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST).toString("hex");
}

export interface RegisterDto {
  email:        string;
  password:     string;
  phone?:       string;
  name?:        string;  // merchant/business display name
  businessName?: string; // alias accepted from frontend
}

export interface LoginDto {
  email:    string;
  password: string;
}

export class AuthService {
  async register(dto: RegisterDto) {
    const existing = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictError("Email already registered");

    const salt         = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(dto.password, salt);
    const webhookSecret = crypto.randomBytes(32).toString("hex");
    const merchantName  = dto.businessName ?? dto.name ?? dto.email.split("@")[0];

    // Create user + merchant in one transaction
    const user = await prisma.user.create({
      data: {
        email:        dto.email,
        phone:        dto.phone,
        passwordHash: `${salt}:${passwordHash}`,
        merchant: {
          create: {
            name:          merchantName,
            email:         dto.email,
            walletAddress: `0x${crypto.randomBytes(20).toString("hex")}`,
            mpesaTill:     dto.phone ?? "",
            webhookSecret,
          },
        },
      },
      include: { merchant: true },
    });

    const token = this.issueToken(user.id, user.email);
    const { passwordHash: _h, merchant, ...safeUser } = user as any;
    return { user: safeUser, merchant, token };
  }

  async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({ where: { email: dto.email } }) as any;
    if (!user || !user.passwordHash) throw new UnauthorizedError("Invalid email or password");

    const [salt, stored] = user.passwordHash.split(":");
    const attempt        = hashPassword(dto.password, salt);
    if (attempt !== stored) throw new UnauthorizedError("Invalid email or password");

    const token = this.issueToken(user.id, user.email);
    const { passwordHash: _h, ...safeUser } = user;
    return { user: safeUser, token };
  }

  private issueToken(userId: string, email: string): string {
    return jwt.sign({ sub: userId, email }, process.env.JWT_SECRET!, { expiresIn: TOKEN_TTL });
  }
}
