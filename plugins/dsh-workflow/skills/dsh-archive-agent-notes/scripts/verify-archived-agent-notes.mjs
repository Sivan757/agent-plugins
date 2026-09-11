#!/usr/bin/env node
/**
 * Portable port of deepseek-harness `scripts/verify-archived-agent-notes.ts`.
 *
 * Verifies and append-seals the frozen Agent Note archive without needing the
 * harness workspace: the same triplet, header, hash, and immutable-manifest
 * rules, reading only `.agents/notes/archived/`.
 *
 * Usage
 *   node verify-archived-agent-notes.mjs [--root <repo>] [--write]
 *
 * Fidelity: the artifact/header/triplet/manifest rules and the Git-baseline
 * comparison are ported in full. `--write` appends seals exactly like upstream
 * (existing seals are never rewritten).
 */

import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { createHash } from 'node:crypto'

const CLASSES = ['feature', 'bug-fix', 'simplification', 'architecture', 'process', 'testing']

function parseArgs(argv) {
  let root = process.env.DSH_REPO_ROOT ?? ''
  let write = false
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--write') write = true
    else if (arg === '--root') root = argv[++i] ?? ''
    else {
      console.error('verify-archived-agent-notes: usage: verify-archived-agent-notes.mjs [--root <repo>] [--write]')
      process.exit(2)
    }
  }
  if (!root) {
    const git = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' })
    root = git.status === 0 ? git.stdout.trim() : process.cwd()
  }
  return { root: resolve(root), write }
}

const { root: repoRoot, write: writeMode } = parseArgs(process.argv.slice(2))

const archiveRoot = join(repoRoot, '.agents', 'notes', 'archived')
const manifestPath = join(archiveRoot, 'manifest.json')
const manifestRepoPath = '.agents/notes/archived/manifest.json'
const errors = []

// ── archive helpers (ported from scripts/archived-agent-notes.ts) ────────────

function contentHash(content) {
  return `sha256:${createHash('sha256').update(content).digest('hex')}`
}

