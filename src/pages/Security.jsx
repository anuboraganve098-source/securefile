const TOPICS = [
  ['Why AES-GCM?', 'AES is a widely reviewed cipher; GCM mode adds authentication. Confidentiality hides the contents, and a built-in tag proves the data was not modified. If even one byte changes, decryption fails instead of returning garbage.'],
  ['Why PBKDF2?', 'Passwords are short and predictable; AES needs a 256-bit key. PBKDF2 stretches the password through hundreds of thousands of hash rounds, producing a proper key and making each password guess slow for an attacker.'],
  ['What is a salt?', 'A random value stored in the file and mixed into key derivation. It makes the same password derive a different key every time, and defeats precomputed guess tables.'],
  ['What is an IV?', 'A random 96-bit value that makes each AES-GCM encryption unique. Reusing an IV with the same key breaks GCM security, so SecureFile generates a new one for every file (and a new key, via a new salt).'],
];
const LIMITS = ['Malware already controlling your device', 'A compromised browser', 'Keyloggers', 'Sharing your password', 'Weak passwords', 'Losing your password (there is no recovery)', 'Malicious browser extensions with sufficient privileges'];

export default function Security() {
  return (
    <main className="page narrow">
      <h1>Security</h1>
      <p className="lead">How SecureFile protects your files, in plain language.</p>
      {TOPICS.map(([t, p]) => <section className="card" key={t}><h2>{t}</h2><p>{p}</p></section>)}
      <section className="card">
        <h2>Client-side processing</h2>
        <pre className="diagram" aria-label="Everything happens in your browser; nothing is uploaded">{`Your browser
  ├─ File
  ├─ Password
  ├─ Key derivation
  ├─ Encryption / Decryption
  └─ ✗ No server upload`}</pre>
        <p className="muted">Files are processed in memory, so very large files may fail on low-memory devices (limit set to 512 MB).</p>
      </section>
      <section className="card">
        <h2>What it does not protect against</h2>
        <ul>{LIMITS.map((l) => <li key={l}>{l}</li>)}</ul>
        <p className="muted">SecureFile makes no claim to be unbreakable.</p>
      </section>
    </main>
  );
}
