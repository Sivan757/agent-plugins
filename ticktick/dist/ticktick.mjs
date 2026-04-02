#!/usr/bin/env node
import{createRequire as _cr}from'module';import{fileURLToPath as _fu}from'url';import{dirname as _dn}from'path';const require=_cr(import.meta.url),__filename=_fu(import.meta.url),__dirname=_dn(_fu(import.meta.url));

// src/ticktick.ts
import { readFileSync, writeFileSync, existsSync as existsSync2 } from "fs";
import { randomBytes } from "crypto";
import { createServer } from "http";
import { tmpdir } from "os";

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
async function saveConfig(pluginName, data, merge = false) {
  const path = configPath(pluginName);
  await mkdir(dirname(path), { recursive: true });
  let finalData = data;
  if (merge) {
    const existing = await loadConfig(pluginName);
    if (existing) {
      finalData = { ...existing, ...data };
    }
  }
  await writeFile(path, JSON.stringify(finalData, null, 2) + "\n", "utf-8");
}
async function requireConfig(pluginName) {
  const config = await loadConfig(pluginName);
  if (!config) {
    throw new PluginError(`No config found at ${configPath(pluginName)}. Run the plugin setup to configure credentials.`, "CONFIG_MISSING");
  }
  return config;
}

// src/ticktick.ts
var SESSION_CACHE = `${tmpdir()}/ticktick-session.json`;
var SESSION_TTL_MS = 36e5;
async function getV2Token(config, HOST, X_DEVICE) {
  const API_V2 = `https://api.${HOST}/api/v2`;
  if (existsSync2(SESSION_CACHE)) {
    try {
      const cached = JSON.parse(readFileSync(SESSION_CACHE, "utf-8"));
      if (Date.now() - cached.ts < SESSION_TTL_MS) return cached;
    } catch {
    }
  }
  const resp = await fetch(`${API_V2}/user/signon?wc=true&remember=true`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
      "X-Device": X_DEVICE
    },
    body: JSON.stringify({
      username: config.username,
      password: config.password
    })
  });
  if (!resp.ok) {
    const text = await resp.text();
    let msg;
    try {
      msg = JSON.parse(text);
    } catch {
      msg = text;
    }
    const code = (typeof msg === "object" ? msg?.errorCode : "") || "";
    if (code === "incorrect_password_too_many_times") {
      console.error("V2 auth: account temporarily locked due to too many failed attempts. Wait a few minutes and retry.");
    } else if (code === "username_password_not_match") {
      console.error(`V2 auth: wrong username/password. Check username and password in config.`);
    } else {
      console.error(`V2 auth failed (${resp.status}): ${typeof msg === "string" ? msg : JSON.stringify(msg)}`);
    }
    process.exit(1);
  }
  const data = await resp.json();
  const session = { token: data.token, inboxId: data.inboxId, userId: data.userId, ts: Date.now() };
  writeFileSync(SESSION_CACHE, JSON.stringify(session));
  return session;
}
function v1Headers(config) {
  return {
    "Authorization": `Bearer ${config.accessToken}`,
    "Content-Type": "application/json"
  };
}
async function v2Headers(config, HOST, X_DEVICE) {
  const session = await getV2Token(config, HOST, X_DEVICE);
  return {
    "Authorization": `Bearer ${session.token}`,
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
    "X-Device": X_DEVICE,
    "Cookie": `t=${session.token}`
  };
}
async function v2(method, path, body, config, API_V2, HOST, X_DEVICE) {
  const headers = await v2Headers(config, HOST, X_DEVICE);
  const opts = { method, headers };
  if (body !== void 0) opts.body = JSON.stringify(body);
  const resp = await fetch(`${API_V2}${path}`, opts);
  if (!resp.ok) {
    const text2 = await resp.text();
    console.error(`API error ${resp.status}: ${text2}`);
    process.exit(1);
  }
  const text = await resp.text();
  return text ? JSON.parse(text) : null;
}
async function v1(method, path, body, config, API_V1) {
  const headers = v1Headers(config);
  const opts = { method, headers };
  if (body !== void 0) opts.body = JSON.stringify(body);
  const resp = await fetch(`${API_V1}${path}`, opts);
  if (!resp.ok) {
    const text2 = await resp.text();
    console.error(`API error ${resp.status}: ${text2}`);
    process.exit(1);
  }
  const text = await resp.text();
  return text ? JSON.parse(text) : null;
}
function out(data) {
  console.log(JSON.stringify(data, null, 2));
}
function priorityLabel(p) {
  return { 0: "none", 1: "low", 3: "medium", 5: "high" }[p] || "none";
}
function parsePriority(s) {
  if (!s) return void 0;
  const map = { none: 0, low: 1, medium: 3, high: 5 };
  return map[s.toLowerCase()] ?? parseInt(s);
}
function formatDate(d) {
  if (!d) return null;
  return d.replace(/\.000\+0000$/, "Z");
}
function taskSummary(t) {
  const summary = {
    id: t.id,
    projectId: t.projectId,
    title: t.title,
    priority: priorityLabel(t.priority ?? 0),
    status: t.status === 0 ? "active" : t.status === 2 ? "completed" : t.status === -1 ? "abandoned" : t.status,
    dueDate: formatDate(t.dueDate),
    tags: t.tags || [],
    parentId: t.parentId || null
  };
  if (t.kind === "CHECKLIST" && t.items?.length) {
    summary.checklistCount = t.items.length;
    summary.checklistDone = t.items.filter((i) => i.status !== 0).length;
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
    folderId: p.groupId || null
  };
}
function parseArgs(argv) {
  const args = [];
  const opts = {};
  let i = 0;
  while (i < argv.length) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
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
async function main() {
  const argvEarly = process.argv.slice(2);
  if (argvEarly.length === 0 || argvEarly[0] === "help" || argvEarly[0] === "--help") {
    const HELP_EARLY = `TickTick CLI \u2014 AI-friendly task management

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
  auth        (OAuth2 token acquisition \u2014 opens browser)
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
    console.log(HELP_EARLY);
    return;
  }
  const config = await requireConfig("ticktick");
  const HOST = config.host || "ticktick.com";
  const API_V2 = `https://api.${HOST}/api/v2`;
  const API_V1 = `https://api.${HOST}/open/v1`;
  function buildXDevice() {
    if (config.xDevice) {
      try {
        const parsed = JSON.parse(config.xDevice);
        return JSON.stringify(parsed);
      } catch {
      }
    }
    const id = config.deviceId || randomBytes(12).toString("hex");
    return JSON.stringify({ platform: "web", os: "macOS 10.15.7", device: "Chrome 145.0.0.0", name: "", version: 8023, id, channel: "website", campaign: "", websocket: "" });
  }
  const X_DEVICE = buildXDevice();
  let _syncCache = null;
  async function sync() {
    if (!_syncCache) _syncCache = await v2("GET", "/batch/check/0", void 0, config, API_V2, HOST, X_DEVICE);
    return _syncCache;
  }
  async function apiV2(method, path, body) {
    return v2(method, path, body, config, API_V2, HOST, X_DEVICE);
  }
  async function apiV1(method, path, body) {
    return v1(method, path, body, config, API_V1);
  }
  async function getV2TokenBound() {
    return getV2Token(config, HOST, X_DEVICE);
  }
  const tasks = {
    async list(args2, opts2) {
      const state = await sync();
      let allTasks = [];
      const projectMap = {};
      for (const p of state.projectProfiles || []) {
        projectMap[p.id] = p.name;
      }
      for (const pg of state.syncTaskBean?.update || []) {
        allTasks.push(pg);
      }
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setDate(todayEnd.getDate() + 1);
      if (opts2.overdue) {
        allTasks = allTasks.filter((t) => t.status === 0 && t.dueDate && new Date(t.dueDate) < today);
      } else if (opts2.today) {
        allTasks = allTasks.filter((t) => {
          if (!t.dueDate) return false;
          const d = new Date(t.dueDate);
          return d >= today && d < todayEnd;
        });
      } else if (opts2.completed) {
        const days = parseInt(String(opts2.days)) || 7;
        const limit = parseInt(String(opts2.limit)) || 100;
        const to = /* @__PURE__ */ new Date();
        const from = new Date(to.getTime() - days * 864e5);
        const fmt = (d) => d.toISOString().replace("T", " ").slice(0, 19);
        const data = await apiV2("GET", `/project/all/closed?from=${encodeURIComponent(fmt(from))}&to=${encodeURIComponent(fmt(to))}&status=Completed&limit=${limit}`);
        out(data.map(taskSummary));
        return;
      } else if (opts2.project) {
        allTasks = allTasks.filter((t) => t.projectId === opts2.project);
      } else if (opts2.tag) {
        allTasks = allTasks.filter((t) => (t.tags || []).includes(String(opts2.tag)));
      } else if (opts2.priority) {
        const p = parsePriority(String(opts2.priority));
        allTasks = allTasks.filter((t) => t.priority === p);
      }
      if (!opts2.completed) {
        allTasks = allTasks.filter((t) => t.status === 0);
      }
      const result = allTasks.map((t) => ({
        ...taskSummary(t),
        projectName: projectMap[t.projectId] || t.projectId
      }));
      if (opts2["group-by-project"]) {
        const grouped = {};
        for (const t of result) {
          const projName = String(t.projectName);
          (grouped[projName] ??= []).push(t);
        }
        out(grouped);
      } else {
        out(result);
      }
    },
    async get(args2) {
      const [taskId, projectId] = args2;
      if (!taskId || !projectId) {
        console.error("Usage: ticktick tasks get <taskId> <projectId>");
        process.exit(1);
      }
      const data = await apiV1("GET", `/project/${projectId}/task/${taskId}`);
      out(taskSummary(data));
    },
    async create(args2, opts2) {
      const [title] = args2;
      if (!title) {
        console.error("Usage: ticktick tasks create <title> [--project ID] [--priority low|medium|high] [--due DATE] [--tags tag1,tag2] [--content TEXT]");
        process.exit(1);
      }
      const session = await getV2TokenBound();
      const task = {
        title,
        projectId: String(opts2.project || session.inboxId)
      };
      if (opts2.priority) task.priority = parsePriority(String(opts2.priority));
      if (opts2.due) task.dueDate = new Date(String(opts2.due)).toISOString().replace("Z", ".000+0000");
      if (opts2.tags) task.tags = String(opts2.tags).split(",").map((s) => s.trim());
      if (opts2.content) task.content = String(opts2.content);
      if (opts2["all-day"] !== void 0) task.isAllDay = true;
      const parentId = opts2.parent ? String(opts2.parent) : void 0;
      const resp = await apiV2("POST", "/batch/task", { add: [task], update: [], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
      if (parentId && resp?.id2etag) {
        const createdId = Object.keys(resp.id2etag)[0];
        if (createdId) {
          await apiV2("POST", "/batch/taskParent", [{ taskId: createdId, projectId: task.projectId, parentId }]);
        }
      }
      out(resp);
    },
    async "quick-add"(args2, opts2) {
      const text = args2.join(" ");
      if (!text) {
        console.error("Usage: ticktick tasks quick-add <text>");
        process.exit(1);
      }
      const session = await getV2TokenBound();
      const task = { title: text, projectId: String(opts2.project || session.inboxId) };
      const resp = await apiV2("POST", "/batch/task", { add: [task], update: [], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
      out(resp);
    },
    async update(args2, opts2) {
      const [taskId, projectId] = args2;
      if (!taskId || !projectId) {
        console.error("Usage: ticktick tasks update <taskId> <projectId> [--title T] [--priority P] [--due D] [--tags T] [--content C]");
        process.exit(1);
      }
      const update = { id: taskId, projectId };
      if (opts2.title) update.title = opts2.title;
      if (opts2.priority) update.priority = parsePriority(String(opts2.priority));
      if (opts2.due) update.dueDate = new Date(String(opts2.due)).toISOString().replace("Z", ".000+0000");
      if (opts2.tags) update.tags = String(opts2.tags).split(",").map((s) => s.trim());
      if (opts2.content) update.content = opts2.content;
      if (opts2.column) update.columnId = opts2.column;
      const resp = await apiV2("POST", "/batch/task", { add: [], update: [update], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
      out(resp);
    },
    async complete(args2) {
      const [taskId, projectId] = args2;
      if (!taskId || !projectId) {
        console.error("Usage: ticktick tasks complete <taskId> <projectId>");
        process.exit(1);
      }
      await apiV1("POST", `/project/${projectId}/task/${taskId}/complete`);
      out({ ok: true, taskId, projectId });
    },
    async delete(args2) {
      const [taskId, projectId] = args2;
      if (!taskId || !projectId) {
        console.error("Usage: ticktick tasks delete <taskId> <projectId>");
        process.exit(1);
      }
      await apiV1("DELETE", `/project/${projectId}/task/${taskId}`);
      out({ ok: true, deleted: taskId });
    },
    async move(args2) {
      const [taskId, fromProject, toProject] = args2;
      if (!taskId || !fromProject || !toProject) {
        console.error("Usage: ticktick tasks move <taskId> <fromProjectId> <toProjectId>");
        process.exit(1);
      }
      const resp = await apiV2("POST", "/batch/taskProject", [{ taskId, fromProjectId: fromProject, toProjectId: toProject }]);
      out(resp);
    },
    // --- Subtask (子任务) operations ---
    async "set-parent"(args2) {
      const [taskId, projectId, parentId] = args2;
      if (!taskId || !projectId || !parentId) {
        console.error("Usage: ticktick tasks set-parent <taskId> <projectId> <parentId>");
        process.exit(1);
      }
      const resp = await apiV2("POST", "/batch/taskParent", [{ taskId, projectId, parentId }]);
      out(resp ?? { ok: true, taskId, parentId });
    },
    async "unset-parent"(args2) {
      const [taskId, projectId, oldParentId] = args2;
      if (!taskId || !projectId || !oldParentId) {
        console.error("Usage: ticktick tasks unset-parent <taskId> <projectId> <oldParentId>");
        process.exit(1);
      }
      const resp = await apiV2("POST", "/batch/taskParent", [{ taskId, projectId, oldParentId }]);
      out(resp ?? { ok: true, taskId, detached: oldParentId });
    },
    async subtasks(args2) {
      const [parentId] = args2;
      if (!parentId) {
        console.error("Usage: ticktick tasks subtasks <parentTaskId>");
        process.exit(1);
      }
      const state = await sync();
      const allTasks = state.syncTaskBean?.update || [];
      const parent = allTasks.find((t) => t.id === parentId);
      if (!parent) {
        console.error(`Task ${parentId} not found`);
        process.exit(1);
      }
      const children = (parent.childIds || []).map((cid) => allTasks.find((t) => t.id === cid)).filter((t) => t !== void 0);
      out({
        parent: { id: parent.id, title: parent.title },
        subtasks: children.map(taskSummary)
      });
    },
    // --- Checklist (清单项) operations ---
    async checklist(args2) {
      const [taskId] = args2;
      if (!taskId) {
        console.error("Usage: ticktick tasks checklist <taskId>");
        process.exit(1);
      }
      const state = await sync();
      const task = (state.syncTaskBean?.update || []).find((t) => t.id === taskId);
      if (!task) {
        console.error(`Task ${taskId} not found`);
        process.exit(1);
      }
      out({
        task: { id: task.id, title: task.title, kind: task.kind },
        items: (task.items || []).map((i) => ({
          id: i.id,
          title: i.title,
          status: i.status === 0 ? "unchecked" : "checked",
          sortOrder: i.sortOrder
        }))
      });
    },
    async "checklist-add"(args2, opts2) {
      const [taskId, ...titleParts] = args2;
      const title = titleParts.join(" ") || String(opts2.title || "");
      if (!taskId || !title) {
        console.error("Usage: ticktick tasks checklist-add <taskId> <title>");
        process.exit(1);
      }
      const state = await sync();
      const task = (state.syncTaskBean?.update || []).find((t) => t.id === taskId);
      if (!task) {
        console.error(`Task ${taskId} not found`);
        process.exit(1);
      }
      const items = task.items || [];
      const maxSort = items.length > 0 ? Math.max(...items.map((i) => i.sortOrder ?? 0)) : -1048576;
      const newItem = {
        id: randomBytes(12).toString("hex"),
        status: 0,
        title,
        sortOrder: maxSort + 1048576,
        startDate: null,
        isAllDay: false,
        timeZone: task.timeZone || "Asia/Shanghai"
      };
      task.items = [...items, newItem];
      if (task.kind !== "CHECKLIST") task.kind = "CHECKLIST";
      const resp = await apiV2("POST", "/batch/task", { add: [], update: [task], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
      out({ ok: true, addedItem: { id: newItem.id, title: newItem.title }, response: resp });
    },
    async "checklist-check"(args2) {
      const [taskId, itemId] = args2;
      if (!taskId || !itemId) {
        console.error("Usage: ticktick tasks checklist-check <taskId> <itemId>");
        process.exit(1);
      }
      const state = await sync();
      const task = (state.syncTaskBean?.update || []).find((t) => t.id === taskId);
      if (!task) {
        console.error(`Task ${taskId} not found`);
        process.exit(1);
      }
      const item = (task.items || []).find((i) => i.id === itemId);
      if (!item) {
        console.error(`Item ${itemId} not found in task`);
        process.exit(1);
      }
      item.status = 1;
      item.completedTime = (/* @__PURE__ */ new Date()).toISOString().replace("Z", ".000+0000");
      const resp = await apiV2("POST", "/batch/task", { add: [], update: [task], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
      out({ ok: true, checked: item.title, response: resp });
    },
    async "checklist-uncheck"(args2) {
      const [taskId, itemId] = args2;
      if (!taskId || !itemId) {
        console.error("Usage: ticktick tasks checklist-uncheck <taskId> <itemId>");
        process.exit(1);
      }
      const state = await sync();
      const task = (state.syncTaskBean?.update || []).find((t) => t.id === taskId);
      if (!task) {
        console.error(`Task ${taskId} not found`);
        process.exit(1);
      }
      const item = (task.items || []).find((i) => i.id === itemId);
      if (!item) {
        console.error(`Item ${itemId} not found in task`);
        process.exit(1);
      }
      item.status = 0;
      item.completedTime = null;
      const resp = await apiV2("POST", "/batch/task", { add: [], update: [task], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
      out({ ok: true, unchecked: item.title, response: resp });
    },
    async "checklist-remove"(args2) {
      const [taskId, itemId] = args2;
      if (!taskId || !itemId) {
        console.error("Usage: ticktick tasks checklist-remove <taskId> <itemId>");
        process.exit(1);
      }
      const state = await sync();
      const task = (state.syncTaskBean?.update || []).find((t) => t.id === taskId);
      if (!task) {
        console.error(`Task ${taskId} not found`);
        process.exit(1);
      }
      const removed = (task.items || []).find((i) => i.id === itemId);
      task.items = (task.items || []).filter((i) => i.id !== itemId);
      const resp = await apiV2("POST", "/batch/task", { add: [], update: [task], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
      out({ ok: true, removed: removed?.title, response: resp });
    },
    async "checklist-rename"(args2) {
      const [taskId, itemId, ...titleParts] = args2;
      const newTitle = titleParts.join(" ");
      if (!taskId || !itemId || !newTitle) {
        console.error("Usage: ticktick tasks checklist-rename <taskId> <itemId> <newTitle>");
        process.exit(1);
      }
      const state = await sync();
      const task = (state.syncTaskBean?.update || []).find((t) => t.id === taskId);
      if (!task) {
        console.error(`Task ${taskId} not found`);
        process.exit(1);
      }
      const item = (task.items || []).find((i) => i.id === itemId);
      if (!item) {
        console.error(`Item ${itemId} not found in task`);
        process.exit(1);
      }
      const oldTitle = item.title;
      item.title = newTitle;
      const resp = await apiV2("POST", "/batch/task", { add: [], update: [task], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
      out({ ok: true, renamed: { from: oldTitle, to: newTitle }, response: resp });
    },
    async search(args2) {
      const query = args2.join(" ");
      if (!query) {
        console.error("Usage: ticktick tasks search <query>");
        process.exit(1);
      }
      const state = await sync();
      const allTasks = state.syncTaskBean?.update || [];
      const q = query.toLowerCase();
      const results = allTasks.filter(
        (t) => t.title && t.title.toLowerCase().includes(q) || t.content && t.content.toLowerCase().includes(q) || (t.tags || []).some((tag) => tag.toLowerCase().includes(q))
      );
      const state2 = state.projectProfiles || [];
      const projectMap = Object.fromEntries(state2.map((p) => [p.id, p.name]));
      out(results.map((t) => ({ ...taskSummary(t), projectName: projectMap[t.projectId] || t.projectId })));
    },
    async "batch-create"(args2, opts2) {
      let items;
      if (opts2.json) {
        items = JSON.parse(String(opts2.json));
      } else {
        const input = readFileSync(0, "utf-8");
        items = JSON.parse(input);
      }
      const session = await getV2TokenBound();
      const batchTasks = items.map((t) => ({
        title: t.title,
        projectId: t.projectId || t.project_id || session.inboxId,
        priority: t.priority !== void 0 ? parsePriority(String(t.priority)) : void 0,
        dueDate: t.dueDate || t.due_date ? new Date(String(t.dueDate || t.due_date)).toISOString().replace("Z", ".000+0000") : void 0,
        tags: t.tags,
        content: t.content,
        parentId: t.parentId || t.parent_id
      }));
      const resp = await apiV2("POST", "/batch/task", { add: batchTasks, update: [], delete: [], addAttachments: [], updateAttachments: [], deleteAttachments: [] });
      out(resp);
    },
    async "batch-complete"(args2, opts2) {
      let items;
      if (opts2.json) {
        items = JSON.parse(String(opts2.json));
      } else {
        const input = readFileSync(0, "utf-8");
        items = JSON.parse(input);
      }
      const results = [];
      for (const [taskId, projectId] of items) {
        await apiV1("POST", `/project/${projectId}/task/${taskId}/complete`);
        results.push({ ok: true, taskId, projectId });
      }
      out(results);
    },
    async "batch-delete"(args2, opts2) {
      let items;
      if (opts2.json) {
        items = JSON.parse(String(opts2.json));
      } else {
        const input = readFileSync(0, "utf-8");
        items = JSON.parse(input);
      }
      const results = [];
      for (const [taskId, projectId] of items) {
        await apiV1("DELETE", `/project/${projectId}/task/${taskId}`);
        results.push({ ok: true, taskId, projectId });
      }
      out(results);
    }
  };
  const projects = {
    async list() {
      const data = await apiV1("GET", "/project");
      out(data.map(projectSummary));
    },
    async get(args2) {
      const [id] = args2;
      if (!id) {
        console.error("Usage: ticktick projects get <projectId>");
        process.exit(1);
      }
      const data = await apiV1("GET", `/project/${id}/data`);
      out({
        project: projectSummary(data.project),
        tasks: (data.tasks || []).map(taskSummary),
        columns: data.columns || []
      });
    },
    async create(args2, opts2) {
      const [name] = args2;
      if (!name) {
        console.error("Usage: ticktick projects create <name> [--color HEX] [--view list|kanban|timeline] [--kind TASK|NOTE]");
        process.exit(1);
      }
      const project = { name };
      if (opts2.color) project.color = opts2.color;
      if (opts2.view) project.viewMode = opts2.view;
      if (opts2.kind) project.kind = opts2.kind;
      if (opts2.folder) project.groupId = opts2.folder;
      const data = await apiV1("POST", "/project", project);
      out(projectSummary(data));
    },
    async update(args2, opts2) {
      const [id] = args2;
      if (!id) {
        console.error("Usage: ticktick projects update <projectId> [--name N] [--color HEX]");
        process.exit(1);
      }
      const update = {};
      if (opts2.name) update.name = opts2.name;
      if (opts2.color) update.color = opts2.color;
      const data = await apiV1("POST", `/project/${id}`, update);
      out(projectSummary(data));
    },
    async delete(args2) {
      const [id] = args2;
      if (!id) {
        console.error("Usage: ticktick projects delete <projectId>");
        process.exit(1);
      }
      await apiV1("DELETE", `/project/${id}`);
      out({ ok: true, deleted: id });
    }
  };
  const folders = {
    async list() {
      const state = await sync();
      out(state.projectGroups || []);
    },
    async create(args2) {
      const [name] = args2;
      if (!name) {
        console.error("Usage: ticktick folders create <name>");
        process.exit(1);
      }
      const resp = await apiV2("POST", "/batch/projectGroup", {
        add: [{ name, listType: "group" }],
        update: [],
        delete: []
      });
      out(resp);
    },
    async rename(args2) {
      const [id, name] = args2;
      if (!id || !name) {
        console.error("Usage: ticktick folders rename <folderId> <newName>");
        process.exit(1);
      }
      const resp = await apiV2("POST", "/batch/projectGroup", {
        add: [],
        update: [{ id, name, listType: "group" }],
        delete: []
      });
      out(resp);
    },
    async delete(args2) {
      const [id] = args2;
      if (!id) {
        console.error("Usage: ticktick folders delete <folderId>");
        process.exit(1);
      }
      const resp = await apiV2("POST", "/batch/projectGroup", { add: [], update: [], delete: [id] });
      out(resp);
    }
  };
  const tagsCmds = {
    async list() {
      const state = await sync();
      out((state.tags || []).map((t) => ({
        name: t.name,
        label: t.label,
        color: t.color,
        parent: t.parent || null
      })));
    },
    async create(args2, opts2) {
      const [name] = args2;
      if (!name) {
        console.error("Usage: ticktick tags create <name> [--color HEX] [--parent NAME]");
        process.exit(1);
      }
      const tag = { label: name, name: name.toLowerCase() };
      if (opts2.color) tag.color = opts2.color;
      if (opts2.parent) tag.parent = opts2.parent;
      const resp = await apiV2("POST", "/batch/tag", { add: [tag], update: [] });
      out(resp);
    },
    async update(args2, opts2) {
      const [name] = args2;
      if (!name) {
        console.error("Usage: ticktick tags update <name> [--color HEX] [--parent NAME]");
        process.exit(1);
      }
      const tag = { name: name.toLowerCase(), label: name, rawName: name };
      if (opts2.color) tag.color = opts2.color;
      if (opts2.parent) tag.parent = opts2.parent;
      const resp = await apiV2("POST", "/batch/tag", { add: [], update: [tag] });
      out(resp);
    },
    async rename(args2) {
      const [oldName, newName] = args2;
      if (!oldName || !newName) {
        console.error("Usage: ticktick tags rename <oldName> <newName>");
        process.exit(1);
      }
      const resp = await apiV2("PUT", "/tag/rename", { name: oldName.toLowerCase(), newName });
      out(resp ?? { ok: true, renamed: `${oldName} -> ${newName}` });
    },
    async merge(args2) {
      const [source, target] = args2;
      if (!source || !target) {
        console.error("Usage: ticktick tags merge <source> <target>");
        process.exit(1);
      }
      const resp = await apiV2("PUT", "/tag/merge", { name: source.toLowerCase(), newName: target.toLowerCase() });
      out(resp ?? { ok: true, merged: `${source} -> ${target}` });
    },
    async delete(args2) {
      const [name] = args2;
      if (!name) {
        console.error("Usage: ticktick tags delete <name>");
        process.exit(1);
      }
      const resp = await apiV2("DELETE", `/tag?name=${encodeURIComponent(name.toLowerCase())}`);
      out(resp ?? { ok: true, deleted: name });
    }
  };
  const columns = {
    async list(args2) {
      const [projectId] = args2;
      if (!projectId) {
        console.error("Usage: ticktick columns list <projectId>");
        process.exit(1);
      }
      const data = await apiV2("GET", `/column/project/${projectId}`);
      out(data);
    },
    async create(args2, opts2) {
      const [projectId, name] = args2;
      if (!projectId || !name) {
        console.error("Usage: ticktick columns create <projectId> <name>");
        process.exit(1);
      }
      const col = { projectId, name };
      if (opts2.order) col.sortOrder = parseInt(String(opts2.order));
      const resp = await apiV2("POST", "/column", { add: [col], update: [], delete: [] });
      out(resp);
    },
    async update(args2, opts2) {
      const [colId, projectId] = args2;
      if (!colId || !projectId) {
        console.error("Usage: ticktick columns update <columnId> <projectId> [--name N] [--order N]");
        process.exit(1);
      }
      const update = { id: colId, projectId };
      if (opts2.name) update.name = opts2.name;
      if (opts2.order) update.sortOrder = parseInt(String(opts2.order));
      const resp = await apiV2("POST", "/column", { add: [], update: [update], delete: [] });
      out(resp);
    },
    async delete(args2) {
      const [colId, projectId] = args2;
      if (!colId || !projectId) {
        console.error("Usage: ticktick columns delete <columnId> <projectId>");
        process.exit(1);
      }
      const resp = await apiV2("POST", "/column", { add: [], update: [], delete: [{ columnId: colId, projectId }] });
      out(resp);
    }
  };
  const habits = {
    async list(args2, opts2) {
      const data = await apiV2("GET", "/habits");
      let list = data || [];
      if (opts2.active) list = list.filter((h) => h.status === 0);
      if (opts2.archived) list = list.filter((h) => h.status === 2);
      out(list.map((h) => ({
        id: h.id,
        name: h.name,
        type: h.type || "Boolean",
        goal: h.goal,
        step: h.step,
        unit: h.unit,
        status: h.status === 0 ? "active" : "archived",
        streak: h.currentStreak || 0,
        totalCheckins: h.totalCheckIns || 0,
        color: h.color
      })));
    },
    async get(args2) {
      const [id] = args2;
      if (!id) {
        console.error("Usage: ticktick habits get <habitId>");
        process.exit(1);
      }
      const all = await apiV2("GET", "/habits");
      const habit = (all || []).find((h) => h.id === id);
      if (!habit) {
        console.error(`Habit ${id} not found`);
        process.exit(1);
      }
      out(habit);
    },
    async create(args2, opts2) {
      const [name] = args2;
      if (!name) {
        console.error("Usage: ticktick habits create <name> [--type boolean|real] [--goal N] [--step N] [--unit TEXT] [--color HEX] [--reminder HH:MM]");
        process.exit(1);
      }
      const now = (/* @__PURE__ */ new Date()).toISOString().replace("Z", ".000+0000");
      const typeVal = String(opts2.type || "Boolean");
      const habit = {
        id: randomBytes(12).toString("hex"),
        name,
        type: typeVal.charAt(0).toUpperCase() + typeVal.slice(1).toLowerCase(),
        goal: parseFloat(String(opts2.goal)) || 1,
        step: parseFloat(String(opts2.step)) || 0,
        unit: opts2.unit || "Count",
        iconRes: opts2.icon || "habit_daily_check_in",
        color: opts2.color || "#97E38B",
        status: 0,
        totalCheckIns: 0,
        currentStreak: 0,
        completedCycles: 0,
        createdTime: now,
        modifiedTime: now,
        encouragement: "",
        recordEnable: false,
        exDates: [],
        style: 1,
        etag: null
      };
      if (opts2.reminder) habit.reminders = [opts2.reminder];
      if (opts2.repeat) habit.repeatRule = opts2.repeat;
      if (opts2.section) habit.sectionId = opts2.section;
      const resp = await apiV2("POST", "/habits/batch", { add: [habit], update: [], delete: [] });
      out(resp);
    },
    async checkin(args2, opts2) {
      const [habitId] = args2;
      if (!habitId) {
        console.error("Usage: ticktick habits checkin <habitId> [--value N] [--date YYYYMMDD]");
        process.exit(1);
      }
      const all = await apiV2("GET", "/habits");
      const habit = (all || []).find((h) => h.id === habitId);
      const goal = habit ? habit.goal ?? 1 : 1;
      const value = parseFloat(String(opts2.value)) || goal;
      const now = /* @__PURE__ */ new Date();
      const stamp = opts2.date ? parseInt(String(opts2.date)) : parseInt(
        `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`
      );
      const checkin = {
        id: randomBytes(12).toString("hex"),
        habitId,
        checkinStamp: stamp,
        checkinTime: now.toISOString().replace("Z", ".000+0000"),
        opTime: now.toISOString().replace("Z", ".000+0000"),
        value,
        goal,
        status: 2
      };
      const resp = await apiV2("POST", "/habitCheckins/batch", { add: [checkin], update: [], delete: [] });
      out(resp);
    },
    async "checkin-all"(args2, opts2) {
      const all = await apiV2("GET", "/habits");
      const active = (all || []).filter((h) => h.status === 0);
      if (active.length === 0) {
        out({ message: "No active habits found" });
        return;
      }
      const now = /* @__PURE__ */ new Date();
      const stamp = parseInt(
        `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`
      );
      const checkins = active.map((h) => ({
        id: randomBytes(12).toString("hex"),
        habitId: h.id,
        checkinStamp: stamp,
        checkinTime: now.toISOString().replace("Z", ".000+0000"),
        opTime: now.toISOString().replace("Z", ".000+0000"),
        value: h.goal || 1,
        goal: h.goal || 1,
        status: 2
      }));
      const resp = await apiV2("POST", "/habitCheckins/batch", { add: checkins, update: [], delete: [] });
      out({
        checkedIn: active.map((h) => ({ id: h.id, name: h.name, streak: h.currentStreak || 0 })),
        response: resp
      });
    },
    async history(args2, opts2) {
      const ids = args2;
      if (ids.length === 0) {
        console.error("Usage: ticktick habits history <habitId1> [habitId2...] [--after YYYYMMDD]");
        process.exit(1);
      }
      const afterStamp = parseInt(String(opts2.after)) || 0;
      const resp = await apiV2("POST", "/habitCheckins/query", { habitIds: ids, afterStamp });
      out(resp);
    },
    async archive(args2) {
      const [id] = args2;
      if (!id) {
        console.error("Usage: ticktick habits archive <habitId>");
        process.exit(1);
      }
      const now = (/* @__PURE__ */ new Date()).toISOString().replace("Z", ".000+0000");
      const resp = await apiV2("POST", "/habits/batch", {
        add: [],
        update: [{ id, status: 2, archivedTime: now, modifiedTime: now }],
        delete: []
      });
      out(resp);
    },
    async delete(args2) {
      const [id] = args2;
      if (!id) {
        console.error("Usage: ticktick habits delete <habitId>");
        process.exit(1);
      }
      const resp = await apiV2("POST", "/habits/batch", { add: [], update: [], delete: [id] });
      out(resp);
    }
  };
  const user = {
    async profile() {
      out(await apiV2("GET", "/user/profile"));
    },
    async status() {
      out(await apiV2("GET", "/user/status"));
    },
    async stats() {
      out(await apiV2("GET", "/statistics/general"));
    }
  };
  const focus = {
    async heatmap(args2, opts2) {
      const days = parseInt(String(opts2.days)) || 30;
      const to = /* @__PURE__ */ new Date();
      const from = new Date(to.getTime() - days * 864e5);
      const fmt = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
      const data = await apiV2("GET", `/pomodoros/statistics/heatmap/${fmt(from)}/${fmt(to)}`);
      out(data);
    },
    async "by-tag"(args2, opts2) {
      const days = parseInt(String(opts2.days)) || 30;
      const to = /* @__PURE__ */ new Date();
      const from = new Date(to.getTime() - days * 864e5);
      const fmt = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
      const data = await apiV2("GET", `/pomodoros/statistics/dist/${fmt(from)}/${fmt(to)}`);
      out(data);
    }
  };
  const syncCmd = {
    async run() {
      out(await sync());
    }
  };
  async function setupDevice(xDeviceJson) {
    let parsed;
    try {
      parsed = JSON.parse(xDeviceJson);
    } catch (e) {
      console.error(`Error: Invalid X-Device JSON: ${e.message}`);
      console.error("Paste the full value from browser DevTools \u2192 Network \u2192 X-Device request header.");
      process.exit(1);
    }
    if (!parsed.id) {
      console.error('Error: X-Device JSON must contain an "id" field.');
      process.exit(1);
    }
    await saveConfig("ticktick", {
      deviceId: String(parsed.id),
      xDevice: JSON.stringify(parsed)
    }, true);
    out({
      ok: true,
      message: `Device info saved to config`,
      device_id: parsed.id,
      version: parsed.version,
      platform: parsed.platform,
      os: parsed.os,
      device: parsed.device
    });
  }
  async function authFlow() {
    const clientId = config.clientId;
    const clientSecret = config.clientSecret;
    if (!clientId || !clientSecret) {
      console.error(`Error: clientId and clientSecret required in config`);
      console.error("Get them at https://developer." + HOST + "/manage");
      process.exit(1);
    }
    const REDIRECT_PORT = 18321;
    const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/callback`;
    const SCOPE = "tasks:read tasks:write";
    const STATE = randomBytes(8).toString("hex");
    const authUrl = `https://${HOST}/oauth/authorize?` + new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: REDIRECT_URI,
      scope: SCOPE,
      state: STATE
    }).toString();
    const { promise, resolve: done } = Promise.withResolvers();
    const server = createServer(async (req, res) => {
      const url = new URL(req.url ?? "/", `http://localhost:${REDIRECT_PORT}`);
      if (url.pathname !== "/callback") {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      if (state !== STATE) {
        res.writeHead(400);
        res.end("State mismatch \u2014 possible CSRF attack");
        done({ error: "state_mismatch" });
        return;
      }
      if (!code) {
        res.writeHead(400);
        res.end("No authorization code received");
        done({ error: "no_code" });
        return;
      }
      try {
        const tokenResp = await fetch(`https://${HOST}/oauth/token`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: REDIRECT_URI,
            scope: SCOPE
          }).toString()
        });
        const tokenData = await tokenResp.json();
        if (tokenData.access_token) {
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end("<h1>Authorization successful!</h1><p>You can close this tab.</p>");
          done({ access_token: tokenData.access_token });
        } else {
          res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
          res.end(`<h1>Token exchange failed</h1><pre>${JSON.stringify(tokenData, null, 2)}</pre>`);
          done({ error: "token_exchange_failed", details: tokenData });
        }
      } catch (err) {
        res.writeHead(500);
        res.end(`Token exchange error: ${err.message}`);
        done({ error: err.message });
      }
    });
    server.listen(REDIRECT_PORT, () => {
      console.error(`Opening browser for authorization...`);
      console.error(`If browser doesn't open, visit:
${authUrl}
`);
      import("child_process").then((cp) => cp.exec(`open "${authUrl}"`));
    });
    const result = await promise;
    server.close();
    if (result.error) {
      console.error("Authorization failed:", result.error);
      if (result.details) console.error(JSON.stringify(result.details, null, 2));
      process.exit(1);
    }
    await saveConfig("ticktick", { accessToken: result.access_token }, true);
    out({ ok: true, message: `Access token saved to config`, token_preview: (result.access_token ?? "").slice(0, 8) + "..." });
  }
  const COMMANDS = { tasks, projects, folders, tags: tagsCmds, columns, habits, user, focus, sync: syncCmd };
  const argv = argvEarly;
  const resource = argv[0];
  const action = argv[1] || "list";
  const { args, opts } = parseArgs(argv.slice(2));
  if (resource === "auth") {
    await authFlow();
    return;
  }
  if (resource === "setup") {
    if (action === "x-device") {
      const json = args[0] || String(opts.json || "");
      if (!json) {
        console.error(`Usage: ticktick setup x-device '{"platform":"web",...}'`);
        console.error("Paste the X-Device header value from browser DevTools.");
        process.exit(1);
      }
      await setupDevice(json);
      return;
    }
    console.error(`Unknown setup action: ${action}
Available: x-device`);
    process.exit(1);
  }
  const cmdGroup = COMMANDS[resource];
  if (!cmdGroup) {
    console.error(`Unknown resource: ${resource}
Run 'ticktick help' for usage.`);
    process.exit(1);
  }
  if (resource === "sync") {
    await syncCmd.run();
    return;
  }
  if (resource === "user") {
    const fn2 = user[action];
    if (!fn2) {
      console.error(`Unknown action: ${resource} ${action}`);
      process.exit(1);
    }
    await fn2();
    return;
  }
  const fn = cmdGroup[action];
  if (!fn) {
    console.error(`Unknown action: ${resource} ${action}
Run 'ticktick help' for usage.`);
    process.exit(1);
  }
  await fn(args, opts);
}
main().catch((err) => {
  if (err instanceof PluginError) {
    console.error(`Error [${err.code}]: ${err.message}`);
    process.exit(err.exitCode);
  }
  console.error(err.message || err);
  process.exit(1);
});
