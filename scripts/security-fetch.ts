/**
 * Fetches current security findings from the configured scanner.
 *
 * Default backend: Aikido (workspace-scoped scanner connected in Lovable).
 * Override AIKIDO_API_BASE if your tenant uses a different region/endpoint.
 *
 * Output: JSON array on stdout with normalized shape:
 *   { internal_id, scanner_name, name, level, description? }[]
 *
 * Exit codes:
 *   0  success (even if no findings)
 *   2  configuration error (missing token, etc.)
 *   3  upstream API error
 */

interface Finding {
  internal_id: string;
  scanner_name: string;
  name: string;
  level: 'info' | 'warn' | 'error' | string;
  description?: string;
}

const TOKEN = process.env.AIKIDO_API_TOKEN;
const BASE = process.env.AIKIDO_API_BASE ?? 'https://app.aikido.dev/api/public/v1';

if (!TOKEN) {
  console.error('AIKIDO_API_TOKEN is not set. Add it as a GitHub Actions secret.');
  process.exit(2);
}

async function main() {
  const res = await fetch(`${BASE}/open-issues/export`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    console.error(`Scanner API ${res.status}: ${await res.text()}`);
    process.exit(3);
  }

  const raw = (await res.json()) as any[];

  const findings: Finding[] = (Array.isArray(raw) ? raw : raw?.issues ?? []).map((r: any) => ({
    internal_id: String(r.internal_id ?? r.id ?? r.rule_id ?? r.fingerprint),
    scanner_name: String(r.scanner_name ?? r.source ?? r.scanner ?? 'aikido'),
    name: String(r.name ?? r.title ?? r.rule ?? 'Unknown'),
    level: normalizeLevel(r.severity ?? r.level),
    description: r.description ?? r.summary,
  }));

  process.stdout.write(JSON.stringify(findings, null, 2));
}

function normalizeLevel(raw: unknown): Finding['level'] {
  const s = String(raw ?? '').toLowerCase();
  if (['critical', 'high', 'error'].includes(s)) return 'error';
  if (['medium', 'warn', 'warning'].includes(s)) return 'warn';
  return 'info';
}

main().catch((err) => {
  console.error(err);
  process.exit(3);
});
