/**
 * Diffs current findings against `.security/baseline.json` and
 * `.security/allowlist.json`. Fails (exit 1) when new findings appear
 * at or above SECURITY_FAIL_LEVEL.
 *
 * Usage:
 *   bunx tsx scripts/security-diff.ts <current.json>
 *   bunx tsx scripts/security-diff.ts <current.json> --update-baseline
 *
 * Env:
 *   SECURITY_FAIL_LEVEL = info | warn | error (default: warn)
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

interface Finding {
  internal_id: string;
  scanner_name: string;
  name: string;
  level: 'info' | 'warn' | 'error' | string;
  description?: string;
}

const LEVEL_ORDER = { info: 0, warn: 1, error: 2 } as const;
type Level = keyof typeof LEVEL_ORDER;

const args = process.argv.slice(2);
const currentPath = args.find((a) => !a.startsWith('--'));
const updateBaseline = args.includes('--update-baseline');
const failLevel = (process.env.SECURITY_FAIL_LEVEL ?? 'warn') as Level;

if (!currentPath) {
  console.error('Usage: security-diff.ts <current.json> [--update-baseline]');
  process.exit(2);
}

const root = process.cwd();
const baselinePath = resolve(root, '.security/baseline.json');
const allowlistPath = resolve(root, '.security/allowlist.json');
const newOutPath = resolve(root, 'security-new.json');

const current: Finding[] = JSON.parse(readFileSync(currentPath, 'utf8'));
const baseline: Finding[] = existsSync(baselinePath)
  ? JSON.parse(readFileSync(baselinePath, 'utf8'))
  : [];
const allowlist: { internal_id: string; reason: string }[] = existsSync(allowlistPath)
  ? JSON.parse(readFileSync(allowlistPath, 'utf8'))
  : [];

const key = (f: Finding) => `${f.scanner_name}::${f.internal_id}`;
const baselineKeys = new Set(baseline.map(key));
const allowKeys = new Set(allowlist.map((a) => a.internal_id));

const newFindings = current.filter(
  (f) => !baselineKeys.has(key(f)) && !allowKeys.has(f.internal_id),
);

const threshold = LEVEL_ORDER[failLevel] ?? LEVEL_ORDER.warn;
const blocking = newFindings.filter(
  (f) => (LEVEL_ORDER[(f.level as Level) ?? 'info'] ?? 0) >= threshold,
);

if (updateBaseline) {
  writeFileSync(baselinePath, JSON.stringify(current, null, 2) + '\n');
  console.log(`Baseline updated with ${current.length} findings.`);
  process.exit(0);
}

writeFileSync(newOutPath, JSON.stringify(newFindings, null, 2));

console.log(`Baseline:   ${baseline.length}`);
console.log(`Current:    ${current.length}`);
console.log(`Allowlist:  ${allowlist.length}`);
console.log(`New:        ${newFindings.length}`);
console.log(`Fail level: ${failLevel} (blocking: ${blocking.length})`);

if (blocking.length > 0) {
  console.error('\n❌ New security findings detected:\n');
  for (const f of blocking) {
    console.error(`  [${f.level}] ${f.scanner_name} :: ${f.internal_id} — ${f.name}`);
  }
  console.error(
    '\nFix them or, if intentional, add to .security/allowlist.json with justification, ' +
      'or refresh the baseline via: bunx tsx scripts/security-diff.ts <current.json> --update-baseline',
  );
  process.exit(1);
}

console.log('\n✅ No new blocking security findings.');
