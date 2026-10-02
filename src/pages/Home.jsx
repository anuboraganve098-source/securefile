const FEATURES = [
  ['🔒', 'Client-side', 'Your file is processed locally in your browser.'],
  ['🛡️', 'AES-GCM', 'Authenticated encryption protects confidentiality and detects tampering.'],
  ['🚫', 'No upload', 'Files and passwords are not sent to a server.'],
];
const FLOW = ['Your file', 'Password', 'PBKDF2', 'AES-256-GCM', 'Encrypted file'];

export default function Home() {
  return (
    <main className="page">
      <section className="hero">
        <h1>Protect your files.<br />Locally. Privately.</h1>
        <p className="lead">Encrypt and decrypt files directly in your browser. Your files never need to leave your device.</p>
        <div className="row center">
          <a className="btn primary" href="#/encrypt">Encrypt a file</a>
          <a className="btn ghost" href="#/decrypt">Decrypt a file</a>
        </div>
      </section>
      <section className="grid3" aria-label="Features">
        {FEATURES.map(([icon, title, text]) => (
          <div className="card" key={title}><div className="icon" aria-hidden="true">{icon}</div><h2>{title}</h2><p className="muted">{text}</p></div>
        ))}
      </section>
      <section className="card flow" aria-labelledby="how">
        <h2 id="how">How it works</h2>
        <ol>{FLOW.map((s) => <li key={s}>{s}</li>)}</ol>
      </section>
      <p className="muted small disclaimer">
        SecureFile is only as strong as your password and your device. It cannot protect against malware, keyloggers, or a compromised browser. See the Security page.
      </p>
    </main>
  );
}
