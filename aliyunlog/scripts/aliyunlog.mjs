#!/usr/bin/env node
//
// aliyunlog.mjs - Alibaba Cloud SLS log query via @alicloud/log SDK
//
// Simplifies SLS log querying by resolving environment/service aliases
// to project/logstore via a configuration file.
//
// Usage:
//   node aliyunlog.mjs <env> <service> [options]
//   node aliyunlog.mjs --list-logstores <project|env>
//   node aliyunlog.mjs --list-aliases
//   node aliyunlog.mjs --test
//   node aliyunlog.mjs --init
//   node aliyunlog.mjs --help
//
// Options:
//   --query=<sls_query>      SLS query string (default: "*")
//   --from=<time>            Start time (omit = auto last 15 min)
//                            Formats: now, -24h, -2d, "2 days ago"
//                            ISO 8601: "2026-03-04T10:00:00+08:00"
//   --to=<time>              End time (omit = now)
//                            Same formats as --from
//   --limit=<n>              Max log entries (default: 1)
//   --format=<fmt>           Output format: compact|csv|json (default: compact)
//   --project=<name>         Override project (skip alias resolution)
//   --logstore=<name>        Override logstore (skip alias resolution)
//   --fields=<f1,f2,...>     Extract specific fields from results
//   --count                  Shorthand: rewrite query to COUNT(*)
//   --oldest                 Show oldest entries first (default: newest first)
//

import fs from "fs";
import path from "path";
import os from "os";
import readline from "readline";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// ── Constants ────────────────────────────────────────────────────────────────

const CONFIG_PATH = path.join(os.homedir(), ".cache", "apex-plugin", ".aliyun.json");
const MAPPINGS_CACHE_PATH = path.join(os.homedir(), ".cache", "apex-plugin", "aliyunlog-mappings.json");
const CONTEXT_PATH = path.join(os.homedir(), ".cache", "apex-plugin", "aliyunlog-context.json");
const LEGACY_CONFIG_DIR = ".claude";
const LEGACY_CONFIG_FILE = ".aliyun.json";
const TEMP_DIR = path.join(os.tmpdir(), "claude-sls");
const AUTO_TEMP_THRESHOLD = 2000; // chars
const COMPACT_MAX_LINE = 500; // max chars per content line in compact mode

// ── Helpers ──────────────────────────────────────────────────────────────────

function die(msg) {
  process.stderr.write(`ERROR: ${msg}\n`);
  process.exit(1);
}

function info(msg) {
  process.stderr.write(`[SLS] ${msg}\n`);
}

function parseArgs(argv) {
  const opts = {};
  const positional = [];
  for (const arg of argv) {
    const m = arg.match(/^--([a-z-]+)=(.*)$/);
    if (m) {
      opts[m[1]] = m[2];
    } else if (arg.startsWith("--")) {
      opts[arg.slice(2)] = true;
    } else {
      positional.push(arg);
    }
  }
  return { opts, positional };
}

// ── SDK Loader ───────────────────────────────────────────────────────────────

function loadSDK() {
  const pluginRoot = path.resolve(__dirname, "..");
  try {
    const sdkPath = require.resolve("@alicloud/log", {
      paths: [pluginRoot],
    });
    return require(sdkPath);
  } catch {
    console.error("Error: @alicloud/log package not found in plugin directory.");
    console.error(`Run: npm install --prefix "${pluginRoot}"`);
    process.exit(1);
  }
}

// ── Configuration ────────────────────────────────────────────────────────────

function findLegacyConfig() {
  const configName = path.join(LEGACY_CONFIG_DIR, LEGACY_CONFIG_FILE);
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    const candidate = path.join(dir, configName);
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }
  return null;
}

function findConfig() {
  // Primary: global config
  if (fs.existsSync(CONFIG_PATH)) return { path: CONFIG_PATH, legacy: false };
  // Fallback: legacy project-local config
  const legacyPath = findLegacyConfig();
  if (legacyPath) return { path: legacyPath, legacy: true };
  return null;
}

function loadConfig() {
  const result = findConfig();
  if (!result) return null;
  if (result.legacy) {
    info(`Using legacy config: ${result.path}`);
    info(`Run --init to create global config at ${CONFIG_PATH}, then migrate your settings.`);
  }
  try {
    return JSON.parse(fs.readFileSync(result.path, "utf-8"));
  } catch (e) {
    die(`Failed to parse ${result.path}: ${e.message}\nCheck for syntax errors in your config file.`);
  }
}

