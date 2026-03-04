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
//   --from=<time>            Start time, ISO 8601 (default: now minus 15 min)
//   --to=<time>              End time, ISO 8601 (default: now)
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
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// ── Constants ────────────────────────────────────────────────────────────────

const CONFIG_PATH = path.join(os.homedir(), ".cache", "apex-plugin", "aliyunlog.json");
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

function parseTime(str) {
  if (!str) return null;
  const d = new Date(str);
  if (isNaN(d.getTime())) die(`Invalid time: ${str}\nSupported formats: ISO 8601 (e.g., "2026-03-04T10:00:00+08:00", "2026-03-04 10:00:00")`);
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

// ── Subcommands ──────────────────────────────────────────────────────────────

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
  node aliyunlog.mjs --list-logstores <project|env> List logstores in a project
  node aliyunlog.mjs --list-aliases                 Show configured aliases
  node aliyunlog.mjs --test                         Test SDK connection

Config: ${CONFIG_PATH}

Options:
  --query=<sls_query>          SLS query (default: *)
  --from=<time>                Start time, ISO 8601 (omit = auto last 15 min)
                               e.g. "2026-03-04T10:00:00+08:00"
  --to=<time>                  End time, ISO 8601 (omit = now)
  --limit=<n>                  Max entries (default: 1)
  --format=compact|csv|json    Output format (default: compact)
  --project=<name>             Override project
  --logstore=<name>            Override logstore
  --fields=<f1,f2,...>         Extract specific fields (CSV output)
  --count                      Rewrite query to COUNT(*)
  --oldest                     Show oldest entries first (default: newest first)`);
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
  if (opts.help || opts.h) return cmdHelp();

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

  // ── Resolve project & logstore ─────────────────────────────────���─────────

  let project = opts.project || "";
  let logstore = opts.logstore || "";

  if (project && logstore) {
    // Both overridden — use as-is
  } else if (positional.length >= 2) {
    const resolved = resolveAlias(config, positional[0], positional[1]);
    if (!project) project = resolved.project;
    if (!logstore) logstore = resolved.logstore;
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

  let query = opts.query || "*";
  const fromDate = parseTime(opts.from) || defaultFromDate();
  const toDate = parseTime(opts.to) || defaultToDate();
  const limit = parseInt(opts.limit || "1", 10);
  if (isNaN(limit) || limit <= 0) die(`Invalid --limit value: "${opts.limit}". Must be a positive integer.`);
  const format = opts.format || "compact";
  const fields = opts.fields || "";
  const count = opts.count || false;
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
    const data = await getLogs(client, project, logstore, fromDate, toDate, query, limit, reverse);

    const n = data ? data.length : 0;
    const order = reverse ? "newest" : "oldest";
    const limitInfo = count ? "count mode" : `limit=${limit}`;
    info(`${project}/${logstore} | ${n} results | ${query === "*" ? "*" : query} | ${formatTimeForDisplay(fromDate)} ~ ${formatTimeForDisplay(toDate)} | ${limitInfo} | ${order} first`);

    if (n === 0) {
      console.log("(no results)");
      return;
    }

    let output;
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

    outputWithTokenOptimization(output);
  } catch (err) {
    die(`Query failed: ${err.message}`);
  }
}

main();
