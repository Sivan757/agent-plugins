#!/usr/bin/env node

'use strict';

/**
 * Thin wrapper that reads .claude/.feishu.json and spawns the official
 * @larksuiteoapi/lark-mcp MCP server with the right CLI args.
 *
 * stdin/stdout are inherited — Claude talks directly to the official package.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG_NAME = '.claude/.feishu.json';

function findConfigFile() {
  // 1. Git repo root
  let projectRoot = '';
  try {
    projectRoot = execSync('git rev-parse --show-toplevel', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch { /* not in a git repo */ }

  if (projectRoot) {
    const p = path.join(projectRoot, CONFIG_NAME);
    if (fs.existsSync(p)) return p;
  }

  // 2. Current working directory (when not in a git repo)
  const cwd = process.cwd();
  if (cwd !== projectRoot) {
    const p = path.join(cwd, CONFIG_NAME);
    if (fs.existsSync(p)) return p;
  }

  // 3. User home directory
  const home = process.env.HOME || process.env.USERPROFILE || '';
  if (home) {
    const p = path.join(home, CONFIG_NAME);
    if (fs.existsSync(p)) return p;
  }

  return null;
}

function main() {
  const cfgPath = findConfigFile();
  if (!cfgPath) {
    process.stderr.write('[feishu] Config file not found. Create .claude/.feishu.json with app_id and app_secret.\n');
    process.exit(1);
  }

  let cfg;
  try {
    cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  } catch (e) {
    process.stderr.write(`[feishu] Invalid JSON in ${cfgPath}: ${e.message}\n`);
    process.exit(1);
  }

  if (!cfg.app_id || !cfg.app_secret) {
    process.stderr.write(`[feishu] Missing app_id or app_secret in ${cfgPath}\n`);
    process.exit(1);
  }

  // Build CLI args for @larksuiteoapi/lark-mcp
  const args = ['-y', '@larksuiteoapi/lark-mcp', 'mcp', '-a', cfg.app_id, '-s', cfg.app_secret];

  if (cfg.oauth) {
    args.push('--oauth');
  }

  if (cfg.token_mode) {
    args.push('--token-mode', cfg.token_mode);
  }

  if (cfg.tools) {
    args.push('-t', cfg.tools);
  }

  if (cfg.language) {
    args.push('-l', cfg.language);
  }

  if (cfg.domain) {
    args.push('-d', cfg.domain);
  }

  process.stderr.write(`[feishu] Starting MCP server... (config: ${cfgPath})\n`);

  const child = spawn('npx', args, {
    stdio: 'inherit',
    env: process.env,
  });

  child.on('error', (err) => {
    process.stderr.write(`[feishu] Failed to start MCP server: ${err.message}\n`);
    process.exit(1);
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });

  // Forward signals
  process.on('SIGTERM', () => child.kill('SIGTERM'));
  process.on('SIGINT', () => child.kill('SIGINT'));
}

main();
