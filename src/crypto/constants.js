// Central place for every cryptographic parameter and user-facing error.
export const MAGIC_BYTES = new TextEncoder().encode('SECUREFILE'); // 10 bytes
export const FORMAT_VERSION = 1;
export const SUPPORTED_VERSIONS = [1];
export const KDF_PBKDF2_SHA256 = 1; // algorithm IDs stored in the header
export const CIPHER_AES_256_GCM = 1;

// 600,000 matches OWASP's 2023+ guidance for PBKDF2-HMAC-SHA256. Change here only.
export const PBKDF2_ITERATIONS = 600_000;
export const MIN_ITERATIONS = 100_000; // bounds applied when READING a file (anti-DoS)
export const MAX_ITERATIONS = 10_000_000;

export const SALT_BYTES = 16;
export const IV_BYTES = 12; // 96-bit IV is the recommended size for AES-GCM
export const TAG_BYTES = 16;
export const KEY_BITS = 256;
// magic(10) + version(1) + kdf(1) + cipher(1) + iterations(4) + salt(16) + iv(12)
export const HEADER_BYTES = 10 + 1 + 1 + 1 + 4 + SALT_BYTES + IV_BYTES;

export const MAX_FILE_BYTES = 512 * 1024 * 1024; // in-memory processing limit
export const MIN_PASSWORD_LENGTH = 8;
export const EXTENSION = '.sfile';

export const STATUS = {
  IDLE: 'IDLE', SCANNING: 'SCANNING', FILE_SELECTED: 'FILE_SELECTED', VALIDATING: 'VALIDATING',
  PROCESSING: 'PROCESSING', SUCCESS: 'SUCCESS', ERROR: 'ERROR',
};

export const ERRORS = {
  NO_FILE: 'No file selected.',
  FILE_TOO_LARGE: 'This file is too large to process in memory (limit 512 MB).',
  PASSWORD_EMPTY: 'Password is empty.',
  PASSWORD_MISMATCH: "Passwords don't match.",
  PASSWORD_WEAK: `Password does not meet the minimum requirement (at least ${MIN_PASSWORD_LENGTH} characters).`,
  INVALID_FORMAT: 'Invalid SecureFile format.',
  UNSUPPORTED_VERSION: 'Unsupported SecureFile version.',
  AUTH_FAILED: 'The password may be incorrect, or the encrypted file may have been modified or corrupted.',
  CORRUPTED: 'Encrypted data appears corrupted.',
  ENCRYPT_FAILED: 'Encryption failed.',
  DECRYPT_FAILED: 'Decryption failed.',
};

export class SecureFileError extends Error {
  constructor(code) { super(ERRORS[code] ?? ERRORS.DECRYPT_FAILED); this.code = code; }
}
