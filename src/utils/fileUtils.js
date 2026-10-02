import { MAX_FILE_BYTES } from '../crypto/constants.js';

export function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  const units = ['KB', 'MB', 'GB'];
  let i = -1;
  do { n /= 1024; i++; } while (n >= 1024 && i < units.length - 1);
  return `${n.toFixed(1)} ${units[i]}`;
}
export function stripExtension(name) {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(0, dot) : name;
}
// Decrypted names come from file metadata: strip path separators/control chars.
export function sanitizeFilename(name) {
  const clean = String(name ?? '').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').trim();
  return clean || 'decrypted-file';
}
export function validateFile(file) {
  if (!file) return 'NO_FILE';
  if (file.size > MAX_FILE_BYTES) return 'FILE_TOO_LARGE';
  return null;
}
