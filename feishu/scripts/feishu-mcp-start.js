#!/usr/bin/env node

'use strict';

/**
 * Thin wrapper that reads feishu.json config and spawns feishu-mcp
 * (https://github.com/cso1z/Feishu-MCP) via environment variables.
 *
 * Config: ~/.cache/apex-plugin/feishu.json (global)
 * Legacy fallback: .claude/.feishu.json (project-local, deprecated)
 *
 * Config fields map directly to feishu-mcp env vars:
 *   port            → PORT
 *   app_id          → FEISHU_APP_ID
 *   app_secret      → FEISHU_APP_SECRET
 *   auth_type       → FEISHU_AUTH_TYPE
 *   base_url        → FEISHU_BASE_URL
 *   scope_validation → FEISHU_SCOPE_VALIDATION
 *   log_level       → LOG_LEVEL
 *   cache_enabled   → CACHE_ENABLED
 *   cache_ttl       → CACHE_TTL
 *
 * stdin/stdout are inherited — Claude talks directly to feishu-mcp via stdio.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const CONFIG_PATH = path.join(os.homedir(), '.cache', 'apex-plugin', 'feishu.json');
const LEGACY_CONFIG_NAME = '.claude/.feishu.json';

function findLegacyConfig() {
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

  const cwd = process.cwd();
  if (cwd !== projectRoot) {
    const p = path.join(cwd, LEGACY_CONFIG_NAME);
    if (fs.existsSync(p)) return p;
  }

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

// Map JSON config keys to feishu-mcp environment variable names
const ENV_MAP = {
  port: 'PORT',
  app_id: 'FEISHU_APP_ID',
  app_secret: 'FEISHU_APP_SECRET',
  auth_type: 'FEISHU_AUTH_TYPE',
  base_url: 'FEISHU_BASE_URL',
  scope_validation: 'FEISHU_SCOPE_VALIDATION',
  log_level: 'LOG_LEVEL',
  cache_enabled: 'CACHE_ENABLED',
  cache_ttl: 'CACHE_TTL',
};

function main() {
  const result = findConfig();
  if (!result) {
    process.stderr.write(`[feishu] Config not found. Run setup or create ${CONFIG_PATH}\n`);
    process.exit(1);
  }

  if (result.legacy) {
    process.stderr.write(`[feishu] Using legacy config: ${result.path}\n`);
    process.stderr.write(`[feishu] Migrate to ${CONFIG_PATH} for global access.\n`);
  }

  let cfg;
  try {
    cfg = JSON.parse(fs.readFileSync(result.path, 'utf8'));
  } catch (e) {
    process.stderr.write(`[feishu] Invalid JSON in ${result.path}: ${e.message}\n`);
    process.exit(1);
  }

  if (!cfg.app_id || !cfg.app_secret) {
    process.stderr.write(`[feishu] Missing app_id or app_secret in ${result.path}\n`);
    process.exit(1);
  }

  // Build env by mapping config fields to feishu-mcp env vars
  const env = { ...process.env };
  for (const [key, envName] of Object.entries(ENV_MAP)) {
    if (cfg[key] !== undefined) {
      env[envName] = String(cfg[key]);
    }
  }

  const authType = env.FEISHU_AUTH_TYPE || 'tenant';

  // Use config directory as cwd so feishu-mcp writes its cache files
  // (user_token_cache.json, tenant_token_cache.json, scope_version_cache.json)
  // there instead of polluting the project root.
  const mcpWorkDir = path.dirname(CONFIG_PATH);
  fs.mkdirSync(mcpWorkDir, { recursive: true });

  process.stderr.write(`[feishu] Starting feishu-mcp server... (auth: ${authType})\n`);

  const cliArgs = ['-y', 'feishu-mcp@latest', '--stdio'];
  cliArgs.push('--port', String(cfg.port || 3333));

  const child = spawn('npx', cliArgs, {
    stdio: 'inherit',
    env,
    cwd: mcpWorkDir,
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
