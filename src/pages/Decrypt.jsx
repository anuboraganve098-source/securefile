import { useState } from 'react';
import FileDropzone from '../components/FileDropzone.jsx';
import FileInfo from '../components/FileInfo.jsx';
import PasswordField from '../components/PasswordField.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import SecurityPanel from '../components/SecurityPanel.jsx';
import ActivityLog, { useActivityLog } from '../components/ActivityLog.jsx';
import TechnicalDetails from '../components/TechnicalDetails.jsx';
import ResultCard from '../components/ResultCard.jsx';
import { decryptFile } from '../crypto/decryption.js';
import { STATUS, ERRORS } from '../crypto/constants.js';
import { validateFile, formatBytes } from '../utils/fileUtils.js';
import { downloadBlob } from '../utils/download.js';

export default function Decrypt() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(STATUS.IDLE);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [failed, setFailed] = useState(false);
  const { entries, log } = useActivityLog();
  const busy = status === STATUS.VALIDATING || status === STATUS.PROCESSING;

  const select = (f) => { setFile(f); setResult(null); setError(''); setStatus(STATUS.FILE_SELECTED); log('File selected'); };
  const reset = () => { setFile(null); setFailed(false); setPassword(''); setResult(null); setError(''); setStatus(STATUS.IDLE); };

  const run = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError(''); setFailed(false); setStatus(STATUS.VALIDATING);
    const problem = validateFile(file) || (!password && 'PASSWORD_EMPTY');
    if (problem) { setError(ERRORS[problem]); setStatus(STATUS.ERROR); return; }
    setStatus(STATUS.PROCESSING);
    await new Promise((r) => setTimeout(r, 30));
    try {
      log('Decryption started');
      const out = await decryptFile(file, password);
      setResult(out); setPassword('');
      log('Authentication verified'); log('Integrity verification passed'); log('Original file restored');
      setStatus(STATUS.SUCCESS);
    } catch (err) {
      setError(err.message); setFailed(true); log('Decryption failed'); setStatus(STATUS.ERROR);
    }
  };

  return (
    <main className="page">
      <h1>Decrypt file</h1>
      <p className="lead">Restore your original file using its password.</p>
      <div className="workspace">
        <div className="card">
          {status === STATUS.SUCCESS && result ? (
            <ResultCard title="Decryption Complete ✓" name={result.name} size={result.size}
              checks={['Password verified', 'Integrity verified', 'File restored successfully', 'Processing completed locally']}
              actionLabel="Download Original File" onAction={() => downloadBlob(result.blob, result.name)} onReset={reset}>
              <TechnicalDetails info={{ ...result.tech, fileType: result.type }} />
            </ResultCard>
          ) : (
            <form onSubmit={run} noValidate>
              {file ? <FileInfo file={file} icon="🔐" onRemove={reset} disabled={busy} />
                : <FileDropzone onFile={select} disabled={busy} prompt="Drop your .sfile here" />}
              <PasswordField id="dec-pw" label="Password" value={password} onChange={setPassword} disabled={busy} autoComplete="current-password" />
              {error && <div className="alert" role="alert">{failed
                ? <><strong>Decryption Failed</strong><br />{error}<br />No decrypted file was produced.</> : <>⚠ {error}</>}</div>}
              <ProgressBar active={busy} label="Decrypting" />
              <button type="submit" className="btn primary wide" disabled={busy}>{busy ? 'Decrypting…' : '🔓 Decrypt file'}</button>
            </form>
          )}
        </div>
        <aside className="side"><SecurityPanel /><ActivityLog entries={entries} /></aside>
      </div>
    </main>
  );
}
