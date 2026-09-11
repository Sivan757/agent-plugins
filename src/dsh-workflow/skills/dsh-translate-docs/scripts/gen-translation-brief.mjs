#!/usr/bin/env node
/**
 * Portable briefing generator for out-of-sync bilingual pairs — a simplified
 * port of deepseek-harness `scripts/gen-translation-brief.ts`.
 *
 * Recovers the last confirmed bytes of each side from the git blobs recorded in
 * the pair's `.i18n.yaml`, diffs them against the working tree, and prints a
 * translation-update briefing for a delegated translator.
 *
 * Usage
 *   node gen-translation-brief.mjs [--root <repo>] [<pair paths...>]
 *
 * Ported: out-of-sync discovery, recorded-blob recovery, the briefing title,
 * diff section, rules pointer, and finish instructions.
 * Not ported (needs the full harness modules): granularity mapping
 * (code-fence splice / Markdown-unit / heading-section spans), first-occurrence
 * notes, and `--apply`.
 */

import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join, resolve } from 'node:path'
import { createHash } from 'node:crypto'

function parseArgs(argv) {
  let root = process.env.DSH_REPO_ROOT ?? ''
  const anchors = []
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--root') root = argv[++i] ?? ''
    else if (arg.startsWith('--')) {
      console.error(`gen-translation-brief: unknown option ${JSON.stringify(arg)}`)
      process.exit(2)
    } else anchors.push(arg)
  }
  if (!root) {
    const git = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' })
    root = git.status === 0 ? git.stdout.trim() : process.cwd()
  }
  return { root: resolve(root), anchors }
}

const { root, anchors } = parseArgs(process.argv.slice(2))

function runGit(args, options = {}) {
  const result = spawnSync('git', ['-C', root, ...args], { encoding: options.encoding ?? 'utf8', maxBuffer: 1 << 26 })
  if (result.error) throw result.error
  return result
}

function gitBlobHash(content) {
  const hash = createHash('sha1')
  hash.update(`blob ${content.byteLength}\0`)
  hash.update(content)
  return hash.digest('hex')
}

function pairPaths(anchor) {
  const source = anchor.endsWith('.i18n.yaml')
    ? anchor.replace(/\.i18n\.yaml$/, '.md')
    : anchor.endsWith('.zh.md')
      ? anchor.replace(/\.zh\.md$/, '.md')
      : anchor
  if (!source.endsWith('.md')) throw new Error(`${anchor}: not a bilingual pair path`)
  return { source, zh: source.replace(/\.md$/, '.zh.md'), meta: source.replace(/\.md$/, '.i18n.yaml') }
}

function parseRecord(content) {
  const hashes = new Map()
  for (const line of content.split('\n')) {
    if (line === '' || line.startsWith('#')) continue
    const match = /^([^:#]+\.md): ([0-9a-f]{40})$/.exec(line)
    if (!match?.[1] || !match[2]) return undefined
    hashes.set(match[1], match[2])
  }
  return hashes
}

/** Bytes of one side as of the last confirmed-consistent state, or undefined. */
function lastConfirmed(hash) {
  const result = runGit(['cat-file', 'blob', hash], { encoding: 'buffer' })
  return result.status === 0 ? result.stdout : undefined
}

function unifiedDiff(label, before, after) {
  const dir = mkdtempSync(join(tmpdir(), 'translation-brief-'))
  try {
    const beforePath = join(dir, 'last-confirmed.md')
    const afterPath = join(dir, 'current.md')
    writeFileSync(beforePath, before)
    writeFileSync(afterPath, after)
    const result = spawnSync(
      'git',
      ['diff', '--no-index', '--no-color', '--unified=6', '--', beforePath, afterPath],
      { encoding: 'utf8', maxBuffer: 1 << 26 },
    )
    const text = (result.stdout ?? '')
      .replaceAll(`a${beforePath}`, `${label} (last confirmed)`)
      .replaceAll(`b${afterPath}`, `${label} (current)`)
      .replaceAll(beforePath, `${label} (last confirmed)`)
      .replaceAll(afterPath, `${label} (current)`)
    return text.trim()
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

function briefFor(paths) {
  const sourceAbs = join(root, paths.source)
  const zhAbs = join(root, paths.zh)
  const metaAbs = join(root, paths.meta)
  if (!existsSync(sourceAbs) || !existsSync(zhAbs) || !existsSync(metaAbs)) {
    console.error(`gen-translation-brief: ${paths.source}: incomplete pair (needs both languages plus the .i18n.yaml record)`)
    return undefined
  }
  const hashes = parseRecord(readFileSync(metaAbs, 'utf8'))
  if (hashes === undefined) {
    console.error(`gen-translation-brief: ${paths.meta}: malformed consistency record`)
    return undefined
  }

  const sides = [
    { label: 'English', path: paths.source, hash: hashes.get(basename(paths.source)) },
    { label: '中文', path: paths.zh, hash: hashes.get(basename(paths.zh)) },
  ]

  const sections = []
  let outOfSync = false
  for (const side of sides) {
    const current = readFileSync(join(root, side.path))
    if (side.hash === undefined) {
      sections.push(`## ${side.label}\n\nNo recorded hash for ${side.path}; treat the whole document as new.`)
      outOfSync = true
      continue
    }
    if (gitBlobHash(current) === side.hash) continue
    outOfSync = true
    const before = lastConfirmed(side.hash)
    if (before === undefined) {
      sections.push(`## ${side.label}\n\nRecorded blob ${side.hash} is unavailable in this checkout; treat the whole document as changed.`)
      continue
    }
    const diff = unifiedDiff(side.path, before, current)
    sections.push(`## ${side.label} diff (last-confirmed → current)\n\n\`\`\`diff\n${diff || '(no textual difference)'}\n\`\`\``)
  }

  if (!outOfSync) {
    console.log(`gen-translation-brief: ${paths.source}: pair is in sync; nothing to brief.`)
    return undefined
  }

  return [
    `# Translation update briefing: ${paths.source}`,
    '',
    ...sections,
    '',
    '## Mechanical update — no translation judgment involved',
    '',
    'Update only the spans the diff marks, keeping the other language untouched.',
    'Bring both sides along, then re-record the pair.',
    '',
    '## Rules digest (full rules: docs/i18n/translation-rules.md)',
    '',
    'Both languages carry equal authority. Preserve structure, code fences, links,',
    'and generated regions byte-for-byte except where the paired locale path differs.',
    '',
    '## Finish',
    '',
    `Run \`node <skill>/scripts/verify-translation-pairing.mjs --root . --write ${paths.source}\``,
    'then the check mode to confirm the pair is consistent again.',
    '',
  ].join('\n')
}

const targets = anchors.length > 0 ? anchors.map(pairPaths) : undefined
if (targets === undefined) {
  console.error('gen-translation-brief: pass one or more pair paths (corpus discovery lives in the verifier: --list)')
  process.exit(2)
}

let briefed = 0
for (const paths of targets) {
  const brief = briefFor(paths)
  if (brief !== undefined) {
    console.log(brief)
    briefed++
  }
}
if (briefed === 0) process.exit(1)
