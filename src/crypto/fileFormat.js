import {
  MAGIC_BYTES, FORMAT_VERSION, SUPPORTED_VERSIONS, KDF_PBKDF2_SHA256, CIPHER_AES_256_GCM,
  HEADER_BYTES, SALT_BYTES, IV_BYTES, TAG_BYTES, MIN_ITERATIONS, MAX_ITERATIONS, SecureFileError,
} from './constants.js';

/*
 * .sfile layout (all integers big-endian):
 *   [0..10)  magic "SECUREFILE"   [10] version   [11] KDF id   [12] cipher id
 *   [13..17) PBKDF2 iterations    [17..33) salt  [33..45) IV
 *   [45..)   AES-GCM ciphertext + 16-byte tag
 * Ciphertext plaintext = uint32 metaLength | metadata JSON | file bytes.
 * Filename and MIME type are INSIDE the encrypted payload so they are confidential.
 * The 45-byte header is passed to AES-GCM as additional authenticated data (AAD),
 * so any header tampering makes authentication fail.
 */
export function buildHeader({ iterations, salt, iv }) {
  const header = new Uint8Array(HEADER_BYTES);
  const view = new DataView(header.buffer);
  header.set(MAGIC_BYTES, 0);
  header[10] = FORMAT_VERSION;
  header[11] = KDF_PBKDF2_SHA256;
  header[12] = CIPHER_AES_256_GCM;
  view.setUint32(13, iterations);
  header.set(salt, 17);
  header.set(iv, 17 + SALT_BYTES);
  return header;
}

export function parseContainer(bytes) {
  const hasMagic = bytes.length >= MAGIC_BYTES.length && MAGIC_BYTES.every((b, i) => bytes[i] === b);
  if (!hasMagic) throw new SecureFileError('INVALID_FORMAT');
  if (bytes.length < 11 || !SUPPORTED_VERSIONS.includes(bytes[10])) throw new SecureFileError('UNSUPPORTED_VERSION');
  if (bytes.length < HEADER_BYTES + TAG_BYTES) throw new SecureFileError('CORRUPTED');
  if (bytes[11] !== KDF_PBKDF2_SHA256 || bytes[12] !== CIPHER_AES_256_GCM) throw new SecureFileError('INVALID_FORMAT');
  const iterations = new DataView(bytes.buffer, bytes.byteOffset).getUint32(13);
  if (iterations < MIN_ITERATIONS || iterations > MAX_ITERATIONS) throw new SecureFileError('INVALID_FORMAT');
  return {
    version: bytes[10],
    iterations,
    salt: bytes.slice(17, 17 + SALT_BYTES),
    iv: bytes.slice(17 + SALT_BYTES, HEADER_BYTES),
    header: bytes.slice(0, HEADER_BYTES),
    ciphertext: bytes.slice(HEADER_BYTES),
  };
}

export function packPayload(meta, data) {
  const metaBytes = new TextEncoder().encode(JSON.stringify(meta));
  const out = new Uint8Array(4 + metaBytes.length + data.length);
  new DataView(out.buffer).setUint32(0, metaBytes.length);
  out.set(metaBytes, 4);
  out.set(data, 4 + metaBytes.length);
  return out;
}

// Only call on AUTHENTICATED plaintext.
export function unpackPayload(payload) {
  if (payload.length < 4) throw new SecureFileError('CORRUPTED');
  const metaLength = new DataView(payload.buffer, payload.byteOffset).getUint32(0);
  if (4 + metaLength > payload.length) throw new SecureFileError('CORRUPTED');
  let meta;
  try { meta = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(payload.subarray(4, 4 + metaLength))); }
  catch { throw new SecureFileError('CORRUPTED'); }
  return { meta, data: payload.subarray(4 + metaLength) };
}
