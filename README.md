# SecureFile — File Encryption & Decryption Tool

A 100% client-side web app that encrypts and decrypts files with the browser's native **Web Crypto API**. No backend, database, accounts, or uploads. No crypto libraries.

## Features
Encrypt any file to a versioned `.sfile` container · decrypt it back with original name and MIME type · password strength hint · activity log (session only) · responsive, accessible dark UI.

## Architecture
```
 Encrypt: file + password → random salt, IV → PBKDF2 → AES-256-GCM → .sfile → download
 Decrypt: .sfile → parse header → PBKDF2(password, salt) → AES-GCM verify+decrypt → download
 Browser only ── ✗ no network I/O (a CSP in index.html blocks external connections)
```
React components never contain cryptography; they call `src/crypto/*`.

## Cryptographic design
| Choice | Why |
|---|---|
| **PBKDF2-HMAC-SHA-256**, 600,000 iterations (`constants.js`) | Passwords aren't keys. PBKDF2 is natively available in Web Crypto and makes guessing slow. Chosen over Argon2 because Argon2 would need an external library. |
| **AES-256-GCM** | Confidentiality plus authentication in one native primitive; tampering is detected. |
| **16-byte random salt** per file | Same password → different key every time; defeats precomputation. |
| **12-byte random IV** per file | GCM breaks if an IV repeats under one key. Fresh `crypto.getRandomValues` IV *and* fresh salt (so a fresh key) each time. |
| **Header as AAD** | Version, KDF, iteration count, salt and IV are authenticated; changing them fails decryption. |
| **Metadata inside ciphertext** | Filename and MIME type are encrypted, not just authenticated (the simplest way to avoid leaking them). |
| **Non-extractable CryptoKey** | The raw key is never visible to JavaScript, stored, or serialized. |

### `.sfile` format (v1, big-endian)
```
0-9   "SECUREFILE"   10 version   11 KDF id   12 cipher id
13-16 iterations     17-32 salt   33-44 IV
45…   AES-GCM( uint32 metaLen | JSON{name,type} | file bytes ) + 16-byte tag
```
Unknown versions are rejected, so v2 can coexist later. Iteration counts read from a file are bounded (100k–10M) so a crafted file cannot freeze the tab.

## Security model & threat model
Protects file contents and metadata at rest/in transit against anyone without the password, and detects modification. Wrong password and tampering are intentionally reported with the same message and release no plaintext (GCM verifies before output).

## Limitations
Does **not** protect against: malware on the device, a compromised browser, keyloggers, malicious browser extensions, shared or weak passwords, or a lost password (no recovery exists). Not "unbreakable". Files are processed fully in memory (several copies at once): capped at 512 MB, and mobile devices may fail earlier. There is no progress percentage since Web Crypto exposes none. Passwords are held in React state only while typing and are cleared after each operation; JavaScript cannot guarantee memory wiping. The app has not had an independent audit.

## Result screens & technical details
Results show only the file name, size and plain-language checks. A collapsed **View Technical Details** panel holds algorithm, KDF, format version, integrity status, SHA-256, and (under *Advanced*) salt and IV, truncated with Show full / Copy. The `.sfile` still carries all required metadata: version, KDF/cipher IDs, iterations, salt and IV in the authenticated header; filename, MIME type, original size and SHA-256 inside the encrypted payload. On decryption the stored SHA-256 is re-checked against the restored bytes. Passwords and keys are never stored or displayed. The app has no separate dashboard; the Security details panel and Activity log serve that role.

## Pre-encryption security scan
Selecting a file runs a local assessment (`src/scan/`) before the password step: extension, MIME type, magic bytes, filename tricks (double extensions, hidden direction characters), size, and a SHA-256 fingerprint. Results are **Normal** (no obvious suspicious characteristics), **Potentially risky** (executable/script types or mismatches) or **Suspicious** (multiple characteristics). The file is only read as bytes, never executed or uploaded, and the hash is never transmitted. It is not an antivirus: it cannot tell whether a file is malware. Analyzers are plain `ctx -> findings[]` functions; `runSecurityScan(file, { extraAnalyzers })` is the extension point for an optional future threat-intelligence provider (which must require explicit user consent). Encryption does not depend on the scan module. Note that browsers derive `file.type` from the extension, so signature checks catch most real mismatches.

## Stack
React 18 · Vite 5 · plain CSS · Web Crypto API.

## Structure
`src/crypto` (constants, keyDerivation, encryption, decryption, fileFormat) · `src/components` · `src/pages` · `src/utils` · `tests/crypto.test.js`. Routing is hash-based (`#/encrypt`) to avoid a dependency.

## Installation & usage
```
npm install
npm run dev      # development
npm run build    # static output in dist/ — host anywhere
```
Encrypt: choose a file → set a password (min 8 chars, longer is better) → Encrypt → Download. Decrypt: choose the `.sfile` → password → Decrypt → Download.

## Testing
`npm test` runs Node's built-in runner (Node 20+) against the real crypto modules: round trip, unicode/empty files, fresh salt/IV, wrong password, tampered ciphertext/IV, renamed file, random/truncated/future-version files. Crypto (7) and scan (8) tests pass. Do the manual UI checks too (drag-and-drop, mobile menu, keyboard).

## Future improvements
Streaming encryption for very large files · Web Worker processing · additional KDF options · drag-and-drop improvements · file integrity information · optional public-key encryption · desktop version · automated security tests in CI.
