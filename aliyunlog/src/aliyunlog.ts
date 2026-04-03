#!/usr/bin/env node
//
// aliyunlog.ts - Alibaba Cloud SLS log query via @alicloud/log SDK
//
// Simplifies SLS log querying by resolving environment/service aliases
// to project/logstore via a configuration file.
//
// Usage:
//   node aliyunlog.mjs query [env] [service] [options]
//   node aliyunlog.mjs list-logstores <project|env>
//   node aliyunlog.mjs list-aliases
//   node aliyunlog.mjs find-service <name> [--project <p>]
//   node aliyunlog.mjs list-services <logstore> [--project <p>]
//   node aliyunlog.mjs test
//   node aliyunlog.mjs init
//   node aliyunlog.mjs setup
//   node aliyunlog.mjs --help
//
// Options:
//   --query=<sls_query>      SLS query string (default: "*")
//   --from=<time>            Start time (omit = auto last 15 min)
//                            Formats: now, -24h, -2d, "2 days ago"
//                            ISO 8601: "2026-03-04T10:00:00+08:00"
//   --to=<time>              End time (omit = now)
//                            Same formats as --from
//   --limit=<n>              Max log entries (default: 5)
//   --format=<fmt>           Output format: compact|csv|json (default: compact)
//   --project=<name>         Override project (skip alias resolution)
//   --logstore=<name>        Override logstore (skip alias resolution)
//   --fields=<f1,f2,...>     Extract specific fields from results
//   --count                  Shorthand: rewrite query to COUNT(*)
//   --oldest                 Show oldest entries first (default: newest first)
//   --summary                Enable smart summary for large compact output
//   --no-context             Disable auto-saving query context
//

import fs from 'fs';
import path from 'path';
import os from 'os';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { Command } from 'commander';
import { requireConfig, requireConfigWithSetup, configPath, PluginError } from '@apex/core';
import type { ConfigUIOptions } from '@apex/core';

// Type declarations are in alicloud-log.d.ts
import ALY from '@alicloud/log';

// Convenience alias for use in function signatures
type ALYClient = InstanceType<typeof ALY>;

// __filename and __dirname are provided by the esbuild banner shim

// ── Constants ────────────────────────────────────────────────────────────────

const CONFIG_PATH = configPath('aliyunlog');
const MAPPINGS_CACHE_PATH = path.join(os.homedir(), '.cache', 'apex-plugin', 'aliyunlog-mappings.json');
const CONTEXT_PATH = path.join(os.homedir(), '.cache', 'apex-plugin', 'aliyunlog-context.json');
const TEMP_DIR = path.join(os.tmpdir(), 'claude-sls');
const AUTO_TEMP_THRESHOLD = 2000; // chars

// ── Types ─────────────────────────────────────────────────────────────────────

interface AliyunLogConfig extends Record<string, unknown> {
  credentials: {
    accessKeyId: string;
    accessKeySecret: string;
    endpoint: string;
  };
  default_project?: string;
  environments?: Record<string, EnvConfig>;
  aliases?: Record<string, AliasConfig>;
}

interface EnvConfig {
  project?: string;
  logstore_pattern?: string;
}

interface AliasConfig {
  project?: string;
  logstore?: string;
}

interface QueryContext {
  project: string;
  logstore: string;
  query: string;
  from: string;
  to: string;
  limit: number;
  format: string;
  offset: number;
  reverse: boolean;
}

interface MappingsCache {
  [project: string]: {
    [service: string]: string;
  };
}

