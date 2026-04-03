# Config UI Redesign with json-render

## Problem

1. **Unclear configuration items** — raw dot-notation keys shown to users (`connections.default.host`), no visual grouping, insufficient help text
2. **No nested hierarchical editing** — cannot add/remove dynamic collection entries (database connections, environments) through the UI; users must edit JSON manually

## Solution

Replace the raw HTML template-based Config UI with a **json-render** powered React application. Plugin authors define config specs using json-render's native spec format with a purpose-built catalog of form components. The app is pre-bundled as a single HTML file; at runtime the server injects the spec and existing config as initial state.

## Architecture

```
Plugin spec (json-render format)
        |
        v
launchConfigUI(pluginName, spec)
        |
        v
Local HTTP server injects spec + existing config into bundled React app
        |
        v
React app: @json-render/shadcn Renderer + Config UI catalog
        |
        v
User fills form -> save action -> POST /save -> write config file
```

## Key Decisions

- **json-render specs directly** — no custom schema format, no converter. Plugin authors write json-render specs with the Config UI catalog.
- **Config file format unchanged** — existing `~/.cache/apex-plugin/*.json` files keep their structure. Users with existing configs do not need to reconfigure.
- **Collection state mapping** — config files use object keys (`connections.default`), json-render `$repeat` uses arrays. Load converts object→array (add `_name`), save converts array→object (use `_name` as key).
- **Single bundled HTML** — the React app is built with Vite into a self-contained HTML file with all JS/CSS inlined. No runtime React dependency for plugins.
- **Collapsible accordions** — each collection item renders as a collapsible accordion section.
- **Re-configuration hint** — the UI tells users they can return to reconfigure later.

## Catalog Components

| Component | Purpose | Props |
|-----------|---------|-------|
| Header | Page title, description, config path display | title, description, configPath |
| Section | Fixed field group with optional collapse | title, description, collapsible, defaultOpen |
| Collection | Dynamic add/remove/rename entry list | title, itemLabel, statePath, nameEditable |
| Field | Form input (text, password, select, number, textarea, checkbox) | label, key, type, required, help, placeholder, default, options, checks |

## Catalog Actions

| Action | Purpose | Params |
|--------|---------|--------|
| save | Write state to config file | — |
| reset | Reload state from file | — |
| addItem | Append entry to collection | statePath |
| removeItem | Remove entry from collection | statePath, index |

Built-in actions (`setState`, `validateForm`) are provided by json-render.

## Plugin Spec Examples

See brainstorming notes for TickTick (simple), MySQL (collection), and Aliyunlog (mixed sections + collections) spec examples.
