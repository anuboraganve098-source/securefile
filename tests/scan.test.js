import test from 'node:test';
import assert from 'node:assert/strict';
import { runSecurityScan } from '../src/scan/index.js';

const f = (parts, name, type = '') => new File(parts, name, { type });
const MZ = new Uint8Array([0x4d, 0x5a, 0x90, 0, 3, 0, 0, 0]);

test('plain text file is normal, with correct SHA-256', async () => {
  const r = await runSecurityScan(f(['abc'], 'note.txt', 'text/plain'));
  assert.equal(r.level, 'normal');
  assert.equal(r.sha256, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});
test('genuine PNG signature is normal', async () => {
  const r = await runSecurityScan(f([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 13, 10])], 'a.png', 'image/png'));
  assert.equal(r.level, 'normal');
});
test('.exe with MZ header is risky, not suspicious', async () => {
  const r = await runSecurityScan(f([MZ], 'setup.exe'));
  assert.equal(r.level, 'risky');
});
test('.ps1 and .bat are risky', async () => {
  for (const n of ['a.ps1', 'b.bat']) assert.equal((await runSecurityScan(f(['echo'], n))).level, 'risky');
});
test('executable disguised as image is suspicious', async () => {
  const r = await runSecurityScan(f([MZ], 'photo.jpg', 'image/jpeg'));
  assert.equal(r.level, 'suspicious');
});
test('double extension and RTL override are suspicious', async () => {
  assert.equal((await runSecurityScan(f(['x'], 'invoice.pdf.exe'))).level, 'suspicious');
  assert.equal((await runSecurityScan(f(['x'], 'doc\u202Efdp.txt'))).level, 'suspicious');
});
test('PDF content named .png is flagged as mismatch', async () => {
  const r = await runSecurityScan(f(['%PDF-1.7'], 'pic.png'));
  assert.equal(r.level, 'risky');
  assert.ok(r.findings.some((x) => x.category === 'mismatch'));
});
test('empty file does not crash', async () => {
  const r = await runSecurityScan(f([], 'empty.txt'));
  assert.equal(r.level, 'normal');
});
