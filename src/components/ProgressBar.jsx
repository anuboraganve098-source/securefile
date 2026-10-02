// Web Crypto reports no progress, so this is honestly indeterminate.
export default function ProgressBar({ active, label }) {
  if (!active) return null;
  return <div className="progress" role="progressbar" aria-label={label}><span /></div>;
}
