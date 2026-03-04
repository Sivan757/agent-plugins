#!/usr/bin/env node
// TickTick CLI — Direct API wrapper for AI-driven task management
// Usage: ticktick <resource> <action> [args] [--options]

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';
import { createServer } from 'http';
import { homedir, tmpdir } from 'os';

// =============================================================================
// Config
// =============================================================================

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(homedir(), '.cache', 'apex-plugin', 'ticktick.env');
const LEGACY_ENV_PATH = resolve(__dirname, '.env');
const SESSION_CACHE = join(tmpdir(), 'ticktick-session.json');
const SESSION_TTL_MS = 3600_000; // 1 hour

function findEnvPath() {
  if (existsSync(CONFIG_PATH)) return { path: CONFIG_PATH, legacy: false };
  if (existsSync(LEGACY_ENV_PATH)) return { path: LEGACY_ENV_PATH, legacy: true };
  return null;
}

let ENV_PATH; // resolved at load time

function loadEnv() {
  const result = findEnvPath();
  if (!result) {
    console.error(`Error: Config not found. Create ${CONFIG_PATH} with credentials.`);
    console.error(`  See .env.example for required fields.`);
    process.exit(1);
  }
  if (result.legacy) {
    process.stderr.write(`[ticktick] Using legacy config: ${result.path}\n`);
    process.stderr.write(`[ticktick] Migrate to ${CONFIG_PATH} for global access.\n`);
  }
  ENV_PATH = result.path;
  const lines = readFileSync(ENV_PATH, 'utf-8').split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    env[key] = val;
  }
  return env;
}

const ENV = loadEnv();
const HOST = ENV.TICKTICK_HOST || 'ticktick.com';
const API_V2 = `https://api.${HOST}/api/v2`;
const API_V1 = `https://api.${HOST}/open/v1`;

// X-Device header: prefer stored full JSON, then construct from DEVICE_ID
function buildXDevice() {
  if (ENV.TICKTICK_X_DEVICE) {
    try {
      const parsed = JSON.parse(ENV.TICKTICK_X_DEVICE);
      return JSON.stringify(parsed);
    } catch { /* fall through to construct */ }
  }
  const id = ENV.TICKTICK_DEVICE_ID || randomBytes(12).toString('hex');
  return JSON.stringify({ platform: 'web', os: 'macOS 10.15.7', device: 'Chrome 145.0.0.0', name: '', version: 8023, id, channel: 'website', campaign: '', websocket: '' });
}

const X_DEVICE = buildXDevice();
const DEVICE_ID = ENV.TICKTICK_DEVICE_ID || JSON.parse(X_DEVICE).id;

// =============================================================================
// Auth
// =============================================================================

