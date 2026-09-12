# Decision Records

Why the plugin collection has the shape it has. Each record holds the reasoning behind a decision that is still in force, so a later change does not silently reverse it.

These records are developer-facing. They are not user documentation: what a plugin can do lives in its own `README.md`, and platform practice lives in `docs/plugin-development/`. A record captures the rejected alternatives and the cost a reversal would reintroduce.

## Records

| Record | What it decides |
| --- | --- |
| [single-tree-plugin-layout.md](single-tree-plugin-layout.md) | `plugins/<name>/` is the plugin: no source tree, no release tree, no packing step |
| [config-ui-json-render.md](config-ui-json-render.md) | The credential form renders json-render specs; the on-disk config format stays object-keyed |

## Maintaining This Directory

- Add a record only for a decision that constrains future maintenance. Behavior already visible in code, and rules already stated in `AGENTS.md`, need no record.
- One decision per record. A record replaced by a newer decision is deleted together with its inbound links; the surviving record states what it replaced.
- Keep a record to rationale. Do not grow it into a how-to guide or a status report, and do not record work that has already been executed unless a reader still needs it to avoid repeating a mistake.
