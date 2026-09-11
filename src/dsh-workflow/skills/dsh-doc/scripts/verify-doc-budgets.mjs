#!/usr/bin/env node
/**
 * Portable port of deepseek-harness `scripts/verify-doc-budgets.ts`.
 *
 * Enforces `wc -w`-style word ceilings from `<repo>/scripts/doc-budgets.manifest.json`.
 * Missing budgeted files and invalid ceilings fail; `--list` reports usage.
 *
 * Usage
 *   node verify-doc-budgets.mjs [--root <repo>] [--manifest <path>] [--list]
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

function parseArgs(argv) {
  let root = process.env.DSH_REPO_ROOT ?? ''
  let manifest = ''
  let list = false
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--root') root = argv[++i] ?? ''
    else if (arg === '--manifest') manifest = argv[++i] ?? ''
    else if (arg === '--list') list = true
    else {
      console.error('verify-doc-budgets: usage: verify-doc-budgets.mjs [--root <repo>] [--manifest <path>] [--list]')
      process.exit(2)
    }
  }
  if (!root) {
    const git = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' })
    root = git.status === 0 ? git.stdout.trim() : process.cwd()
  }
  return { root: resolve(root), manifest, list }
}

const { root, manifest: manifestArg, list } = parseArgs(process.argv.slice(2))
const manifestPath = manifestArg
  ? resolve(root, manifestArg)
  : resolve(root, 'scripts/doc-budgets.manifest.json')

if (!existsSync(manifestPath)) {
  console.error(`verify-doc-budgets: manifest not found at ${manifestPath}`)
  process.exit(2)
}

/** `wc -w` equivalent: count whitespace-delimited tokens. */
function countWords(text) {
  return text.split(/\s+/).filter(Boolean).length
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const failures = []
const rows = []

for (const [path, ceiling] of Object.entries(manifest)) {
  if (!Number.isInteger(ceiling) || ceiling <= 0) {
    rows.push(`BAD   ${'—'.padStart(6)} / ${String(ceiling).padEnd(6)} ${path}`)
    failures.push(`${path}: ceiling must be a positive integer, got ${ceiling}`)
    continue
  }
  const abs = resolve(root, path)
  if (!existsSync(abs)) {
    rows.push(`MISS  ${'—'.padStart(6)} / ${String(ceiling).padEnd(6)} ${path}`)
    failures.push(
      `${path}: budgeted file does not exist (renamed or deleted? update the budget manifest in the same change)`,
    )
    continue
  }
  const words = countWords(readFileSync(abs, 'utf8'))
  rows.push(`${words <= ceiling ? 'ok  ' : 'OVER'}  ${String(words).padStart(6)} / ${String(ceiling).padEnd(6)} ${path}`)
  if (words > ceiling) {
    failures.push(
      `${path}: ${words} words exceeds the ${ceiling}-word ceiling — relocate or condense per the documentation standard (raising the ceiling requires justification)`,
    )
  }
}

if (list) {
  console.log(rows.join('\n'))
  process.exit(0)
}

if (failures.length > 0) {
  console.error('verify-doc-budgets failed:\n')
  for (const failure of failures) console.error(`  ${failure}`)
  process.exit(1)
}

console.log(`verify-doc-budgets: ${Object.keys(manifest).length} budgeted docs within ceiling.`)
