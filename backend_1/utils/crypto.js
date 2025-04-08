import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const algorithm = "aes-256-cbc";
const secretKey = process.env.ENCRYPTION_KEY; // Must be a 32-byte hex string

// Deterministic IV for mob_no (derived from the secret key)
const fixedIV = crypto.createHash("sha256").update(secretKey).digest().slice(0, 16); // 16 bytes

// Encrypt function for deterministic encryption (used for mob_no)
export const encryptDeterministic = (text) => {
  if (!text) return null;

  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, "hex"), fixedIV);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return encrypted; // No IV stored, as it’s fixed
};

// Decrypt function for deterministic encryption
export const decryptDeterministic = (text) => {
  if (!text) return null;

  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, "hex"), fixedIV);
  let decrypted = decipher.update(text, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

// Encrypt function with random IV (used for other fields)
export const encrypt = (text) => {
  if (!text) return null;

  const iv = crypto.randomBytes(16); // Random IV for each encryption
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, "hex"), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted; // Store IV with encrypted data
};

// Decrypt function with random IV
export const decrypt = (text) => {
  if (!text) return null;

  const parts = text.split(":");
  if (parts.length !== 2) return null;

  const iv = Buffer.from(parts[0], "hex");
  const encryptedText = parts[1];

  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, "hex"), iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};