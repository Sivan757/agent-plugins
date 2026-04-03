#!/usr/bin/env node
// TickTick CLI — Direct API wrapper for AI-driven task management
// Usage: ticktick <resource> <action> [args] [--options]

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { randomBytes } from 'crypto';
import { createServer } from 'http';
import { tmpdir } from 'os';

import { Command } from 'commander';
import { requireConfig, requireConfigWithSetup, saveConfig, PluginError } from '@apex/core';
import type { ConfigUIOptions } from '@apex/core';

// =============================================================================
// Config
// =============================================================================

interface TickTickConfig extends Record<string, unknown> {
  host?: string;
  username: string;
  password: string;
  deviceId?: string;
  xDevice?: string;
  accessToken?: string;
  clientId?: string;
  clientSecret?: string;
}

const SESSION_CACHE = `${tmpdir()}/ticktick-session.json`;
const SESSION_TTL_MS = 3600_000; // 1 hour

const TICKTICK_CONFIG_UI: ConfigUIOptions = {
  spec: {
    root: 'page',
    elements: {
      'page': {
        type: 'Header',
        props: { title: 'TickTick', description: { en: 'Enter your TickTick / Dida365 credentials', zh: '输入你的 TickTick / 滴答清单 凭证' }, configPath: null },
        children: ['credentials'],
      },
      'credentials': {
        type: 'Section',
        props: { title: { en: 'Credentials', zh: '凭证' }, collapsible: false, defaultOpen: true, description: null },
        children: ['host', 'username', 'password', 'save'],
      },
      'host': {
        type: 'Field',
        props: {
          label: { en: 'Host', zh: '服务器' },
          type: 'select',
          required: true,
          help: { en: 'Use dida365.com for China accounts', zh: '中国账号请使用 dida365.com' },
          placeholder: null,
          options: ['ticktick.com', 'dida365.com'],
          statePath: '/host',
        },
      },
      'username': {
        type: 'Field',
        props: { label: { en: 'Username / Email', zh: '用户名 / 邮箱' }, type: 'text', required: true, help: null, placeholder: null, options: null, statePath: '/username' },
      },
      'password': {
        type: 'Field',
        props: { label: { en: 'Password', zh: '密码' }, type: 'password', required: true, help: null, placeholder: null, options: null, statePath: '/password' },
      },
      'save': {
        type: 'SaveBar',
        props: { saveLabel: null, resetLabel: null },
      },
    },
    state: { host: 'ticktick.com', username: '', password: '' },
  },
};

// =============================================================================
// Auth
// =============================================================================

interface V2Session {
  token: string;
  inboxId: string;
  userId: string;
  ts: number;
}

interface V2SignonResponse {
  token: string;
  inboxId: string;
  userId: string;
  errorCode?: string;
}

interface V2ErrorResponse {
  errorCode?: string;
}

