import { MIN_PASSWORD_LENGTH } from '../crypto/constants.js';

const COMMON = ['password', '12345678', 'qwerty', 'letmein', 'iloveyou', 'admin', 'welcome'];
export const STRENGTH_LABELS = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];

// Heuristic only: length matters most; character variety helps a little.
export function scorePassword(pw) {
  if (!pw) return 0;
  if (COMMON.some((c) => pw.toLowerCase().includes(c)) || /^(.)\1+$/.test(pw)) return 0;
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  const points = (pw.length >= 8) + (pw.length >= 12) + (pw.length >= 16) + (classes >= 3);
  return Math.min(4, points);
}
// Returns an ERRORS key, or null when acceptable.
export function validateNewPassword(pw, confirm) {
  if (!pw) return 'PASSWORD_EMPTY';
  if (pw.length < MIN_PASSWORD_LENGTH) return 'PASSWORD_WEAK';
  if (pw !== confirm) return 'PASSWORD_MISMATCH';
  return null;
}
