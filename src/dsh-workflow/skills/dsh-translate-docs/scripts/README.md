# Bilingual pairing tools (portable)

Node ports of the harness bilingual-document tooling.

```bash
node scripts/verify-translation-pairing.mjs --root <repo> [--list]
node scripts/verify-translation-pairing.mjs --root <repo> --write [<pair>|--all]
node scripts/verify-translation-pairing.mjs --root <repo> --cached [<pair>|--all]
node scripts/gen-translation-brief.mjs --root <repo> <pair paths...>
```

`verify-translation-pairing.mjs` enforces the corpus scope predicate and the
exclusion manifest (`<repo>/scripts/translation-pairing.manifest.json`),
bilingual completeness (both languages plus the `.i18n.yaml` record), record
well-formedness, and agreement between the recorded and current Git blob hashes;
`--write` re-seals named or all complete pairs, `--cached` checks index bytes.

`gen-translation-brief.mjs` recovers each side's last-confirmed bytes from the
recorded blobs and emits a diff briefing for a delegated translator.

Not ported from upstream: locale-link auditing, generated-region equality,
structure-signature comparison, language-switcher presence, granularity
mapping, first-occurrence notes, and `--apply`.