async function getV2Token(config: TickTickConfig, HOST: string, X_DEVICE: string): Promise<V2Session> {
  const API_V2 = `https://api.${HOST}/api/v2`;

  // Check cache
  if (existsSync(SESSION_CACHE)) {
    try {
      const cached = JSON.parse(readFileSync(SESSION_CACHE, 'utf-8')) as V2Session;
      if (Date.now() - cached.ts < SESSION_TTL_MS) return cached;
    } catch { }
  }

  const resp = await fetch(`${API_V2}/user/signon?wc=true&remember=true`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
      'X-Device': X_DEVICE,
    },
    body: JSON.stringify({
      username: config.username,
      password: config.password,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    let msg: V2ErrorResponse | string;
    try { msg = JSON.parse(text) as V2ErrorResponse; } catch { msg = text; }
    const code = (typeof msg === 'object' ? msg?.errorCode : '') || '';
    if (code === 'incorrect_password_too_many_times') {
      console.error('V2 auth: account temporarily locked due to too many failed attempts. Wait a few minutes and retry.');
    } else if (code === 'username_password_not_match') {
      console.error(`V2 auth: wrong username/password. Check username and password in config.`);
    } else {
      console.error(`V2 auth failed (${resp.status}): ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
    }
    process.exit(1);
  }

  const data = await resp.json() as V2SignonResponse;
  const session: V2Session = { token: data.token, inboxId: data.inboxId, userId: data.userId, ts: Date.now() };
  writeFileSync(SESSION_CACHE, JSON.stringify(session));
  return session;
}

function v1Headers(config: TickTickConfig): Record<string, string> {
  return {
    'Authorization': `Bearer ${config.accessToken}`,
    'Content-Type': 'application/json',
  };
}

async function v2Headers(config: TickTickConfig, HOST: string, X_DEVICE: string): Promise<Record<string, string>> {
  const session = await getV2Token(config, HOST, X_DEVICE);
  return {
    'Authorization': `Bearer ${session.token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    'X-Device': X_DEVICE,
    'Cookie': `t=${session.token}`,
  };
}

// =============================================================================
// HTTP helpers
// =============================================================================

async function v2(
  method: string,
  path: string,
  body: unknown,
  config: TickTickConfig,
  API_V2: string,
  HOST: string,
  X_DEVICE: string
): Promise<unknown> {
  const headers = await v2Headers(config, HOST, X_DEVICE);
  const opts: RequestInit = { method, headers };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const resp = await fetch(`${API_V2}${path}`, opts);
  if (!resp.ok) {
    const text = await resp.text();
    console.error(`API error ${resp.status}: ${text}`);
    process.exit(1);
  }
  const text = await resp.text();
  return text ? JSON.parse(text) : null;
}

async function v1(
  method: string,
  path: string,
  body: unknown,
  config: TickTickConfig,
  API_V1: string
): Promise<unknown> {
  const headers = v1Headers(config);
  const opts: RequestInit = { method, headers };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const resp = await fetch(`${API_V1}${path}`, opts);
  if (!resp.ok) {
    const text = await resp.text();
    console.error(`API error ${resp.status}: ${text}`);
    process.exit(1);
  }
  const text = await resp.text();
  return text ? JSON.parse(text) : null;
}

// =============================================================================
// Sync — get everything at once
// =============================================================================

// =============================================================================
// Output helpers
// =============================================================================

function out(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

function priorityLabel(p: number): string {
  return ({ 0: 'none', 1: 'low', 3: 'medium', 5: 'high' } as Record<number, string>)[p] || 'none';
}

function parsePriority(s: string | undefined): number | undefined {
  if (!s) return undefined;
  const map: Record<string, number> = { none: 0, low: 1, medium: 3, high: 5 };
  return map[s.toLowerCase()] ?? parseInt(s);
}

function formatDate(d: string | null | undefined): string | null {
  if (!d) return null;
  return d.replace(/\.000\+0000$/, 'Z');
}

interface TaskItem {
  id: string;
  title: string;
  status: number;
  sortOrder?: number;
  startDate?: string | null;
  isAllDay?: boolean;
  timeZone?: string;
  completedTime?: string | null;
}

interface Task {
  id: string;
  projectId: string;
  title: string;
  priority?: number;
  status: number;
  dueDate?: string | null;
  tags?: string[];
  parentId?: string | null;
  childIds?: string[];
  kind?: string;
  items?: TaskItem[];
  content?: string;
  timeZone?: string;
  isAllDay?: boolean;
}

interface Project {
  id: string;
  name: string;
  color?: string;
  kind?: string;
  viewMode?: string;
  groupId?: string;
}

interface Tag {
  name: string;
  label?: string;
  color?: string;
  parent?: string | null;
}

interface Habit {
  id: string;
  name: string;
  type?: string;
  goal?: number;
  step?: number;
  unit?: string;
  status: number;
  currentStreak?: number;
  totalCheckIns?: number;
  color?: string;
}

interface SyncState {
  projectGroups?: unknown[];
  projectProfiles?: Project[];
  syncTaskBean?: { update?: Task[] };
  tags?: Tag[];
}

function taskSummary(t: Task): Record<string, unknown> {
  const summary: Record<string, unknown> = {
    id: t.id,
    projectId: t.projectId,
    title: t.title,
    priority: priorityLabel(t.priority ?? 0),
    status: t.status === 0 ? 'active' : t.status === 2 ? 'completed' : t.status === -1 ? 'abandoned' : t.status,
    dueDate: formatDate(t.dueDate),
    tags: t.tags || [],
    parentId: t.parentId || null,
  };
  if (t.kind === 'CHECKLIST' && t.items?.length) {
    summary.checklistCount = t.items.length;
    summary.checklistDone = t.items.filter((i: TaskItem) => i.status !== 0).length;
  }
  if (t.childIds?.length) {
    summary.subtaskCount = t.childIds.length;
  }
  return summary;
}

function projectSummary(p: Project): Record<string, unknown> {
  return {
    id: p.id,
    name: p.name,
    color: p.color,
    kind: p.kind,
    viewMode: p.viewMode,
    folderId: p.groupId || null,
  };
}

// =============================================================================
// CLI Argument Parsing helper (used by commander action handlers)
// =============================================================================

function parseRawOpts(rawArgs: string[]): { args: string[]; opts: Record<string, string | boolean> } {
  const args: string[] = [];
  const opts: Record<string, string | boolean> = {};
  let i = 0;
  while (i < rawArgs.length) {
    if (rawArgs[i].startsWith('--')) {
      const key = rawArgs[i].slice(2);
      if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith('--')) {
        opts[key] = rawArgs[++i];
      } else {
        opts[key] = true;
      }
    } else {
      args.push(rawArgs[i]);
    }
    i++;
  }
  return { args, opts };
}

// =============================================================================
// Main function
// =============================================================================

async function main(): Promise<void> {
  const program = new Command();

  program
    .name('ticktick')
    .description('TickTick CLI — AI-friendly task management')
    .version('0.3.0')
    .addHelpText('after', `
Resources:
  tasks       list|get|create|quick-add|update|complete|delete|move|search|batch-create|batch-complete|batch-delete
              set-parent|unset-parent|subtasks|checklist|checklist-add|checklist-check|checklist-uncheck|checklist-remove|checklist-rename
  projects    list|get|create|update|delete
  folders     list|create|rename|delete
  tags        list|create|update|rename|merge|delete
  columns     list|create|update|delete
  habits      list|get|create|checkin|checkin-all|history|archive|delete
  user        profile|status|stats
  focus       heatmap|by-tag
  sync        (full account state)
  auth        (OAuth2 token acquisition — opens browser)
  setup       x-device <json>  (parse X-Device header and save device info)

Examples:
  ticktick tasks list --overdue
  ticktick tasks list --today --group-by-project
  ticktick tasks create "Buy groceries" --priority high --due 2025-03-15 --tags shopping,errands
  ticktick tasks complete <taskId> <projectId>
  ticktick projects create "Work" --color "#FF6347" --view kanban
  ticktick habits checkin-all
  ticktick tags list
  ticktick user stats`);

  // Register resource-based subcommands. Each takes <action> [args...] plus
  // any unknown options (--key value / --flag) which are passed through to the
  // existing handler signatures unchanged.
  const resourceNames = ['tasks', 'projects', 'folders', 'tags', 'columns', 'habits', 'user', 'focus'];
  for (const res of resourceNames) {
    program
      .command(res)
      .description(`Manage ${res}`)
      .argument('<action>', 'Action to perform (see --help)')
      .argument('[args...]', 'Positional arguments for the action')
      .allowUnknownOption(true)
      .allowExcessArguments(true)
      .action(async (action: string, positionalArgs: string[], _cmdObj: Command) => {
        // Collect everything that commander couldn't parse: unknown opts come
        // through as the remaining raw argv after the subcommand + known tokens.
        // Commander stores unparsed tokens in _cmdObj.args when allowUnknownOption is set,
        // but since we captured <action> and [args...] we need to look at the
        // raw process.argv that follows the subcommand name.
        const subCmdIdx = process.argv.indexOf(res);
        const rawAfterSubcmd = subCmdIdx >= 0 ? process.argv.slice(subCmdIdx + 1) : [];
        // rawAfterSubcmd is: [action, ...positionalArgs, --opt val, --flag, ...]
        // Skip the action token and known positional args to get only option tokens.
        const rawOpts = rawAfterSubcmd.slice(1 + positionalArgs.length);
        const { opts } = parseRawOpts(rawOpts);

        const config = await requireConfigWithSetup<TickTickConfig>('ticktick', TICKTICK_CONFIG_UI);
        const HOST = config.host || 'ticktick.com';
        const API_V2 = `https://api.${HOST}/api/v2`;
        const API_V1 = `https://api.${HOST}/open/v1`;

        function buildXDevice(): string {
          if (config.xDevice) {
            try {
              const parsed = JSON.parse(config.xDevice) as Record<string, unknown>;
              return JSON.stringify(parsed);
            } catch { /* fall through to construct */ }
          }
          const id = config.deviceId || randomBytes(12).toString('hex');
          return JSON.stringify({ platform: 'web', os: 'macOS 10.15.7', device: 'Chrome 145.0.0.0', name: '', version: 8023, id, channel: 'website', campaign: '', websocket: '' });
        }

        const X_DEVICE = buildXDevice();

        let _syncCache: SyncState | null = null;
        async function sync(): Promise<SyncState> {
          if (!_syncCache) _syncCache = await v2('GET', '/batch/check/0', undefined, config, API_V2, HOST, X_DEVICE) as SyncState;
          return _syncCache;
        }

        async function apiV2(method: string, path: string, body?: unknown): Promise<unknown> {
          return v2(method, path, body, config, API_V2, HOST, X_DEVICE);
        }

        async function apiV1(method: string, path: string, body?: unknown): Promise<unknown> {
          return v1(method, path, body, config, API_V1);
        }

        async function getV2TokenBound(): Promise<V2Session> {
          return getV2Token(config, HOST, X_DEVICE);
        }

        await runResourceAction(res, action, positionalArgs, opts, { sync, apiV2, apiV1, getV2TokenBound, config });
      });
  }

  // Sync — no action argument
  program
    .command('sync')
    .description('Full account sync — dump all projects, tasks, tags')
    .action(async () => {
      const config = await requireConfigWithSetup<TickTickConfig>('ticktick', TICKTICK_CONFIG_UI);
      const HOST = config.host || 'ticktick.com';
      const API_V2 = `https://api.${HOST}/api/v2`;
      function buildXDevice(): string {
        if (config.xDevice) {
          try { return JSON.stringify(JSON.parse(config.xDevice) as Record<string, unknown>); } catch { /* fall through */ }
        }
        const id = config.deviceId || randomBytes(12).toString('hex');
        return JSON.stringify({ platform: 'web', os: 'macOS 10.15.7', device: 'Chrome 145.0.0.0', name: '', version: 8023, id, channel: 'website', campaign: '', websocket: '' });
      }
      const X_DEVICE = buildXDevice();
      const data = await v2('GET', '/batch/check/0', undefined, config, API_V2, HOST, X_DEVICE) as SyncState;
      out(data);
    });

  // Auth — OAuth2 flow
  program
    .command('auth')
    .description('OAuth2 token acquisition — opens browser')
    .action(async () => {
      const config = await requireConfigWithSetup<TickTickConfig>('ticktick', TICKTICK_CONFIG_UI);
      const HOST = config.host || 'ticktick.com';
      await authFlow(config, HOST);
    });

  // Setup — parse X-Device header
  program
    .command('setup')
    .argument('<subcommand>', 'x-device')
    .argument('[args...]', 'Arguments for the subcommand')
    .allowUnknownOption(true)
    .description('Setup helpers — e.g. setup x-device \'{"platform":"web",...}\'')
    .action(async (sub: string, subArgs: string[]) => {
      if (sub === 'x-device') {
        const subCmdIdx = process.argv.indexOf('setup');
        const rawAfterSetup = subCmdIdx >= 0 ? process.argv.slice(subCmdIdx + 2) : [];
        const { args: parsedArgs, opts: parsedOpts } = parseRawOpts(rawAfterSetup);
        const json = parsedArgs[0] || String(parsedOpts['json'] || subArgs[0] || '');
        if (!json) {
          console.error('Usage: ticktick setup x-device \'{"platform":"web",...}\'');
          console.error('Paste the X-Device header value from browser DevTools.');
          process.exit(1);
        }
        await setupDevice(json);
        return;
      }
      console.error(`Unknown setup action: ${sub}\nAvailable: x-device`);
      process.exit(1);
    });

  await program.parseAsync();
}

// =============================================================================
// Shared setup helpers (extracted so auth/setup commands can call them)
// =============================================================================

async function authFlow(config: TickTickConfig, HOST: string): Promise<void> {
  const clientId = config.clientId;
  const clientSecret = config.clientSecret;
  if (!clientId || !clientSecret) {
    console.error(`Error: clientId and clientSecret required in config`);
    console.error('Get them at https://developer.' + HOST + '/manage');
    process.exit(1);
  }

  const REDIRECT_PORT = 18321;
  const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/callback`;
  const SCOPE = 'tasks:read tasks:write';
  const STATE = randomBytes(8).toString('hex');

  const authUrl = `https://${HOST}/oauth/authorize?` + new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
    state: STATE,
  }).toString();

  const { promise, resolve: done } = Promise.withResolvers<{ access_token?: string; error?: string; details?: unknown }>();
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost:${REDIRECT_PORT}`);
    if (url.pathname !== '/callback') {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (state !== STATE) {
      res.writeHead(400);
      res.end('State mismatch — possible CSRF attack');
      done({ error: 'state_mismatch' });
      return;
    }
    if (!code) {
      res.writeHead(400);
      res.end('No authorization code received');
      done({ error: 'no_code' });
      return;
    }

    try {
      const tokenResp = await fetch(`https://${HOST}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: REDIRECT_URI,
          scope: SCOPE,
        }).toString(),
      });
      const tokenData = await tokenResp.json() as { access_token?: string };
      if (tokenData.access_token) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>Authorization successful!</h1><p>You can close this tab.</p>');
        done({ access_token: tokenData.access_token });
      } else {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<h1>Token exchange failed</h1><pre>${JSON.stringify(tokenData, null, 2)}</pre>`);
        done({ error: 'token_exchange_failed', details: tokenData });
      }
    } catch (err) {
      res.writeHead(500);
      res.end(`Token exchange error: ${(err as Error).message}`);
      done({ error: (err as Error).message });
    }
  });

  server.listen(REDIRECT_PORT, () => {
    console.error(`Opening browser for authorization...`);
    console.error(`If browser doesn't open, visit:\n${authUrl}\n`);
    import('child_process').then(cp => cp.exec(`open "${authUrl}"`));
  });

  const result = await promise;
  server.close();

  if (result.error) {
    console.error('Authorization failed:', result.error);
    if (result.details) console.error(JSON.stringify(result.details, null, 2));
    process.exit(1);
  }

  await saveConfig('ticktick', { accessToken: result.access_token }, true);
  out({ ok: true, message: `Access token saved to config`, token_preview: (result.access_token ?? '').slice(0, 8) + '...' });
}

