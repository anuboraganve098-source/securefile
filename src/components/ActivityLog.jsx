import { useCallback, useState } from 'react';

// In-memory only. Callers must never pass passwords, keys, contents or filenames.
export function useActivityLog() {
  const [entries, setEntries] = useState([]);
  const log = useCallback((message) =>
    setEntries((prev) => [...prev, { time: new Date().toLocaleTimeString('en-GB'), message }]), []);
  return { entries, log };
}

export default function ActivityLog({ entries }) {
  return (
    <section className="card" aria-labelledby="al-h">
      <h2 id="al-h">Activity</h2>
      {entries.length === 0 ? <p className="muted">Nothing yet. Events appear here for this session only.</p> : (
        <ol className="log" role="log" aria-live="polite">
          {entries.map((e, i) => <li key={i}><time>{e.time}</time> {e.message}</li>)}
        </ol>
      )}
    </section>
  );
}
