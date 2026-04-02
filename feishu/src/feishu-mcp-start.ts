#!/usr/bin/env node

/**
 * Thin wrapper that reads feishu.json config and spawns feishu-mcp
 * (https://github.com/cso1z/Feishu-MCP) via environment variables.
 *
 * Config: ~/.cache/apex-plugin/feishu.json (global)
 *
 * Config fields map directly to feishu-mcp env vars:
 *   port             → PORT
 *   app_id           → FEISHU_APP_ID
 *   app_secret       → FEISHU_APP_SECRET
 *   auth_type        → FEISHU_AUTH_TYPE
 *   base_url         → FEISHU_BASE_URL
 *   scope_validation → FEISHU_SCOPE_VALIDATION
 *   log_level        → LOG_LEVEL
 *   cache_enabled    → CACHE_ENABLED
 *   cache_ttl        → CACHE_TTL
 *
 * stdin/stdout are inherited — Claude talks directly to feishu-mcp via stdio.
 */

import { spawn } from 'child_process';
import { mkdirSync } from 'fs';
import { dirname } from 'path';
import { requireConfig, configPath, PluginError } from '@apex/core';

interface FeishuConfig extends Record<string, unknown> {
  app_id: string;
  app_secret: string;
  auth_type?: string;
  base_url?: string;
  port?: number;
  scope_validation?: boolean;
  log_level?: string;
  cache_enabled?: boolean;
  cache_ttl?: number;
}

// Map JSON config keys to feishu-mcp environment variable names
const ENV_MAP: Record<string, string> = {
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

async function main(): Promise<void> {
  let cfg: FeishuConfig;
  try {
    cfg = await requireConfig<FeishuConfig>('feishu');
  } catch (e) {
    const cfgPath = configPath('feishu');
    if (e instanceof PluginError && e.code === 'CONFIG_MISSING') {
      process.stderr.write(`[feishu] Config not found. Run setup or create ${cfgPath}\n`);
    } else {
      process.stderr.write(`[feishu] Failed to load config: ${(e as Error).message}\n`);
    }
    process.exit(1);
  }

  if (!cfg.app_id || !cfg.app_secret) {
    process.stderr.write(`[feishu] Missing app_id or app_secret in ${configPath('feishu')}\n`);
    process.exit(1);
  }

  // Build env by mapping config fields to feishu-mcp env vars
  const env: NodeJS.ProcessEnv = { ...process.env };
  for (const [key, envName] of Object.entries(ENV_MAP)) {
    const value = (cfg as Record<string, unknown>)[key];
    if (value !== undefined) {
      env[envName] = String(value);
    }
  }

  const authType = env['FEISHU_AUTH_TYPE'] ?? 'tenant';

  // Use config directory as cwd so feishu-mcp writes its cache files
  // (user_token_cache.json, tenant_token_cache.json, scope_version_cache.json)
  // there instead of polluting the project root.
  const mcpWorkDir = dirname(configPath('feishu'));
  mkdirSync(mcpWorkDir, { recursive: true });

  process.stderr.write(`[feishu] Starting feishu-mcp server... (auth: ${authType})\n`);

  const cliArgs = ['-y', 'feishu-mcp@latest', '--stdio'];
  cliArgs.push('--port', String(cfg.port ?? 3333));

  const child = spawn('npx', cliArgs, {
    stdio: 'inherit',
    env,
    cwd: mcpWorkDir,
  });

  child.on('error', (err: Error) => {
    process.stderr.write(`[feishu] Failed to start MCP server: ${err.message}\n`);
    process.exit(1);
  });

  child.on('exit', (code: number | null) => {
    process.exit(code ?? 0);
  });

  // Forward signals
  process.on('SIGTERM', () => child.kill('SIGTERM'));
  process.on('SIGINT', () => child.kill('SIGINT'));
}

main();
