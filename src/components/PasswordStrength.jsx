import { scorePassword, STRENGTH_LABELS } from '../utils/passwordUtils.js';

export default function PasswordStrength({ password }) {
  if (!password) return null;
  const score = scorePassword(password);
  return (
    <div className="strength" aria-live="polite">
      <div className="bars" aria-hidden="true">
        {[1, 2, 3, 4].map((n) => <span key={n} className={n <= score ? `on s${score}` : ''} />)}
      </div>
      <span>Password strength: {STRENGTH_LABELS[score]}</span>
      <p className="muted small">Long, unique passwords are generally harder to guess. This is an estimate, not a guarantee.</p>
    </div>
  );
}
