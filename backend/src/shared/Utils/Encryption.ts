import crypto from "crypto";

const ALGORITHM = "aes-256-gcm" as const;

/** Copy a Buffer into a plain Uint8Array<ArrayBuffer> — satisfies strict @types/node typings */
function toBytes(buf: Buffer): Uint8Array {
  const out = new Uint8Array(buf.length);
  out.set(buf);
  return out;
}

function getKey(): crypto.KeyObject {
  const hex = process.env.ENCRYPTION_KEY || "0".repeat(64);
  return crypto.createSecretKey(toBytes(Buffer.from(hex, "hex")));
}

export function encrypt(text: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, toBytes(iv));
  const encrypted = Buffer.concat([toBytes(cipher.update(text, "utf8")), toBytes(cipher.final())]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("hex"), authTag.toString("hex"), encrypted.toString("hex")].join(":");
}

export function decrypt(data: string): string {
  const key = getKey();
  const [ivHex, authTagHex, encryptedHex] = data.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, toBytes(iv));
  decipher.setAuthTag(toBytes(authTag));
  return decipher.update(toBytes(encrypted), undefined, "utf8") + decipher.final("utf8");
}
