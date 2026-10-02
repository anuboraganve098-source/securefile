import { SecureFileError } from './constants.js';
import { deriveKey } from './keyDerivation.js';
import { parseContainer, unpackPayload } from './fileFormat.js';
import { sha256Hex, toHex } from '../utils/hash.js';
import { sanitizeFilename } from '../utils/fileUtils.js';

export async function decryptFile(file, password) {
  try {
    // Identification is by internal magic/version, never by the filename.
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { version, header, salt, iv, iterations, ciphertext } = parseContainer(bytes);
    const key = await deriveKey(password, salt, iterations);

    let plaintext;
    try {
      // GCM verifies the tag BEFORE returning anything; on failure no plaintext exists.
      plaintext = new Uint8Array(await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv, additionalData: header, tagLength: 128 }, key, ciphertext));
    } catch {
      // Wrong password and tampering are deliberately indistinguishable.
      throw new SecureFileError('AUTH_FAILED');
    }
    const { meta, data } = unpackPayload(plaintext);
    // Defence in depth: the stored fingerprint must match the restored bytes (files from older builds may lack it).
    const sha256 = await sha256Hex(data);
    if (typeof meta.sha256 === 'string' && meta.sha256 !== sha256) throw new SecureFileError('CORRUPTED');
    const type = typeof meta.type === 'string' ? meta.type : 'application/octet-stream';
    return {
      blob: new Blob([data], { type }), name: sanitizeFilename(meta.name), type, size: data.length,
      tech: { version, algorithm: 'AES-256-GCM', kdf: 'PBKDF2-HMAC-SHA-256', iterations, saltHex: toHex(salt), ivHex: toHex(iv),
        sha256, integrity: 'Verified (authentication tag and fingerprint)' },
    };
  } catch (err) {
    if (err instanceof SecureFileError) throw err;
    throw new SecureFileError('DECRYPT_FAILED');
  }
}
