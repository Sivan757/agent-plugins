# OpenCLI Doc Capture

Use this when Temu docs need to be inspected from a logged-in Chrome tab.

## Why OpenCLI

Temu Partner docs are rendered as a SPA. Public HTML may only contain the app shell. Logged-in content is available in Chrome, and OpenCLI can bind to the existing tab without asking the user to log in again.

## Working Session

Commands used successfully on 2026-06-17:

```bash
opencli doctor -v
opencli profile list
opencli --profile dkumwg4s browser temu-docs bind
opencli --profile dkumwg4s browser temu-docs get url
opencli --profile dkumwg4s browser temu-docs get title
opencli --profile dkumwg4s browser temu-docs state
opencli --profile dkumwg4s browser temu-docs extract --chunk-size 20000
```

The profile id can differ on another machine. If doctor reports multiple profiles, run `opencli profile list` and use the profile that is connected to the user's active Chrome.

## Capture Procedure

1. Ask the user to open the target Temu doc page in Chrome and confirm they are logged in.
2. Run `opencli doctor -v`.
3. Bind the current tab with a stable session name.
4. Run `get url` and `get title` to confirm the target.
5. Run `state` to inspect navigation and links.
6. Use `extract --chunk-size 20000`; if `next_start_char` is present, repeat with `--start`.
7. Save or summarize: source URL, document update time, captured date, API names, doc ids, and operational guidance.
8. Prefer summaries over full-page copies.

## Useful Patterns

Get links from the current page with read-only eval:

```bash
opencli --profile dkumwg4s browser temu-docs eval '(() => Array.from(document.querySelectorAll("a[href]")).map(a => ({text: a.textContent.trim(), href: a.href})).filter(x => x.href.includes("/document?")))()'
```

Extract current page content:

```bash
opencli --profile dkumwg4s browser temu-docs extract --chunk-size 20000
```

Check current binding:

```bash
opencli --profile dkumwg4s browser temu-docs get url
```

## Pitfalls Observed

- `opencli browser state --format json` is not supported in the installed `opencli` 1.8.3; use normal `state`.
- After binding to an already-loaded tab, `browser network` may have an empty cache. Use DOM extraction unless you need to trigger a fresh request.
- Numeric refs from `state` are snapshot-local. Re-run `state` after navigation.
- Microsoft Edge AppleScript JavaScript execution may be disabled. Chrome + OpenCLI binding worked better.
- Do not click or submit seller-center forms unless the user explicitly asked for that action.

## Current Captured Source Set

Docs captured into skill references:

- API index: `https://agentpartner.temu.com/document?cataId=875198836203`
- Signing rules: `docId=896167235113`
- Auth information: `docId=896168820140`
- Self-developed-only APIs: `docId=899322689413`
- Region notes: `docId=909799935182`
- Goods publishing flow: `docId=896172443264`

For exact request/response schemas, open the specific API document id from `$temu-api` references and extract that page before coding.
