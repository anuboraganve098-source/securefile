export const toHex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
// SHA-256 fingerprint of file contents. Identifies content; it is NOT a key or password.
export const sha256Hex = async (data) => toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', data)));