function validateCredentials(config) {
  const c = config.credentials;
  if (!c) die("Missing 'credentials' section in config. Run --init for template.");
  if (!c.accessKeyId || c.accessKeyId.includes("<"))
    die(`Invalid accessKeyId in config. Edit ${CONFIG_PATH} with real credentials.`);
  if (!c.accessKeySecret || c.accessKeySecret.includes("<"))
    die(`Invalid accessKeySecret in config. Edit ${CONFIG_PATH} with real credentials.`);
  if (!c.endpoint)
    die(`Missing endpoint in config. Edit ${CONFIG_PATH} with your SLS endpoint.`);
}

function createClient(config) {
  const Client = loadSDK();
  return new Client({
    accessKeyId: config.credentials.accessKeyId,
    accessKeySecret: config.credentials.accessKeySecret,
    endpoint: config.credentials.endpoint,
  });
}

// ── Session Context Preservation ─────────────────────────────────────────────

function loadContext() {
  try {
    if (fs.existsSync(CONTEXT_PATH)) {
      return JSON.parse(fs.readFileSync(CONTEXT_PATH, "utf-8"));
    }
  } catch (e) {
    info(`Warning: Failed to load context: ${e.message}`);
  }
  return null;
}

function saveContext(context) {
  try {
    const dir = path.dirname(CONTEXT_PATH);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONTEXT_PATH, JSON.stringify(context, null, 2));
  } catch (e) {
    info(`Warning: Failed to save context: ${e.message}`);
  }
}

function clearContext() {
  try {
    if (fs.existsSync(CONTEXT_PATH)) {
      fs.unlinkSync(CONTEXT_PATH);
    }
  } catch (e) {
    info(`Warning: Failed to clear context: ${e.message}`);
  }
}

// ── Service Discovery & Mapping Cache ────────────────────────────────────────

function loadMappingsCache() {
  try {
    if (fs.existsSync(MAPPINGS_CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(MAPPINGS_CACHE_PATH, "utf-8"));
    }
  } catch (e) {
    info(`Warning: Failed to load mappings cache: ${e.message}`);
  }
  return {};
}

function saveMappingsCache(cache) {
  try {
    const dir = path.dirname(MAPPINGS_CACHE_PATH);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(MAPPINGS_CACHE_PATH, JSON.stringify(cache, null, 2));
  } catch (e) {
    info(`Warning: Failed to save mappings cache: ${e.message}`);
  }
}

async function discoverServiceLocation(client, project, serviceName) {
  info(`Discovering logstore for service: ${serviceName} in project: ${project}`);

  try {
    // Get all logstores in the project
    const result = await client.listLogStore(project);
    const logstores = result.logstores || [];

    const candidates = [];

    // Query each logstore to check if it contains the service
    for (const logstore of logstores) {
      try {
        const query = `* | SELECT DISTINCT _container_name_ LIMIT 100`;
        const fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24h
        const toDate = new Date();

        const logs = await client.getLogs(project, logstore, fromDate, toDate, {
          query,
          line: 100,
          offset: 0,
        });

        if (logs && Array.isArray(logs)) {
          for (const entry of logs) {
            const containerName = entry._container_name_ || "";
            if (containerName === serviceName || containerName.includes(serviceName)) {
              candidates.push(logstore);
              break;
            }
          }
        }
      } catch (err) {
        // Skip logstores that fail (might be empty or have access issues)
        continue;
      }
    }

    return candidates;
  } catch (err) {
    die(`Failed to discover service location: ${err.message}`);
  }
}

// ── Query Templates ──────────────────────────────────────────────────────────

const QUERY_TEMPLATES = {
  "error-by-service": (service) =>
    `_container_name_:${service} and (ERROR or Exception)`,
  "npe": (service, keyword) =>
    keyword
      ? `_container_name_:${service} and NullPointerException and ${keyword}`
      : `_container_name_:${service} and NullPointerException`,
  "recent-errors": (service) =>
    `_container_name_:${service} and (ERROR or WARN or Exception)`,
  "fatal": (service) =>
    `_container_name_:${service} and (FATAL or "Fatal error")`,
  "timeout": (service) =>
    `_container_name_:${service} and (timeout or "timed out" or TimeoutException)`,
  "oom": (service) =>
    `_container_name_:${service} and (OutOfMemoryError or "out of memory")`,
};

function expandTemplate(templateName, service, keyword) {
  const template = QUERY_TEMPLATES[templateName];
  if (!template) {
    die(`Unknown template: ${templateName}\nAvailable templates: ${Object.keys(QUERY_TEMPLATES).join(", ")}`);
  }
  return template(service, keyword);
}

// ── Alias Resolution ─────────────────────────────────────────────────────────

function resolveAlias(config, env, service) {
  const envConfig = (config.environments || {})[env];

  // 1) Exact alias match
  const key = `${env}/${service}`;
  const aliases = config.aliases || {};
  if (aliases[key]) {
    const project =
      aliases[key].project ||
      (envConfig && envConfig.project) ||
      config.default_project ||
      "";
    return { project, logstore: aliases[key].logstore || "" };
  }

  // 2) Environment pattern
  if (envConfig) {
    const project = envConfig.project || config.default_project || "";
    const pattern = envConfig.logstore_pattern || "{service}";
    return { project, logstore: pattern.replace("{service}", service) };
  }

  // 3) Fallback
  return {
    project: config.default_project || "",
    logstore: env ? `${env}-${service}` : service,
  };
}

