#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

interface Args {
  name: string;
  type: 'cli' | 'mcp' | 'rules';
  description: string;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  let name = '';
  let type: 'cli' | 'mcp' | 'rules' = 'cli';
  let description = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--name' && args[i + 1]) {
      name = args[++i];
    } else if (args[i] === '--type' && args[i + 1]) {
      const t = args[++i];
      if (t !== 'cli' && t !== 'mcp' && t !== 'rules') {
        console.error(`Invalid type: ${t}. Must be cli, mcp, or rules.`);
        process.exit(1);
      }
      type = t;
    } else if (args[i] === '--description' && args[i + 1]) {
      description = args[++i];
    } else if (args[i] === '--help') {
      console.log(`Usage: tsx scripts/create-plugin.ts --name <plugin-name> --type <cli|mcp|rules> --description <text>

Options:
  --name         Plugin name (kebab-case)
  --type         Plugin archetype: cli, mcp, or rules (default: cli)
  --description  One-line description`);
      process.exit(0);
    }
  }

  if (!name) {
    console.error('Error: --name is required');
    process.exit(1);
  }

  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    console.error('Error: Plugin name must be kebab-case (lowercase letters, numbers, hyphens)');
    process.exit(1);
  }

  if (!description) {
    description = `${name} plugin`;
  }

  return { name, type, description };
}

function toPascalCase(kebab: string): string {
  return kebab.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

function toTitleCase(kebab: string): string {
  return kebab.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

function copyTemplate(templateDir: string, targetDir: string, replacements: Record<string, string>): void {
  if (!existsSync(templateDir)) {
    console.error(`Template directory not found: ${templateDir}`);
    process.exit(1);
  }

  function processDir(srcDir: string, destDir: string): void {
    mkdirSync(destDir, { recursive: true });
    const entries = readdirSync(srcDir);

    for (const entry of entries) {
      const srcPath = join(srcDir, entry);
      let destName = entry;
      for (const [search, replace] of Object.entries(replacements)) {
        destName = destName.replaceAll(search, replace);
      }
      const destPath = join(destDir, destName);

      if (statSync(srcPath).isDirectory()) {
        processDir(srcPath, destPath);
      } else {
        let content = readFileSync(srcPath, 'utf-8');
        for (const [search, replace] of Object.entries(replacements)) {
          content = content.replaceAll(search, replace);
        }
        writeFileSync(destPath, content);
      }
    }
  }

  processDir(templateDir, targetDir);
}

function addToMarketplace(name: string, description: string): void {
  const mpPath = join(ROOT, '.claude-plugin', 'marketplace.json');
  const mp = JSON.parse(readFileSync(mpPath, 'utf-8'));
  mp.plugins.push({
    name,
    version: '0.1.0',
    source: `./plugin/${name}`,
    description
  });
  writeFileSync(mpPath, JSON.stringify(mp, null, 4) + '\n');
}

function addToWorkspaces(name: string): void {
  const pkgPath = join(ROOT, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  const workspacePath = `plugin/${name}`;
  if (!pkg.workspaces.includes(workspacePath)) {
    pkg.workspaces.push(workspacePath);
  }
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

function main(): void {
  const { name, type, description } = parseArgs();
  const targetDir = join(ROOT, 'plugin', name);

  if (existsSync(targetDir)) {
    console.error(`Error: Directory '${name}' already exists.`);
    process.exit(1);
  }

  const templateDir = join(ROOT, 'plugin', 'templates', type);
  const replacements: Record<string, string> = {
    '__PLUGIN__': name,
    '__PLUGIN_PASCAL__': toPascalCase(name),
    '__PLUGIN_TITLE__': toTitleCase(name),
    '__DESCRIPTION__': description
  };

  console.log(`Creating ${type} plugin: ${name}`);

  copyTemplate(templateDir, targetDir, replacements);
  addToMarketplace(name, description);

  if (type !== 'rules') {
    addToWorkspaces(name);
    console.log('Running npm install...');
    execSync('npm install', { cwd: ROOT, stdio: 'inherit' });
  }

  console.log(`
Plugin '${name}' created successfully!

Next steps:
  1. Edit plugin/${name}/skills/${name}/SKILL.md — add trigger patterns and usage docs
  2. ${type === 'rules' ? `Add rules to plugin/${name}/skills/${name}/SKILL.md` : `Implement CLI logic in plugin/${name}/src/${name}.ts`}
  ${type !== 'rules' ? `3. Build: npm run build --workspace=plugin/${name}` : ''}
  ${type !== 'rules' ? `4. Test: node plugin/${name}/dist/${name}.mjs --help` : ''}
  5. Bump version: bash scripts/bump-plugin-version.sh ${name} 0.1.0
`);
}

main();
