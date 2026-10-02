import { KEY_BITS } from './constants.js';

// Password -> non-extractable AES-256-GCM key via PBKDF2-HMAC-SHA-256.
// The password is never used as a key directly, and the key never leaves Web Crypto.
export async function deriveKey(password, salt, iterations) {
  const enc = new TextEncoder();
  // NFC so the same visible password typed on different devices derives the same key.
  const material = await crypto.subtle.importKey('raw', enc.encode(password.normalize('NFC')), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    material,
    { name: 'AES-GCM', length: KEY_BITS },
    false, // non-extractable: JS code cannot read the raw key bytes
    ['encrypt', 'decrypt'],
  );
}
