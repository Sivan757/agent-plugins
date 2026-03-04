#!/usr/bin/env node

'use strict';

/**
 * SessionStart hook for the Feishu plugin.
 *
 * 1. Searches for config at ~/.cache/apex-plugin/feishu.json (global).
 * 2. Falls back to legacy .claude/.feishu.json (project-local) with migration hint.
 * 3. If not found, creates a template at the global path.
 * 4. Validates required fields (app_id, app_secret).
 * Always exits 0 — never blocks the session.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const CONFIG_PATH = path.join(os.homedir(), '.cache', 'apex-plugin', 'feishu.json');
const LEGACY_CONFIG_NAME = '.claude/.feishu.json';

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

function findLegacyConfig() {
  // 1. Git repo root
  let projectRoot = '';
  try {
    projectRoot = execSync('git rev-parse --show-toplevel', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch { /* not in a git repo */ }

  if (projectRoot) {
    const p = path.join(projectRoot, LEGACY_CONFIG_NAME);
    if (fs.existsSync(p)) return p;
  }

  // 2. Current working directory
  const cwd = process.cwd();
  if (cwd !== projectRoot) {
    const p = path.join(cwd, LEGACY_CONFIG_NAME);
    if (fs.existsSync(p)) return p;
  }

  // 3. User home directory
  const home = os.homedir();
  if (home) {
    const p = path.join(home, LEGACY_CONFIG_NAME);
    if (fs.existsSync(p)) return p;
  }

  return null;
}

function findConfig() {
  if (fs.existsSync(CONFIG_PATH)) return { path: CONFIG_PATH, legacy: false };
  const legacyPath = findLegacyConfig();
  if (legacyPath) return { path: legacyPath, legacy: true };
  return null;
}

function initConfigFile() {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(CONFIG_TEMPLATE, null, 2) + '\n', 'utf8');
  return CONFIG_PATH;
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const result = findConfig();

  if (!result) {
    const cfgPath = initConfigFile();
    console.log(`[feishu] Config created: ${cfgPath}`);
    console.log('  Fill in app_id and app_secret, then restart the session.');
    console.log('  Get credentials: https://open.feishu.cn/app');
    process.exit(0);
  }

  if (result.legacy) {
    console.log(`[feishu] Using legacy config: ${result.path}`);
    console.log(`  Migrate to ${CONFIG_PATH} for global access.`);
  }

  let cfg;
  try {
    cfg = JSON.parse(fs.readFileSync(result.path, 'utf8'));
  } catch (e) {
    console.log(`[feishu] Invalid JSON in ${result.path}: ${e.message}`);
    process.exit(0);
  }

  if (!cfg.app_id || !cfg.app_secret) {
    console.log(`[feishu] Missing app_id or app_secret in ${result.path}`);
    console.log('  Fill in credentials and restart the session.');
    process.exit(0);
  }

  // Silent when everything is OK — only print on init, legacy, or error
}

main();
