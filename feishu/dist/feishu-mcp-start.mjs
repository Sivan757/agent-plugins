#!/usr/bin/env node

// src/feishu-mcp-start.ts
import { spawn } from "child_process";
import { mkdirSync } from "fs";
import { dirname as dirname2 } from "path";

// ../packages/core/dist/config.js
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { homedir } from "os";

// ../packages/core/dist/errors.js
var PluginError = class extends Error {
  code;
  exitCode;
  constructor(message, code, exitCode = 1) {
    super(message);
    this.code = code;
    this.exitCode = exitCode;
    this.name = "PluginError";
  }
};

// ../packages/core/dist/config.js
var CACHE_DIR = join(homedir(), ".cache", "apex-plugin");
function configPath(pluginName) {
  return join(CACHE_DIR, `${pluginName}.json`);
}
async function loadConfig(pluginName) {
  const path = configPath(pluginName);
  if (!existsSync(path))
    return null;
  try {
    const raw = await readFile(path, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    throw new PluginError(`Failed to parse config at ${path}: ${e.message}`, "CONFIG_INVALID");
  }
}
async function requireConfig(pluginName) {
  const config = await loadConfig(pluginName);
  if (!config) {
    throw new PluginError(`No config found at ${configPath(pluginName)}. Run the plugin setup to configure credentials.`, "CONFIG_MISSING");
  }
  return config;
}

// src/feishu-mcp-start.ts
var ENV_MAP = {
  port: "PORT",
  app_id: "FEISHU_APP_ID",
  app_secret: "FEISHU_APP_SECRET",
  auth_type: "FEISHU_AUTH_TYPE",
  base_url: "FEISHU_BASE_URL",
  scope_validation: "FEISHU_SCOPE_VALIDATION",
  log_level: "LOG_LEVEL",
  cache_enabled: "CACHE_ENABLED",
  cache_ttl: "CACHE_TTL"
};
async function main() {
  let cfg;
  try {
    cfg = await requireConfig("feishu");
  } catch (e) {
    const cfgPath = configPath("feishu");
    if (e instanceof PluginError && e.code === "CONFIG_MISSING") {
      process.stderr.write(`[feishu] Config not found. Run setup or create ${cfgPath}
`);
    } else {
      process.stderr.write(`[feishu] Failed to load config: ${e.message}
`);
    }
    process.exit(1);
  }
  if (!cfg.app_id || !cfg.app_secret) {
    process.stderr.write(`[feishu] Missing app_id or app_secret in ${configPath("feishu")}
`);
    process.exit(1);
  }
  const env = { ...process.env };
  for (const [key, envName] of Object.entries(ENV_MAP)) {
    const value = cfg[key];
    if (value !== void 0) {
      env[envName] = String(value);
    }
  }
  const authType = env["FEISHU_AUTH_TYPE"] ?? "tenant";
  const mcpWorkDir = dirname2(configPath("feishu"));
  mkdirSync(mcpWorkDir, { recursive: true });
  process.stderr.write(`[feishu] Starting feishu-mcp server... (auth: ${authType})
`);
  const cliArgs = ["-y", "feishu-mcp@latest", "--stdio"];
  cliArgs.push("--port", String(cfg.port ?? 3333));
  const child = spawn("npx", cliArgs, {
    stdio: "inherit",
    env,
    cwd: mcpWorkDir
  });
  child.on("error", (err) => {
    process.stderr.write(`[feishu] Failed to start MCP server: ${err.message}
`);
    process.exit(1);
  });
  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });
  process.on("SIGTERM", () => child.kill("SIGTERM"));
  process.on("SIGINT", () => child.kill("SIGINT"));
}
main();
