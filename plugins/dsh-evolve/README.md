# dsh-evolve

Turn repeated work into a reusable skill, and keep the accumulated library honest.

The plugin owns three things the agent should not have to hold in its head: **when** work is repeating, **whether** a skill actually works, and **whether** an installed skill is still earning its place. Everything else — deciding what is worth keeping — stays with the agent and the person.

## Install

```sh
dsh plugin --profile web add ./plugins/dsh-evolve
```

## The loop

```
PostToolUse ──► trace ──► deterministic rules ──► nudge
                                                      │
                                              reflector agent
                                                      │
                                          draft stage ──► draft check
                                                      │        │
                                                      │    PASS? no ──► fix and re-stage
                                                      │        │
                                                      │       yes
                                                      ▼        ▼
                                              ~/.agents/skills/auto-<name>/
                                                      │
Stop ──► turn counter ──► survival rule ──► curate / merge ──► archive
```

Four stages, each with a different owner:

| Stage | Owner | What it guarantees |
| --- | --- | --- |
| Detect | `PostToolUse` hook | Repeated calls, failure streaks and long sessions are noticed without a model deciding to notice |
| Reflect | `reflector` agent | A candidate skill is extracted from work that actually ran |
| Verify | `draft check` | Nothing reaches the skills root unless the command it ships with exits as declared |
| Curate | `curator` agent + `library curate` | Skills compete on load rate, and retirement is a move, not a delete |

## What it does

`PostToolUse` runs one short-lived process per tool call. It appends the call to a per-session trace, advances the usage counter of any installed skill the call exercised, and evaluates three deterministic rules:

| Rule | Fires when | What the model is told |
| --- | --- | --- |
| `repeat-call` | The same tool ran with byte-identical arguments at least twice | Change the arguments, or skip the call |
| `error-streak` | The last N calls all failed | Change the approach instead of retrying the same shape |
| `high-activity` | The session passed another multiple of the activity quantum | Fold the procedure into a skill now, while the steps are in context |

`Stop` advances the turn counter. That counter is the denominator of every survival rate, so it only ever grows.

A rule that has already fired reports once per session, keyed by a signature. The rules are pure functions of the recorded trace; no model runs inside the hook, because a trigger the model could talk itself out of is not a trigger.

## Commands

```sh
node ${CLAUDE_PLUGIN_ROOT}/dist/dsh-evolve.mjs status              # trace, library, drafts, thresholds
node ${CLAUDE_PLUGIN_ROOT}/dist/dsh-evolve.mjs draft stage --file <manifest.json>
node ${CLAUDE_PLUGIN_ROOT}/dist/dsh-evolve.mjs draft check <name>  # PASS or FAIL; the only pass that counts
node ${CLAUDE_PLUGIN_ROOT}/dist/dsh-evolve.mjs draft promote <name> # re-checks, then installs
node ${CLAUDE_PLUGIN_ROOT}/dist/dsh-evolve.mjs draft drop <name> --reason "..."

node ${CLAUDE_PLUGIN_ROOT}/dist/dsh-evolve.mjs library list        # installed skills and their rates
node ${CLAUDE_PLUGIN_ROOT}/dist/dsh-evolve.mjs library curate      # dry run: which groups, and what would retire
node ${CLAUDE_PLUGIN_ROOT}/dist/dsh-evolve.mjs library curate --apply
node ${CLAUDE_PLUGIN_ROOT}/dist/dsh-evolve.mjs library merge <narrow> --into <umbrella> --reason "..."
node ${CLAUDE_PLUGIN_ROOT}/dist/dsh-evolve.mjs library ledger      # the append-only record
```

`/evolve` runs the whole review in-session. The `skill-evolution` skill holds the rules for deciding what belongs in a skill at all.

## The draft manifest

A draft is staged from one JSON object. The model produces it; this plugin validates every field and every path before anything reaches the disk.

```json
{
  "name": "auto-<kebab-case>",
  "description": "What it does, and the situation that should make a later session load it.",
  "body": "The SKILL.md content below the frontmatter.",
  "verify": { "command": "node scripts/check.mjs", "expectExit": 0 },
  "files": { "scripts/check.mjs": "..." }
}
```

Rejected outright: a name without the `auto-` prefix, a description over 500 characters, no file under `scripts/`, a `..` or absolute path, a path outside `scripts|references|assets|templates`, or a file over 256 KB.

## The survival rule

A skill competes on **loads per turn it has been available for**, not on age and not on total loads. A skill installed during a quiet week is not retired for being young; a skill that is never loaded after its probation is not kept for being recent.

| Group | Condition | Outcome |
| --- | --- | --- |
| `probation` | Fewer than `maturity` turns since install | Never retired, whatever its use count |
| `spared` | Past probation, never loaded, but read at least once | Spared, and takes no slot in the pool |
| `pool` | Past probation and loaded at least once | Competes for `capacity` |
| `retire` | Never loaded and never read after probation, or the lowest rate above `capacity` | Moved to the archive |

Retirement never deletes. The directory is moved into the plugin's own cache tree, and the ledger records why.

## Configuration

Thresholds are read from `config.json` in the plugin's own cache directory (`~/.cache/agent-plugins/dsh-evolve/config.json`, or under `AGENT_PLUGINS_CACHE_DIR`). Missing fields fall back to the defaults.

| Field | Default | Meaning |
| --- | --- | --- |
| `activityQuantum` | `20` | Tool calls per session between volume reminders |
| `repeatCalls` | `2` | Occurrences of one tool-and-arguments pair before the repeat rule fires |
| `errorStreak` | `3` | Trailing failures before the streak rule fires |
| `errorPattern` | `^\s*(?:Error\|ERROR)\b` | Regular expression marking a failed tool result |
| `skillsRoot` | `$HOME/.agents/skills` | Where promoted skills are installed |
| `maturity` | `100` | Turns after install before a skill leaves probation |
| `capacity` | `20` | Graduated skills kept before the lowest rate retires |
| `verifyTimeoutMs` | `60000` | How long one `draft check` may run |

`skillsRoot` is an output location a person names, not plugin storage. Everything the plugin records about its own operation stays under the cache root.

## What the model sees

- A `skill-evolution` skill in the session catalog, which carries the decision rules.
- A `PostToolUse` context message only when a rule fires that this session has not already reported.
- The `/evolve` command.
- Two agent roles, `reflector` and `curator`, for the two jobs that need their own context.

## Known Limitations and Deferred Work

- **`draft check` executes what the model wrote.** That is the point — a skill is only worth installing if the command it ships with runs — and it is no more authority than the Bash tool the agent already has. Staged scripts are written outside the skills root and only reach it after the check passes.
- **A staged draft is checked in place, not in a sandbox.** A script that writes outside its own directory can do so during the check.
- **The trace is one JSON file read and rewritten per tool call**, plus a second read and write when the call exercises an installed skill.
- **Failure detection is textual.** A tool that reports failure without the configured prefix is recorded as a success.
- **Nothing prunes the session trace.** `status` counts every session file that exists; removing one is a manual `rm` under the plugin's cache directory.
- **The registry write is not locked.** Two hooks finishing at the same instant can lose one usage increment. The consequence is a slightly stale rate, not a corrupt library.
