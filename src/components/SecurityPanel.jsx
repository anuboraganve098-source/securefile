import { PBKDF2_ITERATIONS } from '../crypto/constants.js';

const ROWS = [
  ['Encryption', 'AES-256-GCM'],
  ['Key derivation', `PBKDF2-HMAC-SHA-256, ${PBKDF2_ITERATIONS.toLocaleString()} iterations`],
  ['Key size', '256-bit'],
  ['Random salt', '128-bit, generated per encryption'],
  ['Random IV', '96-bit, generated per encryption'],
  ['Authentication', 'Enabled (128-bit tag, header authenticated)'],
  ['Processing', 'Client-side only'],
];
export default function SecurityPanel() {
  return (
    <section className="card" aria-labelledby="sp-h">
      <h2 id="sp-h">Security details</h2>
      <dl className="kv">{ROWS.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
    </section>
  );
}
