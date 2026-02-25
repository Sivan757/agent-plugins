#!/usr/bin/env node

'use strict';

/**
 * Thin wrapper that reads .claude/.feishu.json and spawns feishu-mcp
 * (https://github.com/cso1z/Feishu-MCP) via environment variables.
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

const {spawn} = require('child_process');
const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

const CONFIG_NAME = '.claude/.feishu.json';

function findConfigFile() {
    // 1. Git repo root
    let projectRoot = '';
    try {
        projectRoot = execSync('git rev-parse --show-toplevel', {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'pipe'],
        }).trim();
    } catch { /* not in a git repo */
    }

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

    // Build env by mapping config fields to feishu-mcp env vars
    const env = {...process.env};
    for (const [key, envName] of Object.entries(ENV_MAP)) {
        if (cfg[key] !== undefined) {
            env[envName] = String(cfg[key]);
        }
    }

    const authType = env.FEISHU_AUTH_TYPE || 'tenant';

    process.stderr.write(`[feishu] Starting feishu-mcp server... (config: ${cfgPath}, auth: ${authType})\n`);

    const cliArgs = ['-y', 'feishu-mcp@latest', '--stdio'];
    cliArgs.push('--port', String(cfg.port || 3333));

    const child = spawn('npx', cliArgs, {
        stdio: 'inherit',
        env,
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