async function getV2Token() {
  // Check cache
  if (existsSync(SESSION_CACHE)) {
    try {
      const cached = JSON.parse(readFileSync(SESSION_CACHE, 'utf-8'));
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
      username: ENV.TICKTICK_USERNAME,
      password: ENV.TICKTICK_PASSWORD,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    let msg;
    try { msg = JSON.parse(text); } catch { msg = text; }
    const code = msg?.errorCode || '';
    if (code === 'incorrect_password_too_many_times') {
      console.error('V2 auth: account temporarily locked due to too many failed attempts. Wait a few minutes and retry.');
    } else if (code === 'username_password_not_match') {
      console.error(`V2 auth: wrong username/password. Check TICKTICK_USERNAME and TICKTICK_PASSWORD in ${ENV_PATH}`);
    } else {
      console.error(`V2 auth failed (${resp.status}): ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
    }
    process.exit(1);
  }

  const data = await resp.json();
  const session = { token: data.token, inboxId: data.inboxId, userId: data.userId, ts: Date.now() };
  writeFileSync(SESSION_CACHE, JSON.stringify(session));
  return session;
}

function v1Headers() {
  return {
    'Authorization': `Bearer ${ENV.TICKTICK_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

async function v2Headers() {
  const session = await getV2Token();
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

async function v2(method, path, body) {
  const headers = await v2Headers();
  const opts = { method, headers };
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

async function v1(method, path, body) {
  const headers = v1Headers();
  const opts = { method, headers };
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

let _syncCache = null;
async function sync() {
  if (!_syncCache) _syncCache = await v2('GET', '/batch/check/0');
  return _syncCache;
}

// =============================================================================
// Output helpers
// =============================================================================

function out(data) {
  console.log(JSON.stringify(data, null, 2));
}

function priorityLabel(p) {
  return { 0: 'none', 1: 'low', 3: 'medium', 5: 'high' }[p] || 'none';
}

function parsePriority(s) {
  if (!s) return undefined;
  const map = { none: 0, low: 1, medium: 3, high: 5 };
  return map[s.toLowerCase()] ?? parseInt(s);
}

function formatDate(d) {
  if (!d) return null;
  return d.replace(/\.000\+0000$/, 'Z');
}

function taskSummary(t) {
  const summary = {
    id: t.id,
    projectId: t.projectId,
    title: t.title,
    priority: priorityLabel(t.priority),
    status: t.status === 0 ? 'active' : t.status === 2 ? 'completed' : t.status === -1 ? 'abandoned' : t.status,
    dueDate: formatDate(t.dueDate),
    tags: t.tags || [],
    parentId: t.parentId || null,
  };
  if (t.kind === 'CHECKLIST' && t.items?.length) {
    summary.checklistCount = t.items.length;
    summary.checklistDone = t.items.filter(i => i.status !== 0).length;
  }
  if (t.childIds?.length) {
    summary.subtaskCount = t.childIds.length;
  }
  return summary;
}

function projectSummary(p) {
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
// CLI Argument Parsing
// =============================================================================

function parseArgs(argv) {
  const args = [];
  const opts = {};
  let i = 0;
  while (i < argv.length) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
        opts[key] = argv[++i];
      } else {
        opts[key] = true;
      }
    } else {
      args.push(argv[i]);
    }
    i++;
  }
  return { args, opts };
}

// =============================================================================
// Commands: Tasks
// =============================================================================

const tasks = {
  async list(args, opts) {
    const state = await sync();
    let allTasks = [];
    const projectMap = {};

    for (const pg of (state.projectGroups || [])) {
      // folders
    }
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
      const days = parseInt(opts.days) || 7;
      const limit = parseInt(opts.limit) || 100;
      const to = new Date();
      const from = new Date(to.getTime() - days * 86400_000);
      const fmt = d => d.toISOString().replace('T', ' ').slice(0, 19);
      const data = await v2('GET', `/project/all/closed?from=${encodeURIComponent(fmt(from))}&to=${encodeURIComponent(fmt(to))}&status=Completed&limit=${limit}`);
      out(data.map(taskSummary));
      return;
    } else if (opts.project) {
      allTasks = allTasks.filter(t => t.projectId === opts.project);
    } else if (opts.tag) {
      allTasks = allTasks.filter(t => (t.tags || []).includes(opts.tag));
    } else if (opts.priority) {
      const p = parsePriority(opts.priority);
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
      const grouped = {};
      for (const t of result) {
        (grouped[t.projectName] ??= []).push(t);
      }
      out(grouped);
    } else {
      out(result);
    }
  },

  async get(args) {
    const [taskId, projectId] = args;
    if (!taskId || !projectId) { console.error('Usage: ticktick tasks get <taskId> <projectId>'); process.exit(1); }
    const data = await v1('GET', `/project/${projectId}/task/${taskId}`);
    out(taskSummary(data));
  },

  async create(args, opts) {
    const [title] = args;
    if (!title) { console.error('Usage: ticktick tasks create <title> [--project ID] [--priority low|medium|high] [--due DATE] [--tags tag1,tag2] [--content TEXT]'); process.exit(1); }
    const session = await getV2Token();
    const task = {
      title,
      projectId: opts.project || session.inboxId,
    };
    if (opts.priority) task.priority = parsePriority(opts.priority);
    if (opts.due) task.dueDate = new Date(opts.due).toISOString().replace('Z', '.000+0000');
    if (opts.tags) task.tags = opts.tags.split(',').map(s => s.trim());
    if (opts.content) task.content = opts.content;
    if (opts['all-day'] !== undefined) task.isAllDay = true;
    const parentId = opts.parent;

    const resp = await v2('POST', '/batch/task', { add: [task], update: [], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
    // Auto-link subtask if --parent was specified (parentId in create payload doesn't auto-link)
    if (parentId && resp?.id2etag) {
      const createdId = Object.keys(resp.id2etag)[0];
      if (createdId) {
        await v2('POST', '/batch/taskParent', [{ taskId: createdId, projectId: task.projectId, parentId }]);
      }
    }
    out(resp);
  },

  async 'quick-add'(args, opts) {
    const text = args.join(' ');
    if (!text) { console.error('Usage: ticktick tasks quick-add <text>'); process.exit(1); }
    const session = await getV2Token();
    const task = { title: text, projectId: opts.project || session.inboxId };
    const resp = await v2('POST', '/batch/task', { add: [task], update: [], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
    out(resp);
  },

  async update(args, opts) {
    const [taskId, projectId] = args;
    if (!taskId || !projectId) { console.error('Usage: ticktick tasks update <taskId> <projectId> [--title T] [--priority P] [--due D] [--tags T] [--content C]'); process.exit(1); }
    const update = { id: taskId, projectId };
    if (opts.title) update.title = opts.title;
    if (opts.priority) update.priority = parsePriority(opts.priority);
    if (opts.due) update.dueDate = new Date(opts.due).toISOString().replace('Z', '.000+0000');
    if (opts.tags) update.tags = opts.tags.split(',').map(s => s.trim());
    if (opts.content) update.content = opts.content;
    if (opts.column) update.columnId = opts.column;

    const resp = await v2('POST', '/batch/task', { add: [], update: [update], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
    out(resp);
  },

  async complete(args) {
    const [taskId, projectId] = args;
    if (!taskId || !projectId) { console.error('Usage: ticktick tasks complete <taskId> <projectId>'); process.exit(1); }
    await v1('POST', `/project/${projectId}/task/${taskId}/complete`);
    out({ ok: true, taskId, projectId });
  },

  async delete(args) {
    const [taskId, projectId] = args;
    if (!taskId || !projectId) { console.error('Usage: ticktick tasks delete <taskId> <projectId>'); process.exit(1); }
    await v1('DELETE', `/project/${projectId}/task/${taskId}`);
    out({ ok: true, deleted: taskId });
  },

  async move(args) {
    const [taskId, fromProject, toProject] = args;
    if (!taskId || !fromProject || !toProject) { console.error('Usage: ticktick tasks move <taskId> <fromProjectId> <toProjectId>'); process.exit(1); }
    const resp = await v2('POST', '/batch/taskProject', [{ taskId, fromProjectId: fromProject, toProjectId: toProject }]);
    out(resp);
  },

  // --- Subtask (子任务) operations ---

  async 'set-parent'(args) {
    const [taskId, projectId, parentId] = args;
    if (!taskId || !projectId || !parentId) { console.error('Usage: ticktick tasks set-parent <taskId> <projectId> <parentId>'); process.exit(1); }
    const resp = await v2('POST', '/batch/taskParent', [{ taskId, projectId, parentId }]);
    out(resp ?? { ok: true, taskId, parentId });
  },

  async 'unset-parent'(args) {
    const [taskId, projectId, oldParentId] = args;
    if (!taskId || !projectId || !oldParentId) { console.error('Usage: ticktick tasks unset-parent <taskId> <projectId> <oldParentId>'); process.exit(1); }
    const resp = await v2('POST', '/batch/taskParent', [{ taskId, projectId, oldParentId }]);
    out(resp ?? { ok: true, taskId, detached: oldParentId });
  },

  async subtasks(args) {
    const [parentId] = args;
    if (!parentId) { console.error('Usage: ticktick tasks subtasks <parentTaskId>'); process.exit(1); }
    const state = await sync();
    const allTasks = state.syncTaskBean?.update || [];
    const parent = allTasks.find(t => t.id === parentId);
    if (!parent) { console.error(`Task ${parentId} not found`); process.exit(1); }
    const children = (parent.childIds || []).map(cid => allTasks.find(t => t.id === cid)).filter(Boolean);
    out({
      parent: { id: parent.id, title: parent.title },
      subtasks: children.map(taskSummary),
    });
  },

  // --- Checklist (清单项) operations ---

  async checklist(args) {
    const [taskId] = args;
    if (!taskId) { console.error('Usage: ticktick tasks checklist <taskId>'); process.exit(1); }
    const state = await sync();
    const task = (state.syncTaskBean?.update || []).find(t => t.id === taskId);
    if (!task) { console.error(`Task ${taskId} not found`); process.exit(1); }
    out({
      task: { id: task.id, title: task.title, kind: task.kind },
      items: (task.items || []).map(i => ({
        id: i.id,
        title: i.title,
        status: i.status === 0 ? 'unchecked' : 'checked',
        sortOrder: i.sortOrder,
      })),
    });
  },

  async 'checklist-add'(args, opts) {
    const [taskId, ...titleParts] = args;
    const title = titleParts.join(' ') || opts.title;
    if (!taskId || !title) { console.error('Usage: ticktick tasks checklist-add <taskId> <title>'); process.exit(1); }
    const state = await sync();
    const task = (state.syncTaskBean?.update || []).find(t => t.id === taskId);
    if (!task) { console.error(`Task ${taskId} not found`); process.exit(1); }
    const items = task.items || [];
    const maxSort = items.length > 0 ? Math.max(...items.map(i => i.sortOrder || 0)) : -1048576;
    const newItem = {
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
    const resp = await v2('POST', '/batch/task', { add: [], update: [task], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
    out({ ok: true, addedItem: { id: newItem.id, title: newItem.title }, response: resp });
  },

  async 'checklist-check'(args) {
    const [taskId, itemId] = args;
    if (!taskId || !itemId) { console.error('Usage: ticktick tasks checklist-check <taskId> <itemId>'); process.exit(1); }
    const state = await sync();
    const task = (state.syncTaskBean?.update || []).find(t => t.id === taskId);
    if (!task) { console.error(`Task ${taskId} not found`); process.exit(1); }
    const item = (task.items || []).find(i => i.id === itemId);
    if (!item) { console.error(`Item ${itemId} not found in task`); process.exit(1); }
    item.status = 1;
    item.completedTime = new Date().toISOString().replace('Z', '.000+0000');
    const resp = await v2('POST', '/batch/task', { add: [], update: [task], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
    out({ ok: true, checked: item.title, response: resp });
  },

  async 'checklist-uncheck'(args) {
    const [taskId, itemId] = args;
    if (!taskId || !itemId) { console.error('Usage: ticktick tasks checklist-uncheck <taskId> <itemId>'); process.exit(1); }
    const state = await sync();
    const task = (state.syncTaskBean?.update || []).find(t => t.id === taskId);
    if (!task) { console.error(`Task ${taskId} not found`); process.exit(1); }
    const item = (task.items || []).find(i => i.id === itemId);
    if (!item) { console.error(`Item ${itemId} not found in task`); process.exit(1); }
    item.status = 0;
    item.completedTime = null;
    const resp = await v2('POST', '/batch/task', { add: [], update: [task], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
    out({ ok: true, unchecked: item.title, response: resp });
  },

  async 'checklist-remove'(args) {
    const [taskId, itemId] = args;
    if (!taskId || !itemId) { console.error('Usage: ticktick tasks checklist-remove <taskId> <itemId>'); process.exit(1); }
    const state = await sync();
    const task = (state.syncTaskBean?.update || []).find(t => t.id === taskId);
    if (!task) { console.error(`Task ${taskId} not found`); process.exit(1); }
    const removed = (task.items || []).find(i => i.id === itemId);
    task.items = (task.items || []).filter(i => i.id !== itemId);
    const resp = await v2('POST', '/batch/task', { add: [], update: [task], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
    out({ ok: true, removed: removed?.title, response: resp });
  },

  async 'checklist-rename'(args) {
    const [taskId, itemId, ...titleParts] = args;
    const newTitle = titleParts.join(' ');
    if (!taskId || !itemId || !newTitle) { console.error('Usage: ticktick tasks checklist-rename <taskId> <itemId> <newTitle>'); process.exit(1); }
    const state = await sync();
    const task = (state.syncTaskBean?.update || []).find(t => t.id === taskId);
    if (!task) { console.error(`Task ${taskId} not found`); process.exit(1); }
    const item = (task.items || []).find(i => i.id === itemId);
    if (!item) { console.error(`Item ${itemId} not found in task`); process.exit(1); }
    const oldTitle = item.title;
    item.title = newTitle;
    const resp = await v2('POST', '/batch/task', { add: [], update: [task], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
    out({ ok: true, renamed: { from: oldTitle, to: newTitle }, response: resp });
  },

  async search(args) {
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

  async 'batch-create'(args, opts) {
    // Read JSON array from --json flag or stdin
    let items;
    if (opts.json) {
      items = JSON.parse(opts.json);
    } else {
      const input = readFileSync(0, 'utf-8');
      items = JSON.parse(input);
    }
    const session = await getV2Token();
    const tasks = items.map(t => ({
      title: t.title,
      projectId: t.projectId || t.project_id || session.inboxId,
      priority: t.priority !== undefined ? parsePriority(String(t.priority)) : undefined,
      dueDate: t.dueDate || t.due_date ? new Date(t.dueDate || t.due_date).toISOString().replace('Z', '.000+0000') : undefined,
      tags: t.tags,
      content: t.content,
      parentId: t.parentId || t.parent_id,
    }));
    const resp = await v2('POST', '/batch/task', { add: tasks, update: [], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
    out(resp);
  },

  async 'batch-complete'(args, opts) {
    let items;
    if (opts.json) {
      items = JSON.parse(opts.json);
    } else {
      const input = readFileSync(0, 'utf-8');
      items = JSON.parse(input);
    }
    const results = [];
    for (const [taskId, projectId] of items) {
      await v1('POST', `/project/${projectId}/task/${taskId}/complete`);
      results.push({ ok: true, taskId, projectId });
    }
    out(results);
  },

  async 'batch-delete'(args, opts) {
    let items;
    if (opts.json) {
      items = JSON.parse(opts.json);
    } else {
      const input = readFileSync(0, 'utf-8');
      items = JSON.parse(input);
    }
    const results = [];
    for (const [taskId, projectId] of items) {
      await v1('DELETE', `/project/${projectId}/task/${taskId}`);
      results.push({ ok: true, taskId, projectId });
    }
    out(results);
  },
};

// =============================================================================
// Commands: Projects
// =============================================================================

const projects = {
  async list() {
    const data = await v1('GET', '/project');
    out(data.map(projectSummary));
  },

  async get(args) {
    const [id] = args;
    if (!id) { console.error('Usage: ticktick projects get <projectId>'); process.exit(1); }
    const data = await v1('GET', `/project/${id}/data`);
    out({
      project: projectSummary(data.project),
      tasks: (data.tasks || []).map(taskSummary),
      columns: data.columns || [],
    });
  },

  async create(args, opts) {
    const [name] = args;
    if (!name) { console.error('Usage: ticktick projects create <name> [--color HEX] [--view list|kanban|timeline] [--kind TASK|NOTE]'); process.exit(1); }
    const project = { name };
    if (opts.color) project.color = opts.color;
    if (opts.view) project.viewMode = opts.view;
    if (opts.kind) project.kind = opts.kind;
    if (opts.folder) project.groupId = opts.folder;
    const data = await v1('POST', '/project', project);
    out(projectSummary(data));
  },

  async update(args, opts) {
    const [id] = args;
    if (!id) { console.error('Usage: ticktick projects update <projectId> [--name N] [--color HEX]'); process.exit(1); }
    const update = {};
    if (opts.name) update.name = opts.name;
    if (opts.color) update.color = opts.color;
    const data = await v1('POST', `/project/${id}`, update);
    out(projectSummary(data));
  },

  async delete(args) {
    const [id] = args;
    if (!id) { console.error('Usage: ticktick projects delete <projectId>'); process.exit(1); }
    await v1('DELETE', `/project/${id}`);
    out({ ok: true, deleted: id });
  },
};

// =============================================================================
// Commands: Folders
// =============================================================================

const folders = {
  async list() {
    const state = await sync();
    out(state.projectGroups || []);
  },

  async create(args) {
    const [name] = args;
    if (!name) { console.error('Usage: ticktick folders create <name>'); process.exit(1); }
    const resp = await v2('POST', '/batch/projectGroup', {
      add: [{ name, listType: 'group' }], update: [], delete: [],
    });
    out(resp);
  },

  async rename(args) {
    const [id, name] = args;
    if (!id || !name) { console.error('Usage: ticktick folders rename <folderId> <newName>'); process.exit(1); }
    const resp = await v2('POST', '/batch/projectGroup', {
      add: [], update: [{ id, name, listType: 'group' }], delete: [],
    });
    out(resp);
  },

  async delete(args) {
    const [id] = args;
    if (!id) { console.error('Usage: ticktick folders delete <folderId>'); process.exit(1); }
    const resp = await v2('POST', '/batch/projectGroup', { add: [], update: [], delete: [id] });
    out(resp);
  },
};

// =============================================================================
// Commands: Tags
// =============================================================================

const tagsCmds = {
  async list() {
    const state = await sync();
    out((state.tags || []).map(t => ({
      name: t.name,
      label: t.label,
      color: t.color,
      parent: t.parent || null,
    })));
  },

  async create(args, opts) {
    const [name] = args;
    if (!name) { console.error('Usage: ticktick tags create <name> [--color HEX] [--parent NAME]'); process.exit(1); }
    const tag = { label: name, name: name.toLowerCase() };
    if (opts.color) tag.color = opts.color;
    if (opts.parent) tag.parent = opts.parent;
    const resp = await v2('POST', '/batch/tag', { add: [tag], update: [] });
    out(resp);
  },

  async update(args, opts) {
    const [name] = args;
    if (!name) { console.error('Usage: ticktick tags update <name> [--color HEX] [--parent NAME]'); process.exit(1); }
    const tag = { name: name.toLowerCase(), label: name, rawName: name };
    if (opts.color) tag.color = opts.color;
    if (opts.parent) tag.parent = opts.parent;
    const resp = await v2('POST', '/batch/tag', { add: [], update: [tag] });
    out(resp);
  },

  async rename(args) {
    const [oldName, newName] = args;
    if (!oldName || !newName) { console.error('Usage: ticktick tags rename <oldName> <newName>'); process.exit(1); }
    const resp = await v2('PUT', '/tag/rename', { name: oldName.toLowerCase(), newName });
    out(resp ?? { ok: true, renamed: `${oldName} -> ${newName}` });
  },

  async merge(args) {
    const [source, target] = args;
    if (!source || !target) { console.error('Usage: ticktick tags merge <source> <target>'); process.exit(1); }
    const resp = await v2('PUT', '/tag/merge', { name: source.toLowerCase(), newName: target.toLowerCase() });
    out(resp ?? { ok: true, merged: `${source} -> ${target}` });
  },

  async delete(args) {
    const [name] = args;
    if (!name) { console.error('Usage: ticktick tags delete <name>'); process.exit(1); }
    const resp = await v2('DELETE', `/tag?name=${encodeURIComponent(name.toLowerCase())}`);
    out(resp ?? { ok: true, deleted: name });
  },
};

// =============================================================================
// Commands: Columns
// =============================================================================

const columns = {
  async list(args) {
    const [projectId] = args;
    if (!projectId) { console.error('Usage: ticktick columns list <projectId>'); process.exit(1); }
    const data = await v2('GET', `/column/project/${projectId}`);
    out(data);
  },

  async create(args, opts) {
    const [projectId, name] = args;
    if (!projectId || !name) { console.error('Usage: ticktick columns create <projectId> <name>'); process.exit(1); }
    const col = { projectId, name };
    if (opts.order) col.sortOrder = parseInt(opts.order);
    const resp = await v2('POST', '/column', { add: [col], update: [], delete: [] });
    out(resp);
  },

  async update(args, opts) {
    const [colId, projectId] = args;
    if (!colId || !projectId) { console.error('Usage: ticktick columns update <columnId> <projectId> [--name N] [--order N]'); process.exit(1); }
    const update = { id: colId, projectId };
    if (opts.name) update.name = opts.name;
    if (opts.order) update.sortOrder = parseInt(opts.order);
    const resp = await v2('POST', '/column', { add: [], update: [update], delete: [] });
    out(resp);
  },

  async delete(args) {
    const [colId, projectId] = args;
    if (!colId || !projectId) { console.error('Usage: ticktick columns delete <columnId> <projectId>'); process.exit(1); }
    const resp = await v2('POST', '/column', { add: [], update: [], delete: [{ columnId: colId, projectId }] });
    out(resp);
  },
};

// =============================================================================
// Commands: Habits
// =============================================================================

const habits = {
  async list(args, opts) {
    const data = await v2('GET', '/habits');
    let list = data || [];
    if (opts.active) list = list.filter(h => h.status === 0);
    if (opts.archived) list = list.filter(h => h.status === 2);
    out(list.map(h => ({
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

  async get(args) {
    const [id] = args;
    if (!id) { console.error('Usage: ticktick habits get <habitId>'); process.exit(1); }
    const all = await v2('GET', '/habits');
    const habit = (all || []).find(h => h.id === id);
    if (!habit) { console.error(`Habit ${id} not found`); process.exit(1); }
    out(habit);
  },

  async create(args, opts) {
    const [name] = args;
    if (!name) { console.error('Usage: ticktick habits create <name> [--type boolean|real] [--goal N] [--step N] [--unit TEXT] [--color HEX] [--reminder HH:MM]'); process.exit(1); }
    const now = new Date().toISOString().replace('Z', '.000+0000');
    const habit = {
      id: randomBytes(12).toString('hex'),
      name,
      type: (opts.type || 'Boolean').charAt(0).toUpperCase() + (opts.type || 'Boolean').slice(1).toLowerCase(),
      goal: parseFloat(opts.goal) || 1.0,
      step: parseFloat(opts.step) || 0,
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

    const resp = await v2('POST', '/habits/batch', { add: [habit], update: [], delete: [] });
    out(resp);
  },

  async checkin(args, opts) {
    const [habitId] = args;
    if (!habitId) { console.error('Usage: ticktick habits checkin <habitId> [--value N] [--date YYYYMMDD]'); process.exit(1); }

    const all = await v2('GET', '/habits');
    const habit = (all || []).find(h => h.id === habitId);
    const goal = habit ? habit.goal : 1.0;
    const value = parseFloat(opts.value) || goal;

    const now = new Date();
    const stamp = opts.date ? parseInt(opts.date) : parseInt(
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

    const resp = await v2('POST', '/habitCheckins/batch', { add: [checkin], update: [], delete: [] });
    out(resp);
  },

  async 'checkin-all'(args, opts) {
    const all = await v2('GET', '/habits');
    const active = (all || []).filter(h => h.status === 0);

    if (active.length === 0) {
      out({ message: 'No active habits found' });
      return;
    }

    const now = new Date();
    const stamp = parseInt(
      `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
    );

    const checkins = active.map(h => ({
      id: randomBytes(12).toString('hex'),
      habitId: h.id,
      checkinStamp: stamp,
      checkinTime: now.toISOString().replace('Z', '.000+0000'),
      opTime: now.toISOString().replace('Z', '.000+0000'),
      value: h.goal || 1.0,
      goal: h.goal || 1.0,
      status: 2,
    }));

    const resp = await v2('POST', '/habitCheckins/batch', { add: checkins, update: [], delete: [] });
    out({
      checkedIn: active.map(h => ({ id: h.id, name: h.name, streak: h.currentStreak || 0 })),
      response: resp,
    });
  },

  async history(args, opts) {
    const ids = args;
    if (ids.length === 0) { console.error('Usage: ticktick habits history <habitId1> [habitId2...] [--after YYYYMMDD]'); process.exit(1); }
    const afterStamp = parseInt(opts.after) || 0;
    const resp = await v2('POST', '/habitCheckins/query', { habitIds: ids, afterStamp });
    out(resp);
  },

  async archive(args) {
    const [id] = args;
    if (!id) { console.error('Usage: ticktick habits archive <habitId>'); process.exit(1); }
    const now = new Date().toISOString().replace('Z', '.000+0000');
    const resp = await v2('POST', '/habits/batch', {
      add: [], update: [{ id, status: 2, archivedTime: now, modifiedTime: now }], delete: [],
    });
    out(resp);
  },

  async delete(args) {
    const [id] = args;
    if (!id) { console.error('Usage: ticktick habits delete <habitId>'); process.exit(1); }
    const resp = await v2('POST', '/habits/batch', { add: [], update: [], delete: [id] });
    out(resp);
  },
};

// =============================================================================
// Commands: User
// =============================================================================

const user = {
  async profile() {
    out(await v2('GET', '/user/profile'));
  },
  async status() {
    out(await v2('GET', '/user/status'));
  },
  async stats() {
    out(await v2('GET', '/statistics/general'));
  },
};

// =============================================================================
// Commands: Focus
// =============================================================================

const focus = {
  async heatmap(args, opts) {
    const days = parseInt(opts.days) || 30;
    const to = new Date();
    const from = new Date(to.getTime() - days * 86400_000);
    const fmt = d => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const data = await v2('GET', `/pomodoros/statistics/heatmap/${fmt(from)}/${fmt(to)}`);
    out(data);
  },

  async 'by-tag'(args, opts) {
    const days = parseInt(opts.days) || 30;
    const to = new Date();
    const from = new Date(to.getTime() - days * 86400_000);
    const fmt = d => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const data = await v2('GET', `/pomodoros/statistics/dist/${fmt(from)}/${fmt(to)}`);
    out(data);
  },
};

// =============================================================================
// Commands: Sync
// =============================================================================

const syncCmd = {
  async run() {
    out(await sync());
  },
};

// =============================================================================
// Commands: Setup (parse X-Device header and save to config)
// =============================================================================

function upsertEnvField(content, key, value) {
  const re = new RegExp(`^${key}=.*$`, 'm');
  if (re.test(content)) {
    return content.replace(re, `${key}=${value}`);
  }
  return content.trimEnd() + `\n${key}=${value}\n`;
}

function setupDevice(xDeviceJson) {
  let parsed;
  try {
    parsed = JSON.parse(xDeviceJson);
  } catch (e) {
    console.error(`Error: Invalid X-Device JSON: ${e.message}`);
    console.error('Paste the full value from browser DevTools → Network → X-Device request header.');
    process.exit(1);
  }

  if (!parsed.id) {
    console.error('Error: X-Device JSON must contain an "id" field.');
    process.exit(1);
  }

  let envContent = readFileSync(ENV_PATH, 'utf-8');
  envContent = upsertEnvField(envContent, 'TICKTICK_DEVICE_ID', parsed.id);
  envContent = upsertEnvField(envContent, 'TICKTICK_X_DEVICE', JSON.stringify(parsed));
  writeFileSync(ENV_PATH, envContent);

  out({
    ok: true,
    message: `Device info saved to ${ENV_PATH}`,
    device_id: parsed.id,
    version: parsed.version,
    platform: parsed.platform,
    os: parsed.os,
    device: parsed.device,
  });
}

// =============================================================================
// Commands: Auth (OAuth2 token acquisition)
// =============================================================================

async function authFlow() {
  const clientId = ENV.TICKTICK_CLIENT_ID;
  const clientSecret = ENV.TICKTICK_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error(`Error: TICKTICK_CLIENT_ID and TICKTICK_CLIENT_SECRET required in ${ENV_PATH}`);
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

  // Start local server to catch callback
  const { promise, resolve: done } = Promise.withResolvers();
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${REDIRECT_PORT}`);
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

    // Exchange code for token
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
      const tokenData = await tokenResp.json();
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
      res.end(`Token exchange error: ${err.message}`);
      done({ error: err.message });
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

  // Save token to .env
  const envContent = readFileSync(ENV_PATH, 'utf-8');
  const updated = envContent.replace(
    /^TICKTICK_ACCESS_TOKEN=.*$/m,
    `TICKTICK_ACCESS_TOKEN=${result.access_token}`
  );
  if (updated === envContent && !envContent.includes('TICKTICK_ACCESS_TOKEN')) {
    writeFileSync(ENV_PATH, envContent.trimEnd() + `\nTICKTICK_ACCESS_TOKEN=${result.access_token}\n`);
  } else {
    writeFileSync(ENV_PATH, updated);
  }

  out({ ok: true, message: `Access token saved to ${ENV_PATH}`, token_preview: result.access_token.slice(0, 8) + '...' });
}

// =============================================================================
// Router
// =============================================================================

const COMMANDS = { tasks, projects, folders, tags: tagsCmds, columns, habits, user, focus, sync: syncCmd };

const HELP = `TickTick CLI — AI-friendly task management

Usage: ticktick <resource> <action> [args] [--options]

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
  ticktick user stats
`;

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv[0] === 'help' || argv[0] === '--help') {
    console.log(HELP);
    return;
  }

  const resource = argv[0];
  const action = argv[1] || 'list';
  const { args, opts } = parseArgs(argv.slice(2));

  // Special case: auth opens OAuth flow
  if (resource === 'auth') {
    await authFlow();
    return;
  }

  // Special case: setup x-device <json>
  if (resource === 'setup') {
    if (action === 'x-device') {
      const json = args[0] || opts.json;
      if (!json) {
        console.error('Usage: ticktick setup x-device \'{"platform":"web",...}\'');
        console.error('Paste the X-Device header value from browser DevTools.');
        process.exit(1);
      }
      setupDevice(json);
      return;
    }
    console.error(`Unknown setup action: ${action}\nAvailable: x-device`);
    process.exit(1);
  }

  const cmdGroup = COMMANDS[resource];
  if (!cmdGroup) {
    console.error(`Unknown resource: ${resource}\nRun 'ticktick help' for usage.`);
    process.exit(1);
  }

  // Special case: sync has no subcommand
  if (resource === 'sync') {
    await syncCmd.run();
    return;
  }

  // User commands have no args
  if (resource === 'user') {
    const fn = cmdGroup[action];
    if (!fn) { console.error(`Unknown action: ${resource} ${action}`); process.exit(1); }
    await fn();
    return;
  }

  const fn = cmdGroup[action];
  if (!fn) {
    console.error(`Unknown action: ${resource} ${action}\nRun 'ticktick help' for usage.`);
    process.exit(1);
  }

  await fn(args, opts);
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
