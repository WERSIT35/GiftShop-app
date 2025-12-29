import crypto from "crypto";

function getPinEncryptionSecret(): string {
  const secret = process.env.PIN_ENCRYPTION_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("PIN_ENCRYPTION_SECRET (or JWT_SECRET) is required to encrypt/decrypt PINs");
  }
  return secret;
}

function getPinEncryptionKey(): Buffer {
  // Derive a stable 32-byte key from the secret
  const secret = getPinEncryptionSecret();
  return crypto.scryptSync(secret, "giftshop-pin", 32);
}

export function encryptPin(pin: string): string {
  const key = getPinEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const ciphertext = Buffer.concat([cipher.update(pin, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  // base64(iv):base64(tag):base64(ciphertext)
  return `${iv.toString("base64")}:${tag.toString("base64")}:${ciphertext.toString("base64")}`;
}

export function decryptPin(payload: string): string {
  const key = getPinEncryptionKey();
  const parts = payload.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted PIN payload format");

  const ivB64 = parts[0]!;
  const tagB64 = parts[1]!;
  const dataB64 = parts[2]!;

  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([decipher.update(data), decipher.final()]);
  return plaintext.toString("utf8");
}

function getPinLookupSecret(): string {
  // Use a dedicated secret if provided, otherwise fall back to JWT secret.
  const secret = process.env.PIN_LOOKUP_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("PIN_LOOKUP_SECRET (or JWT_SECRET) is required to compute PIN lookup hash");
  }
  return secret;
}

export function computePinLookup(pin: string): string {
  const secret = getPinLookupSecret();
  return crypto.createHmac("sha256", secret).update(pin).digest("hex");
}

export function generateRandomNumericPin(length = 6): string {
  // Generates a numeric string with leading zeros allowed.
  const max = 10 ** length;
  const n = crypto.randomInt(0, max);
  return String(n).padStart(length, "0");
}
