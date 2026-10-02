import { formatBytes } from '../utils/fileUtils.js';

const EXEC_TEXT = 'This file type can contain executable code. SecureFile will treat the file only as data and will not execute it.';
const VIEWS = {
  normal: { icon: '🟢', cls: 'ok', title: 'Security Scan Complete', status: 'No obvious suspicious characteristics detected',
    text: 'No obvious suspicious characteristics were detected in this file.' },
  risky: { icon: '🟠', cls: 'warn', title: 'Potentially Risky File Detected', status: 'Potentially risky file' },
  suspicious: { icon: '🔴', cls: 'bad', title: 'Security Warning', status: 'Suspicious characteristics detected',
    text: 'This file has characteristics that may require further investigation. SecureFile cannot determine whether a file is malware based only on local file analysis.' },
};

export default function SecurityScanCard({ scan, onContinue, onCancel }) {
  const view = VIEWS[scan.level];
  const flagged = scan.findings.filter((f) => f.weight > 0);
  const notes = scan.findings.filter((f) => f.weight === 0);
  const text = view.text ?? (flagged.some((f) => f.category === 'executable' || f.category === 'script')
    ? EXEC_TEXT : "This file's characteristics do not match its label. SecureFile will treat the file only as data and will not execute it.");
  const copy = () => { try { navigator.clipboard.writeText(scan.sha256); } catch { /* clipboard unavailable */ } };

  return (
    <section className={`scan ${view.cls}`} role={scan.level === 'normal' ? 'status' : 'alert'} aria-labelledby="scan-h">
      <div className="scan-head"><span className="scan-icon" aria-hidden="true">{view.icon}</span>
        <div><h2 id="scan-h">{view.title}</h2><p>{text}</p></div></div>

      <dl className="kv">
        <div><dt>File name</dt><dd>{scan.name}</dd></div>
        <div><dt>File type</dt><dd>{scan.detectedType ?? (scan.mime || (scan.ext ? `.${scan.ext}` : 'Unknown'))}</dd></div>
        <div><dt>File size</dt><dd>{formatBytes(scan.size)}</dd></div>
        <div><dt>Security status</dt><dd>{view.status}</dd></div>
      </dl>
      {flagged.length > 0 && (
        <div className="reasons"><strong>{scan.level === 'suspicious' ? 'Detected characteristics' : 'Reason for warning'}</strong>
          <ul>{flagged.map((f) => <li key={f.id}>{f.text}</li>)}</ul></div>
      )}
      <div className="hash"><span className="muted small">SHA-256 fingerprint</span>
        <code>{scan.sha256}</code>
        <button type="button" className="btn ghost sm" onClick={copy}>Copy</button></div>

      <details className="tech"><summary>Technical details</summary>
        <dl className="kv">
          <div><dt>Extension</dt><dd>{scan.ext ? `.${scan.ext}` : 'none'}</dd></div>
          <div><dt>Declared MIME type</dt><dd>{scan.mime || 'not provided'}</dd></div>
          <div><dt>Signature (magic bytes)</dt><dd>{scan.detectedType ?? 'no known signature'}</dd></div>
          <div><dt>Size</dt><dd>{scan.size.toLocaleString()} bytes</dd></div>
          <div><dt>Checks</dt><dd>Extension, MIME, signature, filename, size</dd></div>
        </dl>
        {notes.map((n) => <p key={n.id} className="muted small">{n.text}</p>)}
        <p className="muted small">Analysis ran locally; the file and its hash were not sent anywhere and the file was not executed.
          This is a limited assessment, not an antivirus scan. Further analysis may be required.</p>
      </details>

      <div className="row">
        {scan.level === 'normal'
          ? <button type="button" className="btn primary" onClick={onContinue}>Continue to Encryption</button>
          : <button type="button" className="btn" onClick={onContinue}>Encrypt Anyway</button>}
        <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
      </div>
    </section>
  );
}