interface ServiceCandidate {
  logstore: string;
  count: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function die(msg: string): never {
  process.stderr.write(`ERROR: ${msg}\n`);
  process.exit(1);
}

function info(msg: string): void {
  process.stderr.write(`[SLS] ${msg}\n`);
}

// ── SDK Loader ───────────────────────────────────────────────────────────────

function createClient(config: AliyunLogConfig, timeout?: number): ALYClient {
  return new ALY({
    accessKeyId: config.credentials.accessKeyId,
    accessKeySecret: config.credentials.accessKeySecret,
    endpoint: config.credentials.endpoint,
    ...(timeout ? { timeout } : { timeout: 10000 }),
  });
}

// ── Configuration ────────────────────────────────────────────────────────────

const ALIYUNLOG_CONFIG_UI: ConfigUIOptions = {
  spec: {
    root: 'page',
    elements: {
      'page': {
        type: 'Header',
        props: { title: { en: 'Aliyun SLS Log Service', zh: '阿里云日志服务 SLS' }, description: { en: 'Configure your Alibaba Cloud SLS credentials', zh: '配置阿里云日志服务凭证' }, configPath: null },
        children: ['credentials', 'settings', 'environments', 'save'],
      },
      'credentials': {
        type: 'Section',
        props: { title: { en: 'Credentials', zh: '凭证' }, description: null, collapsible: false, defaultOpen: true },
        children: ['cred-accessKeyId', 'cred-accessKeySecret', 'cred-endpoint'],
      },
      'cred-accessKeyId': {
        type: 'Field',
        props: { label: { en: 'AccessKey ID', zh: 'AccessKey ID' }, type: 'text', required: true, help: null, placeholder: null, options: null, statePath: '/credentials/accessKeyId' },
      },
      'cred-accessKeySecret': {
        type: 'Field',
        props: { label: { en: 'AccessKey Secret', zh: 'AccessKey Secret' }, type: 'password', required: true, help: null, placeholder: null, options: null, statePath: '/credentials/accessKeySecret' },
      },
      'cred-endpoint': {
        type: 'Field',
        props: { label: { en: 'Endpoint', zh: '服务入口' }, type: 'text', required: true, help: { en: 'e.g. cn-hangzhou.log.aliyuncs.com', zh: '例如 cn-hangzhou.log.aliyuncs.com' }, placeholder: null, options: null, statePath: '/credentials/endpoint' },
      },
      'settings': {
        type: 'Section',
        props: { title: { en: 'Settings', zh: '设置' }, description: null, collapsible: true, defaultOpen: false },
        children: ['setting-default-project'],
      },
      'setting-default-project': {
        type: 'Field',
        props: { label: { en: 'Default Project', zh: '默认项目' }, type: 'text', required: false, help: null, placeholder: { en: 'e.g. robot-k8s-dev', zh: '例如 robot-k8s-dev' }, options: null, statePath: '/default_project' },
      },
      'environments': {
        type: 'Collection',
        props: { title: { en: 'Environments', zh: '环境' }, itemLabel: { en: 'Environment', zh: '环境' }, statePath: '/environments', nameEditable: true },
        children: ['env-project', 'env-endpoint'],
      },
      'env-project': {
        type: 'Field',
        props: { label: { en: 'SLS Project', zh: 'SLS 项目' }, type: 'text', required: false, help: null, placeholder: null, options: null, statePath: 'project' },
      },
      'env-endpoint': {
        type: 'Field',
        props: { label: { en: 'Endpoint Override', zh: '服务入口（覆盖）' }, type: 'text', required: false, help: { en: 'Leave empty to use default endpoint', zh: '留空则使用默认服务入口' }, placeholder: null, options: null, statePath: 'endpoint' },
      },
      'save': {
        type: 'SaveBar',
        props: { saveLabel: null, resetLabel: null },
      },
    },
    state: {
      credentials: { accessKeyId: '', accessKeySecret: '', endpoint: 'cn-hangzhou.log.aliyuncs.com' },
      default_project: '',
      environments: [],
    },
  },
  collections: [{ statePath: '/environments' }],
  validate: (config: Record<string, unknown>): boolean => {
    const c = (config as AliyunLogConfig).credentials;
    return !c
      || !c.accessKeyId || c.accessKeyId.includes('<')
      || !c.accessKeySecret || c.accessKeySecret.includes('<')
      || !c.endpoint;
  },
};

function validateCredentials(config: AliyunLogConfig): void {
  if (!ALIYUNLOG_CONFIG_UI.validate!(config as Record<string, unknown>)) return;
  // If we get here, credentials are invalid — loadConfig should have already
  // auto-launched config UI, so this is a fallback for direct callers.
  const c = config.credentials;
  if (!c) die(`Missing 'credentials' section in config. Run: aliyunlog setup`);
  if (!c.accessKeyId || c.accessKeyId.includes('<'))
    die(`Invalid accessKeyId in config. Run: aliyunlog setup`);
  if (!c.accessKeySecret || c.accessKeySecret.includes('<'))
    die(`Invalid accessKeySecret in config. Run: aliyunlog setup`);
  if (!c.endpoint)
    die(`Missing endpoint in config. Run: aliyunlog setup`);
}

// ── Session Context Preservation ─────────────────────────────────────────────

function loadContext(): QueryContext | null {
  try {
    if (fs.existsSync(CONTEXT_PATH)) {
      return JSON.parse(fs.readFileSync(CONTEXT_PATH, 'utf-8')) as QueryContext;
    }
  } catch (e) {
    info(`Warning: Failed to load context: ${(e as Error).message}`);
  }
  return null;
}

function saveContext(context: QueryContext): void {
  try {
    const dir = path.dirname(CONTEXT_PATH);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONTEXT_PATH, JSON.stringify(context, null, 2));
  } catch (e) {
    info(`Warning: Failed to save context: ${(e as Error).message}`);
  }
}

function clearContext(): void {
  try {
    if (fs.existsSync(CONTEXT_PATH)) {
      fs.unlinkSync(CONTEXT_PATH);
    }
  } catch (e) {
    info(`Warning: Failed to clear context: ${(e as Error).message}`);
  }
}

// ── Service Discovery & Mapping Cache ────────────────────────────────────────

function loadMappingsCache(): MappingsCache {
  try {
    if (fs.existsSync(MAPPINGS_CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(MAPPINGS_CACHE_PATH, 'utf-8')) as MappingsCache;
    }
  } catch (e) {
    info(`Warning: Failed to load mappings cache: ${(e as Error).message}`);
  }
  return {};
}

function saveMappingsCache(cache: MappingsCache): void {
  try {
    const dir = path.dirname(MAPPINGS_CACHE_PATH);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(MAPPINGS_CACHE_PATH, JSON.stringify(cache, null, 2));
  } catch (e) {
    info(`Warning: Failed to save mappings cache: ${(e as Error).message}`);
  }
}

async function discoverServiceLocation(client: ALYClient, project: string, serviceName: string): Promise<string[]> {
  info(`Discovering logstore for service: ${serviceName} in project: ${project}`);

  try {
    // Get all logstores in the project
    const result = await client.listLogStore(project);
    const logstores = result.logstores || [];

    const candidates: string[] = [];

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
            const containerName = String(entry._container_name_ || '');
            if (containerName === serviceName || containerName.includes(serviceName)) {
              candidates.push(logstore);
              break;
            }
          }
        }
      } catch {
        // Skip logstores that fail (might be empty or have access issues)
        continue;
      }
    }

    return candidates;
  } catch (err) {
    die(`Failed to discover service location: ${(err as Error).message}`);
  }
}

// ── Fast Service Discovery ───────────────────────────────────────────────────

