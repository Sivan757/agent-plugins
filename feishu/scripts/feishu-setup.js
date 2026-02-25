#!/usr/bin/env node

'use strict';

/**
 * SessionStart hook for the Feishu plugin.
 *
 * 1. Validates .claude/.feishu.json exists with required fields.
 * 2. If oauth is enabled, checks if user has logged in.
 *    - If not, spawns the login process (opens browser) as a detached child.
 * 3. Always exits 0 — never blocks the session.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, spawn } = require('child_process');

const CONFIG_NAME = '.claude/.feishu.json';

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

// ── OAuth token detection ────────────────────────────────────────────────────
// @larksuiteoapi/lark-mcp uses env-paths('lark-mcp').data/storage.json

function getLarkMcpStoragePath() {
  const platform = os.platform();
  const home = process.env.HOME || process.env.USERPROFILE || '';

  if (platform === 'darwin') {
    return path.join(home, 'Library', 'Application Support', 'lark-mcp', 'storage.json');
  } else if (platform === 'win32') {
    const appData = process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local');
    return path.join(appData, 'lark-mcp', 'Data', 'storage.json');
  } else {
    // Linux / other
    const xdgData = process.env.XDG_DATA_HOME || path.join(home, '.local', 'share');
    return path.join(xdgData, 'lark-mcp', 'storage.json');
  }
}

function hasOAuthToken() {
  const storagePath = getLarkMcpStoragePath();
  return fs.existsSync(storagePath);
}

// ── Login launcher ───────────────────────────────────────────────────────────

function launchLogin(appId, appSecret) {
  console.log('[feishu] OAuth token not found. Launching login (opening browser)...');

  const child = spawn('npx', [
    '-y', '@larksuiteoapi/lark-mcp', 'login',
    '-a', appId,
    '-s', appSecret,
  ], {
    detached: true,
    stdio: 'ignore',
  });

  child.unref();

  console.log('[feishu] Browser should open for Feishu authorization.');
  console.log('[feishu] After login, restart the Claude session to activate.');
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const cfgPath = findConfigFile();

  if (!cfgPath) {
    console.log('[feishu] Config file not found.');
    console.log(`  Create ${CONFIG_NAME} in your project root or ~/ with app_id and app_secret.`);
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
    process.exit(0);
  }

  // Check OAuth login status
  if (cfg.oauth && !hasOAuthToken()) {
    launchLogin(cfg.app_id, cfg.app_secret);
    process.exit(0);
  }

  console.log(`[feishu] Config OK. (${cfgPath})`);
}

main();
