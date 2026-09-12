# Authoring and reviewing plugin skills

Practical guidance distilled from building and then independently reviewing a
large CLI plugin (`codearts`), whose skills had to be correct against a private
cloud deployment that behaved differently from its own documentation. Every rule
below exists because ignoring it produced a real defect.

## 1. SKILL.md is a decision surface, not a manual

Keep the body to what an agent needs *while working*: when to use the skill, the
commands on the golden path, the failure signals it must react to, and pointers.
Everything else goes to `references/` and is linked from the body.

A workable test for where a section belongs:

- Needed to choose or execute the next command → stays in `SKILL.md`.
- Only needed when something is already broken, or during one-off setup → moves
  to `references/`.
- Long enumerations (error-code tables, endpoint tables, per-API parameter
  dumps) → `references/`, always linked, never orphaned.

A quick measure: after the split, `SKILL.md` should read in a couple of minutes,
and each reference should answer one question.

## 2. Verify the tool surface, never recall it

Every command, flag, positional argument, exit code and operation id in a skill
must be checked against the real tool:

```bash
<cli> --help
<cli> <group> <sub> --help
<cli> <group> <cmd> --dry-run      # what it would actually send
```

Prose that quotes a vendor's API documentation is the least trustworthy part of
a skill. A real example: a skill stated a body field was `status`; the API's own
parameter list said `defect_status`, and because the call went through a raw
`--body` escape hatch nothing local would have caught it.

## 3. Document the failure paths, not just the happy path

Skills get read when something is wrong. For each command family include the
error codes or messages that matter, what each one actually means, and the next
command to run. Where a *plausible* reading is wrong, say so explicitly — for
example, "this error means the path is unpublished, not that the host is wrong".

Correction beats description: an error row should end in an actionable next step.

## 4. No deployment-specific identifiers in shipped text

Regions, domains, project UUIDs, tenant names and real account ids do not belong
in skills, READMEs or CLI help, even when they are not secrets. They date
instantly, they leak a customer's topology, and they teach the agent to expect
one deployment's shape. Use placeholders (`<region0_id>`, `<domain>`,
`<项目名>`) and keep the *shape* of real output — the useful part is the format,
not the value.

Generated data files get the same treatment: store the source URL once and derive
per-record URLs at read time, rather than repeating the host on hundreds of rows.

## 5. Prefer capability inventories and composition rules over command dumps

A skill that lists 300 endpoints teaches nothing. What an agent needs is:

- what each service can and **cannot** do (state the boundary),
- how the pieces compose into a workflow the user actually asked for,
- which primitive to reach for when a composition has no ready-made command.

Write the composition rules as rules ("probe the real names first", "use exit
codes as gates", "fill gaps with the generic API surface"), then give one or two
worked recipes. That is what makes an agent combine tools instead of following a
script.

## 6. Guard drift with cheap, mechanical tests

Claims rot; make the rot fail a test instead of reaching a user.

- Every element a config form references must exist (a key typo silently hides a
  field — a missing child rendered an AK/SK form with no AK/SK fields).
- Frontmatter must carry `name` + `description`, and `name` must match its
  directory.
- Every relative link between skills, references and docs must resolve.
- Operation ids and paths quoted in prose must exist in the generated catalog.
- A generated artifact must be reproducible from its extraction script.

## 7. Review by a different agent, with evidence rules

The author of a skill is the worst reviewer of it. Delegate to a fresh subagent
and require:

- one quoted `file:line` and a reproducing command per finding,
- severity grouped as blocker / should-fix / nit,
- read-only behaviour, no edits during review,
- explicit statements of what could **not** be verified, and why.

Then verify the fixes with a second, equally adversarial pass — a fix that is not
re-checked is a claim, not a fact.

## 8. Credentials: never in text, never collected by the agent

Skills must contain no credentials, and must direct the reader to the setup flow
rather than asking a user to paste secrets into a conversation. The agent should
open the setup form itself (as a background task) instead of telling the user to
find and run a command.

Do not suggest "try a fake credential to see which auth mode the gateway wants":
on a working machine that overwrites the real one.

Give every plugin that has a config form one command that opens it — `<plugin>
config --ui` — and make `setupCommand` name it, because those strings are pasted
straight into error messages. Two plugins shipped strings that named a real
command which could not open the form (`setup` meant "set the X-Device header"
in one, `init` printed a template in another), so a reader following the advice
went nowhere. `setupCommand` must satisfy three things: the command exists, every
flag it mentions is declared, and the command's own registration actually calls
the launcher. `.github/scripts/tests/config-ui-commands.test.ts` checks all
three.

## 9. A masked secret must still be judgeable, and upstream text is untrusted

Hiding a value is only half the job. Redaction that leaves an agent with nothing
to reason about produces the worst outcome: it cannot tell a wrong key from a
truncated paste from a permissions problem, so it probes, re-configures and
guesses. Report facts *about* the secret instead — its length, whether its shape
matches the field (an access key is 20 characters; a secret key is 40), and a
one-way digest that identifies "the same credentials as last time". Recording the
last successful authentication, with that digest, turns a later 401 into a
verdict: same credentials worked minutes ago means the key is not the suspect.

Never interpolate upstream error text into user- or agent-facing output without
scrubbing it first. A vendor gateway that echoes the submitted access key back
(`ak <AK> not exist`) puts a live credential into an error message, a log and the
agent's context, which is exactly the leak that redaction was supposed to
prevent. Replace any configured secret found in that text before printing it.

Test fixtures are the other way this happens. An access key id is only 20
characters of uppercase letters and digits — below every entropy threshold, so it
passes a secret scanner while still identifying the account. Never paste a value
from a live console into a fixture, even "just the id": write one that announces
itself as synthetic (`EXAMPLEKEY0000000001`) and let `validate:no-secrets` enforce
it. That check rejects an access-key-shaped literal in a code file unless it
carries such a marker, and it only inspects reference documentation when the line
also names a credential field, because docs legitimately quote 20-character
business ids (order numbers, product codes).

## 10. Isolate anything that reads stored configuration

Any script or test that loads plugin configuration must redirect the cache:

```bash
AGENT_PLUGINS_CACHE_DIR=$(mktemp -d) npx tsx ./preview-script.ts
```

Setting `HOME` *inside* a script does not isolate anything — the cache root is
resolved from `HOME`, which such a script has usually already read. Rendering a
config form without isolation prints whatever credentials are on disk, and tool
output is captured verbatim into transcripts. `config-center` warns when a
programmatic launch would render stored configuration, and resolves the cache
root on every call so the override always works.

## 11. Real-deployment time is the only way to find some defects

Documentation describes what is possible, not what a given deployment publishes.
A deployment was found serving the legacy merge-request API while the current one
was absent, and rejecting a list limit that the docs allow. Write the tooling so
these differences degrade into a fallback rather than a failure — try the
documented generations in order — and record what the deployment actually
answered in `references/troubleshooting.md`.
