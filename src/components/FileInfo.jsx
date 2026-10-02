import { formatBytes } from '../utils/fileUtils.js';

export default function FileInfo({ file, icon = '📄', onRemove, disabled }) {
  return (
    <div className="fileinfo">
      <span aria-hidden="true" className="fi-icon">{icon}</span>
      <div className="fi-text"><div className="fi-name">{file.name}</div><div className="muted">{formatBytes(file.size)}</div></div>
      <button type="button" className="btn ghost sm" onClick={onRemove} disabled={disabled}>Remove</button>
    </div>
  );
}
