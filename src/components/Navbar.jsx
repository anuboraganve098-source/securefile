import { useState } from 'react';

const LINKS = [['/', 'Home'], ['/encrypt', 'Encrypt'], ['/decrypt', 'Decrypt'], ['/security', 'Security']];

export default function Navbar({ route }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="nav">
      <a className="brand" href="#/" aria-label="SecureFile home">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 2h8l4 4v6" stroke="#38bdf8" strokeWidth="1.6" strokeLinejoin="round" />
          <rect x="4" y="12" width="16" height="10" rx="2" fill="#38bdf8" />
          <path d="M8 12v-1.5a4 4 0 018 0V12" stroke="#0b1220" strokeWidth="1.6" />
        </svg>
        SecureFile
      </a>
      <button className="menu-btn" aria-expanded={open} aria-controls="nav-links" onClick={() => setOpen(!open)}>
        {open ? 'Close' : 'Menu'}
      </button>
      <nav id="nav-links" aria-label="Main" className={open ? 'links open' : 'links'}>
        {LINKS.map(([path, label]) => (
          <a key={path} href={`#${path}`} aria-current={route === path ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</a>
        ))}
      </nav>
    </header>
  );
}
