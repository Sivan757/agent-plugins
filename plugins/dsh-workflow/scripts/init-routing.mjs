#!/usr/bin/env node
/**
 * Initialize the dsh-workflow routing mechanism in a project's agent
 * instructions file.
 *
 * Writes one managed block (delimited by markers) into `<root>/AGENTS.md` and
 * leaves every other byte untouched. Re-running updates the block in place, so
 * the command is safe to re-run after the plugin's skill set changes.
 *
 * Usage
 *   node init-routing.mjs [--root <dir>] [--file <path>] [--dry-run] [--print]
 *
 * Exit codes: 0 = written or already current, 1 = failure, 2 = bad arguments.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const BEGIN = '<!-- dsh-workflow:begin -->'
const END = '<!-- dsh-workflow:end -->'

const BLOCK = `${BEGIN}
## Skill routing

Route these duties through the dsh-workflow skills rather than ad-hoc practice.

| Before you… | Use the skill |
| --- | --- |
| Push, mark ready for review, or claim checks pass | dsh-pre-push-checks |
| Write or review prose, comments, README/JSDoc contracts, CLI or UI strings | dsh-prose-standard |
| Audit text that reads like a reasoning transcript | dsh-trim-cot-leakage |
| Add, restructure, review, or audit documentation | dsh-doc |
| Record or reclassify rationale, decisions, or postmortems | dsh-archive-agent-notes |
| Update either side of a bilingual pair | dsh-translate-docs |
| Review a pull request | dsh-code-review |
| Diagnose flaky or nondeterministic tests | dsh-ci-test-reliability |
| Look for redundancy, dead code, or over-built surfaces | dsh-find-simplifications |
| Land dependent pull requests as a stack | dsh-merging-stacked-prs |
| Investigate a performance regression | dsh-speed-up-perf |
| Attach a GUI demonstration to a pull request | record-browser-gif |

## Placement

- Bug write-ups go to postmortems, rationale to Agent Notes, procedures to cookbooks, type definitions to source, package contracts to package READMEs, and standing orders to this file.
- Skills hold reusable workflows and specialized decision standards. Product and runtime contracts belong in docs or source.
${END}`

function parseArgs(argv) {
  let root = ''
  let file = ''
  let dryRun = false
  let print = false
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--root') root = argv[++i] ?? ''
    else if (arg === '--file') file = argv[++i] ?? ''
    else if (arg === '--dry-run') dryRun = true
    else if (arg === '--print') print = true
    else {
      console.error(`init-routing: unknown option ${JSON.stringify(arg)}`)
      console.error('init-routing: usage: init-routing.mjs [--root <dir>] [--file <path>] [--dry-run] [--print]')
      process.exit(2)
    }
  }
  if (!root) {
    const git = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' })
    root = git.status === 0 ? git.stdout.trim() : process.cwd()
  }
  return { root: resolve(root), file, dryRun, print }
}

const { root, file, dryRun, print } = parseArgs(process.argv.slice(2))

if (print) {
  console.log(BLOCK)
  process.exit(0)
}

const target = file ? resolve(root, file) : resolve(root, 'AGENTS.md')

/** Replace an existing managed block, or append a new one, keeping all else. */
function applyBlock(existing) {
  const begin = existing.indexOf(BEGIN)
  const end = existing.indexOf(END)
  if (begin !== -1 && end !== -1 && end > begin) {
    const before = existing.slice(0, begin)
    const after = existing.slice(end + END.length)
    const updated = `${before}${BLOCK}${after}`
    return { content: updated, state: updated === existing ? 'current' : 'updated' }
  }
  if (begin !== -1 || end !== -1) {
    return { content: existing, state: 'broken' }
  }
  const separator = existing === '' ? '' : existing.endsWith('\n\n') ? '' : existing.endsWith('\n') ? '\n' : '\n\n'
  return { content: `${existing}${separator}${BLOCK}\n`, state: 'appended' }
}

if (!existsSync(target)) {
  if (dryRun) {
    console.log(`init-routing: would create ${target}`)
    process.exit(0)
  }
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, `${BLOCK}\n`)
  console.log(`init-routing: created ${target} with the routing block.`)
  process.exit(0)
}

const existing = readFileSync(target, 'utf8')
const { content, state } = applyBlock(existing)

if (state === 'broken') {
  console.error(`init-routing: ${target} contains only one of the ${BEGIN} / ${END} markers; repair or remove it first.`)
  process.exit(1)
}

if (state === 'current') {
  console.log(`init-routing: ${target} is already current.`)
  process.exit(0)
}

if (dryRun) {
  console.log(`init-routing: would ${state === 'appended' ? 'append the routing block to' : 'update the routing block in'} ${target}`)
  process.exit(0)
}

writeFileSync(target, content)
console.log(
  `init-routing: ${state === 'appended' ? 'appended the routing block to' : 'updated the routing block in'} ${target}.`,
)
