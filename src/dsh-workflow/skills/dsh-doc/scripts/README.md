# Documentation checks (portable)

Node ports of harness documentation gates.

```bash
node scripts/verify-doc-budgets.mjs --root <repo> [--list]   # word ceilings
node scripts/doc-sync.mjs --root <repo>                      # portable aggregate
```

`verify-doc-budgets.mjs` enforces the ceilings in
`<repo>/scripts/doc-budgets.manifest.json` (missing files and invalid ceilings
fail; `--list` reports usage).

`doc-sync.mjs` runs the portable documentation checks in this bundle —
budgets, bilingual pairing, archived notes — and reports the upstream checks it
does not carry (link-locale and structure auditing, generated-region equality,
doc typecheck, doc-site fragments, catalog freshness, website build).
