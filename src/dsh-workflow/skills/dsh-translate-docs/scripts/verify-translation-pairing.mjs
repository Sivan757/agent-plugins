#!/usr/bin/env node
/**
 * Portable port of the corpus rules in deepseek-harness
 * `scripts/verify-translation-pairing.ts`.
 *
 * Enforces complete English/Chinese pairs and matching recorded git blob hashes
 * for every in-scope document, reading the target repository directly. The
 * exclusion manifest stays in the repository (`scripts/translation-pairing.manifest.json`).
 *
 * Usage
 *   node verify-translation-pairing.mjs [--root <repo>] [--list]
 *   node verify-translation-pairing.mjs [--root <repo>] --write [<pairs...>|--all]
 *   node verify-translation-pairing.mjs [--root <repo>] --cached [<pairs...>|--all]
 *
 * Ported rules: scope predicate, exclusion manifest, bilingual completeness
 * (both sides plus the `.i18n.yaml` record), record well-formedness, and
 * recorded-vs-current git blob hash agreement, including `--write` re-sealing.
 *
 * Not ported (needs the full harness modules): locale-link auditing, generated-
 * region equality, structure-signature comparison, language-switcher presence.
 * Those run in `pnpm run doc-sync` inside a deepseek-harness checkout.
 */

import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { createHash } from 'node:crypto'

// ── scope predicate (ported from scripts/translation-pairing.ts) ────────────

const README_ARTIFACT = /(?:^|\/)readme(?:\.md|\.zh\.md|\.i18n\.yaml)$/i
const ROOT_PAIRED_DOCUMENT_ARTIFACT = /^(?:brand_guidelines|contributing|safety)(?:\.md|\.zh\.md|\.i18n\.yaml)$/i
const NON_SOURCE_DIRECTORIES = new Set([
  'node_modules', 'lib', '.pnpm-store', '.cache', 'coverage', '.sessions', '.storages',
  'tmp', 'dist-exe', '__pycache__', '.pytest_cache', '.artifacts', 'vendor',
])

function isTranslationSourceExcluded(file) {
  const segments = file.split('/')
  return (
    segments.some(
      (segment) =>
        NON_SOURCE_DIRECTORIES.has(segment) ||
        segment.startsWith('.doc-typecheck-') ||
        segment.startsWith('.node-next-types-'),
    ) ||
    file.startsWith('apps/web/dist/') ||
    file.startsWith('python/sdk-runtime/src/deepseek_harness_runtime/runtime/deepseek-harness-sdk-runtime-') ||
    file.startsWith('python/sdk-runtime/src/deepseek_harness_runtime/runtime/node/')
  )
}

function isTranslationScopeFile(file) {
  return (
    !file.startsWith('.agents/notes/archived/') &&
    !isTranslationSourceExcluded(file) &&
    (README_ARTIFACT.test(file) ||
      ROOT_PAIRED_DOCUMENT_ARTIFACT.test(file) ||
      file.startsWith('.agents/notes/') ||
      file.startsWith('docs/') ||
      file.startsWith('python/'))
  )
}

function parseManifest(content) {
  const value = JSON.parse(content)
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('translation-pairing.manifest.json: expected an object')
  }
  const unsupported = Object.keys(value).filter((field) => field !== 'excluded')
  if (unsupported.length > 0) {
    throw new Error(
      `translation-pairing.manifest.json: unsupported field(s): ${unsupported.join(', ')}; every in-scope document is required`,
    )
  }
  const excluded = value.excluded
  if (!Array.isArray(excluded) || excluded.some((entry) => typeof entry !== 'string' || entry === '')) {
    throw new Error('translation-pairing.manifest.json: `excluded` must be an array of non-empty strings')
  }
  return { excluded }
}

function isExcluded(file, manifest) {
  return manifest.excluded.some((entry) => (entry.endsWith('/') ? file.startsWith(entry) : file === entry))
}

// ── pair paths / records (ported from translation-pairing-record.ts) ────────

function pairPaths(source) {
  if (!source.endsWith('.md') || source.endsWith('.zh.md')) {
    throw new Error(`expected an English Markdown path, received ${JSON.stringify(source)}`)
  }
  return { source, zh: source.replace(/\.md$/, '.zh.md'), meta: source.replace(/\.md$/, '.i18n.yaml') }
}

