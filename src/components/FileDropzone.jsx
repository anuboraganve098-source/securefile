import { useRef, useState } from 'react';

export default function FileDropzone({ onFile, disabled, prompt }) {
  const input = useRef(null);
  const [over, setOver] = useState(false);
  const pick = () => !disabled && input.current?.click();
  return (
    <div
      className={`dropzone${over ? ' over' : ''}${disabled ? ' disabled' : ''}`}
      role="button" tabIndex={disabled ? -1 : 0} aria-disabled={disabled} aria-label={`${prompt}. Press Enter to browse files.`}
      onClick={pick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } }}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); if (!disabled && e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]); }}
    >
      <span className="dz-icon" aria-hidden="true">📁</span>
      <strong>{prompt}</strong>
      <span className="muted">or browse files</span>
      <input ref={input} type="file" hidden tabIndex={-1} disabled={disabled}
        onChange={(e) => { if (e.target.files[0]) onFile(e.target.files[0]); e.target.value = ''; }} />
    </div>
  );
}