async function discoverServiceFast(client: ALYClient, project: string, serviceName: string): Promise<ServiceCandidate[]> {
  // Fast discovery: only scan "saas"-like logstores (the common shared ones)
  // rather than all 47+ logstores
  const result = await client.listLogStore(project);
  const allLogstores = result.logstores || [];

  // Prioritize logstores likely to contain application services
  const priority = allLogstores.filter((ls) =>
    ls.includes('saas') || ls.includes('base') || ls.includes('imes') ||
    ls.includes('cps') || ls.includes('feelinker') || ls.includes('trend')
  );
  const rest = allLogstores.filter((ls) => !priority.includes(ls));

  const candidates: ServiceCandidate[] = [];
  const fromDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2h lookback
  const toDate = new Date();

  // Search priority logstores first
  for (const logstore of [...priority, ...rest]) {
    try {
      const query = `_container_name_:${serviceName} | SELECT COUNT(*) as c`;
      const logs = await client.getLogs(project, logstore, fromDate, toDate, {
        query,
        line: 1,
        offset: 0,
      });
      if (logs && Array.isArray(logs) && logs.length > 0) {
        const count = parseInt(String(logs[0].c || '0'), 10);
        if (count > 0) {
          candidates.push({ logstore, count });
        }
      }
    } catch {
      continue;
    }

    // Short-circuit: if found in a priority logstore, that's usually sufficient
    if (candidates.length > 0 && priority.includes(candidates[0].logstore)) {
      break;
    }
  }

  return candidates;
}

async function cmdFindService(config: AliyunLogConfig, project: string, serviceName: string): Promise<void> {
  if (!serviceName) die('Usage: find-service <service_name>');
  validateCredentials(config);

  project = project || config.default_project || '';
  if (!project) die('No project specified. Use --project=<name> or set default_project in config.');

  const client = createClient(config);

  info(`Searching for service "${serviceName}" across logstores in ${project}...`);
  const candidates = await discoverServiceFast(client, project, serviceName);

  if (candidates.length === 0) {
    console.error(`Service "${serviceName}" not found in any logstore in project "${project}" (last 2h).`);
    console.error(`\nAvailable logstores:`);
    const result = await client.listLogStore(project);
    const appLogstores = (result.logstores || []).filter(
      (ls) => !ls.startsWith('alb-') && !ls.startsWith('apiserver-') &&
              !ls.startsWith('audit-') && !ls.startsWith('ccm-') &&
              !ls.startsWith('kcm-') && !ls.startsWith('scheduler-') &&
              !ls.startsWith('controlplane-') && !ls.startsWith('security-')
    );
    for (const ls of appLogstores.sort()) {
      console.error(`  ${ls}`);
    }
    process.exit(1);
  }

  for (const { logstore, count } of candidates) {
    console.log(`${logstore} (${count} logs in last 2h)`);
  }

  // Auto-cache the mapping
  const cache = loadMappingsCache();
  if (!cache[project]) cache[project] = {};
  for (const { logstore } of candidates) {
    cache[project][serviceName] = logstore;
  }
  saveMappingsCache(cache);
  info(`Cached: ${serviceName} -> ${candidates[0].logstore}`);
  info(`Query example: node aliyunlog.mjs --service=${serviceName} --project=${project} --query="ERROR" --from=-1h`);
}

async function cmdListServices(config: AliyunLogConfig, project: string, logstoreName: string): Promise<void> {
  if (!logstoreName) die('Usage: list-services <logstore> [--project <name>]');
  validateCredentials(config);

  project = project || config.default_project || '';
  if (!project) die('No project specified. Use --project=<name> or set default_project in config.');

  const client = createClient(config);
  const fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const toDate = new Date();

  try {
    const query = `* | SELECT DISTINCT _container_name_ ORDER BY _container_name_ LIMIT 200`;
    const logs = await client.getLogs(project, logstoreName, fromDate, toDate, {
      query,
      line: 200,
      offset: 0,
    });

    if (!logs || logs.length === 0) {
      console.log(`(no services found in ${logstoreName} in the last 24h)`);
      return;
    }

    console.log(`Services in ${project}/${logstoreName}:`);
    const services = logs
      .map((e) => String(e._container_name_ || ''))
      .filter(Boolean)
      .sort();
    for (const svc of services) {
      console.log(`  ${svc}`);
    }
    info(`${services.length} services found`);
  } catch (err) {
    die(`Failed to list services: ${(err as Error).message}`);
  }
}

// ── Query Templates ──────────────────────────────────────────────────────────

const QUERY_TEMPLATES: Record<string, (service: string, keyword?: string) => string> = {
  'error-by-service': (service) =>
    `_container_name_:${service} and (ERROR or Exception)`,
  'npe': (service, keyword) =>
    keyword
      ? `_container_name_:${service} and NullPointerException and ${keyword}`
      : `_container_name_:${service} and NullPointerException`,
  'recent-errors': (service) =>
    `_container_name_:${service} and (ERROR or WARN or Exception)`,
  'fatal': (service) =>
    `_container_name_:${service} and (FATAL or "Fatal error")`,
  'timeout': (service) =>
    `_container_name_:${service} and (timeout or "timed out" or TimeoutException)`,
  'oom': (service) =>
    `_container_name_:${service} and (OutOfMemoryError or "out of memory")`,
};

const LOGSTORE_TEMPLATES: Record<string, (keyword?: string) => string> = {
  'recent-errors': () => 'ERROR or WARN or Exception',
  'error-by-service': () => 'ERROR or Exception',
  'fatal': () => 'FATAL or "Fatal error"',
  'timeout': () => 'timeout or "timed out" or TimeoutException',
  'oom': () => 'OutOfMemoryError or "out of memory"',
  'npe': (keyword) => keyword
    ? `NullPointerException and ${keyword}`
    : 'NullPointerException',
};

