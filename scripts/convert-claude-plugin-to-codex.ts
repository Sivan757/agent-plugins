#!/usr/bin/env node

import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

interface Author {
  name?: string;
  email?: string;
  url?: string;
}

interface ClaudePluginManifest {
  name: string;
  version: string;
  description: string;
  author?: string | Author;
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
}

interface CodexPluginManifest {
  name: string;
  version: string;
  description: string;
  author?: Author;
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
  skills?: string;
  mcpServers?: string;
  apps?: string;
  interface?: {
    displayName?: string;
    shortDescription?: string;
    longDescription?: string;
    developerName?: string;
    category?: string;
    websiteURL?: string;
  };
}

interface MarketplacePluginEntry {
  name: string;
  source: {
    source: 'local';
    path: string;
  };
  policy: {
    installation: string;
    authentication: string;
  };
  category: string;
}

interface MarketplaceFile {
  name: string;
  interface?: {
    displayName?: string;
  };
  plugins: MarketplacePluginEntry[];
}

interface ClaudeMarketplacePluginEntry {
  name: string;
  version?: string;
  description: string;
  source: string | {
    source: string;
    url?: string;
    path?: string;
  };
  homepage?: string;
}

interface ClaudeMarketplaceFile {
  $schema?: string;
  name: string;
  description?: string;
  owner?: Author;
  metadata?: {
    description?: string;
    version?: string;
  };
  plugins: ClaudeMarketplacePluginEntry[];
}

interface Options {
  source: string;
  output: string;
  marketplaceRoot?: string;
  marketplaceName: string;
  marketplaceVersion: string;
  category: string;
  installationPolicy: string;
  authenticationPolicy: string;
  force: boolean;
  dryRun: boolean;
}

interface FrontmatterInfo {
  body: string;
  keys: string[];
  name?: string;
  description?: string;
}

function printHelp(): void {
  console.log(`Usage: tsx scripts/convert-claude-plugin-to-codex.ts --source <dir> [options]

Convert a Claude plugin directory into the shared src/ layout used by this repo.

Options:
  --source <dir>              Source Claude plugin directory (required)
  --output <dir>              Output plugin source directory (default: src/<name>)
  --marketplace-root <dir>    Create/update marketplace files under <dir>
  --marketplace-name <name>   Marketplace name when creating a new file (default: codex-local-plugins)
  --marketplace-version <v>   Marketplace version when creating a new file (default: 1.0.0)
  --category <name>           Plugin category for interface + marketplace (default: Coding)
  --installation <policy>     Marketplace installation policy (default: AVAILABLE)
  --authentication <policy>   Marketplace authentication policy (default: ON_INSTALL)
  --force                     Replace an existing output directory
  --dry-run                   Print planned actions without writing files
  --help                      Show this help

Examples:
  tsx scripts/convert-claude-plugin-to-codex.ts --source /path/to/claude-plugin/mysql --marketplace-root .
  tsx scripts/convert-claude-plugin-to-codex.ts --source /path/to/claude-plugin/augment --output src/augment-mcp --category Productivity
`);
}

