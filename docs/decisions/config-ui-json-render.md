# Config UI: json-render Specs

**Date:** 2026-04-03
**Status:** Implemented

## Problem

1. **Unclear configuration items** — the credential form rendered raw
   dot-notation keys (`connections.default.host`) with no visual grouping and
   too little help text.
2. **No nested hierarchical editing** — dynamic collection entries (database
   connections, environments) could not be added or removed in the form; users
   edited the JSON by hand.

## Decision

The credential form is a json-render React application. Each plugin defines its
own form as a json-render spec against a catalog of form components, and the UI
renders that spec instead of a hand-written form.

```text
plugin spec (json-render format)
        |
        v
launchConfigUI(pluginName, spec)
        |
        v
local HTTP server injects spec + existing config into the bundled React app
        |
        v
React app: json-render renderer + Config UI catalog
        |
        v
human fills the form -> save action -> POST /save -> write the config file
```

## Decisions In Force

- **json-render specs directly.** No custom schema format and no converter.
  Plugin authors write json-render specs against the Config UI catalog, so there
  is no intermediate description language to keep in sync with the renderer.
- **The on-disk config format stays object-keyed.**
  `~/.cache/agent-plugins/<name>/config.json` keeps `connections.default`-style
  keys and the UI adapts to that file. An existing configuration never needs
  rewriting to open the form, and the plaintext file remains the only storage
  contract.
- **Collection state mapping.** Loading converts object keys into the
  json-render `$repeat` array and adds `_name`; saving converts the array back
  to an object and uses `_name` as the key. Collections are arrays only inside
  the UI.
- **Single bundled HTML.** The React app builds into one self-contained HTML
  file with its JS and CSS inlined, so a plugin carries no runtime React
  dependency.
- **Collapsible accordions.** Each collection item renders as a collapsible
  section, which keeps a long connection list scannable.
- **Re-configuration hint.** The form tells the user how to return and
  reconfigure later, because the human is expected to open it once and close it.

## Catalog

The catalog is the contract between a plugin spec and the renderer, and it is
deliberately small: a spec may only name what the catalog defines.

That contract is written down twice on purpose, in two places that cannot drift:

- `plugins/config-center/ui/src/shared/catalog-contract.ts` is the plain-data
  vocabulary — no imports, so a repository validator and an authoring guide can
  read it without loading React or zod.
- `plugins/config-center/ui/src/shared/catalog.ts` declares the zod schemas and
  ties them to that vocabulary with `satisfies`, so a component or action present
  in one but not the other is a type error.

`registry.tsx` binds each entry to its React implementation. Each plugin declares
its own form as data in `src/config-ui.ts` — not in its CLI entry, which parses
argv on import and so cannot be read by a validator. `npm run validate:config-ui`
checks every spec against the vocabulary, including reachability from `spec.root`.

Components: `Header` (title, description, config path), `Section` (card-style
field group with optional collapse), `Collection` (dynamic add/remove/rename
entry list), `Field` (text, password, select, number, textarea, checkbox, with
an optional `visibleWhen` gate), and `SaveBar` (reset and save).

Actions: `save` (persist state to the config file), `reset` (reload state from
the file, discarding changes), `addItem` (append an entry to a collection), and
`removeItem` (remove an entry by index). `setState` and `validateForm` come from
json-render itself.

## Consequences

- A plugin's credential form is authored next to the commands that read the
  config, in its own `src/config-ui.ts`; only the vocabulary and the UI bundle are
  shared.
- The shared HTML travels only with bundles that resolve it. A bundle that does
  not serve the form carries no copy, and `npm run validate:config-ui` rejects
  both a missing copy and an unused one — 344 KB per plugin, which one plugin was
  silently shipping. `bun test ./plugins/config-center/src` and the UI's own test files
  cover the routes, the redaction rules, and the config read/write paths.
- Changing the catalog changes every plugin spec, so the catalog version and the
  UI bundle that reads it move together.
- The UI is a human write surface. Agent-facing reads stay on the config-center
  CLI, whose masking rules the UI does not relax.
