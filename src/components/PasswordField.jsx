import { useState } from 'react';

export default function PasswordField({ id, label, value, onChange, disabled, autoComplete = 'off' }) {
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="pw">
        <input id={id} type={show ? 'text' : 'password'} value={value} disabled={disabled}
          autoComplete={autoComplete} spellCheck="false" onChange={(e) => onChange(e.target.value)} />
        <button type="button" className="btn ghost sm" aria-pressed={show} aria-label={`${show ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
          onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button>
      </div>
    </div>
  );
}