function parseArgs(): Options {
  const args = process.argv.slice(2);
  let source = '';
  let output = '';
  let marketplaceRoot = '';
  let marketplaceName = 'codex-local-plugins';
  let marketplaceVersion = '1.0.0';
  let category = 'Coding';
  let installationPolicy = 'AVAILABLE';
  let authenticationPolicy = 'ON_INSTALL';
  let force = false;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--source' && args[i + 1]) {
      source = args[++i];
    } else if (arg === '--output' && args[i + 1]) {
      output = args[++i];
    } else if (arg === '--marketplace-root' && args[i + 1]) {
      marketplaceRoot = args[++i];
    } else if (arg === '--marketplace-name' && args[i + 1]) {
      marketplaceName = args[++i];
    } else if (arg === '--marketplace-version' && args[i + 1]) {
      marketplaceVersion = args[++i];
    } else if (arg === '--category' && args[i + 1]) {
      category = args[++i];
    } else if (arg === '--installation' && args[i + 1]) {
      installationPolicy = args[++i];
    } else if (arg === '--authentication' && args[i + 1]) {
      authenticationPolicy = args[++i];
    } else if (arg === '--force') {
      force = true;
    } else if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg === '--help') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown or incomplete argument: ${arg}`);
    }
  }

  if (!source) {
    throw new Error('--source is required');
  }

  const resolvedSource = absolutePath(source);
  const sourceManifestPath = join(resolvedSource, '.claude-plugin', 'plugin.json');
  if (!existsSync(sourceManifestPath)) {
    throw new Error(`Claude plugin manifest not found: ${sourceManifestPath}`);
  }

  const sourceManifest = readJson<ClaudePluginManifest>(sourceManifestPath);
  const resolvedOutput = output
    ? absolutePath(output)
    : join(REPO_ROOT, 'src', sourceManifest.name);

  return {
    source: resolvedSource,
    output: resolvedOutput,
    marketplaceRoot: marketplaceRoot ? absolutePath(marketplaceRoot) : undefined,
    marketplaceName,
    marketplaceVersion,
    category,
    installationPolicy,
    authenticationPolicy,
    force,
    dryRun,
  };
}

function absolutePath(input: string): string {
  return isAbsolute(input) ? input : resolve(REPO_ROOT, input);
}

function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, 'utf8')) as T;
}

function writeJson(filePath: string, value: unknown): void {
  writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
}

function ensureDir(pathname: string): void {
  mkdirSync(pathname, { recursive: true });
}

function titleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function displayNameFromSlug(value: string): string {
  const tokenMap = new Map<string, string>([
    ['aliyunlog', 'Aliyun Log'],
    ['ai', 'AI'],
    ['api', 'API'],
    ['ecommerce', 'E-commerce'],
    ['ios', 'iOS'],
    ['macos', 'macOS'],
    ['mcp', 'MCP'],
    ['mysql', 'MySQL'],
    ['postgresql', 'PostgreSQL'],
    ['sdk', 'SDK'],
    ['sql', 'SQL'],
    ['ticktick', 'TickTick'],
    ['ui', 'UI'],
    ['ux', 'UX'],
  ]);

  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(part => tokenMap.get(part.toLowerCase()) || part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }
  return value.slice(0, maxLength - 1).trimEnd() + '…';
}

function normalizeAuthor(author: ClaudePluginManifest['author']): Author | undefined {
  if (!author) {
    return undefined;
  }
  if (typeof author === 'string') {
    return { name: author };
  }
  return {
    name: author.name,
    email: author.email,
    url: author.url,
  };
}

function buildCodexManifest(
  sourceManifest: ClaudePluginManifest,
  options: Options,
  outputDir: string
): CodexPluginManifest {
  const author = normalizeAuthor(sourceManifest.author);
  const hasSkills = existsSync(join(outputDir, 'skills'));
  const hasMcp = existsSync(join(outputDir, '.mcp.json'));
  const hasApp = existsSync(join(outputDir, '.app.json'));
  const websiteURL = sourceManifest.homepage || author?.url;

  const manifest: CodexPluginManifest = {
    name: sourceManifest.name,
    version: sourceManifest.version,
    description: sourceManifest.description,
    ...(author ? { author } : {}),
    ...(sourceManifest.homepage ? { homepage: sourceManifest.homepage } : {}),
    ...(sourceManifest.repository ? { repository: sourceManifest.repository } : {}),
    ...(sourceManifest.license ? { license: sourceManifest.license } : {}),
    ...(sourceManifest.keywords ? { keywords: sourceManifest.keywords } : {}),
    ...(hasSkills ? { skills: './skills/' } : {}),
    ...(hasMcp ? { mcpServers: './.mcp.json' } : {}),
    ...(hasApp ? { apps: './.app.json' } : {}),
    interface: {
      displayName: displayNameFromSlug(sourceManifest.name),
      shortDescription: truncate(sourceManifest.description, 96),
      longDescription: sourceManifest.description,
      developerName: author?.name || displayNameFromSlug(sourceManifest.name),
      category: options.category,
      ...(websiteURL ? { websiteURL } : {}),
    },
  };

  return manifest;
}

function buildClaudeCompatManifest(sourceManifest: ClaudePluginManifest): ClaudePluginManifest {
  return {
    name: sourceManifest.name,
    version: sourceManifest.version,
    description: sourceManifest.description,
    ...(sourceManifest.author ? { author: sourceManifest.author } : {}),
    ...(sourceManifest.homepage ? { homepage: sourceManifest.homepage } : {}),
    ...(sourceManifest.repository ? { repository: sourceManifest.repository } : {}),
    ...(sourceManifest.license ? { license: sourceManifest.license } : {}),
    ...(sourceManifest.keywords ? { keywords: sourceManifest.keywords } : {}),
  };
}

function toImportPath(fromFile: string, toFileWithoutExtension: string): string {
  let importPath = relative(dirname(fromFile), toFileWithoutExtension).split(sep).join('/');
  if (!importPath.startsWith('.')) {
    importPath = `./${importPath}`;
  }
  return importPath;
}

function buildPluginConfigSource(
  codexManifest: CodexPluginManifest,
  claudeManifest: ClaudePluginManifest,
  options: Options,
  hasHooks: boolean,
  outputDir: string
): string {
  const configPath = join(outputDir, 'plugin.config.ts');
  const typeImportPath = toImportPath(configPath, join(REPO_ROOT, 'scripts', 'plugin-config'));
  const config = {
    name: codexManifest.name,
    version: codexManifest.version,
    description: codexManifest.description,
    ...(codexManifest.author ? { author: codexManifest.author } : {}),
    ...(codexManifest.keywords ? { keywords: codexManifest.keywords } : {}),
    category: options.category,
    ...(codexManifest.interface ? { interface: codexManifest.interface } : {}),
    surfaces: {
      ...(codexManifest.skills ? { skills: true } : {}),
      ...(hasHooks ? { hooks: 'native', claudeManifestHooks: true } : {}),
      ...(codexManifest.mcpServers ? { mcp: true } : {}),
      ...(codexManifest.apps ? { app: true } : {}),
    },
    marketplace: {
      codex: {
        installation: options.installationPolicy,
        authentication: options.authenticationPolicy,
      },
      claude: {
        description: claudeManifest.description,
      },
    },
  };

  return `import type { PluginConfig } from "${typeImportPath}";\n\nexport default ${JSON.stringify(config, null, 2)} satisfies PluginConfig;\n`;
}

function getHookConfigSource(sourceDir: string): string | undefined {
  const candidates = [
    join(sourceDir, 'hooks.json'),
    join(sourceDir, 'hooks', 'hooks.json'),
    join(sourceDir, '.claude-plugin', 'hooks.json'),
  ];

  return candidates.find(existsSync);
}

function isNestedPath(candidate: string, parent: string): boolean {
  const resolvedCandidate = resolve(candidate);
  const resolvedParent = resolve(parent);
  return resolvedCandidate === resolvedParent || resolvedCandidate.startsWith(resolvedParent + sep);
}

function copySourceTree(sourceDir: string, outputDir: string): void {
  cpSync(sourceDir, outputDir, {
    recursive: true,
    filter: (src: string) => {
      const rel = relative(sourceDir, src) || '.';
      if (rel === '.claude-plugin' || rel.startsWith(`.claude-plugin${sep}`)) {
        return false;
      }
      if (rel === 'node_modules' || rel.startsWith(`node_modules${sep}`)) {
        return false;
      }
      return true;
    },
  });
}

function removeIfExists(filePath: string): void {
  if (existsSync(filePath)) {
    rmSync(filePath, { recursive: true, force: true });
  }
}

function collectFiles(dir: string, matcher: (filePath: string) => boolean, out: string[] = []): string[] {
  if (!existsSync(dir)) {
    return out;
  }

  for (const entry of readdirSync(dir)) {
    const filePath = join(dir, entry);
    const stats = statSync(filePath);

    if (stats.isDirectory()) {
      collectFiles(filePath, matcher, out);
      continue;
    }

    if (matcher(filePath)) {
      out.push(filePath);
    }
  }

  return out;
}

function parseFrontmatter(content: string): FrontmatterInfo | undefined {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return undefined;
  }

  const raw = match[1];
  const body = match[2];
  const keys = raw
    .split(/\r?\n/)
    .map(line => line.match(/^([A-Za-z0-9_-]+):/))
    .filter((entry): entry is RegExpMatchArray => Boolean(entry))
    .map(entry => entry[1]);

  return {
    body,
    keys,
    name: readFrontmatterScalar(raw, 'name'),
    description: readFrontmatterScalar(raw, 'description'),
  };
}

function readFrontmatterScalar(frontmatter: string, key: string): string | undefined {
  const lines = frontmatter.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prefix = `${key}:`;
    if (!line.startsWith(prefix)) {
      continue;
    }

    const value = line.slice(prefix.length).trim();
    if (value === '>-') {
      const folded: string[] = [];
      for (let j = i + 1; j < lines.length; j++) {
        if (!/^\s+/.test(lines[j])) {
          break;
        }
        folded.push(lines[j].trim());
      }
      return folded.join(' ').trim();
    }

    if (value === '|' || value === '|-' || value === '>') {
      const block: string[] = [];
      for (let j = i + 1; j < lines.length; j++) {
        if (!/^\s+/.test(lines[j])) {
          break;
        }
        block.push(lines[j].replace(/^\s+/, ''));
      }
      return block.join('\n').trim();
    }

    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1);
    }
    if (value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1);
    }
    return value || undefined;
  }

  return undefined;
}

function wrapDescription(description: string): string {
  const words = description.replace(/\s+/g, ' ').trim().split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > 76 && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.map(line => `  ${line}`).join('\n');
}

function rewriteSkillBody(body: string): { body: string; warnings: string[] } {
  const warnings: string[] = [];
  let next = body;

  next = next
    .replace(/\bAskUserQuestion\b/g, 'ask the user')
    .replace(/CLAUDE\.md/g, 'the project instructions file (AGENTS.md or CLAUDE.md)')
    .replace(/\.claude-plugin/g, '.codex-plugin')
    .replace(/\bClaude Code\b/g, 'Codex or Claude Code');

  if (next.includes('CLAUDE_PLUGIN_ROOT')) {
    warnings.push(
      'References to CLAUDE_PLUGIN_ROOT were preserved because Codex docs do not document a direct replacement token.'
    );
  }

  return { body: next, warnings };
}

function convertSkillFiles(outputDir: string, warnings: string[]): void {
  const skillFiles = collectFiles(outputDir, filePath => filePath.endsWith('SKILL.md'));

  for (const skillFile of skillFiles) {
    const original = readFileSync(skillFile, 'utf8');
    const parsed = parseFrontmatter(original);

    if (!parsed) {
      warnings.push(`Left ${relative(outputDir, skillFile)} unchanged: missing YAML frontmatter.`);
      continue;
    }

    const skillName = parsed.name || dirname(skillFile).split(sep).pop() || 'skill';
    const description = parsed.description;

    if (!description) {
      warnings.push(`Left ${relative(outputDir, skillFile)} unchanged: missing frontmatter description.`);
      continue;
    }

    const removedKeys = parsed.keys.filter(key => key !== 'name' && key !== 'description');
    if (removedKeys.length > 0) {
      warnings.push(
        `Removed unsupported Codex skill frontmatter keys from ${relative(outputDir, skillFile)}: ${removedKeys.join(', ')}`
      );
    }

    const rewritten = rewriteSkillBody(parsed.body);
    for (const warning of rewritten.warnings) {
      warnings.push(`${relative(outputDir, skillFile)}: ${warning}`);
    }

    const next = `---\nname: ${skillName}\ndescription: >-\n${wrapDescription(description)}\n---\n\n${rewritten.body.trimStart()}`;
    writeFileSync(skillFile, next.endsWith('\n') ? next : `${next}\n`);
  }
}

function loadMarketplace(filePath: string, options: Options): MarketplaceFile {
  if (!existsSync(filePath)) {
    return {
      name: options.marketplaceName,
      interface: {
        displayName: displayNameFromSlug(options.marketplaceName),
      },
      plugins: [],
    };
  }

  const current = readJson<MarketplaceFile>(filePath);
  return {
    name: current.name || options.marketplaceName,
    interface: current.interface || {
      displayName: displayNameFromSlug(current.name || options.marketplaceName),
    },
    plugins: Array.isArray(current.plugins) ? current.plugins : [],
  };
}

function loadClaudeMarketplace(filePath: string, options: Options): ClaudeMarketplaceFile {
  if (!existsSync(filePath)) {
    return {
      $schema: 'https://anthropic.com/claude-code/marketplace.schema.json',
      name: options.marketplaceName,
      description: 'Curated Claude Code plugin directory backed by generated plugin artifacts.',
      owner: {
        name: 'Agent Plugins',
      },
      metadata: {
        description: 'Curated Claude Code plugin directory backed by generated plugin artifacts.',
        version: options.marketplaceVersion,
      },
      plugins: [],
    };
  }

  const current = readJson<ClaudeMarketplaceFile>(filePath);
  return {
    ...current,
    plugins: Array.isArray(current.plugins) ? current.plugins : [],
  };
}

function upsertMarketplaceEntry(
  marketplace: MarketplaceFile,
  manifest: CodexPluginManifest,
  outputDir: string,
  options: Options,
  warnings: string[]
): void {
  if (!options.marketplaceRoot) {
    return;
  }

  void outputDir;
  void warnings;
  const normalizedPath = `./plugins/${manifest.name}`;
  const entry: MarketplacePluginEntry = {
    name: manifest.name,
    source: {
      source: 'local',
      path: normalizedPath,
    },
    policy: {
      installation: options.installationPolicy,
      authentication: options.authenticationPolicy,
    },
    category: options.category,
  };

  const remaining = marketplace.plugins.filter(plugin => plugin.name !== entry.name);
  remaining.push(entry);
  remaining.sort((left, right) => left.name.localeCompare(right.name));
  marketplace.plugins = remaining;
}

function upsertClaudeMarketplaceEntry(
  marketplace: ClaudeMarketplaceFile,
  manifest: ClaudePluginManifest,
  outputDir: string,
  options: Options,
  warnings: string[]
): void {
  if (!options.marketplaceRoot) {
    return;
  }

  void outputDir;
  void warnings;
  const normalizedPath = `./plugins/${manifest.name}`;

  const entry: ClaudeMarketplacePluginEntry = {
    name: manifest.name,
    version: manifest.version,
    description: manifest.description,
    source: normalizedPath,
    ...(manifest.homepage ? { homepage: manifest.homepage } : {}),
  };

  const remaining = marketplace.plugins.filter(plugin => plugin.name !== entry.name);
  remaining.push(entry);
  remaining.sort((left, right) => left.name.localeCompare(right.name));
  marketplace.plugins = remaining;
}

function logSummary(
  sourceManifest: ClaudePluginManifest,
  options: Options,
  warnings: string[],
  codexMarketplacePath?: string,
  claudeMarketplacePath?: string
): void {
  console.log(`Converted ${sourceManifest.name}`);
  console.log(`  source: ${options.source}`);
  console.log(`  output: ${options.output}`);
  if (codexMarketplacePath) {
    console.log(`  codex marketplace: ${codexMarketplacePath}`);
  }
  if (claudeMarketplacePath) {
    console.log(`  claude marketplace: ${claudeMarketplacePath}`);
  }
  if (options.dryRun) {
    console.log('  mode: dry-run');
  }

  if (warnings.length > 0) {
    console.log('\nWarnings:');
    for (const warning of warnings) {
      console.log(`  - ${warning}`);
    }
  }
}

function main(): void {
  const options = parseArgs();
  const sourceManifestPath = join(options.source, '.claude-plugin', 'plugin.json');
  const sourceManifest = readJson<ClaudePluginManifest>(sourceManifestPath);
  const warnings: string[] = [];

  if (isNestedPath(options.output, options.source)) {
    throw new Error(`Output directory must not be nested inside the source plugin: ${options.output}`);
  }

  if (existsSync(options.output)) {
    if (!options.force) {
      throw new Error(`Output already exists: ${options.output}. Use --force to replace it.`);
    }
    if (!options.dryRun) {
      rmSync(options.output, { recursive: true, force: true });
    }
  }

  const hookSource = getHookConfigSource(options.source);
  if (hookSource && relative(options.source, hookSource) !== 'hooks.json') {
    warnings.push(
      `Hook config comes from ${relative(options.source, hookSource)}. Relative command paths inside hooks.json may need manual review after conversion.`
    );
  }

  if (!options.dryRun) {
    ensureDir(dirname(options.output));
    copySourceTree(options.source, options.output);

    removeIfExists(join(options.output, '.claude-plugin'));

    const nestedHookConfig = join(options.output, 'hooks', 'hooks.json');
    if (existsSync(nestedHookConfig)) {
      rmSync(nestedHookConfig, { force: true });
    }

    if (hookSource) {
      const outputHookPath = join(options.output, 'hooks.json');
      const claudeHookPath = join(options.output, 'hooks', 'hooks.json');
      const hookConfig = readJson<unknown>(hookSource);
      writeJson(outputHookPath, hookConfig);
      ensureDir(dirname(claudeHookPath));
      writeJson(claudeHookPath, hookConfig);
    }

    const codexManifest = buildCodexManifest(sourceManifest, options, options.output);
    const claudeManifest = buildClaudeCompatManifest(sourceManifest);
    writeFileSync(
      join(options.output, 'plugin.config.ts'),
      buildPluginConfigSource(codexManifest, claudeManifest, options, Boolean(hookSource), options.output)
    );

    convertSkillFiles(options.output, warnings);

    let codexMarketplacePath: string | undefined;
    let claudeMarketplacePath: string | undefined;
    if (options.marketplaceRoot) {
      codexMarketplacePath = join(options.marketplaceRoot, '.agents', 'plugins', 'marketplace.json');
      claudeMarketplacePath = join(options.marketplaceRoot, '.claude-plugin', 'marketplace.json');
      ensureDir(dirname(codexMarketplacePath));
      ensureDir(dirname(claudeMarketplacePath));

      const codexMarketplace = loadMarketplace(codexMarketplacePath, options);
      upsertMarketplaceEntry(codexMarketplace, codexManifest, options.output, options, warnings);
      writeJson(codexMarketplacePath, codexMarketplace);

      const claudeMarketplace = loadClaudeMarketplace(claudeMarketplacePath, options);
      upsertClaudeMarketplaceEntry(claudeMarketplace, claudeManifest, options.output, options, warnings);
      writeJson(claudeMarketplacePath, claudeMarketplace);
    }

    logSummary(sourceManifest, options, warnings, codexMarketplacePath, claudeMarketplacePath);
    return;
  }

  let codexMarketplacePath: string | undefined;
  let claudeMarketplacePath: string | undefined;
  if (options.marketplaceRoot) {
    codexMarketplacePath = join(options.marketplaceRoot, '.agents', 'plugins', 'marketplace.json');
    claudeMarketplacePath = join(options.marketplaceRoot, '.claude-plugin', 'marketplace.json');
  }
  logSummary(sourceManifest, options, warnings, codexMarketplacePath, claudeMarketplacePath);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
