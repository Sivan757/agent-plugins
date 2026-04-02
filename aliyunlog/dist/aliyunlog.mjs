#!/usr/bin/env node

// src/aliyunlog.ts
import fs from "fs";
import path from "path";
import os from "os";
import readline from "readline";
import { fileURLToPath } from "url";

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
  const path2 = configPath(pluginName);
  if (!existsSync(path2))
    return null;
  try {
    const raw = await readFile(path2, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    throw new PluginError(`Failed to parse config at ${path2}: ${e.message}`, "CONFIG_INVALID");
  }
}
async function requireConfig(pluginName) {
  const config = await loadConfig(pluginName);
  if (!config) {
    throw new PluginError(`No config found at ${configPath(pluginName)}. Run the plugin setup to configure credentials.`, "CONFIG_MISSING");
  }
  return config;
}

// src/aliyunlog.ts
import ALY from "@alicloud/log";
var __filename = fileURLToPath(import.meta.url);
var CONFIG_PATH = configPath("aliyunlog");
var MAPPINGS_CACHE_PATH = path.join(os.homedir(), ".cache", "apex-plugin", "aliyunlog-mappings.json");
var CONTEXT_PATH = path.join(os.homedir(), ".cache", "apex-plugin", "aliyunlog-context.json");
var TEMP_DIR = path.join(os.tmpdir(), "claude-sls");
var AUTO_TEMP_THRESHOLD = 2e3;
function die(msg) {
  process.stderr.write(`ERROR: ${msg}
`);
  process.exit(1);
}
function info(msg) {
  process.stderr.write(`[SLS] ${msg}
`);
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
function createClient(config) {
  return new ALY({
    accessKeyId: config.credentials.accessKeyId,
    accessKeySecret: config.credentials.accessKeySecret,
    endpoint: config.credentials.endpoint
  });
}
function validateCredentials(config) {
  const c = config.credentials;
  if (!c) die(`Missing 'credentials' section in config. Run --init for template.`);
  if (!c.accessKeyId || c.accessKeyId.includes("<"))
    die(`Invalid accessKeyId in config. Edit ${CONFIG_PATH} with real credentials.`);
  if (!c.accessKeySecret || c.accessKeySecret.includes("<"))
    die(`Invalid accessKeySecret in config. Edit ${CONFIG_PATH} with real credentials.`);
  if (!c.endpoint)
    die(`Missing endpoint in config. Edit ${CONFIG_PATH} with your SLS endpoint.`);
}
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
    const result = await client.listLogStore(project);
    const logstores = result.logstores || [];
    const candidates = [];
    for (const logstore of logstores) {
      try {
        const query = `* | SELECT DISTINCT _container_name_ LIMIT 100`;
        const fromDate = new Date(Date.now() - 24 * 60 * 60 * 1e3);
        const toDate = /* @__PURE__ */ new Date();
        const logs = await client.getLogs(project, logstore, fromDate, toDate, {
          query,
          line: 100,
          offset: 0
        });
        if (logs && Array.isArray(logs)) {
          for (const entry of logs) {
            const containerName = String(entry._container_name_ || "");
            if (containerName === serviceName || containerName.includes(serviceName)) {
              candidates.push(logstore);
              break;
            }
          }
        }
      } catch {
        continue;
      }
    }
    return candidates;
  } catch (err) {
    die(`Failed to discover service location: ${err.message}`);
  }
}
async function discoverServiceFast(client, project, serviceName) {
  const result = await client.listLogStore(project);
  const allLogstores = result.logstores || [];
  const priority = allLogstores.filter(
    (ls) => ls.includes("saas") || ls.includes("base") || ls.includes("imes") || ls.includes("cps") || ls.includes("feelinker") || ls.includes("trend")
  );
  const rest = allLogstores.filter((ls) => !priority.includes(ls));
  const candidates = [];
  const fromDate = new Date(Date.now() - 2 * 60 * 60 * 1e3);
  const toDate = /* @__PURE__ */ new Date();
  for (const logstore of [...priority, ...rest]) {
    try {
      const query = `_container_name_:${serviceName} | SELECT COUNT(*) as c`;
      const logs = await client.getLogs(project, logstore, fromDate, toDate, {
        query,
        line: 1,
        offset: 0
      });
      if (logs && Array.isArray(logs) && logs.length > 0) {
        const count = parseInt(String(logs[0].c || "0"), 10);
        if (count > 0) {
          candidates.push({ logstore, count });
        }
      }
    } catch {
      continue;
    }
    if (candidates.length > 0 && priority.includes(candidates[0].logstore)) {
      break;
    }
  }
  return candidates;
}
async function cmdFindService(config, project, serviceName) {
  if (!serviceName) die("Usage: --find-service <service_name>");
  validateCredentials(config);
  project = project || config.default_project || "";
  if (!project) die("No project specified. Use --project=<name> or set default_project in config.");
  const client = createClient(config);
  info(`Searching for service "${serviceName}" across logstores in ${project}...`);
  const candidates = await discoverServiceFast(client, project, serviceName);
  if (candidates.length === 0) {
    console.error(`Service "${serviceName}" not found in any logstore in project "${project}" (last 2h).`);
    console.error(`
Available logstores:`);
    const result = await client.listLogStore(project);
    const appLogstores = (result.logstores || []).filter(
      (ls) => !ls.startsWith("alb-") && !ls.startsWith("apiserver-") && !ls.startsWith("audit-") && !ls.startsWith("ccm-") && !ls.startsWith("kcm-") && !ls.startsWith("scheduler-") && !ls.startsWith("controlplane-") && !ls.startsWith("security-")
    );
    for (const ls of appLogstores.sort()) {
      console.error(`  ${ls}`);
    }
    process.exit(1);
  }
  for (const { logstore, count } of candidates) {
    console.log(`${logstore} (${count} logs in last 2h)`);
  }
  const cache = loadMappingsCache();
  if (!cache[project]) cache[project] = {};
  for (const { logstore } of candidates) {
    cache[project][serviceName] = logstore;
  }
  saveMappingsCache(cache);
  info(`Cached: ${serviceName} -> ${candidates[0].logstore}`);
  info(`Query example: node aliyunlog.mjs --service=${serviceName} --project=${project} --query="ERROR" --from=-1h`);
}
async function cmdListServices(config, project, logstoreName) {
  if (!logstoreName) die("Usage: --list-services <logstore> [--project=<name>]");
  validateCredentials(config);
  project = project || config.default_project || "";
  if (!project) die("No project specified. Use --project=<name> or set default_project in config.");
  const client = createClient(config);
  const fromDate = new Date(Date.now() - 24 * 60 * 60 * 1e3);
  const toDate = /* @__PURE__ */ new Date();
  try {
    const query = `* | SELECT DISTINCT _container_name_ ORDER BY _container_name_ LIMIT 200`;
    const logs = await client.getLogs(project, logstoreName, fromDate, toDate, {
      query,
      line: 200,
      offset: 0
    });
    if (!logs || logs.length === 0) {
      console.log(`(no services found in ${logstoreName} in the last 24h)`);
      return;
    }
    console.log(`Services in ${project}/${logstoreName}:`);
    const services = logs.map((e) => String(e._container_name_ || "")).filter(Boolean).sort();
    for (const svc of services) {
      console.log(`  ${svc}`);
    }
    info(`${services.length} services found`);
  } catch (err) {
    die(`Failed to list services: ${err.message}`);
  }
}
var QUERY_TEMPLATES = {
  "error-by-service": (service) => `_container_name_:${service} and (ERROR or Exception)`,
  "npe": (service, keyword) => keyword ? `_container_name_:${service} and NullPointerException and ${keyword}` : `_container_name_:${service} and NullPointerException`,
  "recent-errors": (service) => `_container_name_:${service} and (ERROR or WARN or Exception)`,
  "fatal": (service) => `_container_name_:${service} and (FATAL or "Fatal error")`,
  "timeout": (service) => `_container_name_:${service} and (timeout or "timed out" or TimeoutException)`,
  "oom": (service) => `_container_name_:${service} and (OutOfMemoryError or "out of memory")`
};
function expandTemplate(templateName, service, keyword) {
  const template = QUERY_TEMPLATES[templateName];
  if (!template) {
    die(`Unknown template: ${templateName}
Available templates: ${Object.keys(QUERY_TEMPLATES).join(", ")}`);
  }
  return template(service, keyword);
}
function resolveAlias(config, env, service) {
  const envConfig = (config.environments || {})[env];
  const key = `${env}/${service}`;
  const aliases = config.aliases || {};
  if (aliases[key]) {
    const project = aliases[key].project || envConfig && envConfig.project || config.default_project || "";
    return { project, logstore: aliases[key].logstore || "" };
  }
  if (envConfig) {
    const project = envConfig.project || config.default_project || "";
    const pattern = envConfig.logstore_pattern || "{service}";
    return { project, logstore: pattern.replace("{service}", service) };
  }
  return {
    project: config.default_project || "",
    logstore: env ? `${env}-${service}` : service
  };
}
function resolveProjectName(config, nameOrEnv) {
  if (!nameOrEnv) return "";
  const envConfig = (config.environments || {})[nameOrEnv];
  if (envConfig) return envConfig.project || config.default_project || nameOrEnv;
  return nameOrEnv;
}
function parseRelativeTime(str) {
  const now = Date.now();
  if (str === "now") return new Date(now);
  const shortMatch = str.match(/^-(\d+)([smhd])$/);
  if (shortMatch) {
    const value = parseInt(shortMatch[1], 10);
    const unit = shortMatch[2];
    const multipliers = { s: 1e3, m: 6e4, h: 36e5, d: 864e5 };
    return new Date(now - value * multipliers[unit]);
  }
  const longMatch = str.match(/^(\d+)\s+(second|minute|hour|day|week)s?\s+ago$/i);
  if (longMatch) {
    const value = parseInt(longMatch[1], 10);
    const unit = longMatch[2].toLowerCase();
    const multipliers = {
      second: 1e3,
      minute: 6e4,
      hour: 36e5,
      day: 864e5,
      week: 6048e5
    };
    return new Date(now - value * multipliers[unit]);
  }
  return null;
}
function parseTime(str) {
  if (!str) return /* @__PURE__ */ new Date();
  const relative = parseRelativeTime(str);
  if (relative) return relative;
  const d = new Date(str);
  if (isNaN(d.getTime())) {
    die(`Invalid time: ${str}
Supported formats:
  - Relative: now, -24h, -2d, -30m, "2 days ago", "3 hours ago"
  - ISO 8601: "2026-03-04T10:00:00+08:00", "2026-03-04 10:00:00"`);
  }
  return d;
}
function defaultFromDate() {
  return new Date(Date.now() - 15 * 60 * 1e3);
}
function defaultToDate() {
  return /* @__PURE__ */ new Date();
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
var HEADER_FIELDS = /* @__PURE__ */ new Set([
  "_container_name_",
  "_namespace_",
  "_pod_name_"
]);
var SKIP_FIELDS = /* @__PURE__ */ new Set([
  "__source__",
  "__topic__",
  "__time__",
  "_source_",
  "_time_",
  "_container_ip_",
  "_pod_uid_",
  "_image_name_"
]);
function shouldSkip(k) {
  return SKIP_FIELDS.has(k) || k.startsWith("__tag__:");
}
function extractErrors(data) {
  if (!data.length) return "(no results)";
  const lines = [];
  for (const entry of data) {
    const time = extractTime(entry);
    const container = String(entry._container_name_ || "");
    let content = String(entry.content || entry.message || entry.log || "");
    if (!content) {
      for (const [k, v] of Object.entries(entry)) {
        if (!shouldSkip(k) && !HEADER_FIELDS.has(k) && typeof v === "string" && v.length > 50) {
          content = v;
          break;
        }
      }
    }
    if (!content) continue;
    const exceptionMatch = content.match(/([A-Za-z.]+Exception|Error):\s*([^\n]+)/);
    if (!exceptionMatch) continue;
    const exceptionType = exceptionMatch[1];
    const exceptionMsg = exceptionMatch[2];
    const stackLines = [];
    const linesInContent = content.split("\n");
    let inStack = false;
    for (const line of linesInContent) {
      if (line.includes("at ") || line.includes("Caused by:")) {
        inStack = true;
        stackLines.push(line.trim());
        if (stackLines.length >= 10) break;
      } else if (inStack && line.trim() === "") {
        break;
      }
    }
    lines.push(`${time} [${container}]`);
    lines.push(`  ${exceptionType}: ${exceptionMsg}`);
    if (stackLines.length > 0) {
      lines.push(`  Stack trace (${stackLines.length} lines):`);
      for (const stackLine of stackLines) {
        lines.push(`    ${stackLine}`);
      }
    }
    lines.push("");
  }
  return lines.length > 0 ? lines.join("\n") : "(no errors found)";
}
function summarizeData(data) {
  if (!data.length) return "(no results)";
  const summary = [];
  const errorTypes = {};
  const timestamps = [];
  const stackTraces = {};
  for (const entry of data) {
    const timeField = entry._time_ || entry.__time__;
    if (timeField) {
      const ts = typeof timeField === "number" ? timeField * 1e3 : new Date(String(timeField)).getTime();
      if (!isNaN(ts)) timestamps.push(ts);
    }
    let content = String(entry.content || entry.message || entry.log || "");
    if (!content) {
      for (const [k, v] of Object.entries(entry)) {
        if (!shouldSkip(k) && !HEADER_FIELDS.has(k) && typeof v === "string" && v.length > 50) {
          content = v;
          break;
        }
      }
    }
    if (!content) continue;
    const exceptionMatch = content.match(/([A-Za-z.]+Exception|Error):\s*([^\n]+)/);
    if (exceptionMatch) {
      const errorType = exceptionMatch[1];
      errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
      const stackMatch = content.match(/at\s+([^\n]+)/);
      if (stackMatch) {
        const stackPattern = stackMatch[1].split("(")[0].trim();
        stackTraces[stackPattern] = (stackTraces[stackPattern] || 0) + 1;
      }
    }
  }
  summary.push(`=== Summary of ${data.length} log entries ===
`);
  if (Object.keys(errorTypes).length > 0) {
    summary.push("Error types:");
    const sorted = Object.entries(errorTypes).sort((a, b) => b[1] - a[1]);
    for (const [type, count] of sorted.slice(0, 5)) {
      summary.push(`  ${type}: ${count} occurrences`);
    }
    summary.push("");
  }
  if (timestamps.length > 0) {
    const earliest = new Date(Math.min(...timestamps));
    const latest = new Date(Math.max(...timestamps));
    summary.push(`Time range:`);
    summary.push(`  First: ${formatTimeForDisplay(earliest)}`);
    summary.push(`  Last:  ${formatTimeForDisplay(latest)}`);
    summary.push("");
  }
  if (Object.keys(stackTraces).length > 0) {
    summary.push("Top stack trace patterns:");
    const sorted = Object.entries(stackTraces).sort((a, b) => b[1] - a[1]);
    for (const [pattern, count] of sorted.slice(0, 3)) {
      summary.push(`  ${pattern} (${count}x)`);
    }
    summary.push("");
  }
  summary.push("Use --full to see complete output");
  return summary.join("\n");
}
function extractTime(entry) {
  let t = entry._time_ || entry.__time__ || "";
  if (typeof t === "number") {
    const d = new Date(t * 1e3);
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
    const container = String(entry._container_name_ || "");
    const pod = String(entry._pod_name_ || "");
    const source = String(entry.__source__ || "");
    const parts = [];
    if (time) parts.push(time);
    if (container) parts.push(`[${container}]`);
    if (pod) parts.push(pod);
    else if (source) parts.push(source);
    if (parts.length) lines.push(parts.join(" "));
    for (const [k, v] of Object.entries(entry)) {
      if (shouldSkip(k) || HEADER_FIELDS.has(k)) continue;
      if (v === null || v === void 0 || v === "") continue;
      const s = String(v);
      lines.push(`  ${s}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}
function formatCsv(data, fields) {
  if (!data.length) return "(no results)";
  const cols = fields ? fields.split(",") : Object.keys(data[0]).filter((k) => !shouldSkip(k));
  const escape = (v) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = [cols.join(",")];
  for (const entry of data) {
    rows.push(cols.map((c) => escape(entry[c])).join(","));
  }
  return rows.join("\n");
}
function formatJson(data) {
  if (!data.length) return "(no results)";
  return JSON.stringify(data);
}
function cleanupOldTempFiles() {
  try {
    if (!fs.existsSync(TEMP_DIR)) return;
    const cutoff = Date.now() - 24 * 60 * 60 * 1e3;
    for (const f of fs.readdirSync(TEMP_DIR)) {
      const fp = path.join(TEMP_DIR, f);
      try {
        const stat = fs.statSync(fp);
        if (stat.mtimeMs < cutoff) fs.unlinkSync(fp);
      } catch {
      }
    }
  } catch {
  }
}
function outputWithTokenOptimization(output) {
  if (output.length <= AUTO_TEMP_THRESHOLD) {
    console.log(output);
    return;
  }
  cleanupOldTempFiles();
  fs.mkdirSync(TEMP_DIR, { recursive: true });
  const timestamp = Date.now();
  const tempFile = path.join(TEMP_DIR, `sls-${timestamp}.txt`);
  fs.writeFileSync(tempFile, output, "utf-8");
  const lineCount = output.split("\n").length;
  console.log(`[Output too large for inline display (${output.length} chars, ${lineCount} lines)]`);
  console.log(`Written to: ${tempFile}`);
  console.log(`Use Read tool with offset/limit to inspect portions of this file, or rerun with --full for inline raw output.`);
}
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
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
  if (fs.existsSync(CONFIG_PATH)) {
    const overwrite = await prompt(`Config already exists at ${CONFIG_PATH}. Overwrite? (y/N): `);
    if (overwrite.toLowerCase() !== "y") {
      console.log("Setup cancelled.");
      return;
    }
  }
  console.log("\n1. Enter your Aliyun credentials:");
  const accessKeyId = await prompt("   AccessKey ID: ");
  const accessKeySecret = await prompt("   AccessKey Secret: ");
  const endpoint = await prompt("   Endpoint (default: cn-hangzhou.log.aliyuncs.com): ") || "cn-hangzhou.log.aliyuncs.com";
  const config = {
    credentials: {
      accessKeyId,
      accessKeySecret,
      endpoint
    },
    default_project: "",
    environments: {},
    aliases: {}
  };
  console.log("\n2. Testing connection...");
  try {
    const client = createClient(config);
    await client.listProject();
    console.log("   \u2713 Connection successful!");
  } catch (err) {
    console.log(`   \u2717 Connection failed: ${err.message}`);
    const continueAnyway = await prompt("   Continue anyway? (y/N): ");
    if (continueAnyway.toLowerCase() !== "y") {
      console.log("Setup cancelled.");
      return;
    }
  }
  console.log("\n3. Set default project (optional):");
  const defaultProject = await prompt("   Default project name (leave empty to skip): ");
  if (defaultProject) {
    config.default_project = defaultProject;
  }
  const configDir = path.dirname(CONFIG_PATH);
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");
  console.log(`
\u2713 Configuration saved to: ${CONFIG_PATH}`);
  console.log("\nNext steps:");
  console.log("  - Run 'node aliyunlog.mjs --test' to verify setup");
  console.log("  - Run 'node aliyunlog.mjs --list-logstores <project>' to explore logstores");
  console.log("  - Edit the config file to add environment aliases and service mappings");
}
function cmdInit() {
  if (fs.existsSync(CONFIG_PATH)) {
    console.log(`Config already exists: ${CONFIG_PATH}`);
    return;
  }
  const template = {
    credentials: {
      accessKeyId: "<your-access-key-id>",
      accessKeySecret: "<your-access-key-secret>",
      endpoint: "cn-hangzhou.log.aliyuncs.com"
    },
    default_project: "",
    environments: {},
    aliases: {}
  };
  const configDir = path.dirname(CONFIG_PATH);
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(template, null, 2) + "\n");
  console.log(`Created: ${CONFIG_PATH}`);
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
  node aliyunlog.mjs [query-options]               Query logs (recommended with --service + --project)
  node aliyunlog.mjs <env> <service> [options]     Query logs by environment and service (legacy positional mode)
  node aliyunlog.mjs --init                         Create config template
  node aliyunlog.mjs --setup                        Interactive setup wizard
  node aliyunlog.mjs --find-service=<name> [--project=<p>]  Find which logstore a service belongs to
  node aliyunlog.mjs --list-services=<logstore> [--project=<p>]  List services in a logstore
  node aliyunlog.mjs --list-logstores <project|env> List logstores in a project
  node aliyunlog.mjs --list-aliases                 Show configured aliases
  node aliyunlog.mjs --test                         Test SDK connection
  node aliyunlog.mjs --more                         Fetch next page (requires saved context)
  node aliyunlog.mjs --full                         Re-run last query without summarization
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
  --limit=<n>                  Max entries (default: 5)
  --format=compact|csv|json    Output format (default: compact)
  --extract-errors             Extract only exception types and stack traces
  --full                       Skip summarization and force raw inline output
  --summary                    Enable smart summary for large compact output
  --auto-broaden               Auto-retry with relaxed filters if 0 results
  --save-context               Save query context (legacy; now default behavior)
  --no-context                 Disable auto-saving query context
  --project=<name>             Override project
  --logstore=<name>            Override logstore
  --fields=<f1,f2,...>         Extract specific fields (CSV output)
  --count                      Rewrite query to COUNT(*)
  --oldest                     Show oldest entries first (default: newest first)`);
}
function relaxQuery(query, level) {
  if (level === 1) {
    const serviceMatch = query.match(/_container_name_:[^\s]+/);
    const exceptionMatch = query.match(/\b([A-Za-z]+Exception|Error)\b/);
    if (serviceMatch && exceptionMatch) {
      return `${serviceMatch[0]} and ${exceptionMatch[0]}`;
    } else if (serviceMatch) {
      return `${serviceMatch[0]} and (ERROR or Exception)`;
    }
  }
  if (level === 2) {
    const serviceMatch = query.match(/_container_name_:[^\s]+/);
    if (serviceMatch) {
      return `${serviceMatch[0]} and (ERROR or WARN or Exception)`;
    }
  }
  if (level === 3) {
    const serviceMatch = query.match(/_container_name_:[^\s]+/);
    if (serviceMatch) {
      return serviceMatch[0];
    }
  }
  return null;
}
async function progressiveSearch(client, project, logstore, fromDate, toDate, query, limit, reverse, startOffset = 0) {
  let currentQuery = query;
  let level = 0;
  const maxLevels = 3;
  while (level <= maxLevels) {
    if (level > 0) {
      info(`Try ${level + 1}: Broadening search...`);
    }
    const results = await getLogs(client, project, logstore, fromDate, toDate, currentQuery, limit, reverse, startOffset);
    if (results && results.length > 0) {
      if (level > 0) {
        info(`\u2713 Found ${results.length} results with relaxed query: ${currentQuery}`);
      }
      return { results, finalQuery: currentQuery, level };
    }
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
async function getLogs(client, project, logstore, from, to, query, limit, reverse, startOffset = 0) {
  const MAX_PER_CALL = 100;
  const allResults = [];
  let offset = Math.max(0, Number(startOffset) || 0);
  while (allResults.length < limit) {
    const batchSize = Math.min(MAX_PER_CALL, limit - allResults.length);
    const results = await client.getLogs(project, logstore, from, to, {
      query,
      line: batchSize,
      offset,
      reverse
    });
    if (!results || !Array.isArray(results) || results.length === 0) break;
    allResults.push(...results);
    offset += results.length;
    if (results.length < batchSize) break;
  }
  return allResults;
}
async function main() {
  const { opts, positional } = parseArgs(process.argv.slice(2));
  if (opts.init) return cmdInit();
  if (opts.help || opts.h) return cmdHelp();
  if (opts.setup) return await cmdSetup();
  if (opts["clear-context"]) {
    clearContext();
    console.log("Context cleared");
    return;
  }
  let config;
  try {
    config = await requireConfig("aliyunlog");
  } catch (e) {
    if (e instanceof PluginError && e.code === "CONFIG_MISSING") {
      die(`No config found. Run with --init to create ${CONFIG_PATH}`);
    }
    throw e;
  }
  if (opts["list-aliases"]) return cmdListAliases(config);
  if (opts["list-logstores"]) {
    const project2 = resolveProjectName(config, positional[0]);
    return cmdListLogstores(config, project2);
  }
  if (opts.test) return cmdTest(config);
  if (opts["find-service"]) {
    const serviceName2 = typeof opts["find-service"] === "string" ? opts["find-service"] : positional[0];
    const project2 = typeof opts.project === "string" ? opts.project : resolveProjectName(config, positional[0]) || "";
    return cmdFindService(config, project2, serviceName2);
  }
  if (opts["list-services"]) {
    const logstoreName = typeof opts["list-services"] === "string" ? opts["list-services"] : positional[0];
    const project2 = typeof opts.project === "string" ? opts.project : config.default_project || "";
    return cmdListServices(config, project2, logstoreName);
  }
  let contextOverride = null;
  const standaloneFullOutput = opts.full && !opts.project && !opts.service && !opts.logstore && positional.length === 0;
  if (opts.more || opts.refine || standaloneFullOutput) {
    const prevContext = loadContext();
    if (!prevContext) {
      if (standaloneFullOutput) {
        die("No previous context found for standalone --full. Run a query first (context is auto-saved), or rerun the original query with --full.");
      }
      die("No previous context found. Run a query first (context is auto-saved unless --no-context is used).");
    }
    if (opts.more) {
      info("Loading previous query context for next page...");
      contextOverride = {
        ...prevContext,
        offset: (Number(prevContext.offset) || 0) + (Number(prevContext.limit) || 1)
      };
    } else if (standaloneFullOutput) {
      info("Loading previous query context with full output...");
      contextOverride = { ...prevContext };
    } else if (opts.refine) {
      info(`Refining previous query: ${prevContext.query}`);
      const refinement = opts.refine;
      contextOverride = { ...prevContext, query: `${prevContext.query} and ${refinement}` };
    }
  }
  let project = contextOverride?.project || (typeof opts.project === "string" ? opts.project : "") || "";
  let logstore = contextOverride?.logstore || (typeof opts.logstore === "string" ? opts.logstore : "") || "";
  let serviceName = "";
  if (opts.service && !logstore) {
    serviceName = String(opts.service);
    project = project || config.default_project || "";
    if (!project) die("--service requires a project. Use --project or set default_project in config.");
    const cache = loadMappingsCache();
    const projectCache = cache[project] || {};
    if (projectCache[serviceName]) {
      logstore = projectCache[serviceName];
      info(`Using cached mapping: ${serviceName} -> ${logstore}`);
    } else {
      validateCredentials(config);
      const tempClient = createClient(config);
      const candidates = await discoverServiceLocation(tempClient, project, serviceName);
      if (candidates.length === 0) {
        const fastCandidates = await discoverServiceFast(tempClient, project, serviceName);
        if (fastCandidates.length > 0) {
          logstore = fastCandidates[0].logstore;
          info(`Fast-discovered: ${serviceName} -> ${logstore}`);
          if (!cache[project]) cache[project] = {};
          cache[project][serviceName] = logstore;
          saveMappingsCache(cache);
        } else {
          die(`Service "${serviceName}" not found in any logstore in project "${project}".
Try: node ${__filename} --list-services=<logstore> --project=${project}`);
        }
      } else if (candidates.length === 1) {
        logstore = candidates[0];
        info(`Discovered: ${serviceName} -> ${logstore}`);
        if (!cache[project]) cache[project] = {};
        cache[project][serviceName] = logstore;
        saveMappingsCache(cache);
      } else {
        console.log(`Service "${serviceName}" found in multiple logstores:`);
        for (let i = 0; i < candidates.length; i++) {
          console.log(`  ${i + 1}. ${candidates[i]}`);
        }
        die(`Please specify logstore with --logstore or update your config with an explicit alias.`);
      }
    }
  } else if (opts.service && logstore) {
    serviceName = String(opts.service);
  } else if (project && logstore) {
  } else if (positional.length >= 2) {
    const resolved = resolveAlias(config, positional[0], positional[1]);
    if (!project) project = resolved.project;
    if (!logstore) logstore = resolved.logstore;
    serviceName = positional[1];
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
  validateCredentials(config);
  const client = createClient(config);
  let query = contextOverride?.query || (typeof opts.query === "string" ? opts.query : "") || "*";
  if (opts.template) {
    if (!serviceName) {
      die("--template requires service name. Usage: node aliyunlog.mjs <env> <service> --template=<name>");
    }
    const keyword = typeof opts.keyword === "string" ? opts.keyword : "";
    query = expandTemplate(String(opts.template), serviceName, keyword);
    info(`Template expanded: ${query}`);
  }
  const fromDate = opts.from ? parseTime(String(opts.from)) : contextOverride?.from ? new Date(contextOverride.from) : defaultFromDate();
  const toDate = opts.to ? parseTime(String(opts.to)) : contextOverride?.to ? new Date(contextOverride.to) : defaultToDate();
  const limit = Number(opts.limit || contextOverride?.limit || "5");
  if (isNaN(limit) || limit <= 0) die(`Invalid --limit value: "${opts.limit}". Must be a positive integer.`);
  const format = (typeof opts.format === "string" ? opts.format : null) || contextOverride?.format || "compact";
  const fields = typeof opts.fields === "string" ? opts.fields : "";
  const count = opts.count || false;
  const extractErrorsMode = opts["extract-errors"] || false;
  const fullOutput = opts.full || false;
  const summaryMode = opts.summary || false;
  const autoBroaden = opts["auto-broaden"] || false;
  const persistContext = !opts["no-context"];
  const reverse = opts.oldest ? false : contextOverride?.reverse !== void 0 ? Boolean(contextOverride.reverse) : true;
  const startOffset = Math.max(0, Number(contextOverride?.offset) || 0);
  if (count) {
    if (query.includes("|")) {
      info("--count ignored: query already contains analysis statement");
    } else {
      query = `${query} | SELECT COUNT(*) as total`;
    }
  }
  try {
    let data;
    let finalQuery = query;
    let searchLevel = 0;
    if (autoBroaden) {
      const result = await progressiveSearch(client, project, logstore, fromDate, toDate, query, limit, reverse, startOffset);
      data = result.results;
      finalQuery = result.finalQuery;
      searchLevel = result.level;
    } else {
      data = await getLogs(client, project, logstore, fromDate, toDate, query, limit, reverse, startOffset);
    }
    const n = data ? data.length : 0;
    const order = reverse ? "newest" : "oldest";
    const limitInfo = count ? "count mode" : `limit=${limit}, offset=${startOffset}`;
    const queryDisplay = finalQuery === "*" ? "*" : finalQuery;
    info(`${project}/${logstore} | ${n} results | ${queryDisplay} | ${formatTimeForDisplay(fromDate)} ~ ${formatTimeForDisplay(toDate)} | ${limitInfo} | ${order} first`);
    const contextPayload = {
      project,
      logstore,
      query: finalQuery,
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      limit,
      format,
      offset: startOffset,
      reverse
    };
    if (n === 0) {
      if (persistContext) {
        saveContext(contextPayload);
      }
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
    const canSummarize = summaryMode && !fullOutput && !extractErrorsMode && format === "compact" && !fields;
    if (canSummarize && output.split("\n").length > 50) {
      const summary = summarizeData(data);
      console.log(summary);
      if (persistContext) {
        saveContext(contextPayload);
        info("Context saved. Use --more for next page or --refine to add filters.");
      }
      return;
    }
    if (fullOutput) {
      console.log(output);
    } else {
      outputWithTokenOptimization(output);
    }
    if (persistContext) {
      saveContext(contextPayload);
      info("Context saved. Use --more for next page or --refine to add filters.");
    }
  } catch (err) {
    const msg = err.message || String(err);
    if (msg.includes("does not exist") || msg.includes("LogStoreNotExist") || msg.includes("ProjectNotExist")) {
      process.stderr.write(`ERROR: ${msg}
`);
      if (serviceName) {
        process.stderr.write(`
Hint: The logstore "${logstore}" does not exist. Discover the correct one:
`);
        process.stderr.write(`  node ${__filename} --find-service=${serviceName} --project=${project}
`);
      } else {
        process.stderr.write(`
Hint: List available logstores:
`);
        process.stderr.write(`  node ${__filename} --list-logstores ${project}
`);
      }
      process.stderr.write(`  node ${__filename} --list-services=<logstore> --project=${project}
`);
      process.exit(1);
    }
    die(`Query failed: ${msg}`);
  }
}
main();
