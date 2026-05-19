/**
 * Demo seed: creates a merchant account + sample payments for live presentation.
 * Run: npx ts-node scripts/seed-demo.ts
 */
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ITERATIONS = 100_000;
const KEY_LEN    = 64;
const DIGEST     = "sha512";

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST).toString("hex");
}

async function main() {
  const email    = "demo@avaramp.io";
  const password = "Demo1234!";
  const salt     = crypto.randomBytes(16).toString("hex");
  const hash     = hashPassword(password, salt);

  // Upsert user (ADMIN role so compliance page works)
  const user = await prisma.user.upsert({
    where:  { email },
    update: { passwordHash: `${salt}:${hash}`, kycStatus: "VERIFIED", role: "ADMIN" },
    create: {
      email,
      phone:        "+254712345678",
      passwordHash: `${salt}:${hash}`,
      kycStatus:    "VERIFIED",
      role:         "ADMIN",
    },
  });
  console.log("✓ User:", user.email, "| role:", user.role);

  // Upsert merchant
  const merchant = await prisma.merchant.upsert({
    where:  { email },
    update: {},
    create: {
      userId:        user.id,
      name:          "AvaRamp Demo Store",
      email,
      walletAddress: "0xDe0mO000000000000000000000000000000dEm0",
      payoutType:    "till",
      payoutAccount: "174653",
      payoutCurrency:"KES",
      mpesaTill:     "174653",
      webhookSecret: crypto.randomBytes(16).toString("hex"),
      isActive:      true,
    },
  });
  console.log("✓ Merchant:", merchant.name, "| till:", merchant.payoutAccount);

  // Seed consent records
  const consentTypes = [
    { policyType: "TERMS",   version: "2026-01-15" },
    { policyType: "PRIVACY", version: "2026-01-15" },
    { policyType: "COOKIES", version: "2026-01-15" },
  ];
  const existingConsents = await prisma.consentRecord.count({ where: { userId: user.id } });
  if (existingConsents === 0) {
    for (const c of consentTypes) {
      await prisma.consentRecord.create({
        data: {
          userId:    user.id,
          policyType:c.policyType,
          version:   c.version,
          acceptedAt:new Date("2026-01-15T10:32:00Z"),
          ipAddress: "41.90.64.1",
          userAgent: "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36",
        },
      });
    }
    console.log("✓ Consent records: 3 created");
  } else {
    console.log("  skip (exists): consent records");
  }

  // Helper: fake deposit address per payment
  const addr = (n: number) => `0xAva${String(n).padStart(38, "0")}`;

  const now = new Date();
  const paymentsData = [
    // SETTLED payments — show healthy history
    { ref: "Order #001", fiat: "5000.00", usdc: "38.460000", currency: "KES", status: "SETTLED",   daysAgo: 6, depositN: 1 },
    { ref: "Order #002", fiat: "12000.00",usdc: "92.310000", currency: "KES", status: "SETTLED",   daysAgo: 5, depositN: 2 },
    { ref: "Invoice-47", fiat: "25000.00",usdc: "192.310000",currency: "KES", status: "SETTLED",   daysAgo: 5, depositN: 3 },
    { ref: "Order #003", fiat: "3500.00", usdc: "26.920000", currency: "KES", status: "SETTLED",   daysAgo: 4, depositN: 4 },
    { ref: "NGN-001",    fiat: "50000.00",usdc: "38.460000", currency: "NGN", status: "SETTLED",   daysAgo: 3, depositN: 5 },
    { ref: "Order #004", fiat: "8000.00", usdc: "61.540000", currency: "KES", status: "SETTLED",   daysAgo: 3, depositN: 6 },
    { ref: "GHS-001",    fiat: "150.00",  usdc: "11.540000", currency: "GHS", status: "SETTLED",   daysAgo: 2, depositN: 7 },
    { ref: "Order #005", fiat: "15000.00",usdc: "115.380000",currency: "KES", status: "SETTLED",   daysAgo: 2, depositN: 8 },
    { ref: "Invoice-48", fiat: "30000.00",usdc: "230.770000",currency: "KES", status: "SETTLED",   daysAgo: 1, depositN: 9 },
    // CONFIRMED — processing right now
    { ref: "Order #006", fiat: "7500.00", usdc: "57.690000", currency: "KES", status: "CONFIRMED", daysAgo: 0, depositN: 10 },
    // PENDING — fresh, waiting for USDC
    { ref: "Order #007", fiat: "2500.00", usdc: "19.230000", currency: "KES", status: "PENDING",   daysAgo: 0, depositN: 11 },
    { ref: "Demo-Live",  fiat: "500.00",  usdc: "3.850000",  currency: "KES", status: "PENDING",   daysAgo: 0, depositN: 12 },
  ];

  const createdPaymentIds: string[] = [];

  for (const p of paymentsData) {
    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - p.daysAgo);
    const expiresAt = new Date(createdAt);
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    const existing = await prisma.payment.findFirst({
      where: { merchantId: merchant.id, reference: p.ref },
    });
    if (existing) {
      console.log("  skip (exists):", p.ref);
      if (p.status === "SETTLED") createdPaymentIds.push(existing.id);
      continue;
    }

    const payment = await prisma.payment.create({
      data: {
        merchantId:    merchant.id,
        userId:        user.id,
        amountUsdc:    p.usdc,
        amountFiat:    p.fiat,
        fiatCurrency:  p.currency,
        reference:     p.ref,
        depositAddress:addr(p.depositN),
        depositPk:     "",
        fxRate:        p.currency === "KES" ? 130 : p.currency === "NGN" ? 1300 : 13,
        fiatAmount:    p.fiat,
        expiresAt,
        status:        p.status as any,
        confirmedAt:   p.status !== "PENDING" ? createdAt : null,
        settledAt:     p.status === "SETTLED"  ? createdAt : null,
        mpesaReceiptId:p.status === "SETTLED"  ? `TRF_DEMO${p.depositN.toString().padStart(8,"0")}` : null,
        createdAt,
        updatedAt:     createdAt,
      },
    });
    console.log("  ✓", p.status.padEnd(10), p.ref, `(${p.fiat} ${p.currency})`);
    if (p.status === "SETTLED") createdPaymentIds.push(payment.id);
  }

  // Seed webhook deliveries for settled payments
  const existingDeliveries = await prisma.webhookDelivery.count({
    where: { payment: { userId: user.id } },
  });

  if (existingDeliveries === 0 && createdPaymentIds.length > 0) {
    for (const paymentId of createdPaymentIds) {
      await prisma.webhookDelivery.create({
        data: {
          paymentId,
          event:  "payment.settled",
          status: "delivered",
          sentAt: new Date(now.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000),
        },
      });
    }
    // Add one failed delivery for realism
    if (createdPaymentIds.length > 0) {
      await prisma.webhookDelivery.create({
        data: {
          paymentId: createdPaymentIds[0],
          event:     "payment.settled",
          status:    "failed",
          error:     "Connection refused: webhook endpoint unreachable (attempt 3/3)",
          sentAt:    new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        },
      });
    }
    console.log(`✓ Webhook deliveries: ${createdPaymentIds.length + 1} created`);
  } else {
    console.log("  skip (exists): webhook deliveries");
  }

  console.log("\n══════════════════════════════════════════");
  console.log("  DEMO CREDENTIALS");
  console.log("══════════════════════════════════════════");
  console.log("  Email   :", email);
  console.log("  Password:", password);
  console.log("  Role    : ADMIN");
  console.log("══════════════════════════════════════════");
  console.log("  Merchant: AvaRamp Demo Store");
  console.log("  Till    : 174653 (KES)");
  console.log("══════════════════════════════════════════\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
