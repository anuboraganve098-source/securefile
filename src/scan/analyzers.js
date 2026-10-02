import { RISKY_EXTENSIONS, SIGNATURES, STRICT_EXTENSIONS, EXTENSION_MIMES, EXECUTABLE_MIMES, DECOY_EXTENSIONS } from './scanRules.js';

// Each analyzer is a pure function: ctx -> findings[]. Findings:
//   { id, category: 'executable'|'script'|'mismatch'|'filename'|'info', weight, text }
// `weight` feeds the overall level; weight 0 is informational. Nothing here executes or renders file content.
export const getExtension = (name) => { const i = name.lastIndexOf('.'); return i > 0 ? name.slice(i + 1).toLowerCase() : ''; };

export function detectSignature(head) {
  return SIGNATURES.find((s) => s.bytes.every((b, i) => head[s.offset + i] === b)) ?? null;
}

export function extensionAnalyzer({ ext }) {
  const risky = RISKY_EXTENSIONS[ext];
  return risky ? [{ id: 'ext-risky', category: risky[0], weight: 1, text: `Extension .${ext}: ${risky[1]}. This file type can contain executable code.` }] : [];
}

export function signatureAnalyzer({ ext, signature, size }) {
  const out = [];
  if (!signature || size === 0) {
    if (size > 0 && STRICT_EXTENSIONS.includes(ext))
      out.push({ id: 'sig-missing', category: 'mismatch', weight: 1, text: `Content does not start with a signature expected for .${ext} files.` });
    return out;
  }
  if (signature.kind === 'executable' || signature.kind === 'script') {
    out.push({ id: 'sig-exec', category: signature.kind, weight: 1, text: `File content matches: ${signature.label}.` });
    if (signature.kind === 'executable' && !RISKY_EXTENSIONS[ext])
      out.push({ id: 'sig-disguised', category: 'mismatch', weight: 2, text: `Executable content found in a file named .${ext || '(no extension)'}. The extension does not reveal this.` });
  } else if (ext && !signature.exts.includes(ext) && (STRICT_EXTENSIONS.includes(ext) || Object.keys(EXTENSION_MIMES).includes(ext))) {
    out.push({ id: 'sig-mismatch', category: 'mismatch', weight: 1, text: `Content looks like ${signature.label}, but the extension is .${ext}.` });
  }
  if (signature.id === 'zip') out.push({ id: 'info-container', category: 'info', weight: 0, text: 'Archive and Office formats can embed content that this scan does not inspect.' });
  return out;
}

export function mimeAnalyzer({ ext, mime }) {
  if (!mime) return [];
  const out = [];
  const expected = EXTENSION_MIMES[ext];
  if (expected && !expected.some((m) => mime.startsWith(m)))
    out.push({ id: 'mime-mismatch', category: 'mismatch', weight: 1, text: `Declared MIME type ${mime} does not match extension .${ext}.` });
  if (EXECUTABLE_MIMES.includes(mime))
    out.push({ id: 'mime-exec', category: 'executable', weight: 1, text: `Declared MIME type ${mime} indicates executable content.` });
  return out;
}

export function filenameAnalyzer({ name, ext }) {
  const out = [];
  if (/[\u202A-\u202E\u2066-\u2069\u0000-\u001f]/.test(name))
    out.push({ id: 'name-control', category: 'filename', weight: 3, text: 'Filename contains hidden text-direction or control characters that can disguise the real extension.' });
  const decoy = new RegExp(`\\.(${DECOY_EXTENSIONS.join('|')})\\.([a-z0-9]+)$`, 'i').exec(name);
  if (decoy && RISKY_EXTENSIONS[decoy[2].toLowerCase()])
    out.push({ id: 'name-double', category: 'filename', weight: 2, text: `Double extension (.${decoy[1]}.${decoy[2]}): a document-style name followed by a risky extension.` });
  if (/\s{5,}\.[^.]+$/.test(name))
    out.push({ id: 'name-padding', category: 'filename', weight: 2, text: 'Filename is padded with spaces before the extension, which can hide the real file type.' });
  return out;
}

export function sizeAnalyzer({ size }) {
  return size === 0 ? [{ id: 'info-empty', category: 'info', weight: 0, text: 'File is empty (0 bytes).' }] : [];
}

export const LOCAL_ANALYZERS = [extensionAnalyzer, signatureAnalyzer, mimeAnalyzer, filenameAnalyzer, sizeAnalyzer];