function expandTemplate(templateName: string, service: string, keyword?: string): string {
  const template = QUERY_TEMPLATES[templateName];
  if (!template) {
    die(`Unknown template: ${templateName}\nAvailable templates: ${Object.keys(QUERY_TEMPLATES).join(', ')}`);
  }
  return template(service, keyword);
}

// ── Alias Resolution ─────────────────────────────────────────────────────────

function resolveAlias(config: AliyunLogConfig, env: string, service: string): { project: string; logstore: string } {
  const envConfig = (config.environments || {})[env];

  // 1) Exact alias match
  const key = `${env}/${service}`;
  const aliases = config.aliases || {};
  if (aliases[key]) {
    const project =
      aliases[key].project ||
      (envConfig && envConfig.project) ||
      config.default_project ||
      '';
    return { project, logstore: aliases[key].logstore || '' };
  }

  // 2) Environment pattern
  if (envConfig) {
    const project = envConfig.project || config.default_project || '';
    const pattern = envConfig.logstore_pattern || '{service}';
    return { project, logstore: pattern.replace('{service}', service) };
  }

  // 3) Fallback
  return {
    project: config.default_project || '',
    logstore: env ? `${env}-${service}` : service,
  };
}

// ── Resolve env name to project name ─────────────────────────────────────────

function resolveProjectName(config: AliyunLogConfig, nameOrEnv: string): string {
  if (!nameOrEnv) return '';
  const envConfig = (config.environments || {})[nameOrEnv];
  if (envConfig) return envConfig.project || config.default_project || nameOrEnv;
  return nameOrEnv;
}

// ── Time helpers ─────────────────────────────────────────────────────────────

function parseRelativeTime(str: string): Date | null {
  const now = Date.now();

  // Handle "now"
  if (str === 'now') return new Date(now);

  // Handle "-24h", "-2d", "-30m" format
  const shortMatch = str.match(/^-(\d+)([smhd])$/);
  if (shortMatch) {
    const value = parseInt(shortMatch[1], 10);
    const unit = shortMatch[2];
    const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return new Date(now - value * multipliers[unit]);
  }

  // Handle "2 days ago", "3 hours ago" format
  const longMatch = str.match(/^(\d+)\s+(second|minute|hour|day|week)s?\s+ago$/i);
  if (longMatch) {
    const value = parseInt(longMatch[1], 10);
    const unit = longMatch[2].toLowerCase();
    const multipliers: Record<string, number> = {
      second: 1000,
      minute: 60000,
      hour: 3600000,
      day: 86400000,
      week: 604800000,
    };
    return new Date(now - value * multipliers[unit]);
  }

  return null;
}

function parseTime(str: string): Date {
  if (!str) return new Date();

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

function defaultFromDate(): Date {
  return new Date(Date.now() - 15 * 60 * 1000);
}

function defaultToDate(): Date {
  return new Date();
}

function formatTimeForDisplay(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
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
  '_container_name_',
  '_namespace_',
  '_pod_name_',
]);

const SKIP_FIELDS = new Set([
  '__source__',
  '__topic__',
  '__time__',
  '_source_',
  '_time_',
  '_container_ip_',
  '_pod_uid_',
  '_image_name_',
]);

function shouldSkip(k: string): boolean {
  return SKIP_FIELDS.has(k) || k.startsWith('__tag__:');
}