function gitBlobHash(content) {
  const hash = createHash('sha1')
  hash.update(`blob ${content.byteLength}\0`)
  hash.update(content)
  return hash.digest('hex')
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseManifest(content) {
  const value = JSON.parse(content)
  if (!isRecord(value)) throw new Error('expected a JSON object')
  const fields = Object.keys(value).sort()
  if (fields.join(',') !== 'files,version') throw new Error('expected exactly the fields `version` and `files`')
  if (value.version !== 1) throw new Error('unsupported manifest version (expected 1)')
  if (!isRecord(value.files)) throw new Error('`files` must be an object')
  const files = {}
  for (const [path, hash] of Object.entries(value.files)) {
    if (typeof hash !== 'string' || !/^sha256:[0-9a-f]{64}$/.test(hash)) {
      throw new Error(`invalid content hash for ${path}`)
    }
    files[path] = hash
  }
  return { version: 1, files }
}

function renderManifest(files) {
  const sorted = Object.fromEntries(Object.entries(files).sort(([a], [b]) => a.localeCompare(b)))
  return `${JSON.stringify({ version: 1, files: sorted }, null, 2)}\n`
}

function validateManifestExtension(baseline, current) {
  const out = []
  for (const [path, expected] of Object.entries(baseline.files)) {
    const actual = current.files[path]
    if (actual === undefined) out.push(`${path}: sealed manifest entry is missing`)
    else if (actual !== expected) out.push(`${path}: sealed manifest hash changed`)
  }
  return out
}

function validDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (match === null) return false
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

function pairMeta(content) {
  const entries = new Map()
  for (const line of content.split('\n')) {
    if (line === '' || line.startsWith('#')) continue
    const match = /^([^:#]+\.md): ([0-9a-f]{40})$/.exec(line)
    if (match?.[1] === undefined || match[2] === undefined) return undefined
    entries.set(match[1], match[2])
  }
  return entries
}

function validateHeader(path, content, sourceBase, chinese) {
  const out = []
  const lines = content.toString('utf8').split('\n')
  if (!/^# Agent Note: \S/.test(lines[0] ?? '')) out.push(`${path}: line 1 must be \`# Agent Note: <title>\``)
  if (lines[1] !== '') out.push(`${path}: line 2 must be blank`)
  if (lines[2] !== 'Status: implemented') out.push(`${path}: line 3 must be \`Status: implemented\``)
  const archived = /^Archived: (\d{4}-\d{2}-\d{2})$/.exec(lines[3] ?? '')?.[1]
  if (archived === undefined || !validDate(archived)) {
    out.push(`${path}: line 4 must be \`Archived: YYYY-MM-DD\` with a valid date`)
  } else if (archived < sourceBase.slice(0, 10)) {
    out.push(`${path}: archive date ${archived} predates the note filename`)
  }
  if (lines[4] !== '') out.push(`${path}: line 5 must be blank`)
  const switcher = chinese
    ? `[English](${sourceBase}.md) | 中文`
    : `English | [中文](${sourceBase}.zh.md)`
  if (lines[5] !== switcher) out.push(`${path}: line 6 must be ${JSON.stringify(switcher)}`)
  return out
}

function validateArtifacts(artifacts) {
  const out = []
  const triplets = new Map()
  for (const [path, content] of artifacts) {
    const match = /^([^/]+)\/(\d{4}-\d{2}-\d{2}-.+?)(\.zh\.md|\.i18n\.yaml|\.md)$/.exec(path)
    if (match?.[1] === undefined || match[2] === undefined || match[3] === undefined) {
      out.push(`${path}: expected {kind}/yyyy-mm-dd-topic.{md,zh.md,i18n.yaml}`)
      continue
    }
    if (!CLASSES.includes(match[1])) {
      out.push(`${path}: unknown Agent Note kind ${JSON.stringify(match[1])}`)
      continue
    }
    const key = `${match[1]}/${match[2]}`
    const triplet = triplets.get(key) ?? {}
    if (match[3] === '.md') triplet.source = content
    else if (match[3] === '.zh.md') triplet.zh = content
    else triplet.meta = content
    triplets.set(key, triplet)
  }

  for (const [key, triplet] of [...triplets].sort(([a], [b]) => a.localeCompare(b))) {
    const sourcePath = `${key}.md`
    const zhPath = `${key}.zh.md`
    const metaPath = `${key}.i18n.yaml`
    const { source, zh, meta } = triplet
    if (source === undefined || zh === undefined || meta === undefined) {
      const missing = [source === undefined ? sourcePath : undefined, zh === undefined ? zhPath : undefined, meta === undefined ? metaPath : undefined].filter(Boolean)
      out.push(`${key}: incomplete archived triplet; missing ${missing.join(', ')}`)
      continue
    }
    const sourceBase = basename(key)
    out.push(...validateHeader(sourcePath, source, sourceBase, false))
    out.push(...validateHeader(zhPath, zh, sourceBase, true))
    const sourceDate = /^Archived: (\d{4}-\d{2}-\d{2})$/m.exec(source.toString('utf8'))?.[1]
    const zhDate = /^Archived: (\d{4}-\d{2}-\d{2})$/m.exec(zh.toString('utf8'))?.[1]
    if (sourceDate !== undefined && zhDate !== undefined && sourceDate !== zhDate) {
      out.push(`${key}: English and Chinese archive dates differ (${sourceDate} vs ${zhDate})`)
    }
    const pair = pairMeta(meta.toString('utf8'))
    if (
      pair === undefined ||
      pair.size !== 2 ||
      pair.get(`${sourceBase}.md`) !== gitBlobHash(source) ||
      pair.get(`${sourceBase}.zh.md`) !== gitBlobHash(zh)
    ) {
      out.push(`${metaPath}: consistency record must contain the current Git blob hashes of both archived sides`)
    }
  }
  return out
}

function extendManifest(existing, artifacts) {
  const out = []
  const files = { ...existing.files }
  for (const [path, expected] of Object.entries(existing.files)) {
    const content = artifacts.get(path)
    if (content === undefined) out.push(`${path}: sealed artifact is missing`)
    else if (contentHash(content) !== expected) out.push(`${path}: sealed content hash changed`)
  }
  const added = []
  for (const [path, content] of [...artifacts].sort(([a], [b]) => a.localeCompare(b))) {
    if (files[path] !== undefined) continue
    files[path] = contentHash(content)
    added.push(path)
  }
  return { files, added, errors: out }
}

// ── archive tree ────────────────────────────────────────────────────────────

if (!existsSync(archiveRoot)) {
  console.error(`verify-archived-agent-notes: ${manifestRepoPath.replace('/manifest.json', '')} does not exist in ${repoRoot}`)
  process.exit(2)
}
if (!existsSync(join(archiveRoot, 'AGENTS.md'))) errors.push('archived/AGENTS.md is required')

const allowedRootFiles = new Set(['AGENTS.md', 'manifest.json'])
const kinds = new Set()
const artifacts = new Map()

for (const entry of readdirSync(archiveRoot, { withFileTypes: true })) {
  if (entry.isFile()) {
    if (!allowedRootFiles.has(entry.name)) errors.push(`archived/${entry.name}: unexpected root file`)
    continue
  }
  if (!entry.isDirectory()) {
    errors.push(`archived/${entry.name}: only regular files and kind directories are allowed`)
    continue
  }
  if (!CLASSES.includes(entry.name)) {
    errors.push(`archived/${entry.name}/: unknown Agent Note kind`)
    continue
  }
  kinds.add(entry.name)
  for (const child of readdirSync(join(archiveRoot, entry.name), { withFileTypes: true })) {
    const rel = `${entry.name}/${child.name}`
    if (!child.isFile()) {
      errors.push(`${rel}: archived kind directories contain regular files only`)
      continue
    }
    artifacts.set(rel, readFileSync(join(archiveRoot, rel)))
  }
}
for (const kind of CLASSES) {
  if (!kinds.has(kind)) errors.push(`archived/${kind}/: required kind directory is missing`)
}
errors.push(...validateArtifacts(artifacts))

// ── manifest + Git baseline ─────────────────────────────────────────────────

function runGit(args) {
  const result = spawnSync('git', ['-C', repoRoot, ...args], { encoding: 'utf8', maxBuffer: 1 << 26 })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(result.stderr.trim() || `git exited with status ${result.status}`)
  return result.stdout
}

function readBaselineManifest(ref) {
  runGit(['cat-file', '-e', `${ref}^{commit}`])
  const entry = runGit(['ls-tree', '--name-only', ref, '--', manifestRepoPath]).trim()
  if (entry === '') return { version: 1, files: {} }
  return parseManifest(runGit(['show', `${ref}:${manifestRepoPath}`]))
}

let manifest = { version: 1, files: {} }
if (existsSync(manifestPath)) {
  try {
    manifest = parseManifest(readFileSync(manifestPath, 'utf8'))
  } catch (error) {
    errors.push(`archived/manifest.json: ${error instanceof Error ? error.message : String(error)}`)
  }
} else if (!writeMode) {
  errors.push('archived/manifest.json is required; seal new artifacts with `--write`')
}

const baselineRef = process.env.DSH_ARCHIVE_BASE_REF ?? 'HEAD'
try {
  errors.push(...validateManifestExtension(readBaselineManifest(baselineRef), manifest))
} catch (error) {
  errors.push(
    `archived/manifest.json: cannot read baseline ${JSON.stringify(baselineRef)}: ${error instanceof Error ? error.message : String(error)}`,
  )
}

const extended = extendManifest(manifest, artifacts)
errors.push(...extended.errors)
if (!writeMode) {
  for (const path of extended.added) errors.push(`${path}: archived artifact is not sealed in manifest.json`)
}

if (errors.length > 0) {
  console.error('verify-archived-agent-notes: archive rules violated:')
  for (const error of errors) console.error(`  ${error}`)
  process.exit(1)
}

if (writeMode) {
  const rendered = renderManifest(extended.files)
  if (!existsSync(manifestPath) || readFileSync(manifestPath, 'utf8') !== rendered) {
    writeFileSync(manifestPath, rendered)
  }
  console.log(`verify-archived-agent-notes: sealed ${extended.added.length} new artifact(s); existing seals unchanged.`)
} else {
  console.log(`verify-archived-agent-notes: ${artifacts.size} frozen artifact(s) checked across ${kinds.size} kind(s).`)
}
