import { LOCAL_ANALYZERS, detectSignature, getExtension } from './analyzers.js';

import { sha256Hex } from '../utils/hash.js';

export const LEVEL_STATUS = {
  normal: 'No obvious suspicious characteristics detected',
  risky: 'Potentially risky file characteristics detected',
  suspicious: 'Suspicious characteristics detected',
};

export function levelFromScore(score) { return score >= 3 ? 'suspicious' : score >= 1 ? 'risky' : 'normal'; }

/*
 * Local, offline assessment. The file is read as bytes only, never executed, rendered or uploaded.
 * `extraAnalyzers` is the extension point for a FUTURE opt-in threat-intelligence provider:
 * an async (ctx) => findings[] function. Any provider that sends data off-device must require
 * explicit user consent first. Encryption does not depend on this module.
 */
export async function runSecurityScan(file, { extraAnalyzers = [] } = {}) {
  const buffer = await file.arrayBuffer();
  const head = new Uint8Array(buffer, 0, Math.min(32, buffer.byteLength));
  const ctx = { name: file.name, ext: getExtension(file.name), mime: file.type || '', size: file.size, signature: detectSignature(head) };
  const findings = [];
  for (const analyze of [...LOCAL_ANALYZERS, ...extraAnalyzers]) findings.push(...(await analyze(ctx)));
  const score = findings.reduce((sum, f) => sum + f.weight, 0);
  return {
    level: levelFromScore(score), findings, score,
    sha256: await sha256Hex(buffer),
    name: file.name, size: file.size, ext: ctx.ext, mime: ctx.mime,
    detectedType: ctx.signature?.label ?? null,
  };
}