function extractErrors(data: Array<Record<string, string | number>>): string {
  if (!data.length) return '(no results)';

  const lines: string[] = [];
  for (const entry of data) {
    const time = extractTime(entry);
    const container = String(entry._container_name_ || '');

    // Find the content field (usually 'content' or 'message')
    let content = String(entry.content || entry.message || entry.log || '');
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
    const stackLines: string[] = [];
    const linesInContent = content.split('\n');
    let inStack = false;
    for (const line of linesInContent) {
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

  return lines.length > 0 ? lines.join('\n') : '(no errors found)';
}

function summarizeData(data: Array<Record<string, string | number>>): string {
  if (!data.length) return '(no results)';

  const summary: string[] = [];
  const errorTypes: Record<string, number> = {};
  const timestamps: number[] = [];
  const stackTraces: Record<string, number> = {};

  // Analyze data
  for (const entry of data) {
    // Extract timestamp
    const timeField = entry._time_ || entry.__time__;
    if (timeField) {
      const ts = typeof timeField === 'number' ? timeField * 1000 : new Date(String(timeField)).getTime();
      if (!isNaN(ts)) timestamps.push(ts);
    }

    // Find content field
    let content = String(entry.content || entry.message || entry.log || '');
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
    summary.push('Error types:');
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
    summary.push('Top stack trace patterns:');
    const sorted = Object.entries(stackTraces).sort((a, b) => b[1] - a[1]);
    for (const [pattern, count] of sorted.slice(0, 3)) {
      summary.push(`  ${pattern} (${count}x)`);
    }
    summary.push('');
  }

  summary.push('Use --full to see complete output');

  return summary.join('\n');
}

function extractTime(entry: Record<string, string | number>): string {
  let t: string | number = entry._time_ || entry.__time__ || '';
  if (typeof t === 'number') {
    const d = new Date(t * 1000);
    return formatTimeForDisplay(d).split(' ')[1];
  }
  if (t.includes('T')) {
    t = t.split('T')[1];
    if (t.includes('.')) t = t.slice(0, t.indexOf('.'));
    else if (t.includes('+')) t = t.split('+')[0];
    else if (t.includes('-')) t = t.split('-')[0];
  }
  return t;
}

function formatCompact(data: Array<Record<string, string | number>>): string {
  if (!data.length) return '(no results)';
  const lines: string[] = [];
  for (const entry of data) {
    const time = extractTime(entry);
    const container = String(entry._container_name_ || '');
    const pod = String(entry._pod_name_ || '');
    const source = String(entry.__source__ || '');

    const parts: string[] = [];
    if (time) parts.push(time);
    if (container) parts.push(`[${container}]`);
    if (pod) parts.push(pod);
    else if (source) parts.push(source);
    if (parts.length) lines.push(parts.join(' '));

    for (const [k, v] of Object.entries(entry)) {
      if (shouldSkip(k) || HEADER_FIELDS.has(k)) continue;
      if (v === null || v === undefined || v === '') continue;
      const s = String(v);
      lines.push(`  ${s}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function formatCsv(data: Array<Record<string, string | number>>, fields?: string): string {
  if (!data.length) return '(no results)';
  const cols = fields
    ? fields.split(',')
    : Object.keys(data[0]).filter((k) => !shouldSkip(k));
  const escape = (v: string | number | undefined) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const rows = [cols.join(',')];
  for (const entry of data) {
    rows.push(cols.map((c) => escape(entry[c])).join(','));
  }
  return rows.join('\n');
}

function formatJson(data: Array<Record<string, string | number>>): string {
  if (!data.length) return '(no results)';
  return JSON.stringify(data);
}

// ── Token optimization: auto temp file ───────────────────────────────────────

function cleanupOldTempFiles(): void {
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

function outputWithTokenOptimization(output: string): void {
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
  fs.writeFileSync(tempFile, output, 'utf-8');

  const lineCount = output.split('\n').length;
  console.log(`[Output too large for inline display (${output.length} chars, ${lineCount} lines)]`);
  console.log(`Written to: ${tempFile}`);
  console.log(`Use Read tool with offset/limit to inspect portions of this file, or rerun with --full for inline raw output.`);
}

// ── Interactive Setup Wizard ─────────────────────────────────────────────────

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function cmdSetup(): Promise<void> {
  console.log('=== Aliyun SLS Setup Wizard ===\n');

  // Check if config already exists
  if (fs.existsSync(CONFIG_PATH)) {
    const overwrite = await prompt(`Config already exists at ${CONFIG_PATH}. Overwrite? (y/N): `);
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      return;
    }
  }

  // Gather credentials
  console.log('\n1. Enter your Aliyun credentials:');
  const accessKeyId = await prompt('   AccessKey ID: ');
  const accessKeySecret = await prompt('   AccessKey Secret: ');
  const endpoint = await prompt('   Endpoint (default: cn-hangzhou.log.aliyuncs.com): ') || 'cn-hangzhou.log.aliyuncs.com';

  // Create config object
  const config: AliyunLogConfig = {
    credentials: {
      accessKeyId,
      accessKeySecret,
      endpoint,
    },
    default_project: '',
    environments: {},
    aliases: {},
  };

  // Test connection
  console.log('\n2. Testing connection...');
  try {
    const client = createClient(config);
    // Try to list projects (this validates credentials)
    await client.listProject();
    console.log('   \u2713 Connection successful!');
  } catch (err) {
    console.log(`   \u2717 Connection failed: ${(err as Error).message}`);
    const continueAnyway = await prompt('   Continue anyway? (y/N): ');
    if (continueAnyway.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      return;
    }
  }

  // Ask for default project
  console.log('\n3. Set default project (optional):');
  const defaultProject = await prompt('   Default project name (leave empty to skip): ');
  if (defaultProject) {
    config.default_project = defaultProject;
  }

  // Save config
  const configDir = path.dirname(CONFIG_PATH);
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');

  console.log(`\n\u2713 Configuration saved to: ${CONFIG_PATH}`);
  console.log('\nNext steps:');
  console.log('  - Run \'node aliyunlog.mjs test\' to verify setup');
  console.log('  - Run \'node aliyunlog.mjs list-logstores <project>\' to explore logstores');
  console.log('  - Edit the config file to add environment aliases and service mappings');
}

// ── Subcommands ───────────────────────────────────────────────────────────────

function cmdInit(): void {
  if (fs.existsSync(CONFIG_PATH)) {
    console.log(`Config already exists: ${CONFIG_PATH}`);
    return;
  }

  const template = {
    credentials: {
      accessKeyId: '<your-access-key-id>',
      accessKeySecret: '<your-access-key-secret>',
      endpoint: 'cn-hangzhou.log.aliyuncs.com',
    },
    default_project: '',
    environments: {},
    aliases: {},
  };

  const configDir = path.dirname(CONFIG_PATH);
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(template, null, 2) + '\n');
  console.log(`Created: ${CONFIG_PATH}`);
  console.log('Edit this file with your SLS credentials and project/logstore mapping.');
}

async function cmdListLogstores(config: AliyunLogConfig, project: string): Promise<void> {
  if (!project) die('Missing project name. Usage: list-logstores <project|env>');
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
    die(`Failed to list logstores: ${(err as Error).message}`);
  }
}

function cmdListAliases(config: AliyunLogConfig): void {
  console.log('=== Environments ===');
  for (const [env, cfg] of Object.entries(config.environments || {}).sort()) {
    const project = cfg.project || config.default_project || '?';
    const pattern = cfg.logstore_pattern || '{service}';
    console.log(`  ${env}: project=${project}, logstore=${pattern}`);
  }

  const aliases = config.aliases || {};
  if (Object.keys(aliases).length) {
    console.log('\n=== Explicit Aliases ===');
    for (const [key, val] of Object.entries(aliases).sort()) {
      const logstore = val.logstore || '?';
      const project = val.project || '';
      console.log(
        project ? `  ${key} -> ${project}/${logstore}` : `  ${key} -> ${logstore}`
      );
    }
  }
}

async function cmdTest(config: AliyunLogConfig): Promise<void> {
  validateCredentials(config);

  console.log('Testing SLS SDK connection...');
  const client = createClient(config);

  const project = config.default_project;
  if (!project) die('No default_project set in config.');

  try {
    const result = await client.listLogStore(project);
    console.log(`OK: connected to ${project} (${result.count || 0} logstores)`);
  } catch (err) {
    console.log(`FAILED: ${(err as Error).message}`);
    process.exit(1);
  }
}

// cmdHelp removed — commander generates help automatically

// ── Progressive Search Strategy ──────────────────────────────────────────────

function relaxQuery(query: string, level: number): string | null {
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

async function progressiveSearch(
  client: ALYClient,
  project: string,
  logstore: string,
  fromDate: Date,
  toDate: Date,
  query: string,
  limit: number,
  reverse: boolean,
  startOffset: number = 0
): Promise<{ results: Array<Record<string, string | number>>; finalQuery: string; level: number }> {
  let currentQuery = query;
  let level = 0;
  const maxLevels = 3;

  while (level <= maxLevels) {
    if (level > 0) {
      info(`Try ${level + 1}: Broadening search...`);
    }

    const results = await getLogsWithRetry(client, project, logstore, fromDate, toDate, currentQuery, limit, reverse, startOffset);

    if (results && results.length > 0) {
      if (level > 0) {
        info(`\u2713 Found ${results.length} results with relaxed query: ${currentQuery}`);
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

async function getLogs(
  client: ALYClient,
  project: string,
  logstore: string,
  from: Date,
  to: Date,
  query: string,
  limit: number,
  reverse: boolean,
  startOffset: number = 0
): Promise<Array<Record<string, string | number>>> {
  const MAX_PER_CALL = 100;
  const allResults: Array<Record<string, string | number>> = [];
  let offset = Math.max(0, Number(startOffset) || 0);

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

async function getLogsWithRetry(
  client: ALYClient,
  project: string,
  logstore: string,
  from: Date,
  to: Date,
  query: string,
  limit: number,
  reverse: boolean,
  startOffset: number = 0,
  maxRetries: number = 2
): Promise<Array<Record<string, string | number>>> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await getLogs(client, project, logstore, from, to, query, limit, reverse, startOffset);
    } catch (err) {
      const msg = (err as Error).message || '';
      const isTimeout = msg.includes('Timeout') || msg.includes('ReadTimeout') || msg.includes('ConnectTimeout');
      if (isTimeout && attempt < maxRetries) {
        const delay = 1000 * (attempt + 1);
        info(`Timeout on attempt ${attempt + 1}, retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  return [];
}

// ── Helper: load config or die ────────────────────────────────────────────────

async function loadConfig(): Promise<AliyunLogConfig> {
  return requireConfigWithSetup<AliyunLogConfig>(
    'aliyunlog',
    ALIYUNLOG_CONFIG_UI,
  );
}

// ── Query action (shared by default command) ──────────────────────────────────

async function runQuery(
  env: string | undefined,
  service: string | undefined,
  opts: {
    project?: string;
    logstore?: string;
    service?: string;
    query?: string;
    template?: string;
    keyword?: string;
    from?: string;
    to?: string;
    limit?: string;
    format?: string;
    fields?: string;
    count?: boolean;
    oldest?: boolean;
    summary?: boolean;
    context?: boolean;
    more?: boolean;
    refine?: string;
    full?: boolean;
    extractErrors?: boolean;
    autoBroaden?: boolean;
    timeout?: string;
  }
): Promise<void> {
  const config = await loadConfig();

  // Handle --more, --refine, and standalone --full (load previous context)
  let contextOverride: QueryContext | null = null;
  const standaloneFullOutput = opts.full && !opts.project && !opts.service && !opts.logstore && !env;
  if (opts.more || opts.refine || standaloneFullOutput) {
    const prevContext = loadContext();
    if (!prevContext) {
      if (standaloneFullOutput) {
        die('No previous context found for standalone --full. Run a query first (context is auto-saved), or rerun the original query with --full.');
      }
      die('No previous context found. Run a query first (context is auto-saved unless --no-context is used).');
    }

    if (opts.more) {
      info('Loading previous query context for next page...');
      contextOverride = {
        ...prevContext,
        offset: (Number(prevContext.offset) || 0) + (Number(prevContext.limit) || 1),
      };
    } else if (standaloneFullOutput) {
      info('Loading previous query context with full output...');
      contextOverride = { ...prevContext };
    } else if (opts.refine) {
      info(`Refining previous query: ${prevContext.query}`);
      const refinement = opts.refine;
      contextOverride = { ...prevContext, query: `${prevContext.query} and ${refinement}` };
    }
  }

  // ── Resolve project & logstore ──────────────────────────────────────────

  let project = contextOverride?.project || opts.project || '';
  let logstore = contextOverride?.logstore || opts.logstore || '';
  let serviceName = ''; // Track service name for template expansion

  // Handle --service flag for auto-discovery
  if (opts.service && !logstore) {
    serviceName = opts.service;
    project = project || config.default_project || '';
    if (!project) die('--service requires a project. Use --project or set default_project in config.');

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
        // Fallback: try fast discovery before giving up
        const fastCandidates = await discoverServiceFast(tempClient, project, serviceName);
        if (fastCandidates.length > 0) {
          logstore = fastCandidates[0].logstore;
          info(`Fast-discovered: ${serviceName} -> ${logstore}`);
          if (!cache[project]) cache[project] = {};
          cache[project][serviceName] = logstore;
          saveMappingsCache(cache);
        } else {
          die(`Service "${serviceName}" not found in any logstore in project "${project}".\nTry: node ${__filename} find-service ${serviceName} --project ${project}`);
        }
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
  } else if (env && service) {
    const resolved = resolveAlias(config, env, service);
    if (!project) project = resolved.project;
    if (!logstore) logstore = resolved.logstore;
    serviceName = service; // Save service name
  } else if (project && env) {
    logstore = env;
  } else if (env) {
    project = config.default_project || '';
    logstore = env;
  } else {
    process.stdout.write(program.helpInformation());
    process.exit(1);
  }

  if (!project || !logstore) {
    die(
      'Could not resolve project/logstore. Check config or use --project/--logstore.'
    );
  }

  // ── Create SDK client ────────────────────────────────────────────────────

  validateCredentials(config);
  const timeout = opts.timeout ? parseInt(opts.timeout, 10) : 10000;
  const client = createClient(config, timeout);

  // ── Build query parameters ───────────────────────────────────────────────

  let query = contextOverride?.query || opts.query || '*';

  // Template expansion
  if (opts.template) {
    const keyword = opts.keyword || '';
    if (serviceName) {
      query = expandTemplate(opts.template, serviceName, keyword);
      info(`Template expanded: ${query}`);
    } else if (LOGSTORE_TEMPLATES[opts.template]) {
      query = LOGSTORE_TEMPLATES[opts.template](keyword);
      info(`Template expanded (logstore-wide): ${query}`);
    } else {
      die(`Unknown template: ${opts.template}\nAvailable: ${Object.keys(QUERY_TEMPLATES).join(', ')}`);
    }
  }

  const fromDate = opts.from
    ? parseTime(opts.from)
    : (contextOverride?.from ? new Date(contextOverride.from) : defaultFromDate());
  const toDate = opts.to
    ? parseTime(opts.to)
    : (contextOverride?.to ? new Date(contextOverride.to) : defaultToDate());
  const limit = Number(opts.limit || contextOverride?.limit || '5');
  if (isNaN(limit) || limit <= 0) die(`Invalid --limit value: "${opts.limit}". Must be a positive integer.`);
  const format = opts.format || contextOverride?.format || 'compact';
  const fields = opts.fields || '';
  const count = opts.count || false;
  const extractErrorsMode = opts.extractErrors || false;
  const fullOutput = opts.full || false;
  const summaryMode = opts.summary || false;
  const autoBroaden = opts.autoBroaden || false;
  // commander's --no-context sets opts.context = false
  const persistContext = opts.context !== false;
  const reverse = opts.oldest ? false : (contextOverride?.reverse !== undefined ? Boolean(contextOverride.reverse) : true); // default newest-first
  const startOffset = Math.max(0, Number(contextOverride?.offset) || 0);

  // --count shorthand: rewrite query to COUNT(*)
  if (count) {
    if (query.includes('|')) {
      // Already has analysis — don't rewrite
      info('--count ignored: query already contains analysis statement');
    } else {
      query = `${query} | SELECT COUNT(*) as total`;
    }
  }

  // ── Execute query ────────────────────────────────────────────────────────

  try {
    let data: Array<Record<string, string | number>>;
    let finalQuery = query;
    let searchLevel = 0;

    if (autoBroaden) {
      const result = await progressiveSearch(client, project, logstore, fromDate, toDate, query, limit, reverse, startOffset);
      data = result.results;
      finalQuery = result.finalQuery;
      searchLevel = result.level;
    } else {
      data = await getLogsWithRetry(client, project, logstore, fromDate, toDate, query, limit, reverse, startOffset);
    }

    const n = data ? data.length : 0;
    const order = reverse ? 'newest' : 'oldest';
    const limitInfo = count ? 'count mode' : `limit=${limit}, offset=${startOffset}`;
    const queryDisplay = finalQuery === '*' ? '*' : finalQuery;
    info(`${project}/${logstore} | ${n} results | ${queryDisplay} | ${formatTimeForDisplay(fromDate)} ~ ${formatTimeForDisplay(toDate)} | ${limitInfo} | ${order} first`);

    const contextPayload: QueryContext = {
      project,
      logstore,
      query: finalQuery,
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      limit,
      format,
      offset: startOffset,
      reverse,
    };

    if (n === 0) {
      if (persistContext) {
        saveContext(contextPayload);
      }
      if (autoBroaden && searchLevel > 0) {
        console.log('(no results found even after broadening search)');
      } else {
        console.log('(no results)');
      }
      return;
    }

    let output: string;
    if (extractErrorsMode) {
      output = extractErrors(data);
    } else {
      switch (format) {
        case 'compact':
          output = fields ? formatCsv(data, fields) : formatCompact(data);
          break;
        case 'csv':
          output = formatCsv(data, fields);
          break;
        case 'json':
          output = formatJson(data);
          break;
        default:
          die(`Unknown format: ${format}`);
      }
    }

    // Smart summarization is opt-in and only applies to large compact outputs.
    const canSummarize = summaryMode && !fullOutput && !extractErrorsMode && format === 'compact' && !fields;
    if (canSummarize && output.split('\n').length > 50) {
      const summary = summarizeData(data);
      console.log(summary);

      if (persistContext) {
        saveContext(contextPayload);
        info('Context saved. Use --more for next page or --refine to add filters.');
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
      info('Context saved. Use --more for next page or --refine to add filters.');
    }
  } catch (err) {
    const msg = (err as Error).message || String(err);

    // Timeout-specific guidance
    if (msg.includes('Timeout') || msg.includes('ReadTimeout') || msg.includes('ConnectTimeout')) {
      process.stderr.write(`ERROR: Query timed out.\n`);
      process.stderr.write(`\nSuggestions:\n`);
      process.stderr.write(`  • Narrow the time range: --from=-1h instead of longer ranges\n`);
      process.stderr.write(`  • Reduce result limit: --limit 5\n`);
      process.stderr.write(`  • Filter by service: --service <name> to reduce scan scope\n`);
      process.stderr.write(`  • Use --count first to check data volume\n`);
      process.stderr.write(`  • Increase timeout: --timeout 30000\n`);
      process.exit(1);
    }

    if (msg.includes('does not exist') || msg.includes('LogStoreNotExist') || msg.includes('ProjectNotExist')) {
      process.stderr.write(`ERROR: ${msg}\n`);
      if (serviceName) {
        process.stderr.write(`\nHint: The logstore "${logstore}" does not exist. Discover the correct one:\n`);
        process.stderr.write(`  node ${__filename} find-service ${serviceName} --project ${project}\n`);
      } else {
        process.stderr.write(`\nHint: List available logstores:\n`);
        process.stderr.write(`  node ${__filename} list-logstores ${project}\n`);
      }
      process.stderr.write(`  node ${__filename} list-services <logstore> --project ${project}\n`);
      process.exit(1);
    }
    die(`Query failed: ${msg}`);
  }
}

// ── Commander CLI ─────────────────────────────────────────────────────────────

const program = new Command();

program
  .name('aliyunlog')
  .description('Alibaba Cloud SLS log query CLI')
  .version('1.2.0');

program
  .command('init')
  .description('Create config template')
  .action(() => { cmdInit(); });

program
  .command('setup')
  .description('Interactive setup wizard')
  .action(async () => { await cmdSetup(); });

program
  .command('test')
  .description('Test SDK connection')
  .action(async () => {
    const config = await loadConfig();
    await cmdTest(config);
  });

program
  .command('list-logstores')
  .argument('<project>', 'Project or environment name')
  .description('List logstores in a project')
  .action(async (projectArg: string) => {
    const config = await loadConfig();
    const project = resolveProjectName(config, projectArg);
    await cmdListLogstores(config, project);
  });

program
  .command('list-aliases')
  .description('Show configured aliases')
  .action(async () => {
    const config = await loadConfig();
    cmdListAliases(config);
  });

program
  .command('find-service')
  .argument('<name>', 'Service name to search for')
  .option('--project <p>', 'SLS project name')
  .description('Find which logstore a service belongs to')
  .action(async (name: string, opts: { project?: string }) => {
    const config = await loadConfig();
    const project = opts.project || config.default_project || '';
    await cmdFindService(config, project, name);
  });

program
  .command('list-services')
  .argument('<logstore>', 'Logstore name')
  .option('--project <p>', 'SLS project name')
  .description('List services in a logstore')
  .action(async (logstore: string, opts: { project?: string }) => {
    const config = await loadConfig();
    const project = opts.project || config.default_project || '';
    await cmdListServices(config, project, logstore);
  });

program
  .command('clear-context')
  .description('Clear saved query context')
  .action(() => {
    clearContext();
    console.log('Context cleared');
  });

program
  .command('query', { isDefault: true })
  .argument('[env]', 'Environment (legacy positional)')
  .argument('[service]', 'Service name (legacy positional)')
  .option('--project <name>', 'SLS project name')
  .option('--logstore <name>', 'SLS logstore name')
  .option('--service <name>', 'Auto-discover logstore by service')
  .option('--query <q>', 'SLS query string', '*')
  .option('--template <name>', 'Query template (error-by-service, npe, recent-errors, fatal, timeout, oom)')
  .option('--keyword <text>', 'Keyword for template')
  .option('--from <time>', 'Start time (omit = auto last 15 min). Formats: now, -24h, -2d, "2 days ago", ISO 8601')
  .option('--to <time>', 'End time (omit = now). Same formats as --from')
  .option('--limit <n>', 'Max entries', '5')
  .option('--format <fmt>', 'Output format: compact|csv|json', 'compact')
  .option('--fields <f>', 'Extract specific fields (comma-separated)')
  .option('--count', 'COUNT(*) query')
  .option('--oldest', 'Show oldest first (default: newest first)')
  .option('--summary', 'Smart summary for large compact output')
  .option('--no-context', 'Disable context saving')
  .option('--more', 'Fetch next page (requires saved context)')
  .option('--refine <filter>', 'Refine previous query with additional filter')
  .option('--full', 'Raw inline output (skip summarization/temp file)')
  .option('--extract-errors', 'Extract exceptions/stack traces')
  .option('--auto-broaden', 'Auto-retry with relaxed filters if 0 results')
  .option('--timeout <ms>', 'Query timeout in milliseconds', '10000')
  .action(async (env: string | undefined, service: string | undefined, opts: {
    project?: string;
    logstore?: string;
    service?: string;
    query?: string;
    template?: string;
    keyword?: string;
    from?: string;
    to?: string;
    limit?: string;
    format?: string;
    fields?: string;
    count?: boolean;
    oldest?: boolean;
    summary?: boolean;
    context?: boolean;
    more?: boolean;
    refine?: string;
    full?: boolean;
    extractErrors?: boolean;
    autoBroaden?: boolean;
    timeout?: string;
  }) => {
    await runQuery(env, service, opts);
  });

await program.parseAsync();