function parseRecord(content, paths) {
  const hashes = new Map()
  for (const line of content.split('\n')) {
    if (line === '' || line.startsWith('#')) continue
    const match = /^([^:#]+\.md): ([0-9a-f]{40})$/.exec(line)
    if (!match?.[1] || !match[2] || hashes.has(match[1])) return undefined
    hashes.set(match[1], match[2])
  }
  const sourceHash = hashes.get(basename(paths.source))
  const zhHash = hashes.get(basename(paths.zh))
  if (hashes.size !== 2 || sourceHash === undefined || zhHash === undefined) return undefined
  return { sourceHash, zhHash }
}

function renderRecord(paths, record) {
  return [
    '# Bilingual-pair consistency record (docs/i18n/README.md): the git blob hash of each',
    '# side as of the last confirmed-consistent state. Both languages carry equal authority;',
    '# after editing either side, bring the other along and re-record with:',
    `#   pnpm run verify-translation-pairing --write ${paths.source}`,
    `${basename(paths.source)}: ${record.sourceHash}`,
    `${basename(paths.zh)}: ${record.zhHash}`,
    '',
  ].join('\n')
}

function gitBlobHash(content) {
  const hash = createHash('sha1')
  hash.update(`blob ${content.byteLength}\0`)
  hash.update(content)
  return hash.digest('hex')
}

// ── args + planes ───────────────────────────────────────────────────────────

function parseArgs(argv) {
  let root = process.env.DSH_REPO_ROOT ?? ''
  let mode = 'check'
  let cached = false
  let all = false
  const anchors = []
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--root') root = argv[++i] ?? ''
    else if (arg === '--list') mode = 'list'
    else if (arg === '--write') mode = 'write'
    else if (arg === '--cached') cached = true
    else if (arg === '--all') all = true
    else if (arg.startsWith('--')) {
      console.error(`verify-translation-pairing: unknown option ${JSON.stringify(arg)}`)
      process.exit(2)
    } else anchors.push(arg)
  }
  if (!root) {
    const git = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' })
    root = git.status === 0 ? git.stdout.trim() : process.cwd()
  }
  if (all && anchors.length > 0) {
    console.error('verify-translation-pairing: --all cannot be combined with named pairs')
    process.exit(2)
  }
  return { root: resolve(root), mode, cached, all, anchors, scoped: anchors.length > 0 }
}

const { root, mode, cached, all, anchors, scoped } = parseArgs(process.argv.slice(2))
const listMode = mode === 'list'
const writeMode = mode === 'write'
const indexMode = cached

function runGit(args, input) {
  const result = spawnSync('git', ['-C', root, ...args], { input, maxBuffer: 1 << 26 })
  if (result.error) throw new Error(`git ${args[0]} failed: ${result.error.message}`)
  if (result.status !== 0) {
    throw new Error(`git ${args[0]} failed with status ${String(result.status)}: ${result.stderr.toString('utf8').trim()}`)
  }
  return result.stdout
}

let indexPaths
let indexSet
if (indexMode) {
  indexSet = new Set()
  const entries = runGit(['ls-files', '--stage', '-z']).toString('utf8').split('\0').filter(Boolean)
  for (const entry of entries) {
    const match = /^\d+ [0-9a-f]+ ([0-3])\t([\s\S]+)$/.exec(entry)
    if (!match?.[1] || match[2] === undefined) throw new Error('git ls-files --stage returned a malformed entry')
    if (match[1] === '0') indexSet.add(match[2])
  }
  indexPaths = indexSet
}

const contentCache = new Map()

function readIndexBlob(file) {
  const output = runGit(['ls-files', '--stage', '-z', '--', file]).toString('utf8')
  const entries = output.split('\0').filter(Boolean)
  if (entries.length === 0) return undefined
  if (entries.length !== 1) throw new Error(`${file} does not have exactly one resolved index entry`)
  const match = /^(?:\d+) ([0-9a-f]+) 0\t[\s\S]+$/.exec(entries[0] ?? '')
  if (!match?.[1]) throw new Error(`${file} remains unmerged or has an invalid index entry`)
  return runGit(['cat-file', 'blob', match[1]])
}

function readRepositoryFile(file) {
  if (contentCache.has(file)) return contentCache.get(file)
  const content = indexMode
    ? indexPaths.has(file)
      ? readIndexBlob(file)
      : undefined
    : existsSync(join(root, file)) && statSync(join(root, file)).isFile()
      ? readFileSync(join(root, file))
      : undefined
  contentCache.set(file, content)
  return content
}

function repositoryFileExists(file) {
  return indexMode ? indexPaths.has(file) : readRepositoryFile(file) !== undefined
}

// ── scope enumeration ───────────────────────────────────────────────────────

const manifestContent = readRepositoryFile('scripts/translation-pairing.manifest.json')
if (manifestContent === undefined) {
  console.error('verify-translation-pairing: scripts/translation-pairing.manifest.json is missing from the selected content plane')
  process.exit(2)
}
const manifest = parseManifest(manifestContent.toString('utf8'))

function walk(dir, rel, files) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    const childRel = rel ? `${rel}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      if (NON_SOURCE_DIRECTORIES.has(entry.name) || entry.name === '.git') continue
      if (childRel === '.agents/notes/archived') continue
      walk(join(dir, entry.name), childRel, files)
    } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.i18n.yaml'))) {
      if (isTranslationScopeFile(childRel)) files.add(childRel)
    }
  }
}

const files = new Set()
if (scoped) {
  for (const anchor of anchors) {
    let paths
    try {
      paths = pairPaths(anchor)
    } catch (error) {
      console.error(`verify-translation-pairing: ${error instanceof Error ? error.message : String(error)}`)
      process.exit(2)
    }
    for (const file of [paths.source, paths.zh, paths.meta]) {
      if (repositoryFileExists(file)) files.add(file)
    }
    if (!indexMode && !repositoryFileExists(anchor)) files.add(anchor)
  }
} else {
  walk(root, '', files)
}

const translations = [...files].filter((f) => f.endsWith('.zh.md')).sort()
const metas = [...files].filter((f) => f.endsWith('.i18n.yaml')).sort()
const sources = [...files].filter((f) => f.endsWith('.md') && !f.endsWith('.zh.md')).sort()

if (scoped) {
  const rejected = anchors.filter((anchor) => !isTranslationScopeFile(anchor) || isExcluded(anchor, manifest))
  const absent = anchors.filter((anchor) => {
    const { source, zh, meta } = pairPaths(anchor)
    return ![source, zh, meta].some(repositoryFileExists)
  })
  if (rejected.length > 0 || (!indexMode && absent.length > 0)) {
    for (const anchor of rejected) {
      console.error(
        `verify-translation-pairing: ${anchor} is not an in-scope pair (excluded or outside the documentation corpus; see docs/i18n/README.md)`,
      )
    }
    for (const anchor of absent) {
      console.error(`verify-translation-pairing: ${anchor} names no pair on disk (none of its three files exist)`)
    }
    process.exit(2)
  }
}

// ── --write: re-seal requested complete pairs ───────────────────────────────

const SNAPSHOT_REF_PREFIX = 'refs/dsh/translation-pairing/snapshots'

function storeGitBlob(content) {
  const expected = gitBlobHash(content)
  const stored = runGit(['hash-object', '-w', '--stdin'], content).toString('utf8').trim()
  if (stored !== expected) {
    throw new Error(`git hash-object returned ${JSON.stringify(stored)}; expected ${expected}`)
  }
  runGit(['update-ref', `${SNAPSHOT_REF_PREFIX}/${stored}`, stored])
  return stored
}

if (writeMode) {
  let written = 0
  for (const source of sources) {
    if (isExcluded(source, manifest)) continue
    const paths = pairPaths(source)
    if (!repositoryFileExists(source) || !repositoryFileExists(paths.zh)) {
      if (scoped) {
        console.error(
          `verify-translation-pairing: cannot record ${source}: missing ${repositoryFileExists(source) ? paths.zh : source}`,
        )
        process.exit(2)
      }
      continue
    }
    const sourceContent = readRepositoryFile(source)
    const zhContent = readRepositoryFile(paths.zh)
    if (sourceContent === undefined || zhContent === undefined) throw new Error(`${source}: complete pair became unreadable`)
    const record = renderRecord(paths, {
      sourceHash: storeGitBlob(sourceContent),
      zhHash: storeGitBlob(zhContent),
    })
    if (existsSync(join(root, paths.meta)) && readFileSync(join(root, paths.meta), 'utf8') === record) continue
    writeFileSync(join(root, paths.meta), record)
    console.log(`verify-translation-pairing: recorded ${paths.meta}`)
    written++
  }
  console.log(`verify-translation-pairing: ${written} record(s) written; run the check to validate the pairs.`)
  process.exit(0)
}

// ── checks ──────────────────────────────────────────────────────────────────

const errors = []
const state = new Map()

for (const source of sources) {
  if (isExcluded(source, manifest)) continue
  const { zh } = pairPaths(source)
  if (!repositoryFileExists(zh)) {
    errors.push(
      `${source}: in-scope documentation must merge bilingual; add the counterpart and record the pair`,
    )
    state.set(source, 'missing')
  }
}

const pairAnchors = new Set()
for (const zh of translations) pairAnchors.add(zh.replace(/\.zh\.md$/, '.md'))
for (const meta of metas) pairAnchors.add(meta.replace(/\.i18n\.yaml$/, '.md'))

for (const source of [...pairAnchors].sort()) {
  const paths = pairPaths(source)
  const have = {
    source: repositoryFileExists(source),
    zh: repositoryFileExists(paths.zh),
    meta: repositoryFileExists(paths.meta),
  }

  if (isExcluded(source, manifest)) {
    if (have.zh) errors.push(`${paths.zh}: ${source} is excluded from pairing; this translation must not exist`)
    if (have.meta) errors.push(`${paths.meta}: ${source} is excluded from pairing; this consistency record must not exist`)
    continue
  }

  const missing = Object.entries(have)
    .filter(([, ok]) => !ok)
    .map(([key]) => (key === 'source' ? source : key === 'zh' ? paths.zh : paths.meta))
  if (missing.length > 0) {
    errors.push(
      `${source}: incomplete pair — missing ${missing.join(', ')} (pairs merge whole: both languages plus the .i18n.yaml record)`,
    )
    continue
  }

  const sourceContent = readRepositoryFile(source)
  const zhContent = readRepositoryFile(paths.zh)
  const metaContent = readRepositoryFile(paths.meta)
  if (sourceContent === undefined || zhContent === undefined || metaContent === undefined) {
    throw new Error(`${source}: complete pair became unreadable`)
  }
  const record = parseRecord(metaContent.toString('utf8'), paths)
  if (record === undefined) {
    errors.push(
      `${paths.meta}: malformed consistency record (expected exactly \`${basename(source)}: <40-hex>\` and \`${basename(paths.zh)}: <40-hex>\`)`,
    )
    continue
  }

  let consistent = true
  for (const [file, content] of [
    [source, sourceContent],
    [paths.zh, zhContent],
  ]) {
    const current = gitBlobHash(content)
    const recorded = file === source ? record.sourceHash : record.zhHash
    if (recorded !== current) {
      errors.push(
        `${file}: out of sync — content no longer matches the pair's last confirmed-consistent state in ${paths.meta} (bring the other side along, then re-record with --write)`,
      )
      consistent = false
    }
  }
  if (!consistent) {
    state.set(source, 'out-of-sync')
    continue
  }
  if (!state.has(source)) state.set(source, 'ok')
}