// =============================================================================
// Resource action dispatcher (called by commander action handler)
// =============================================================================

interface Ctx {
  sync: () => Promise<SyncState>;
  apiV2: (method: string, path: string, body?: unknown) => Promise<unknown>;
  apiV1: (method: string, path: string, body?: unknown) => Promise<unknown>;
  getV2TokenBound: () => Promise<V2Session>;
  config: TickTickConfig;
}

async function runResourceAction(
  resource: string,
  action: string,
  args: string[],
  opts: Record<string, string | boolean>,
  ctx: Ctx,
): Promise<void> {
  const { sync, apiV2, apiV1, getV2TokenBound } = ctx;

  // =============================================================================
  // Commands: Tasks
  // =============================================================================

  const tasks = {
    async list(args: string[], opts: Record<string, string | boolean>): Promise<void> {
      const state = await sync();
      let allTasks: Task[] = [];
      const projectMap: Record<string, string> = {};

      for (const p of (state.projectProfiles || [])) {
        projectMap[p.id] = p.name;
      }

      for (const pg of (state.syncTaskBean?.update || [])) {
        allTasks.push(pg);
      }

      // Filter
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setDate(todayEnd.getDate() + 1);

      if (opts.overdue) {
        allTasks = allTasks.filter(t => t.status === 0 && t.dueDate && new Date(t.dueDate) < today);
      } else if (opts.today) {
        allTasks = allTasks.filter(t => {
          if (!t.dueDate) return false;
          const d = new Date(t.dueDate);
          return d >= today && d < todayEnd;
        });
      } else if (opts.completed) {
        // Use closed endpoint
        const days = parseInt(String(opts.days)) || 7;
        const limit = parseInt(String(opts.limit)) || 100;
        const to = new Date();
        const from = new Date(to.getTime() - days * 86400_000);
        const fmt = (d: Date) => d.toISOString().replace('T', ' ').slice(0, 19);
        const data = await apiV2('GET', `/project/all/closed?from=${encodeURIComponent(fmt(from))}&to=${encodeURIComponent(fmt(to))}&status=Completed&limit=${limit}`) as Task[];
        out(data.map(taskSummary));
        return;
      } else if (opts.project) {
        allTasks = allTasks.filter(t => t.projectId === opts.project);
      } else if (opts.tag) {
        allTasks = allTasks.filter(t => (t.tags || []).includes(String(opts.tag)));
      } else if (opts.priority) {
        const p = parsePriority(String(opts.priority));
        allTasks = allTasks.filter(t => t.priority === p);
      }

      // Active only by default
      if (!opts.completed) {
        allTasks = allTasks.filter(t => t.status === 0);
      }

      const result = allTasks.map(t => ({
        ...taskSummary(t),
        projectName: projectMap[t.projectId] || t.projectId,
      }));

      if (opts['group-by-project']) {
        const grouped: Record<string, unknown[]> = {};
        for (const t of result) {
          const projName = String(t.projectName);
          (grouped[projName] ??= []).push(t);
        }
        out(grouped);
      } else {
        out(result);
      }
    },

    async get(args: string[]): Promise<void> {
      const [taskId, projectId] = args;
      if (!taskId || !projectId) { console.error('Usage: ticktick tasks get <taskId> <projectId>'); process.exit(1); }
      const data = await apiV1('GET', `/project/${projectId}/task/${taskId}`) as Task;
      out(taskSummary(data));
    },

    async create(args: string[], opts: Record<string, string | boolean>): Promise<void> {
      const [title] = args;
      if (!title) { console.error('Usage: ticktick tasks create <title> [--project ID] [--priority low|medium|high] [--due DATE] [--tags tag1,tag2] [--content TEXT]'); process.exit(1); }
      const session = await getV2TokenBound();
      const task: Partial<Task> & { title: string; projectId: string } = {
        title,
        projectId: String(opts.project || session.inboxId),
      };
      if (opts.priority) task.priority = parsePriority(String(opts.priority));
      if (opts.due) task.dueDate = new Date(String(opts.due)).toISOString().replace('Z', '.000+0000');
      if (opts.tags) task.tags = String(opts.tags).split(',').map(s => s.trim());
      if (opts.content) task.content = String(opts.content);
      if (opts['all-day'] !== undefined) task.isAllDay = true;
      const parentId = opts.parent ? String(opts.parent) : undefined;

      const resp = await apiV2('POST', '/batch/task', { add: [task], update: [], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] }) as { id2etag?: Record<string, string> };
      // Auto-link subtask if --parent was specified (parentId in create payload doesn't auto-link)
      if (parentId && resp?.id2etag) {
        const createdId = Object.keys(resp.id2etag)[0];
        if (createdId) {
          await apiV2('POST', '/batch/taskParent', [{ taskId: createdId, projectId: task.projectId, parentId }]);
        }
      }
      out(resp);
    },

    async 'quick-add'(args: string[], opts: Record<string, string | boolean>): Promise<void> {
      const text = args.join(' ');
      if (!text) { console.error('Usage: ticktick tasks quick-add <text>'); process.exit(1); }
      const session = await getV2TokenBound();
      const task = { title: text, projectId: String(opts.project || session.inboxId) };
      const resp = await apiV2('POST', '/batch/task', { add: [task], update: [], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
      out(resp);
    },

    async update(args: string[], opts: Record<string, string | boolean>): Promise<void> {
      const [taskId, projectId] = args;
      if (!taskId || !projectId) { console.error('Usage: ticktick tasks update <taskId> <projectId> [--title T] [--priority P] [--due D] [--tags T] [--content C]'); process.exit(1); }
      const update: Record<string, unknown> = { id: taskId, projectId };
      if (opts.title) update.title = opts.title;
      if (opts.priority) update.priority = parsePriority(String(opts.priority));
      if (opts.due) update.dueDate = new Date(String(opts.due)).toISOString().replace('Z', '.000+0000');
      if (opts.tags) update.tags = String(opts.tags).split(',').map(s => s.trim());
      if (opts.content) update.content = opts.content;
      if (opts.column) update.columnId = opts.column;

      const resp = await apiV2('POST', '/batch/task', { add: [], update: [update], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
      out(resp);
    },

    async complete(args: string[]): Promise<void> {
      const [taskId, projectId] = args;
      if (!taskId || !projectId) { console.error('Usage: ticktick tasks complete <taskId> <projectId>'); process.exit(1); }
      await apiV1('POST', `/project/${projectId}/task/${taskId}/complete`);
      out({ ok: true, taskId, projectId });
    },

    async delete(args: string[]): Promise<void> {
      const [taskId, projectId] = args;
      if (!taskId || !projectId) { console.error('Usage: ticktick tasks delete <taskId> <projectId>'); process.exit(1); }
      await apiV1('DELETE', `/project/${projectId}/task/${taskId}`);
      out({ ok: true, deleted: taskId });
    },

    async move(args: string[]): Promise<void> {
      const [taskId, fromProject, toProject] = args;
      if (!taskId || !fromProject || !toProject) { console.error('Usage: ticktick tasks move <taskId> <fromProjectId> <toProjectId>'); process.exit(1); }
      const resp = await apiV2('POST', '/batch/taskProject', [{ taskId, fromProjectId: fromProject, toProjectId: toProject }]);
      out(resp);
    },

    // --- Subtask (子任务) operations ---

    async 'set-parent'(args: string[]): Promise<void> {
      const [taskId, projectId, parentId] = args;
      if (!taskId || !projectId || !parentId) { console.error('Usage: ticktick tasks set-parent <taskId> <projectId> <parentId>'); process.exit(1); }
      const resp = await apiV2('POST', '/batch/taskParent', [{ taskId, projectId, parentId }]);
      out(resp ?? { ok: true, taskId, parentId });
    },

    async 'unset-parent'(args: string[]): Promise<void> {
      const [taskId, projectId, oldParentId] = args;
      if (!taskId || !projectId || !oldParentId) { console.error('Usage: ticktick tasks unset-parent <taskId> <projectId> <oldParentId>'); process.exit(1); }
      const resp = await apiV2('POST', '/batch/taskParent', [{ taskId, projectId, oldParentId }]);
      out(resp ?? { ok: true, taskId, detached: oldParentId });
    },

    async subtasks(args: string[]): Promise<void> {
      const [parentId] = args;
      if (!parentId) { console.error('Usage: ticktick tasks subtasks <parentTaskId>'); process.exit(1); }
      const state = await sync();
      const allTasks = state.syncTaskBean?.update || [];
      const parent = allTasks.find(t => t.id === parentId);
      if (!parent) { console.error(`Task ${parentId} not found`); process.exit(1); }
      const children = (parent.childIds || []).map(cid => allTasks.find(t => t.id === cid)).filter((t): t is Task => t !== undefined);
      out({
        parent: { id: parent.id, title: parent.title },
        subtasks: children.map(taskSummary),
      });
    },

    // --- Checklist (清单项) operations ---

    async checklist(args: string[]): Promise<void> {
      const [taskId] = args;
      if (!taskId) { console.error('Usage: ticktick tasks checklist <taskId>'); process.exit(1); }
      const state = await sync();
      const task = (state.syncTaskBean?.update || []).find(t => t.id === taskId);
      if (!task) { console.error(`Task ${taskId} not found`); process.exit(1); }
      out({
        task: { id: task.id, title: task.title, kind: task.kind },
        items: (task.items || []).map((i: TaskItem) => ({
          id: i.id,
          title: i.title,
          status: i.status === 0 ? 'unchecked' : 'checked',
          sortOrder: i.sortOrder,
        })),
      });
    },

    async 'checklist-add'(args: string[], opts: Record<string, string | boolean>): Promise<void> {
      const [taskId, ...titleParts] = args;
      const title = titleParts.join(' ') || String(opts.title || '');
      if (!taskId || !title) { console.error('Usage: ticktick tasks checklist-add <taskId> <title>'); process.exit(1); }
      const state = await sync();
      const task = (state.syncTaskBean?.update || []).find(t => t.id === taskId);
      if (!task) { console.error(`Task ${taskId} not found`); process.exit(1); }
      const items = task.items || [];
      const maxSort = items.length > 0 ? Math.max(...items.map((i: TaskItem) => i.sortOrder ?? 0)) : -1048576;
      const newItem: TaskItem = {
        id: randomBytes(12).toString('hex'),
        status: 0,
        title,
        sortOrder: maxSort + 1048576,
        startDate: null,
        isAllDay: false,
        timeZone: task.timeZone || 'Asia/Shanghai',
      };
      task.items = [...items, newItem];
      if (task.kind !== 'CHECKLIST') task.kind = 'CHECKLIST';
      const resp = await apiV2('POST', '/batch/task', { add: [], update: [task], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
      out({ ok: true, addedItem: { id: newItem.id, title: newItem.title }, response: resp });
    },

    async 'checklist-check'(args: string[]): Promise<void> {
      const [taskId, itemId] = args;
      if (!taskId || !itemId) { console.error('Usage: ticktick tasks checklist-check <taskId> <itemId>'); process.exit(1); }
      const state = await sync();
      const task = (state.syncTaskBean?.update || []).find(t => t.id === taskId);
      if (!task) { console.error(`Task ${taskId} not found`); process.exit(1); }
      const item = (task.items || []).find((i: TaskItem) => i.id === itemId);
      if (!item) { console.error(`Item ${itemId} not found in task`); process.exit(1); }
      item.status = 1;
      item.completedTime = new Date().toISOString().replace('Z', '.000+0000');
      const resp = await apiV2('POST', '/batch/task', { add: [], update: [task], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
      out({ ok: true, checked: item.title, response: resp });
    },

    async 'checklist-uncheck'(args: string[]): Promise<void> {
      const [taskId, itemId] = args;
      if (!taskId || !itemId) { console.error('Usage: ticktick tasks checklist-uncheck <taskId> <itemId>'); process.exit(1); }
      const state = await sync();
      const task = (state.syncTaskBean?.update || []).find(t => t.id === taskId);
      if (!task) { console.error(`Task ${taskId} not found`); process.exit(1); }
      const item = (task.items || []).find((i: TaskItem) => i.id === itemId);
      if (!item) { console.error(`Item ${itemId} not found in task`); process.exit(1); }
      item.status = 0;
      item.completedTime = null;
      const resp = await apiV2('POST', '/batch/task', { add: [], update: [task], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
      out({ ok: true, unchecked: item.title, response: resp });
    },

    async 'checklist-remove'(args: string[]): Promise<void> {
      const [taskId, itemId] = args;
      if (!taskId || !itemId) { console.error('Usage: ticktick tasks checklist-remove <taskId> <itemId>'); process.exit(1); }
      const state = await sync();
      const task = (state.syncTaskBean?.update || []).find(t => t.id === taskId);
      if (!task) { console.error(`Task ${taskId} not found`); process.exit(1); }
      const removed = (task.items || []).find((i: TaskItem) => i.id === itemId);
      task.items = (task.items || []).filter((i: TaskItem) => i.id !== itemId);
      const resp = await apiV2('POST', '/batch/task', { add: [], update: [task], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
      out({ ok: true, removed: removed?.title, response: resp });
    },

    async 'checklist-rename'(args: string[]): Promise<void> {
      const [taskId, itemId, ...titleParts] = args;
      const newTitle = titleParts.join(' ');
      if (!taskId || !itemId || !newTitle) { console.error('Usage: ticktick tasks checklist-rename <taskId> <itemId> <newTitle>'); process.exit(1); }
      const state = await sync();
      const task = (state.syncTaskBean?.update || []).find(t => t.id === taskId);
      if (!task) { console.error(`Task ${taskId} not found`); process.exit(1); }
      const item = (task.items || []).find((i: TaskItem) => i.id === itemId);
      if (!item) { console.error(`Item ${itemId} not found in task`); process.exit(1); }
      const oldTitle = item.title;
      item.title = newTitle;
      const resp = await apiV2('POST', '/batch/task', { add: [], update: [task], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
      out({ ok: true, renamed: { from: oldTitle, to: newTitle }, response: resp });
    },

    async search(args: string[]): Promise<void> {
      const query = args.join(' ');
      if (!query) { console.error('Usage: ticktick tasks search <query>'); process.exit(1); }
      // V2 doesn't have a simple search endpoint exposed; use sync + filter
      const state = await sync();
      const allTasks = state.syncTaskBean?.update || [];
      const q = query.toLowerCase();
      const results = allTasks.filter(t =>
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.content && t.content.toLowerCase().includes(q)) ||
        (t.tags || []).some(tag => tag.toLowerCase().includes(q))
      );
      const state2 = state.projectProfiles || [];
      const projectMap = Object.fromEntries(state2.map(p => [p.id, p.name]));
      out(results.map(t => ({ ...taskSummary(t), projectName: projectMap[t.projectId] || t.projectId })));
    },

    async 'batch-create'(args: string[], opts: Record<string, string | boolean>): Promise<void> {
      // Read JSON array from --json flag or stdin
      let items: Array<Record<string, unknown>>;
      if (opts.json) {
        items = JSON.parse(String(opts.json)) as Array<Record<string, unknown>>;
      } else {
        const input = readFileSync(0, 'utf-8');
        items = JSON.parse(input) as Array<Record<string, unknown>>;
      }
      const session = await getV2TokenBound();
      const batchTasks = items.map(t => ({
        title: t.title,
        projectId: t.projectId || t.project_id || session.inboxId,
        priority: t.priority !== undefined ? parsePriority(String(t.priority)) : undefined,
        dueDate: t.dueDate || t.due_date ? new Date(String(t.dueDate || t.due_date)).toISOString().replace('Z', '.000+0000') : undefined,
        tags: t.tags,
        content: t.content,
        parentId: t.parentId || t.parent_id,
      }));
      const resp = await apiV2('POST', '/batch/task', { add: batchTasks, update: [], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
      out(resp);
    },

    async 'batch-complete'(args: string[], opts: Record<string, string | boolean>): Promise<void> {
      let items: Array<[string, string]>;
      if (opts.json) {
        items = JSON.parse(String(opts.json)) as Array<[string, string]>;
      } else {
        const input = readFileSync(0, 'utf-8');
        items = JSON.parse(input) as Array<[string, string]>;
      }
      const results: Array<{ ok: boolean; taskId: string; projectId: string }> = [];
      for (const [taskId, projectId] of items) {
        await apiV1('POST', `/project/${projectId}/task/${taskId}/complete`);
        results.push({ ok: true, taskId, projectId });
      }
      out(results);
    },

    async 'batch-delete'(args: string[], opts: Record<string, string | boolean>): Promise<void> {
      let items: Array<[string, string]>;
      if (opts.json) {
        items = JSON.parse(String(opts.json)) as Array<[string, string]>;
      } else {
        const input = readFileSync(0, 'utf-8');
        items = JSON.parse(input) as Array<[string, string]>;
      }
      const results: Array<{ ok: boolean; taskId: string; projectId: string }> = [];
      for (const [taskId, projectId] of items) {
        await apiV1('DELETE', `/project/${projectId}/task/${taskId}`);
        results.push({ ok: true, taskId, projectId });
      }
      out(results);
    },
  };

  // =============================================================================
  // Commands: Projects
  // =============================================================================

  const projects = {
    async list(): Promise<void> {
      const data = await apiV1('GET', '/project') as Project[];
      out(data.map(projectSummary));
    },

    async get(args: string[]): Promise<void> {
      const [id] = args;
      if (!id) { console.error('Usage: ticktick projects get <projectId>'); process.exit(1); }
      const data = await apiV1('GET', `/project/${id}/data`) as { project: Project; tasks?: Task[]; columns?: unknown[] };
      out({
        project: projectSummary(data.project),
        tasks: (data.tasks || []).map(taskSummary),
        columns: data.columns || [],
      });
    },

    async create(args: string[], opts: Record<string, string | boolean>): Promise<void> {
      const [name] = args;
      if (!name) { console.error('Usage: ticktick projects create <name> [--color HEX] [--view list|kanban|timeline] [--kind TASK|NOTE]'); process.exit(1); }
      const project: Record<string, unknown> = { name };
      if (opts.color) project.color = opts.color;
      if (opts.view) project.viewMode = opts.view;
      if (opts.kind) project.kind = opts.kind;
      if (opts.folder) project.groupId = opts.folder;
      const data = await apiV1('POST', '/project', project) as Project;
      out(projectSummary(data));
    },

    async update(args: string[], opts: Record<string, string | boolean>): Promise<void> {
      const [id] = args;
      if (!id) { console.error('Usage: ticktick projects update <projectId> [--name N] [--color HEX]'); process.exit(1); }
      const update: Record<string, unknown> = {};
      if (opts.name) update.name = opts.name;
      if (opts.color) update.color = opts.color;
      const data = await apiV1('POST', `/project/${id}`, update) as Project;
      out(projectSummary(data));
    },

    async delete(args: string[]): Promise<void> {
      const [id] = args;
      if (!id) { console.error('Usage: ticktick projects delete <projectId>'); process.exit(1); }
      await apiV1('DELETE', `/project/${id}`);
      out({ ok: true, deleted: id });
    },
  };

  // =============================================================================
  // Commands: Folders
  // =============================================================================

  const folders = {
    async list(): Promise<void> {
      const state = await sync();
      out(state.projectGroups || []);
    },

    async create(args: string[]): Promise<void> {
      const [name] = args;
      if (!name) { console.error('Usage: ticktick folders create <name>'); process.exit(1); }
      const resp = await apiV2('POST', '/batch/projectGroup', {
        add: [{ name, listType: 'group' }], update: [], delete: [],
      });
      out(resp);
    },

    async rename(args: string[]): Promise<void> {
      const [id, name] = args;
      if (!id || !name) { console.error('Usage: ticktick folders rename <folderId> <newName>'); process.exit(1); }
      const resp = await apiV2('POST', '/batch/projectGroup', {
        add: [], update: [{ id, name, listType: 'group' }], delete: [],
      });
      out(resp);
    },

    async delete(args: string[]): Promise<void> {
      const [id] = args;
      if (!id) { console.error('Usage: ticktick folders delete <folderId>'); process.exit(1); }
      const resp = await apiV2('POST', '/batch/projectGroup', { add: [], update: [], delete: [id] });
      out(resp);
    },
  };

  // =============================================================================
  // Commands: Tags
  // =============================================================================

  const tagsCmds = {
    async list(): Promise<void> {
      const state = await sync();
      out((state.tags || []).map((t: Tag) => ({
        name: t.name,
        label: t.label,
        color: t.color,
        parent: t.parent || null,
      })));
    },

    async create(args: string[], opts: Record<string, string | boolean>): Promise<void> {
      const [name] = args;
      if (!name) { console.error('Usage: ticktick tags create <name> [--color HEX] [--parent NAME]'); process.exit(1); }
      const tag: Record<string, unknown> = { label: name, name: name.toLowerCase() };
      if (opts.color) tag.color = opts.color;
      if (opts.parent) tag.parent = opts.parent;
      const resp = await apiV2('POST', '/batch/tag', { add: [tag], update: [] });
      out(resp);
    },

    async update(args: string[], opts: Record<string, string | boolean>): Promise<void> {
      const [name] = args;
      if (!name) { console.error('Usage: ticktick tags update <name> [--color HEX] [--parent NAME]'); process.exit(1); }
      const tag: Record<string, unknown> = { name: name.toLowerCase(), label: name, rawName: name };
      if (opts.color) tag.color = opts.color;
      if (opts.parent) tag.parent = opts.parent;
      const resp = await apiV2('POST', '/batch/tag', { add: [], update: [tag] });
      out(resp);
    },

    async rename(args: string[]): Promise<void> {
      const [oldName, newName] = args;
      if (!oldName || !newName) { console.error('Usage: ticktick tags rename <oldName> <newName>'); process.exit(1); }
      const resp = await apiV2('PUT', '/tag/rename', { name: oldName.toLowerCase(), newName });
      out(resp ?? { ok: true, renamed: `${oldName} -> ${newName}` });
    },

    async merge(args: string[]): Promise<void> {
      const [source, target] = args;
      if (!source || !target) { console.error('Usage: ticktick tags merge <source> <target>'); process.exit(1); }
      const resp = await apiV2('PUT', '/tag/merge', { name: source.toLowerCase(), newName: target.toLowerCase() });
      out(resp ?? { ok: true, merged: `${source} -> ${target}` });
    },

    async delete(args: string[]): Promise<void> {
      const [name] = args;
      if (!name) { console.error('Usage: ticktick tags delete <name>'); process.exit(1); }
      const resp = await apiV2('DELETE', `/tag?name=${encodeURIComponent(name.toLowerCase())}`);
      out(resp ?? { ok: true, deleted: name });
    },
  };

  // =============================================================================
  // Commands: Columns
  // =============================================================================

  const columns = {
    async list(args: string[]): Promise<void> {
      const [projectId] = args;
      if (!projectId) { console.error('Usage: ticktick columns list <projectId>'); process.exit(1); }
      const data = await apiV2('GET', `/column/project/${projectId}`);
      out(data);
    },

    async create(args: string[], opts: Record<string, string | boolean>): Promise<void> {
      const [projectId, name] = args;
      if (!projectId || !name) { console.error('Usage: ticktick columns create <projectId> <name>'); process.exit(1); }
      const col: Record<string, unknown> = { projectId, name };
      if (opts.order) col.sortOrder = parseInt(String(opts.order));
      const resp = await apiV2('POST', '/column', { add: [col], update: [], delete: [] });
      out(resp);
    },

    async update(args: string[], opts: Record<string, string | boolean>): Promise<void> {
      const [colId, projectId] = args;
      if (!colId || !projectId) { console.error('Usage: ticktick columns update <columnId> <projectId> [--name N] [--order N]'); process.exit(1); }
      const update: Record<string, unknown> = { id: colId, projectId };
      if (opts.name) update.name = opts.name;
      if (opts.order) update.sortOrder = parseInt(String(opts.order));
      const resp = await apiV2('POST', '/column', { add: [], update: [update], delete: [] });
      out(resp);
    },

    async delete(args: string[]): Promise<void> {
      const [colId, projectId] = args;
      if (!colId || !projectId) { console.error('Usage: ticktick columns delete <columnId> <projectId>'); process.exit(1); }
      const resp = await apiV2('POST', '/column', { add: [], update: [], delete: [{ columnId: colId, projectId }] });
      out(resp);
    },
  };

  // =============================================================================
  // Commands: Habits
  // =============================================================================

  const habits = {
    async list(args: string[], opts: Record<string, string | boolean>): Promise<void> {
      const data = await apiV2('GET', '/habits') as Habit[] | null;
      let list = data || [];
      if (opts.active) list = list.filter(h => h.status === 0);
      if (opts.archived) list = list.filter(h => h.status === 2);
      out(list.map((h: Habit) => ({
        id: h.id,
        name: h.name,
        type: h.type || 'Boolean',
        goal: h.goal,
        step: h.step,
        unit: h.unit,
        status: h.status === 0 ? 'active' : 'archived',
        streak: h.currentStreak || 0,
        totalCheckins: h.totalCheckIns || 0,
        color: h.color,
      })));
    },

    async get(args: string[]): Promise<void> {
      const [id] = args;
      if (!id) { console.error('Usage: ticktick habits get <habitId>'); process.exit(1); }
      const all = await apiV2('GET', '/habits') as Habit[] | null;
      const habit = (all || []).find(h => h.id === id);
      if (!habit) { console.error(`Habit ${id} not found`); process.exit(1); }
      out(habit);
    },

    async create(args: string[], opts: Record<string, string | boolean>): Promise<void> {
      const [name] = args;
      if (!name) { console.error('Usage: ticktick habits create <name> [--type boolean|real] [--goal N] [--step N] [--unit TEXT] [--color HEX] [--reminder HH:MM]'); process.exit(1); }
      const now = new Date().toISOString().replace('Z', '.000+0000');
      const typeVal = String(opts.type || 'Boolean');
      const habit: Record<string, unknown> = {
        id: randomBytes(12).toString('hex'),
        name,
        type: typeVal.charAt(0).toUpperCase() + typeVal.slice(1).toLowerCase(),
        goal: parseFloat(String(opts.goal)) || 1.0,
        step: parseFloat(String(opts.step)) || 0,
        unit: opts.unit || 'Count',
        iconRes: opts.icon || 'habit_daily_check_in',
        color: opts.color || '#97E38B',
        status: 0,
        totalCheckIns: 0,
        currentStreak: 0,
        completedCycles: 0,
        createdTime: now,
        modifiedTime: now,
        encouragement: '',
        recordEnable: false,
        exDates: [],
        style: 1,
        etag: null,
      };
      if (opts.reminder) habit.reminders = [opts.reminder];
      if (opts.repeat) habit.repeatRule = opts.repeat;
      if (opts.section) habit.sectionId = opts.section;

      const resp = await apiV2('POST', '/habits/batch', { add: [habit], update: [], delete: [] });
      out(resp);
    },

    async checkin(args: string[], opts: Record<string, string | boolean>): Promise<void> {
      const [habitId] = args;
      if (!habitId) { console.error('Usage: ticktick habits checkin <habitId> [--value N] [--date YYYYMMDD]'); process.exit(1); }

      const all = await apiV2('GET', '/habits') as Habit[] | null;
      const habit = (all || []).find(h => h.id === habitId);
      const goal = habit ? (habit.goal ?? 1.0) : 1.0;
      const value = parseFloat(String(opts.value)) || goal;

      const now = new Date();
      const stamp = opts.date ? parseInt(String(opts.date)) : parseInt(
        `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
      );

      const checkin = {
        id: randomBytes(12).toString('hex'),
        habitId,
        checkinStamp: stamp,
        checkinTime: now.toISOString().replace('Z', '.000+0000'),
        opTime: now.toISOString().replace('Z', '.000+0000'),
        value,
        goal,
        status: 2,
      };

      const resp = await apiV2('POST', '/habitCheckins/batch', { add: [checkin], update: [], delete: [] });
      out(resp);
    },

    async 'checkin-all'(args: string[], opts: Record<string, string | boolean>): Promise<void> {
      const all = await apiV2('GET', '/habits') as Habit[] | null;
      const active = (all || []).filter(h => h.status === 0);

      if (active.length === 0) {
        out({ message: 'No active habits found' });
        return;
      }

      const now = new Date();
      const stamp = parseInt(
        `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
      );

      const checkins = active.map((h: Habit) => ({
        id: randomBytes(12).toString('hex'),
        habitId: h.id,
        checkinStamp: stamp,
        checkinTime: now.toISOString().replace('Z', '.000+0000'),
        opTime: now.toISOString().replace('Z', '.000+0000'),
        value: h.goal || 1.0,
        goal: h.goal || 1.0,
        status: 2,
      }));

      const resp = await apiV2('POST', '/habitCheckins/batch', { add: checkins, update: [], delete: [] });
      out({
        checkedIn: active.map((h: Habit) => ({ id: h.id, name: h.name, streak: h.currentStreak || 0 })),
        response: resp,
      });
    },

    async history(args: string[], opts: Record<string, string | boolean>): Promise<void> {
      const ids = args;
      if (ids.length === 0) { console.error('Usage: ticktick habits history <habitId1> [habitId2...] [--after YYYYMMDD]'); process.exit(1); }
      const afterStamp = parseInt(String(opts.after)) || 0;
      const resp = await apiV2('POST', '/habitCheckins/query', { habitIds: ids, afterStamp });
      out(resp);
    },

    async archive(args: string[]): Promise<void> {
      const [id] = args;
      if (!id) { console.error('Usage: ticktick habits archive <habitId>'); process.exit(1); }
      const now = new Date().toISOString().replace('Z', '.000+0000');
      const resp = await apiV2('POST', '/habits/batch', {
        add: [], update: [{ id, status: 2, archivedTime: now, modifiedTime: now }], delete: [],
      });
      out(resp);
    },

    async delete(args: string[]): Promise<void> {
      const [id] = args;
      if (!id) { console.error('Usage: ticktick habits delete <habitId>'); process.exit(1); }
      const resp = await apiV2('POST', '/habits/batch', { add: [], update: [], delete: [id] });
      out(resp);
    },
  };

  // =============================================================================
  // Commands: User
  // =============================================================================

  const user = {
    async profile(): Promise<void> {
      out(await apiV2('GET', '/user/profile'));
    },
    async status(): Promise<void> {
      out(await apiV2('GET', '/user/status'));
    },
    async stats(): Promise<void> {
      out(await apiV2('GET', '/statistics/general'));
    },
  };

  // =============================================================================
  // Commands: Focus
  // =============================================================================

  const focus = {
    async heatmap(args: string[], opts: Record<string, string | boolean>): Promise<void> {
      const days = parseInt(String(opts.days)) || 30;
      const to = new Date();
      const from = new Date(to.getTime() - days * 86400_000);
      const fmt = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
      const data = await apiV2('GET', `/pomodoros/statistics/heatmap/${fmt(from)}/${fmt(to)}`);
      out(data);
    },

    async 'by-tag'(args: string[], opts: Record<string, string | boolean>): Promise<void> {
      const days = parseInt(String(opts.days)) || 30;
      const to = new Date();
      const from = new Date(to.getTime() - days * 86400_000);
      const fmt = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
      const data = await apiV2('GET', `/pomodoros/statistics/dist/${fmt(from)}/${fmt(to)}`);
      out(data);
    },
  };

  // =============================================================================
  // Router
  // =============================================================================

  type CommandGroup = Record<string, (args: string[], opts: Record<string, string | boolean>) => Promise<void>>;

  const COMMANDS: Record<string, CommandGroup> = { tasks, projects, folders, tags: tagsCmds, columns, habits, user: user as unknown as CommandGroup, focus };

  const cmdGroup = COMMANDS[resource];
  if (!cmdGroup) {
    console.error(`Unknown resource: ${resource}\nRun 'ticktick --help' for usage.`);
    process.exit(1);
  }

  // User commands have no args
  if (resource === 'user') {
    const fn = (user as Record<string, () => Promise<void>>)[action];
    if (!fn) { console.error(`Unknown action: ${resource} ${action}`); process.exit(1); }
    await fn();
    return;
  }

  const fn = cmdGroup[action];
  if (!fn) {
    console.error(`Unknown action: ${resource} ${action}\nRun 'ticktick --help' for usage.`);
    process.exit(1);
  }

  await fn(args, opts);
}

// =============================================================================
// Commands: Setup (parse X-Device header and save to config)
// =============================================================================

async function setupDevice(xDeviceJson: string): Promise<void> {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(xDeviceJson) as Record<string, unknown>;
  } catch (e) {
    console.error(`Error: Invalid X-Device JSON: ${(e as Error).message}`);
    console.error('Paste the full value from browser DevTools → Network → X-Device request header.');
    process.exit(1);
  }

  if (!parsed.id) {
    console.error('Error: X-Device JSON must contain an "id" field.');
    process.exit(1);
  }

  await saveConfig('ticktick', {
    deviceId: String(parsed.id),
    xDevice: JSON.stringify(parsed),
  }, true);

  out({
    ok: true,
    message: `Device info saved to config`,
    device_id: parsed.id,
    version: parsed.version,
    platform: parsed.platform,
    os: parsed.os,
    device: parsed.device,
  });
}

main().catch((err: unknown) => {
  if (err instanceof PluginError) {
    console.error(`Error [${err.code}]: ${err.message}`);
    process.exit(err.exitCode);
  }
  console.error((err as Error).message || err);
  process.exit(1);
});
