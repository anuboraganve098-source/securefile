import { useState } from 'react';
import FileDropzone from '../components/FileDropzone.jsx';
import FileInfo from '../components/FileInfo.jsx';
import PasswordField from '../components/PasswordField.jsx';
import PasswordStrength from '../components/PasswordStrength.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import SecurityPanel from '../components/SecurityPanel.jsx';
import ActivityLog, { useActivityLog } from '../components/ActivityLog.jsx';
import SecurityScanCard from '../components/SecurityScanCard.jsx';
import TechnicalDetails from '../components/TechnicalDetails.jsx';
import { runSecurityScan, LEVEL_STATUS } from '../scan/index.js';
import ResultCard from '../components/ResultCard.jsx';
import { encryptFile } from '../crypto/encryption.js';
import { STATUS, ERRORS } from '../crypto/constants.js';
import { validateFile, formatBytes } from '../utils/fileUtils.js';
import { validateNewPassword } from '../utils/passwordUtils.js';
import { downloadBlob } from '../utils/download.js';

export default function Encrypt() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState(STATUS.IDLE);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [scan, setScan] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const { entries, log } = useActivityLog();
  const busy = status === STATUS.SCANNING || status === STATUS.VALIDATING || status === STATUS.PROCESSING;

  // Selecting a file only runs the local scan; encryption stays locked until the user reviews it.
  const select = async (f) => {
    setFile(f); setResult(null); setError(''); setScan(null); setAccepted(false);
    setStatus(STATUS.SCANNING); log('File selected'); log('Local security scan started');
    try {
      setScan(await runSecurityScan(f));
      log('Security scan complete'); setStatus(STATUS.FILE_SELECTED);
    } catch {
      setError('Security scan could not be completed. Remove the file and try again.'); setStatus(STATUS.ERROR);
    }
  };
  const reset = () => { setFile(null); setScan(null); setAccepted(false); setPassword(''); setConfirm(''); setResult(null); setError(''); setStatus(STATUS.IDLE); };

  const run = async (e) => {
    e.preventDefault();
    if (busy || !scan || !accepted) return; // scan review is required first; prevent concurrent operations
    setError(''); setStatus(STATUS.VALIDATING);
    const problem = validateFile(file) || validateNewPassword(password, confirm);
    if (problem) { setError(ERRORS[problem]); setStatus(STATUS.ERROR); return; }
    log('Password validated');
    setStatus(STATUS.PROCESSING);
    await new Promise((r) => setTimeout(r, 30)); // let the UI paint before PBKDF2 blocks
    try {
      log('Key derivation and encryption started');
      const out = await encryptFile(file, password);
      setResult({ ...out, from: file.name });
      setPassword(''); setConfirm(''); // drop secrets from state as soon as possible
      log('Encryption completed'); log('Secure file ready');
      setStatus(STATUS.SUCCESS);
    } catch (err) {
      setError(err.message); log('Encryption failed'); setStatus(STATUS.ERROR);
    }
  };

  return (
    <main className="page">
      <h1>Encrypt file</h1>
      <p className="lead">Protect a file with a password. Everything happens locally in your browser.</p>
      <div className="workspace">
        <div className="card">
          {status === STATUS.SUCCESS && result ? (
            <ResultCard title="Encryption Complete 🔐" name={result.from} size={result.originalSize}
              checks={['AES-256-GCM encryption', 'Integrity protection enabled', 'File processed locally', 'Nothing uploaded to a server']}
              actionLabel="Download .sfile" onAction={() => downloadBlob(result.blob, result.name)} onReset={reset}>
              <TechnicalDetails info={{ ...result.tech, fileType: scan?.detectedType ?? (scan?.mime || (scan?.ext && `.${scan.ext}`)),
                assessment: scan && LEVEL_STATUS[scan.level] }} />
            </ResultCard>
          ) : (
            <>
              {!file && <FileDropzone onFile={select} disabled={busy} prompt="Drop your file here" />}
              {file && status === STATUS.SCANNING && (<><FileInfo file={file} onRemove={reset} disabled /><p className="muted" role="status">Scanning locally…</p><ProgressBar active label="Scanning file" /></>)}
              {file && !scan && status === STATUS.ERROR && (<><FileInfo file={file} onRemove={reset} /><div className="alert" role="alert">⚠ {error}</div></>)}
              {scan && !accepted && (
                <SecurityScanCard scan={scan} onCancel={reset}
                  onContinue={() => { setAccepted(true); log('Scan reviewed; continuing to encryption'); }} />
              )}
              {scan && accepted && (
                <form onSubmit={run} noValidate>
                  <FileInfo file={file} onRemove={reset} disabled={busy} />
                  <PasswordField id="enc-pw" label="Password" value={password} onChange={setPassword} disabled={busy} autoComplete="new-password" />
                  <PasswordStrength password={password} />
                  <PasswordField id="enc-confirm" label="Confirm password" value={confirm} onChange={setConfirm} disabled={busy} autoComplete="new-password" />
                  {error && <div className="alert" role="alert">⚠ {error}</div>}
                  <ProgressBar active={busy} label="Encrypting" />
                  <button type="submit" className="btn primary wide" disabled={busy}>{busy ? 'Encrypting…' : '🔒 Encrypt file'}</button>
                  <p className="muted small">Your file and password never leave this device. Lose the password and the file cannot be recovered.</p>
                </form>
              )}
            </>
          )}
        </div>
        <aside className="side"><SecurityPanel /><ActivityLog entries={entries} /></aside>
      </div>
    </main>
  );
}
