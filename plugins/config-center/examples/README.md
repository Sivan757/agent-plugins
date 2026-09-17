# Example: a skill-declared spec file

`toolx.spec.json` in this directory is a complete, working example of the
plain-JSON spec file a skill ships so that config-center can serve its
structured form and drive its CLI without knowing anything about the plugin.

Copy it into your skill's directory (beside `SKILL.md`), rename it, and replace
every `toolx`-specific value: the storage name, the form fields, the command and
the environment-variable names.

## The fields

| Field | Meaning |
| --- | --- |
| `plugin` | The storage directory under the shared cache root. Must match the `<plugin>` named on the config-center command line. |
| `reason` | Why the form is needed, in the user's terms. Shown when the form opens by itself. |
| `command` | The executable to run, as typed in a shell. Required for `run`. |
| `env` | Environment variable name → configuration key. The values live only in the child process. |
| `requiredKeys` | Every key here must be non-empty before a run starts. |
| `requiredAny` | At least one key per group must be non-empty (here: password or token). |
| `form` | The browser form. `root` names the entry element; `elements` holds every `Header`, `Section`, `Field` and `SaveBar`; `state` holds the defaults. |

## Using it

```bash
CC_BIN="<config-center plugin>/dist/config-center.mjs"
SPEC="<your skill directory>/toolx.spec.json"

# First-time setup: open the structured form for the user to fill (background task)
node "$CC_BIN" edit --spec "$SPEC" toolx

# Every command afterwards: credentials injected as TOOLX_URL/TOOLX_ACCOUNT/…
node "$CC_BIN" run --spec "$SPEC" toolx <toolx arguments…>
```

## Validation

- `config-center run` refuses to start while a `requiredKeys` entry or a whole
  `requiredAny` group is empty, and opens the form on its own.
- The command line's `<plugin>` must equal the spec's `plugin`.
- Every `form` element must be reachable from `form.root`, and field `type`s
  must come from the shared vocabulary in
  [`ui/src/shared/catalog-contract.ts`](../ui/src/shared/catalog-contract.ts).
- A spec file carries field names, variable names and shapes — never secret
  values. `npm run validate:no-secrets` scans the repository.
