# Archived Agent Note verifier (portable)

Node port of the harness gate behind `pnpm run verify-archived-agent-notes`, so
the archive can be sealed and checked from any checkout.

```bash
node scripts/verify-archived-agent-notes.mjs --root <repo>          # check
node scripts/verify-archived-agent-notes.mjs --root <repo> --write  # append seals
```

Rules carried over: the closed kind set and required kind directories, root-file
allowlist, complete `{kind}/{yyyy-mm-dd-topic}.{md,zh.md,i18n.yaml}` triplets,
the frozen header block (title, status, `Archived:` date, language switcher,
matching dates), sidecar Git blob hashes, and the append-only manifest compared
against the Git baseline (`DSH_ARCHIVE_BASE_REF`, default `HEAD`).
