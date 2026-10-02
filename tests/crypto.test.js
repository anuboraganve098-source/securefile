import test from 'node:test';
import assert from 'node:assert/strict';
import { encryptFile } from '../src/crypto/encryption.js';
import { decryptFile } from '../src/crypto/decryption.js';

const PW = 'correct horse battery staple';
const toFile = async (blob, name = 'renamed.bin') => new File([await blob.arrayBuffer()], name);
const bytesOf = async (blob) => new Uint8Array(await blob.arrayBuffer());
const rejectsWith = (p, code) => assert.rejects(p, (e) => e.code === code);

test('1. round trip restores exact bytes, name and type', async () => {
  const original = new File(['hello world'], 'hello.txt', { type: 'text/plain' });
  const enc = await encryptFile(original, PW);
  assert.equal(enc.name, 'hello.sfile');
  const dec = await decryptFile(await toFile(enc.blob), PW);
  assert.equal(await dec.blob.text(), 'hello world');
  assert.equal(dec.name, 'hello.txt');
  assert.equal(dec.type, 'text/plain');
});

test('1b. unicode filename and empty file', async () => {
  const dec = await decryptFile(await toFile((await encryptFile(new File([], 'résumé 日本.txt'), PW)).blob), PW);
  assert.equal(dec.size, 0);
  assert.equal(dec.name, 'résumé 日本.txt');
});

test('2. same file + password gives different salt, IV and ciphertext', async () => {
  const f = new File(['same'], 'a.txt');
  const a = await bytesOf((await encryptFile(f, PW)).blob);
  const b = await bytesOf((await encryptFile(f, PW)).blob);
  assert.notDeepEqual(a.slice(17, 33), b.slice(17, 33)); // salt
  assert.notDeepEqual(a.slice(33, 45), b.slice(33, 45)); // IV
  assert.notDeepEqual(a.slice(45), b.slice(45));
});

test('3. wrong password fails authentication', async () => {
  const enc = await encryptFile(new File(['x'], 'a.txt'), PW);
  await rejectsWith(decryptFile(await toFile(enc.blob), 'wrong password'), 'AUTH_FAILED');
});

test('4. modified ciphertext or header fails authentication', async () => {
  const bytes = await bytesOf((await encryptFile(new File(['secret data'], 'a.txt'), PW)).blob);
  for (const index of [60, bytes.length - 1, 40 /* IV */]) {
    const bad = bytes.slice(); bad[index] ^= 1;
    await rejectsWith(decryptFile(new File([bad], 'x.sfile'), PW), 'AUTH_FAILED');
  }
});

test('5. renamed file still decrypts (identified by internal format)', async () => {
  const enc = await encryptFile(new File(['x'], 'a.txt'), PW);
  assert.equal((await decryptFile(await toFile(enc.blob, 'holiday.jpg'), PW)).name, 'a.txt');
});

test('6. random, truncated and future-version files are rejected', async () => {
  await rejectsWith(decryptFile(new File([crypto.getRandomValues(new Uint8Array(200))], 'r.sfile'), PW), 'INVALID_FORMAT');
  const bytes = await bytesOf((await encryptFile(new File(['x'], 'a.txt'), PW)).blob);
  await rejectsWith(decryptFile(new File([bytes.slice(0, 30)], 't.sfile'), PW), 'CORRUPTED');
  const v2 = bytes.slice(); v2[10] = 2;
  await rejectsWith(decryptFile(new File([v2], 'v.sfile'), PW), 'UNSUPPORTED_VERSION');
});

test('7. container metadata: sizes, SHA-256, salt/IV round trip; no secrets stored', async () => {
  const pw = 'Tr0ub4dor&3-unique';
  const enc = await encryptFile(new File(['abc'], 'm.txt', { type: 'text/plain' }), pw);
  const bytes = await bytesOf(enc.blob);
  const hex = (u) => [...u].map((b) => b.toString(16).padStart(2, '0')).join('');
  assert.equal(enc.originalSize, 3);
  assert.equal(enc.tech.sha256, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.equal(enc.tech.saltHex, hex(bytes.slice(17, 33)));
  assert.equal(enc.tech.ivHex, hex(bytes.slice(33, 45)));
  assert.ok(!Buffer.from(bytes).includes(Buffer.from(pw)), 'password must not appear in the container');
  const dec = await decryptFile(await toFile(enc.blob), pw);
  assert.equal(dec.tech.sha256, enc.tech.sha256);
  assert.equal(dec.tech.saltHex, enc.tech.saltHex);
  assert.equal(dec.tech.ivHex, enc.tech.ivHex);
  assert.equal(dec.tech.version, 1);
  const enc2 = await encryptFile(new File(['abc'], 'm.txt'), pw);
  assert.notEqual(enc2.tech.saltHex, enc.tech.saltHex);
  assert.notEqual(enc2.tech.ivHex, enc.tech.ivHex);
});