// ── Resolve env name to project name ─────────────────────────────────────────

function resolveProjectName(config, nameOrEnv) {
  if (!nameOrEnv) return "";
  const envConfig = (config.environments || {})[nameOrEnv];
  if (envConfig) return envConfig.project || config.default_project || nameOrEnv;
  return nameOrEnv;
}

// ── Time helpers ─────────────────────────────────────────────────────────────

function parseRelativeTime(str) {
  const now = Date.now();

  // Handle "now"
  if (str === "now") return new Date(now);

  // Handle "-24h", "-2d", "-30m" format
  const shortMatch = str.match(/^-(\d+)([smhd])$/);
  if (shortMatch) {
    const value = parseInt(shortMatch[1], 10);
    const unit = shortMatch[2];
    const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return new Date(now - value * multipliers[unit]);
  }

  // Handle "2 days ago", "3 hours ago" format
  const longMatch = str.match(/^(\d+)\s+(second|minute|hour|day|week)s?\s+ago$/i);
  if (longMatch) {
    const value = parseInt(longMatch[1], 10);
    const unit = longMatch[2].toLowerCase();
    const multipliers = {
      second: 1000,
      minute: 60000,
      hour: 3600000,
      day: 86400000,
      week: 604800000
    };
    return new Date(now - value * multipliers[unit]);
  }

  return null;
}

function parseTime(str) {
  if (!str) return null;

  // Try relative time first
  const relative = parseRelativeTime(str);
  if (relative) return relative;

  // Fall back to ISO 8601
  const d = new Date(str);
  if (isNaN(d.getTime())) {
    die(`Invalid time: ${str}\nSupported formats:\n  - Relative: now, -24h, -2d, -30m, "2 days ago", "3 hours ago"\n  - ISO 8601: "2026-03-04T10:00:00+08:00", "2026-03-04 10:00:00"`);
  }
  return d;
}

function defaultFromDate() {
  return new Date(Date.now() - 15 * 60 * 1000);
}

function defaultToDate() {
  return new Date();
}

