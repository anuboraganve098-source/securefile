import { formatBytes } from '../utils/fileUtils.js';

// Simple result first; technical information is passed as `children` (collapsed by default).
export default function ResultCard({ title, name, size, checks = [], actionLabel, onAction, onReset, children }) {
  return (
    <div className="result" role="status">
      <h3>{title}</h3>
      <div className="rname">{name}</div>
      <div className="muted">{formatBytes(size)}</div>
      <ul className="checks">{checks.map((c) => <li key={c}>✓ {c}</li>)}</ul>
      <div className="row">
        <button type="button" className="btn primary" onClick={onAction}>{actionLabel}</button>
        <button type="button" className="btn ghost" onClick={onReset}>Start over</button>
      </div>
      {children}
    </div>
  );
}
