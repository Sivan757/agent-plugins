#!/usr/bin/env node
/**
 * Portable subset of deepseek-harness `pnpm run doc-sync`.
 *
 * Runs the documentation consistency checks this bundle carries, in the same
 * spirit as the upstream aggregate, against any repository root.
 *
 * Usage
 *   node doc-sync.mjs [--root <repo>]
 *
 * Covered: doc budgets, bilingual pairing (completeness + recorded hashes),
 * archived Agent Note seals.
 * Not covered (upstream-only, needs the harness workspace): link-locale and
 * structure-signature auditing, generated-region equality, doc typecheck,
 * doc-site fragments, catalog freshness generators, website build.
 */

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const pluginRoot = resolve(here, '..', '..', '..')

function parseArgs(argv) {
  let root = process.env.DSH_REPO_ROOT ?? ''
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--root') root = argv[++i] ?? ''
    else {
      console.error('doc-sync: usage: doc-sync.mjs [--root <repo>]')
      process.exit(2)
    }
  }
  if (!root) {
    const git = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' })
    root = git.status === 0 ? git.stdout.trim() : process.cwd()
  }
  return resolve(root)
}

const root = parseArgs(process.argv.slice(2))

const steps = [
  {
    name: 'verify-doc-budgets',
    script: resolve(here, 'verify-doc-budgets.mjs'),
    applies: existsSync(resolve(root, 'scripts/doc-budgets.manifest.json')),
    skip: 'scripts/doc-budgets.manifest.json not present',
  },
  {
    name: 'verify-translation-pairing',
    script: resolve(pluginRoot, 'skills', 'dsh-translate-docs', 'scripts', 'verify-translation-pairing.mjs'),
    applies: existsSync(resolve(root, 'scripts/translation-pairing.manifest.json')),
    skip: 'scripts/translation-pairing.manifest.json not present',
  },
  {
    name: 'verify-archived-agent-notes',
    script: resolve(pluginRoot, 'skills', 'dsh-archive-agent-notes', 'scripts', 'verify-archived-agent-notes.mjs'),
    applies: existsSync(resolve(root, '.agents/notes/archived')),
    skip: '.agents/notes/archived not present',
  },
]

let failed = 0
for (const step of steps) {
  if (!step.applies) {
    console.log(`doc-sync: skip ${step.name} — ${step.skip}`)
    continue
  }
  const result = spawnSync(process.execPath, [step.script, '--root', root], { stdio: 'inherit' })
  if (result.status !== 0) {
    console.error(`doc-sync: ${step.name} failed`)
    failed++
  }
}

console.log('doc-sync: not covered here (run inside a deepseek-harness checkout): link-locale and')
console.log('doc-sync: structure auditing, generated-region equality, doc typecheck, doc-site')
console.log('doc-sync: fragments, catalog freshness, and the website build.')

if (failed > 0) {
  console.error(`doc-sync: ${failed} check(s) failed`)
  process.exit(1)
}
console.log('doc-sync: portable documentation checks passed.')
