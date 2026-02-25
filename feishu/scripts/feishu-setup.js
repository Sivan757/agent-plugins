#!/usr/bin/env node

'use strict';

/**
 * SessionStart hook for the Feishu plugin.
 *
 * 1. Searches for .claude/.feishu.json config file.
 * 2. If not found, creates a template in the project root (or cwd).
 * 3. Validates required fields (app_id, app_secret).
 * Always exits 0 — never blocks the session.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG_NAME = '.claude/.feishu.json';

const CONFIG_TEMPLATE = {
  app_id: '',
  app_secret: '',
  auth_type: 'user',
  port: 3333,
  base_url: 'https://open.feishu.cn/open-apis',
  scope_validation: true,
  log_level: 'info',
  cache_enabled: true,
  cache_ttl: 300,
};

// ── Config file discovery ────────────────────────────────────────────────────

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

function getInitDir() {
  try {
    return execSync('git rev-parse --show-toplevel', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return process.cwd();
  }
}

function initConfigFile() {
  const baseDir = getInitDir();
  const cfgPath = path.join(baseDir, CONFIG_NAME);
  const dir = path.dirname(cfgPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(cfgPath, JSON.stringify(CONFIG_TEMPLATE, null, 2) + '\n', 'utf8');
  return cfgPath;
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
  let cfgPath = findConfigFile();

  if (!cfgPath) {
    cfgPath = initConfigFile();
    console.log(`[feishu] Config initialized: ${cfgPath}`);
    console.log('  Fill in app_id and app_secret, then restart the session.');
    console.log('  Get credentials: https://open.feishu.cn/app');
    process.exit(0);
  }

  let cfg;
  try {
    cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  } catch (e) {
    console.log(`[feishu] Invalid JSON in ${cfgPath}: ${e.message}`);
    process.exit(0);
  }

  if (!cfg.app_id || !cfg.app_secret) {
    console.log(`[feishu] Missing app_id or app_secret in ${cfgPath}`);
    console.log('  Fill in credentials and restart the session.');
    process.exit(0);
  }

  const authType = cfg.auth_type || (cfg.oauth ? 'user' : 'tenant');
  console.log(`[feishu] Config OK. (${cfgPath}, auth: ${authType})`);
}

main();
