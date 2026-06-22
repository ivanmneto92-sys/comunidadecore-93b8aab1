# Security Baseline & Allowlist

Used by `.github/workflows/security-scan.yml` to fail CI when **new** security
findings appear.

## Files

- `baseline.json` — snapshot of findings considered "known/accepted" at a point
  in time. Diff treats anything in here as not-new.
- `allowlist.json` — explicit ignores with justification. Format:
  ```json
  [{ "internal_id": "SUPA_xxx", "reason": "Intentional public table" }]
  ```

## Fail criteria

CI fails when a finding is **not** in `baseline.json` **and** not in
`allowlist.json`, **and** its level is at or above `SECURITY_FAIL_LEVEL`
(default `warn`, set in the workflow env).

`bun audit --audit-level=high` runs as a separate job and fails on high/critical
CVEs in npm dependencies independently of the scanner diff.

## Updating the baseline

After fixing or accepting findings, regenerate locally and commit the diff:

```bash
AIKIDO_API_TOKEN=xxx bunx tsx scripts/security-fetch.ts > security-current.json
bunx tsx scripts/security-diff.ts security-current.json --update-baseline
git add .security/baseline.json && git commit -m "chore(security): refresh baseline"
```

Updates must go through PR review.

## Required secret

Add `AIKIDO_API_TOKEN` in **GitHub → Settings → Secrets and variables → Actions**.
Set `AIKIDO_API_BASE` as a workflow env var if your tenant uses a different
region endpoint.
