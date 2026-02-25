#!/usr/bin/env node
//
// query.js - Alibaba Cloud SLS log query via @alicloud/log SDK
//
// Simplifies SLS log querying by resolving environment/service aliases
// to project/logstore via a configuration file.
//
// Usage:
//   node query.js <env> <service> [options]
//   node query.js --list-logstores <project|env>
//   node query.js --list-aliases
//   node query.js --test
//   node query.js --init
//   node query.js --help
//
// Options:
//   --query=<sls_query>      SLS query string (default: "*")
//   --from=<time>            Start time (default: 15 minutes ago)
//   --to=<time>              End time (default: now)
//   --limit=<n>              Max log entries (default: 1)
//   --format=<fmt>           Output format: compact|csv|json (default: compact)
//   --project=<name>         Override project (skip alias resolution)
//   --logstore=<name>        Override logstore (skip alias resolution)
//   --fields=<f1,f2,...>     Extract specific fields from results
//   --count                  Shorthand: rewrite query to COUNT(*)
//   --oldest                 Show oldest entries first (default: newest first)
//

"use strict";

const fs = require("fs");
const path = require("path");

// ── Constants ────────────────────────────────────────────────────────────────

const CONFIG_DIR = ".claude";
const CONFIG_FILE = ".aliyun.json";
const TEMP_DIR = "/tmp/claude-sls";
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

function findConfig() {
  const configName = path.join(CONFIG_DIR, CONFIG_FILE);
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    const candidate = path.join(dir, configName);
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }
  return null;
}

function loadConfig() {
  const configPath = findConfig();
  if (!configPath) return null;
  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

function validateCredentials(config) {
  const c = config.credentials;
  if (!c) die("Missing 'credentials' section in config. Run --init for template.");
  if (!c.accessKeyId || c.accessKeyId.includes("<"))
    die("Invalid accessKeyId in config. Edit .claude/.aliyun.json with real credentials.");
  if (!c.accessKeySecret || c.accessKeySecret.includes("<"))
    die("Invalid accessKeySecret in config. Edit .claude/.aliyun.json with real credentials.");
  if (!c.endpoint)
    die("Missing endpoint in config. Edit .claude/.aliyun.json with your SLS endpoint.");
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

const RELATIVE_UNITS = { s: 1000, m: 60000, min: 60000, h: 3600000, d: 86400000 };

function parseRelativeTime(str) {
  // Formats: "-30m", "-2h", "-3d", "-90s", "-30min"
  const m1 = str.match(/^-(\d+)(s|min|m|h|d)$/);
  if (m1) {
    const [, n, unit] = m1;
    return new Date(Date.now() - parseInt(n, 10) * RELATIVE_UNITS[unit]);
  }
  // Formats: "3 days ago", "2 hours ago", "30 minutes ago", "90 seconds ago"
  const m2 = str.match(/^(\d+)\s+(second|minute|hour|day)s?\s+ago$/i);
  if (m2) {
    const unitMap = { second: "s", minute: "m", hour: "h", day: "d" };
    const [, n, unit] = m2;
    return new Date(Date.now() - parseInt(n, 10) * RELATIVE_UNITS[unitMap[unit.toLowerCase()]]);
  }
  return null;
}

function parseTime(str) {
  if (!str) return null;
  const rel = parseRelativeTime(str);
  if (rel) return rel;
  const d = new Date(str);
  if (isNaN(d.getTime())) die(`Invalid time: ${str}\nSupported formats: ISO 8601, "-30m", "-2h", "-3d", "3 days ago", "2 hours ago"`);
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
      if (!v) continue;
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

function outputWithTokenOptimization(output) {
  if (output.length <= AUTO_TEMP_THRESHOLD) {
    console.log(output);
    return;
  }

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
  const configDir = CONFIG_DIR;
  const configFile = path.join(configDir, CONFIG_FILE);
  if (fs.existsSync(configFile)) {
    console.log(`Config already exists: ${configFile}`);
    return;
  }

  const template = {
    credentials: {
      accessKeyId: "<your-access-key-id>",
      accessKeySecret: "<your-access-key-secret>",
      endpoint: "cn-hangzhou.log.aliyuncs.com",
    },
    default_project: "robot-k8s-dev",
    environments: {
      dev: { project: "robot-k8s-dev", logstore_pattern: "dev1-{service}" },
      sit: { project: "robot-k8s-dev", logstore_pattern: "sit-{service}" },
      uat: { project: "robot-k8s-dev", logstore_pattern: "uat1-{service}" },
      qa: { project: "robot-k8s-dev", logstore_pattern: "qa1-{service}" },
      prod: { project: "robot-k8s-prod", logstore_pattern: "{service}" },
    },
    aliases: {
      "dev/base": { logstore: "dev-base" },
      "dev/imes": { logstore: "dev-imes" },
      "dev/cps": { logstore: "dev-cps" },
      "dev/feelinker": { logstore: "dev-feelinker" },
      "dev/trendcenter": { logstore: "dev-trendcenter" },
      "prod/saas": { logstore: "saas" },
      "prod/base": { logstore: "robot-base" },
      "prod/imes": { logstore: "imes" },
      "prod/trend": { logstore: "trend" },
    },
  };

  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(configFile, JSON.stringify(template, null, 2) + "\n");
  console.log(`Created: ${configFile}`);
  console.log("Edit this file with your SLS credentials and project/logstore mapping.");
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
  node query.js <env> <service> [options]     Query logs by environment and service
  node query.js --init                         Create config template
  node query.js --list-logstores <project|env> List logstores in a project
  node query.js --list-aliases                 Show configured aliases
  node query.js --test                         Test SDK connection

Options:
  --query=<sls_query>          SLS query (default: *)
  --from=<time>                Start time (default: 15 min ago). Supports:
                               ISO 8601, "-30m", "-2h", "-3d", "3 days ago"
  --to=<time>                  End time (default: now). Same formats as --from
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
  if (!config) die("No .claude/.aliyun.json found. Run with --init.");

  // Subcommands that need config
  if (opts["list-aliases"]) return cmdListAliases(config);
  if (opts["list-logstores"]) {
    const project = resolveProjectName(config, positional[0]);
    return cmdListLogstores(config, project);
  }
  if (opts.test) return cmdTest(config);

  // ── Resolve project & logstore ───────────────────────────────────────────

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