for (const source of sources) {
  if (!isExcluded(source, manifest) && !state.has(source)) state.set(source, 'missing')
}

if (listMode) {
  const order = { 'out-of-sync': 0, missing: 1, ok: 2 }
  const rows = [...state.entries()].sort((a, b) => order[a[1]] - order[b[1]] || a[0].localeCompare(b[0]))
  for (const [file, status] of rows) {
    console.log(`${status.padEnd(11)} ${file}${status === 'missing' ? '  (required)' : ''}`)
  }
  const counts = { ok: 0, 'out-of-sync': 0, missing: 0 }
  for (const status of state.values()) counts[status]++
  console.log(
    `verify-translation-pairing: ${counts.ok} ok, ${counts['out-of-sync']} out-of-sync, ${counts.missing} missing (of ${state.size} in scope)`,
  )
  process.exit(0)
}

if (errors.length === 0) {
  console.log(
    scoped
      ? `verify-translation-pairing: ${pairAnchors.size} named pair(s) consistent (completeness + recorded hashes).`
      : `verify-translation-pairing: ${pairAnchors.size} pair(s) checked (completeness + recorded hashes), all consistent.`,
  )
  process.exit(0)
}

console.error('verify-translation-pairing: bilingual pairing rules violated:')
for (const message of errors) console.error(`  ${message}`)
process.exit(1)
