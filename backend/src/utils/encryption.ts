/**
 * Encryption Utilities for PII Protection
 *
 * Provides AES-256-GCM encryption for sensitive personal information.
 * Used to encrypt driver phone numbers and other sensitive data at rest.
 *
 * Copyright (c) 2025 Sheet Solved - Spreadsheets Solved
 * Licensed under GNU GPL v3.0
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000; // PBKDF2 iterations

/**
 * Get encryption key from environment or generate one
 */
function getEncryptionKey(): Buffer {
  const keyString = process.env.ENCRYPTION_KEY;

  if (!keyString) {
    // CRITICAL: Fail in production if encryption key is not set
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'ENCRYPTION_KEY environment variable is required in production. ' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'base64\'))"'
      );
    }

    // Only use default key in development
    console.warn('⚠️  WARNING: ENCRYPTION_KEY not set. Using development-only default key (INSECURE!)');
    return crypto.scryptSync('development-key-not-for-production-use-only', 'salt', KEY_LENGTH);
  }

  // Derive a proper length key from the environment variable
  return crypto.scryptSync(keyString, 'salt', KEY_LENGTH);
}

/**
 * Encrypt a string value
 * Returns: base64 encoded string containing: salt:iv:tag:encrypted
 */
export function encrypt(text: string): string {
  if (!text) return text;

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Combine iv, authTag, and encrypted data
    const combined = Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')]);

    return combined.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt an encrypted string
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) return encryptedData;

  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedData, 'base64');

    // Extract iv, authTag, and encrypted data
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH + TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash a value (one-way, for comparison purposes)
 * Useful for searching encrypted fields without decrypting
 */
export function hash(text: string): string {
  if (!text) return text;

  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Mask a phone number for display (show only last 4 digits)
 * Example: "+27821234567" -> "+27*****4567"
 */
export function maskPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber || phoneNumber.length < 4) return '****';

  const visibleDigits = 4;
  const maskedPart = '*'.repeat(Math.max(phoneNumber.length - visibleDigits, 0));
  const visiblePart = phoneNumber.slice(-visibleDigits);

  // Preserve country code if present
  if (phoneNumber.startsWith('+')) {
    const countryCode = phoneNumber.substring(0, 3); // e.g., "+27"
    return `${countryCode}${maskedPart.substring(3)}${visiblePart}`;
  }

  return `${maskedPart}${visiblePart}`;
}

/**
 * Validate encryption key strength
 */
export function validateEncryptionKey(key: string): {
  valid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  issues: string[];
} {
  const issues: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (key.length < 32) {
    issues.push('Key is too short (minimum 32 characters recommended)');
  }

  if (!/[A-Z]/.test(key)) {
    issues.push('Key should contain uppercase letters');
  }

  if (!/[a-z]/.test(key)) {
    issues.push('Key should contain lowercase letters');
  }

  if (!/[0-9]/.test(key)) {
    issues.push('Key should contain numbers');
  }

  if (!/[^A-Za-z0-9]/.test(key)) {
    issues.push('Key should contain special characters');
  }

  if (issues.length === 0 && key.length >= 64) {
    strength = 'strong';
  } else if (issues.length <= 2 && key.length >= 32) {
    strength = 'medium';
  }

  return {
    valid: issues.length === 0,
    strength,
    issues,
  };
}

/**
 * Generate a secure encryption key
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(64).toString('base64');
}

/**
 * Encrypt an object (for full document encryption)
 */
export function encryptObject(obj: Record<string, any>): string {
  return encrypt(JSON.stringify(obj));
}

/**
 * Decrypt an object
 */
export function decryptObject<T = Record<string, any>>(encryptedData: string): T {
  const decrypted = decrypt(encryptedData);
  return JSON.parse(decrypted) as T;
}

// Export for testing/CLI usage
if (require.main === module) {
  console.log('🔐 Encryption Utilities Test\n');

  // Generate a new key
  const newKey = generateEncryptionKey();
  console.log('Generated encryption key:');
  console.log(newKey);
  console.log('\nAdd this to your .env file:');
  console.log(`ENCRYPTION_KEY=${newKey}\n`);

  // Test encryption/decryption
  const testPhone = '+27821234567';
  console.log(`Original: ${testPhone}`);

  const encrypted = encrypt(testPhone);
  console.log(`Encrypted: ${encrypted}`);

  const decrypted = decrypt(encrypted);
  console.log(`Decrypted: ${decrypted}`);

  const masked = maskPhoneNumber(testPhone);
  console.log(`Masked: ${masked}`);

  const hashed = hash(testPhone);
  console.log(`Hashed: ${hashed}\n`);

  // Validate key
  if (process.env.ENCRYPTION_KEY) {
    const validation = validateEncryptionKey(process.env.ENCRYPTION_KEY);
    console.log('Encryption key validation:');
    console.log(`  Valid: ${validation.valid}`);
    console.log(`  Strength: ${validation.strength}`);
    if (validation.issues.length > 0) {
      console.log('  Issues:');
      validation.issues.forEach((issue) => console.log(`    - ${issue}`));
    }
  }
}