function formatTimeForDisplay(date) {
  const pad = (n) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const mo = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${y}-${mo}-${d} ${h}:${mi}:${s}`;
}

// ── Output formatters ────────────────────────────────────────────────────────

const HEADER_FIELDS = new Set([
  "_container_name_",
  "_namespace_",
  "_pod_name_",
]);

const SKIP_FIELDS = new Set([
  "__source__",
  "__topic__",
  "__time__",
  "_source_",
  "_time_",
  "_container_ip_",
  "_pod_uid_",
  "_image_name_",
]);

function shouldSkip(k) {
  return SKIP_FIELDS.has(k) || k.startsWith("__tag__:");
}

function extractErrors(data) {
  if (!data.length) return "(no results)";

  const lines = [];
  for (const entry of data) {
    const time = extractTime(entry);
    const container = entry._container_name_ || "";

    // Find the content field (usually 'content' or 'message')
    let content = entry.content || entry.message || entry.log || "";
    if (!content) {
      // Try to find any field that looks like a log message
      for (const [k, v] of Object.entries(entry)) {
        if (!shouldSkip(k) && !HEADER_FIELDS.has(k) && typeof v === 'string' && v.length > 50) {
          content = v;
          break;
        }
      }
    }

    if (!content) continue;

    // Extract exception type and message
    const exceptionMatch = content.match(/([A-Za-z.]+Exception|Error):\s*([^\n]+)/);
    if (!exceptionMatch) continue;

    const exceptionType = exceptionMatch[1];
    const exceptionMsg = exceptionMatch[2];

    // Extract stack trace (first 10 lines)
    const stackLines = [];
    const lines_in_content = content.split('\n');
    let inStack = false;
    for (const line of lines_in_content) {
      if (line.includes('at ') || line.includes('Caused by:')) {
        inStack = true;
        stackLines.push(line.trim());
        if (stackLines.length >= 10) break;
      } else if (inStack && line.trim() === '') {
        break;
      }
    }

    // Format output
    lines.push(`${time} [${container}]`);
    lines.push(`  ${exceptionType}: ${exceptionMsg}`);
    if (stackLines.length > 0) {
      lines.push(`  Stack trace (${stackLines.length} lines):`);
      for (const stackLine of stackLines) {
        lines.push(`    ${stackLine}`);
      }
    }
    lines.push('');
  }

  return lines.length > 0 ? lines.join('\n') : "(no errors found)";
}

function summarizeData(data) {
  if (!data.length) return "(no results)";

  const summary = [];
  const errorTypes = {};
  const timestamps = [];
  const stackTraces = {};

  // Analyze data
  for (const entry of data) {
    // Extract timestamp
    const timeField = entry._time_ || entry.__time__;
    if (timeField) {
      const ts = typeof timeField === 'number' ? timeField * 1000 : new Date(timeField).getTime();
      if (!isNaN(ts)) timestamps.push(ts);
    }

    // Find content field
    let content = entry.content || entry.message || entry.log || "";
    if (!content) {
      for (const [k, v] of Object.entries(entry)) {
        if (!shouldSkip(k) && !HEADER_FIELDS.has(k) && typeof v === 'string' && v.length > 50) {
          content = v;
          break;
        }
      }
    }

    if (!content) continue;

    // Extract error type
    const exceptionMatch = content.match(/([A-Za-z.]+Exception|Error):\s*([^\n]+)/);
    if (exceptionMatch) {
      const errorType = exceptionMatch[1];
      errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;

      // Extract first stack trace line for pattern detection
      const stackMatch = content.match(/at\s+([^\n]+)/);
      if (stackMatch) {
        const stackPattern = stackMatch[1].split('(')[0].trim();
        stackTraces[stackPattern] = (stackTraces[stackPattern] || 0) + 1;
      }
    }
  }

  // Build summary
  summary.push(`=== Summary of ${data.length} log entries ===\n`);

  // Error types
  if (Object.keys(errorTypes).length > 0) {
    summary.push("Error types:");
    const sorted = Object.entries(errorTypes).sort((a, b) => b[1] - a[1]);
    for (const [type, count] of sorted.slice(0, 5)) {
      summary.push(`  ${type}: ${count} occurrences`);
    }
    summary.push('');
  }

  // Time range
  if (timestamps.length > 0) {
    const earliest = new Date(Math.min(...timestamps));
    const latest = new Date(Math.max(...timestamps));
    summary.push(`Time range:`);
    summary.push(`  First: ${formatTimeForDisplay(earliest)}`);
    summary.push(`  Last:  ${formatTimeForDisplay(latest)}`);
    summary.push('');
  }

  // Top stack trace patterns
  if (Object.keys(stackTraces).length > 0) {
    summary.push("Top stack trace patterns:");
    const sorted = Object.entries(stackTraces).sort((a, b) => b[1] - a[1]);
    for (const [pattern, count] of sorted.slice(0, 3)) {
      summary.push(`  ${pattern} (${count}x)`);
    }
    summary.push('');
  }

  summary.push("Use --full to see complete output");

  return summary.join('\n');
}

function extractTime(entry) {
  let t = entry._time_ || entry.__time__ || "";
  if (typeof t === "number") {
    const d = new Date(t * 1000);
    return formatTimeForDisplay(d).split(" ")[1];
  }
  if (t.includes("T")) {
    t = t.split("T")[1];
    if (t.includes(".")) t = t.slice(0, t.indexOf("."));
    else if (t.includes("+")) t = t.split("+")[0];
    else if (t.includes("-")) t = t.split("-")[0];
  }
  return t;
}

function formatCompact(data) {
  if (!data.length) return "(no results)";
  const lines = [];
  for (const entry of data) {
    const time = extractTime(entry);
    const container = entry._container_name_ || "";
    const pod = entry._pod_name_ || "";
    const source = entry.__source__ || "";

    const parts = [];
    if (time) parts.push(time);
    if (container) parts.push(`[${container}]`);
    if (pod) parts.push(pod);
    else if (source) parts.push(source);
    if (parts.length) lines.push(parts.join(" "));

    for (const [k, v] of Object.entries(entry)) {
      if (shouldSkip(k) || HEADER_FIELDS.has(k)) continue;
      if (v === null || v === undefined || v === '') continue;
      const s = String(v);
      if (s.length > COMPACT_MAX_LINE) {
        lines.push(`  ${s.slice(0, COMPACT_MAX_LINE)}... (${s.length} chars, use --format=json for full)`);
      } else {
        lines.push(`  ${s}`);
      }
    }
    lines.push("");
  }
  return lines.join("\n");
}

function formatCsv(data, fields) {
  if (!data.length) return "(no results)";
  const cols = fields
    ? fields.split(",")
    : Object.keys(data[0]).filter((k) => !shouldSkip(k));
  const escape = (v) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const lines = [cols.join(",")];
  for (const entry of data) {
    lines.push(cols.map((c) => escape(entry[c])).join(","));
  }
  return lines.join("\n");
}

function formatJson(data) {
  if (!data.length) return "(no results)";
  return JSON.stringify(data, null, 2);
}

// ── Token optimization: auto temp file ───────────────────────────────────────

function cleanupOldTempFiles() {
  try {
    if (!fs.existsSync(TEMP_DIR)) return;
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    for (const f of fs.readdirSync(TEMP_DIR)) {
      const fp = path.join(TEMP_DIR, f);
      try {
        const stat = fs.statSync(fp);
        if (stat.mtimeMs < cutoff) fs.unlinkSync(fp);
      } catch { /* ignore individual file errors */ }
    }
  } catch { /* ignore cleanup errors */ }
}

function outputWithTokenOptimization(output) {
  if (output.length <= AUTO_TEMP_THRESHOLD) {
    console.log(output);
    return;
  }

  // Clean up temp files older than 24 hours
  cleanupOldTempFiles();

  // Write to temp file
  fs.mkdirSync(TEMP_DIR, { recursive: true });
  const timestamp = Date.now();
  const tempFile = path.join(TEMP_DIR, `sls-${timestamp}.txt`);
  fs.writeFileSync(tempFile, output, "utf-8");

  const lineCount = output.split("\n").length;
  console.log(`[Output too large for inline display (${output.length} chars, ${lineCount} lines)]`);
  console.log(`Written to: ${tempFile}`);
  console.log(`Use Read tool with offset/limit to inspect portions of this file.`);
}

// ── Interactive Setup Wizard ─────────────────────────────────────────────────

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function cmdSetup() {
  console.log("=== Aliyun SLS Setup Wizard ===\n");

  // Check if config already exists
  if (fs.existsSync(CONFIG_PATH)) {
    const overwrite = await prompt(`Config already exists at ${CONFIG_PATH}. Overwrite? (y/N): `);
    if (overwrite.toLowerCase() !== 'y') {
      console.log("Setup cancelled.");
      return;
    }
  }

  // Gather credentials
  console.log("\n1. Enter your Aliyun credentials:");
  const accessKeyId = await prompt("   AccessKey ID: ");
  const accessKeySecret = await prompt("   AccessKey Secret: ");
  const endpoint = await prompt("   Endpoint (default: cn-hangzhou.log.aliyuncs.com): ") || "cn-hangzhou.log.aliyuncs.com";

  // Create config object
  const config = {
    credentials: {
      accessKeyId,
      accessKeySecret,
      endpoint,
    },
    default_project: "",
    environments: {},
    aliases: {},
  };

  // Test connection
  console.log("\n2. Testing connection...");
  try {
    const Client = loadSDK();
    const client = new Client({
      accessKeyId: config.credentials.accessKeyId,
      accessKeySecret: config.credentials.accessKeySecret,
      endpoint: config.credentials.endpoint,
    });

    // Try to list projects (this validates credentials)
    await client.listProject();
    console.log("   ✓ Connection successful!");
  } catch (err) {
    console.log(`   ✗ Connection failed: ${err.message}`);
    const continueAnyway = await prompt("   Continue anyway? (y/N): ");
    if (continueAnyway.toLowerCase() !== 'y') {
      console.log("Setup cancelled.");
      return;
    }
  }

  // Ask for default project
  console.log("\n3. Set default project (optional):");
  const defaultProject = await prompt("   Default project name (leave empty to skip): ");
  if (defaultProject) {
    config.default_project = defaultProject;
  }

  // Save config
  const configDir = path.dirname(CONFIG_PATH);
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");

  console.log(`\n✓ Configuration saved to: ${CONFIG_PATH}`);
  console.log("\nNext steps:");
  console.log("  - Run 'node aliyunlog.mjs --test' to verify setup");
  console.log("  - Run 'node aliyunlog.mjs --list-logstores <project>' to explore logstores");
  console.log("  - Edit the config file to add environment aliases and service mappings");
}

// ── Subcommands ───────────────────────────────────────────────────���──────────

function cmdInit() {
  if (fs.existsSync(CONFIG_PATH)) {
    console.log(`Config already exists: ${CONFIG_PATH}`);
    return;
  }

  const template = {
    credentials: {
      accessKeyId: "<your-access-key-id>",
      accessKeySecret: "<your-access-key-secret>",
      endpoint: "cn-hangzhou.log.aliyuncs.com",
    },
    default_project: "",
    environments: {},
    aliases: {},
  };

  const configDir = path.dirname(CONFIG_PATH);
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(template, null, 2) + "\n");
  console.log(`Created: ${CONFIG_PATH}`);
  console.log("Edit this file with your SLS credentials and project/logstore mapping.");

  // Hint about legacy config if it exists
  const legacyPath = findLegacyConfig();
  if (legacyPath) {
    console.log(`\nNote: Legacy config found at ${legacyPath}`);
    console.log(`Copy your settings from the legacy file, then remove it.`);
  }
}

async function cmdListLogstores(config, project) {
  if (!project) die("Missing project name. Usage: --list-logstores <project|env>");
  validateCredentials(config);

  const client = createClient(config);
  try {
    const result = await client.listLogStore(project);
    const logstores = (result.logstores || []).sort();
    for (const ls of logstores) {
      console.log(ls);
    }
    info(`${logstores.length} logstores in ${project}`);
  } catch (err) {
    die(`Failed to list logstores: ${err.message}`);
  }
}

function cmdListAliases(config) {
  console.log("=== Environments ===");
  for (const [env, cfg] of Object.entries(config.environments || {}).sort()) {
    const project = cfg.project || config.default_project || "?";
    const pattern = cfg.logstore_pattern || "{service}";
    console.log(`  ${env}: project=${project}, logstore=${pattern}`);
  }

  const aliases = config.aliases || {};
  if (Object.keys(aliases).length) {
    console.log("\n=== Explicit Aliases ===");
    for (const [key, val] of Object.entries(aliases).sort()) {
      const logstore = val.logstore || "?";
      const project = val.project || "";
      console.log(
        project ? `  ${key} -> ${project}/${logstore}` : `  ${key} -> ${logstore}`
      );
    }
  }
}

async function cmdTest(config) {
  validateCredentials(config);

  console.log("Testing SLS SDK connection...");
  const client = createClient(config);

  const project = config.default_project;
  if (!project) die("No default_project set in config.");

  try {
    const result = await client.listLogStore(project);
    console.log(`OK: connected to ${project} (${result.count || 0} logstores)`);
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
    process.exit(1);
  }
}

function cmdHelp() {
  console.log(`Usage:
  node aliyunlog.mjs <env> <service> [options]     Query logs by environment and service
  node aliyunlog.mjs --init                         Create config template
  node aliyunlog.mjs --setup                        Interactive setup wizard
  node aliyunlog.mjs --list-logstores <project|env> List logstores in a project
  node aliyunlog.mjs --list-aliases                 Show configured aliases
  node aliyunlog.mjs --test                         Test SDK connection
  node aliyunlog.mjs --more                         Fetch next page (requires saved context)
  node aliyunlog.mjs --refine="filter"              Add filter to previous query
  node aliyunlog.mjs --clear-context                Clear saved context

Config: ${CONFIG_PATH}

Options:
  --query=<sls_query>          SLS query (default: *)
  --service=<name>             Auto-discover logstore by service name
  --template=<name>            Use query template (requires service name)
                               Available: error-by-service, npe, recent-errors,
                               fatal, timeout, oom
  --keyword=<text>             Additional keyword for templates (e.g., npe)
  --from=<time>                Start time (omit = auto last 15 min)
                               Formats: now, -24h, -2d, "2 days ago"
                               ISO 8601: "2026-03-04T10:00:00+08:00"
  --to=<time>                  End time (omit = now)
                               Same formats as --from
  --limit=<n>                  Max entries (default: 1)
  --format=compact|csv|json    Output format (default: compact)
  --extract-errors             Extract only exception types and stack traces
  --full                       Skip smart summarization for large outputs
  --auto-broaden               Auto-retry with relaxed filters if 0 results
  --save-context               Save query context for --more/--refine
  --project=<name>             Override project
  --logstore=<name>            Override logstore
  --fields=<f1,f2,...>         Extract specific fields (CSV output)
  --count                      Rewrite query to COUNT(*)
  --oldest                     Show oldest entries first (default: newest first)`);
}

// ── Progressive Search Strategy ──────────────────────────────────────────────

function relaxQuery(query, level) {
  // Level 1: Remove specific keywords but keep exception types
  if (level === 1) {
    // Extract service filter and exception types
    const serviceMatch = query.match(/_container_name_:[^\s]+/);
    const exceptionMatch = query.match(/\b([A-Za-z]+Exception|Error)\b/);

    if (serviceMatch && exceptionMatch) {
      return `${serviceMatch[0]} and ${exceptionMatch[0]}`;
    } else if (serviceMatch) {
      return `${serviceMatch[0]} and (ERROR or Exception)`;
    }
  }

  // Level 2: Keep only service filter + basic error filter
  if (level === 2) {
    const serviceMatch = query.match(/_container_name_:[^\s]+/);
    if (serviceMatch) {
      return `${serviceMatch[0]} and (ERROR or WARN or Exception)`;
    }
  }

  // Level 3: Just service filter
  if (level === 3) {
    const serviceMatch = query.match(/_container_name_:[^\s]+/);
    if (serviceMatch) {
      return serviceMatch[0];
    }
  }

  return null; // Can't relax further
}

async function progressiveSearch(client, project, logstore, fromDate, toDate, query, limit, reverse) {
  let currentQuery = query;
  let level = 0;
  const maxLevels = 3;

  while (level <= maxLevels) {
    if (level > 0) {
      info(`Try ${level + 1}: Broadening search...`);
    }

    const results = await getLogs(client, project, logstore, fromDate, toDate, currentQuery, limit, reverse);

    if (results && results.length > 0) {
      if (level > 0) {
        info(`✓ Found ${results.length} results with relaxed query: ${currentQuery}`);
      }
      return { results, finalQuery: currentQuery, level };
    }

    // No results, try to relax
    level++;
    if (level > maxLevels) break;

    const relaxed = relaxQuery(query, level);
    if (!relaxed) {
      info(`Cannot relax query further`);
      break;
    }

    currentQuery = relaxed;
    info(`  Trying: ${currentQuery}`);
  }

  return { results: [], finalQuery: currentQuery, level };
}

// ── Query with pagination ────────────────────────────────────────────────────

async function getLogs(client, project, logstore, from, to, query, limit, reverse) {
  const MAX_PER_CALL = 100;
  const allResults = [];
  let offset = 0;

  while (allResults.length < limit) {
    const batchSize = Math.min(MAX_PER_CALL, limit - allResults.length);
    const results = await client.getLogs(project, logstore, from, to, {
      query,
      line: batchSize,
      offset,
      reverse,
    });

    if (!results || !Array.isArray(results) || results.length === 0) break;

    allResults.push(...results);
    offset += results.length;

    // If we got fewer than requested, there are no more results
    if (results.length < batchSize) break;
  }

  return allResults;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { opts, positional } = parseArgs(process.argv.slice(2));

  // Subcommands that don't need config
  if (opts.init) return cmdInit();
  if (opts.setup) return await cmdSetup();
  if (opts.help || opts.h) return cmdHelp();

  // Handle context commands
  if (opts["clear-context"]) {
    clearContext();
    console.log("Context cleared");
    return;
  }

  // Load config once for all remaining operations
  const config = loadConfig();
  if (!config) die(`No config found. Run with --init to create ${CONFIG_PATH}`);

  // Subcommands that need config
  if (opts["list-aliases"]) return cmdListAliases(config);
  if (opts["list-logstores"]) {
    const project = resolveProjectName(config, positional[0]);
    return cmdListLogstores(config, project);
  }
  if (opts.test) return cmdTest(config);

  // Handle --more and --refine (load previous context)
  let contextOverride = null;
  if (opts.more || opts.refine) {
    const prevContext = loadContext();
    if (!prevContext) {
      die("No previous context found. Run a query with --save-context first.");
    }

    if (opts.more) {
      info("Loading previous query context for next page...");
      contextOverride = { ...prevContext, offset: (prevContext.offset || 0) + (prevContext.limit || 1) };
    } else if (opts.refine) {
      info(`Refining previous query: ${prevContext.query}`);
      const refinement = opts.refine;
      contextOverride = { ...prevContext, query: `${prevContext.query} and ${refinement}` };
    }
  }

  // ── Resolve project & logstore ─────────────────────────────────���─────────

  let project = contextOverride?.project || opts.project || "";
  let logstore = contextOverride?.logstore || opts.logstore || "";
  let serviceName = ""; // Track service name for template expansion

  // Handle --service flag for auto-discovery
  if (opts.service && !logstore) {
    serviceName = opts.service;
    project = project || config.default_project || "";
    if (!project) die("--service requires a project. Use --project or set default_project in config.");

    // Check cache first
    const cache = loadMappingsCache();
    const projectCache = cache[project] || {};

    if (projectCache[serviceName]) {
      logstore = projectCache[serviceName];
      info(`Using cached mapping: ${serviceName} -> ${logstore}`);
    } else {
      // Need to discover - create client first
      validateCredentials(config);
      const tempClient = createClient(config);

      const candidates = await discoverServiceLocation(tempClient, project, serviceName);

      if (candidates.length === 0) {
        die(`Service "${serviceName}" not found in any logstore in project "${project}"`);
      } else if (candidates.length === 1) {
        logstore = candidates[0];
        info(`Discovered: ${serviceName} -> ${logstore}`);
        // Cache the result
        if (!cache[project]) cache[project] = {};
        cache[project][serviceName] = logstore;
        saveMappingsCache(cache);
      } else {
        // Multiple candidates - need user input
        console.log(`Service "${serviceName}" found in multiple logstores:`);
        for (let i = 0; i < candidates.length; i++) {
          console.log(`  ${i + 1}. ${candidates[i]}`);
        }
        die(`Please specify logstore with --logstore or update your config with an explicit alias.`);
      }
    }
  } else if (opts.service && logstore) {
    // Service specified but logstore already provided - just use the logstore
    serviceName = opts.service;
  } else if (project && logstore) {
    // Both overridden — use as-is
  } else if (positional.length >= 2) {
    const resolved = resolveAlias(config, positional[0], positional[1]);
    if (!project) project = resolved.project;
    if (!logstore) logstore = resolved.logstore;
    serviceName = positional[1]; // Save service name
  } else if (project && positional.length >= 1) {
    logstore = positional[0];
  } else if (positional.length === 1) {
    project = config.default_project || "";
    logstore = positional[0];
  } else {
    cmdHelp();
    process.exit(1);
  }

  if (!project || !logstore) {
    die(
      "Could not resolve project/logstore. Check config or use --project/--logstore."
    );
  }

  // ── Create SDK client ──────────────────────────────────────────────────

  validateCredentials(config);
  const client = createClient(config);

  // ── Build query parameters ───────────────────────────────────────────────

  let query = contextOverride?.query || opts.query || "*";

  // Template expansion
  if (opts.template) {
    if (!serviceName) {
      die("--template requires service name. Usage: node aliyunlog.mjs <env> <service> --template=<name>");
    }
    const keyword = opts.keyword || "";
    query = expandTemplate(opts.template, serviceName, keyword);
    info(`Template expanded: ${query}`);
  }

  const fromDate = contextOverride?.from ? new Date(contextOverride.from) : (parseTime(opts.from) || defaultFromDate());
  const toDate = contextOverride?.to ? new Date(contextOverride.to) : (parseTime(opts.to) || defaultToDate());
  const limit = contextOverride?.limit || parseInt(opts.limit || "1", 10);
  if (isNaN(limit) || limit <= 0) die(`Invalid --limit value: "${opts.limit}". Must be a positive integer.`);
  const format = contextOverride?.format || opts.format || "compact";
  const fields = opts.fields || "";
  const count = opts.count || false;
  const extractErrorsMode = opts["extract-errors"] || false;
  const fullOutput = opts.full || false;
  const autoBroaden = opts["auto-broaden"] || false;
  const saveContextFlag = opts["save-context"] || false;
  const reverse = !opts.oldest; // default newest-first

  // --count shorthand: rewrite query to COUNT(*)
  if (count) {
    if (query.includes("|")) {
      // Already has analysis — don't rewrite
      info("--count ignored: query already contains analysis statement");
    } else {
      query = `${query} | SELECT COUNT(*) as total`;
    }
  }

  // ── Execute query ────────────────────────────────────────────────────────

  try {
    let data;
    let finalQuery = query;
    let searchLevel = 0;

    if (autoBroaden) {
      const result = await progressiveSearch(client, project, logstore, fromDate, toDate, query, limit, reverse);
      data = result.results;
      finalQuery = result.finalQuery;
      searchLevel = result.level;
    } else {
      data = await getLogs(client, project, logstore, fromDate, toDate, query, limit, reverse);
    }

    const n = data ? data.length : 0;
    const order = reverse ? "newest" : "oldest";
    const limitInfo = count ? "count mode" : `limit=${limit}`;
    const queryDisplay = finalQuery === "*" ? "*" : finalQuery;
    info(`${project}/${logstore} | ${n} results | ${queryDisplay} | ${formatTimeForDisplay(fromDate)} ~ ${formatTimeForDisplay(toDate)} | ${limitInfo} | ${order} first`);

    if (n === 0) {
      if (autoBroaden && searchLevel > 0) {
        console.log("(no results found even after broadening search)");
      } else {
        console.log("(no results)");
      }
      return;
    }

    let output;
    if (extractErrorsMode) {
      output = extractErrors(data);
    } else {
      switch (format) {
        case "compact":
          output = fields ? formatCsv(data, fields) : formatCompact(data);
          break;
        case "csv":
          output = formatCsv(data, fields);
          break;
        case "json":
          output = formatJson(data);
          break;
        default:
          die(`Unknown format: ${format}`);
      }
    }

    // Smart summarization for large outputs
    if (!fullOutput && !extractErrorsMode && output.split('\n').length > 50) {
      const summary = summarizeData(data);
      console.log(summary);

      // Save context if requested
      if (saveContextFlag) {
        saveContext({
          project,
          logstore,
          query: finalQuery,
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
          limit,
          format,
          offset: 0,
        });
        info("Context saved. Use --more for next page or --refine to add filters.");
      }

      return;
    }

    outputWithTokenOptimization(output);

    // Save context if requested
    if (saveContextFlag) {
      saveContext({
        project,
        logstore,
        query: finalQuery,
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
        limit,
        format,
        offset: 0,
      });
      info("Context saved. Use --more for next page or --refine to add filters.");
    }
  } catch (err) {
    const msg = err.message || String(err);
    if (msg.includes("does not exist")) {
      process.stderr.write(`ERROR: ${msg}\n`);
      process.stderr.write(`\nTry: node ${__filename} --list-logstores ${project}\n`);
      process.exit(1);
    }
    die(`Query failed: ${msg}`);
  }
}

main();
