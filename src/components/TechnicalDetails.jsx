import { useState } from 'react';

// Long hex values are truncated by default; the user can reveal or copy the full value.
function HexValue({ label, value }) {
  const [full, setFull] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* unavailable */ }
  };
  return (
    <div className="hex">
      <span className="muted small">{label}</span>
      <code>{full ? value : `${value.slice(0, 6)}…${value.slice(-4)}`}</code>
      <button type="button" className="btn ghost sm" onClick={() => setFull(!full)} aria-pressed={full}>{full ? 'Truncate' : 'Show full'}</button>
      <button type="button" className="btn ghost sm" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
    </div>
  );
}

// Never receives the password or derived key; neither exists outside the crypto modules.
export default function TechnicalDetails({ info }) {
  const [open, setOpen] = useState(false);
  const rows = [
    ['Encryption', info.algorithm], ['Key derivation', 'PBKDF2'], ['Format version', String(info.version)],
    ['Integrity', info.integrity], ['File type', info.fileType], ['Security assessment', info.assessment],
    ['Processing', 'Client-side / Local'],
  ].filter(([, v]) => v);
  return (
    <div className="techbox">
      <button type="button" className="btn ghost" aria-expanded={open} aria-controls="tech-panel" onClick={() => setOpen(!open)}>
        View Technical Details {open ? '▴' : '▾'}
      </button>
      {open && (
        <div id="tech-panel" className="tech-panel">
          <h4>Security details</h4>
          <dl className="kv">{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          <HexValue label="SHA-256" value={info.sha256} />
          <p className="muted small">A SHA-256 fingerprint uniquely identifies the file's contents. It is not the encryption key or password. It is never sent anywhere.</p>
          <h4 className="muted">Advanced</h4>
          <p className="muted small">Salt and IV are not secrets; they are stored in the .sfile so it can be decrypted. {info.iterations.toLocaleString()} PBKDF2 iterations.</p>
          <HexValue label="Salt" value={info.saltHex} />
          <HexValue label="IV" value={info.ivHex} />
        </div>
      )}
    </div>
  );
}
