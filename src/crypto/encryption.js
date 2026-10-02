import { FORMAT_VERSION, PBKDF2_ITERATIONS, SALT_BYTES, IV_BYTES, EXTENSION, SecureFileError } from './constants.js';
import { deriveKey } from './keyDerivation.js';
import { buildHeader, packPayload } from './fileFormat.js';
import { sha256Hex, toHex } from '../utils/hash.js';
import { stripExtension } from '../utils/fileUtils.js';

export async function encryptFile(file, password) {
  try {
    const data = new Uint8Array(await file.arrayBuffer());
    // Fresh CSPRNG salt AND IV for every operation. Never Math.random().
    const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
    const header = buildHeader({ iterations: PBKDF2_ITERATIONS, salt, iv });
    const key = await deriveKey(password, salt, PBKDF2_ITERATIONS);
    const sha256 = await sha256Hex(data);
    // Metadata lives INSIDE the encrypted payload: confidential and authenticated. No password/key here.
    const payload = packPayload({ name: file.name, type: file.type || 'application/octet-stream', size: data.length, sha256 }, data);

    // The header is authenticated as AAD; the 128-bit GCM tag is appended to the ciphertext.
    const ciphertext = new Uint8Array(await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv, additionalData: header, tagLength: 128 }, key, payload));

    const out = new Uint8Array(header.length + ciphertext.length);
    out.set(header, 0);
    out.set(ciphertext, header.length);
    return {
      blob: new Blob([out], { type: 'application/octet-stream' }),
      name: stripExtension(file.name) + EXTENSION,
      size: out.length,
      originalSize: data.length,
      tech: { version: FORMAT_VERSION, algorithm: 'AES-256-GCM', kdf: 'PBKDF2-HMAC-SHA-256', iterations: PBKDF2_ITERATIONS,
        saltHex: toHex(salt), ivHex: toHex(iv), sha256, integrity: 'Authentication tag enabled' },
    };
  } catch (err) {
    if (err instanceof SecureFileError) throw err;
    throw new SecureFileError('ENCRYPT_FAILED'); // never surface internals to the UI
  }
}
