#!/usr/bin/env node

// scripts/config-ui.ts
import { createServer } from "http";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import { exec } from "child_process";
import { randomBytes } from "crypto";
var args = process.argv.slice(2);
function arg(name) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : null;
}
var configPath = arg("config");
var schemaRaw = arg("schema");
var schemaFile = arg("schema-file");
var port = parseInt(arg("port") ?? "0", 10);
if (!configPath) {
  console.error("Missing --config <path>");
  process.exit(1);
}
if (!schemaRaw && !schemaFile) {
  console.error("Missing --schema or --schema-file");
  process.exit(1);
}
var schema;
try {
  const raw = schemaRaw ?? readFileSync(schemaFile, "utf-8");
  schema = JSON.parse(raw);
} catch (e) {
  console.error(`Invalid schema: ${e.message}`);
  process.exit(1);
}
var isJson = configPath.endsWith(".json");
function readConfig(path) {
  if (!existsSync(path)) return {};
  const raw = readFileSync(path, "utf-8").trim();
  if (!raw) return {};
  if (isJson) {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  const env = {};
  for (const l of raw.split("\n")) {
    const match = l.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)/);
    if (match) env[match[1]] = match[2];
  }
  return env;
}
function setNested(obj, dotKey, value) {
  const parts = dotKey.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!(parts[i] in cur) || typeof cur[parts[i]] !== "object") cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}
function getNested(obj, dotKey) {
  const parts = dotKey.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return void 0;
    cur = cur[p];
  }
  return cur;
}
function writeConfig(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  const existing2 = readConfig(path);
  if (isJson) {
    const existingNested = existing2;
    for (const [k, v] of Object.entries(data)) {
      if (k.includes(".")) {
        setNested(existingNested, k, v);
      } else {
        existingNested[k] = v;
      }
    }
    writeFileSync(path, JSON.stringify(existingNested, null, 2) + "\n");
  } else {
    const merged = { ...existing2, ...data };
    const content = Object.entries(merged).map(([k, v]) => `${k}=${v}`).join("\n") + "\n";
    writeFileSync(path, content);
  }
}
var existing = readConfig(configPath);
var langOverride = arg("lang") ?? schema.lang ?? "";
var i18n = {
  en: {
    defaultTitle: "Plugin Configuration",
    reset: "Reset",
    save: "Save Configuration",
    saving: "Saving...",
    saved: "Configuration Saved",
    savedHint: "You can close this tab and return to your session.",
    failedSave: "Failed to save",
    connError: "Connection error: ",
    togglePw: "Toggle visibility"
  },
  zh: {
    defaultTitle: "\u63D2\u4EF6\u914D\u7F6E",
    reset: "\u91CD\u7F6E",
    save: "\u4FDD\u5B58\u914D\u7F6E",
    saving: "\u4FDD\u5B58\u4E2D...",
    saved: "\u914D\u7F6E\u5DF2\u4FDD\u5B58",
    savedHint: "\u4F60\u53EF\u4EE5\u5173\u95ED\u6B64\u9875\u9762\u5E76\u8FD4\u56DE\u4F1A\u8BDD\u3002",
    failedSave: "\u4FDD\u5B58\u5931\u8D25",
    connError: "\u8FDE\u63A5\u9519\u8BEF\uFF1A",
    togglePw: "\u5207\u6362\u53EF\u89C1\u6027"
  }
};
function buildHTML(schema2, existing2, csrfToken2) {
  const title = schema2.title ?? "__DEFAULT_TITLE__";
  const description = schema2.description ?? "";
  const fields = schema2.fields ?? [];
  const fieldRows = fields.map((f) => {
    const key = f.key;
    const label = f.label ?? key;
    const type = f.type ?? "text";
    const required = f.required ? "required" : "";
    const placeholder = f.placeholder ?? "";
    const help = f.help ?? "";
    const existingVal = (isJson && key.includes(".") ? getNested(existing2, key) : existing2[key]) ?? "";
    const defaultVal = f.default ?? "";
    const value = existingVal || defaultVal;
    let inputHTML;
    if (type === "select") {
      const opts = (f.options ?? []).map((o) => {
        const selected = value === o ? "selected" : "";
        return `<option value="${esc(o)}" ${selected}>${esc(o)}</option>`;
      }).join("");
      inputHTML = `<select name="${esc(key)}" id="f-${esc(key)}" ${required} class="field-input">${opts}</select>`;
    } else if (type === "textarea") {
      inputHTML = `<textarea name="${esc(key)}" id="f-${esc(key)}" ${required} placeholder="${esc(placeholder)}" class="field-input" rows="3">${esc(value)}</textarea>`;
    } else if (type === "checkbox") {
      const checked = value === "true" || value === "1" ? "checked" : "";
      inputHTML = `<label class="checkbox-wrap"><input type="checkbox" name="${esc(key)}" id="f-${esc(key)}" value="true" ${checked} class="field-checkbox"><span class="checkbox-label">${esc(label)}</span></label>`;
    } else if (type === "password") {
      const masked = existingVal ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : "";
      inputHTML = `
        <div class="password-wrap">
          <input type="password" name="${esc(key)}" id="f-${esc(key)}" ${required} placeholder="${masked || esc(placeholder)}" class="field-input" autocomplete="off">
          <button type="button" class="toggle-pw" onclick="togglePw(this)" tabindex="-1" aria-label="__TOGGLE_PW__">
            <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>`;
    } else {
      inputHTML = `<input type="${esc(type)}" name="${esc(key)}" id="f-${esc(key)}" value="${esc(value)}" ${required} placeholder="${esc(placeholder)}" class="field-input" autocomplete="off">`;
    }
    const labelHTML = type === "checkbox" ? "" : `<label for="f-${esc(key)}" class="field-label">${esc(label)}${f.required ? '<span class="req">*</span>' : ""}</label>`;
    const helpHTML = help ? `<span class="field-help">${esc(help)}</span>` : "";
    const keyTag = type === "checkbox" ? "" : `<span class="field-key">${esc(key)}</span>`;
    return `<div class="field-row" data-type="${type}">${labelHTML}${keyTag}${inputHTML}${helpHTML}</div>`;
  }).join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} &mdash; Configuration</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=DM+Sans:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0e1117;
    --surface: #161b22;
    --surface-hover: #1c2230;
    --border: #2a3140;
    --border-focus: #3fb950;
    --text: #e6edf3;
    --text-muted: #7d8590;
    --text-dim: #484f58;
    --accent: #3fb950;
    --accent-dim: rgba(63, 185, 80, 0.15);
    --danger: #f85149;
    --radius: 8px;
    --mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'PingFang SC', 'Microsoft YaHei', monospace;
    --sans: 'DM Sans', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
  }

  html { font-size: 15px; }

  body {
    font-family: var(--sans);
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 48px 20px 80px;
    -webkit-font-smoothing: antialiased;
  }

  /* Subtle grid background */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(63, 185, 80, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(63, 185, 80, 0.02) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  .container {
    width: 100%;
    max-width: 520px;
    position: relative;
    z-index: 1;
    animation: fadeUp 0.5s ease-out;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Header */
  .header {
    margin-bottom: 36px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border);
  }

  .header-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: var(--accent-dim);
    border: 1px solid rgba(63, 185, 80, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  .header-icon svg {
    width: 18px;
    height: 18px;
    color: var(--accent);
  }

  .header h1 {
    font-family: var(--sans);
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    margin-bottom: 6px;
  }

  .header p {
    color: var(--text-muted);
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .config-path {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 12px;
    padding: 6px 10px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    font-family: var(--mono);
    font-size: 0.72rem;
    color: var(--text-dim);
    word-break: break-all;
  }

  .config-path svg {
    width: 12px;
    height: 12px;
    color: var(--text-dim);
    flex-shrink: 0;
  }

  /* Form */
  .form-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 28px;
  }

  .field-row {
    margin-bottom: 22px;
  }

  .field-row:last-of-type {
    margin-bottom: 0;
  }

  .field-label {
    display: block;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text);
    margin-bottom: 4px;
  }

  .req {
    color: var(--danger);
    margin-left: 3px;
  }

  .field-key {
    display: block;
    font-family: var(--mono);
    font-size: 0.68rem;
    color: var(--text-dim);
    margin-bottom: 8px;
    letter-spacing: 0.02em;
  }

  .field-input {
    width: 100%;
    padding: 10px 12px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text);
    font-family: var(--mono);
    font-size: 0.85rem;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .field-input:focus {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px var(--accent-dim);
  }

  .field-input::placeholder {
    color: var(--text-dim);
    font-family: var(--mono);
  }

  select.field-input {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%237d8590' fill='none' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 32px;
    cursor: pointer;
  }

  textarea.field-input {
    resize: vertical;
    min-height: 72px;
    line-height: 1.5;
  }

  /* Password field */
  .password-wrap {
    position: relative;
  }

  .password-wrap .field-input {
    padding-right: 42px;
  }

  .toggle-pw {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: var(--text-dim);
    transition: color 0.2s;
    display: flex;
    align-items: center;
  }

  .toggle-pw:hover { color: var(--text-muted); }

  .eye-icon { width: 18px; height: 18px; }

  /* Checkbox */
  .checkbox-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 10px 0;
  }

  .field-checkbox {
    width: 18px;
    height: 18px;
    accent-color: var(--accent);
    cursor: pointer;
  }

  .checkbox-label {
    font-size: 0.85rem;
    color: var(--text);
    user-select: none;
  }

  .field-help {
    display: block;
    font-size: 0.75rem;
    color: var(--text-dim);
    margin-top: 6px;
    line-height: 1.4;
  }

  /* Divider between sections */
  .form-divider {
    border: none;
    border-top: 1px solid var(--border);
    margin: 24px 0;
  }

  /* Actions */
  .actions {
    display: flex;
    gap: 12px;
    margin-top: 28px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
  }

  .btn {
    flex: 1;
    padding: 11px 20px;
    border-radius: 6px;
    font-family: var(--sans);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid var(--border);
    transition: all 0.2s;
  }

  .btn-secondary {
    background: var(--surface);
    color: var(--text-muted);
  }

  .btn-secondary:hover {
    background: var(--surface-hover);
    color: var(--text);
  }

  .btn-primary {
    background: var(--accent);
    color: #0e1117;
    border-color: var(--accent);
    font-weight: 600;
  }

  .btn-primary:hover {
    background: #46c358;
    border-color: #46c358;
  }

  .btn-primary:active {
    transform: scale(0.98);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Status */
  .status {
    text-align: center;
    padding: 16px;
    margin-top: 16px;
    border-radius: 6px;
    font-size: 0.85rem;
    display: none;
  }

  .status.error {
    display: block;
    background: rgba(248, 81, 73, 0.1);
    border: 1px solid rgba(248, 81, 73, 0.3);
    color: var(--danger);
  }

  .status.success {
    display: block;
    background: var(--accent-dim);
    border: 1px solid rgba(63, 185, 80, 0.3);
    color: var(--accent);
  }

  /* Success overlay */
  .success-overlay {
    position: fixed;
    inset: 0;
    background: rgba(14, 17, 23, 0.92);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s;
  }

  .success-overlay.show {
    opacity: 1;
    visibility: visible;
  }

  .success-content {
    text-align: center;
    animation: successPop 0.4s ease-out;
  }

  @keyframes successPop {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }

  .success-check {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--accent-dim);
    border: 2px solid var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
  }

  .success-check svg {
    width: 28px;
    height: 28px;
    color: var(--accent);
  }

  .success-content h2 {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .success-content p {
    color: var(--text-muted);
    font-size: 0.85rem;
  }

  /* Responsive */
  @media (max-width: 560px) {
    body { padding: 24px 16px 60px; }
    .form-card { padding: 20px; }
    .actions { flex-direction: column; }
  }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="header-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
      </svg>
    </div>
    <h1>${esc(title)}</h1>
    ${description ? `<p>${esc(description)}</p>` : ""}
    <div class="config-path">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
      ${esc(configPath)}
    </div>
  </div>

  <form id="configForm" class="form-card" autocomplete="off">
    <input type="hidden" name="_csrf" value="${csrfToken2}">
    ${fieldRows}
    <div class="actions">
      <button type="button" class="btn btn-secondary" onclick="resetForm()" data-i18n="reset">Reset</button>
      <button type="submit" class="btn btn-primary" id="saveBtn" data-i18n="save">Save Configuration</button>
    </div>
  </form>

  <div id="status" class="status"></div>
</div>

<div id="successOverlay" class="success-overlay">
  <div class="success-content">
    <div class="success-check">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
    <h2 data-i18n="saved">Configuration Saved</h2>
    <p data-i18n="savedHint">You can close this tab and return to your session.</p>
  </div>
</div>

<script>
const _i18n = ${JSON.stringify(i18n)};
const _langOverride = '${esc(langOverride)}';

function _detectLang() {
  if (_langOverride) return _langOverride.startsWith('zh') ? 'zh' : 'en';
  const nav = navigator.language || navigator.userLanguage || 'en';
  return nav.startsWith('zh') ? 'zh' : 'en';
}

const _lang = _detectLang();
const t = _i18n[_lang] || _i18n.en;

// Apply i18n to all elements with data-i18n attribute
document.querySelectorAll('[data-i18n]').forEach(el => {
  const key = el.getAttribute('data-i18n');
  if (t[key]) el.textContent = t[key];
});
// Apply i18n to aria-labels
document.querySelectorAll('[aria-label="__TOGGLE_PW__"]').forEach(el => {
  el.setAttribute('aria-label', t.togglePw);
});
// Apply default title
const h1 = document.querySelector('.header h1');
if (h1 && h1.textContent === '__DEFAULT_TITLE__') h1.textContent = t.defaultTitle;
// Update page title
if (document.title.includes('__DEFAULT_TITLE__')) {
  document.title = document.title.replace('__DEFAULT_TITLE__', t.defaultTitle);
}

function togglePw(btn) {
  const input = btn.parentElement.querySelector('input');
  input.type = input.type === 'password' ? 'text' : 'password';
}

function resetForm() {
  document.getElementById('configForm').reset();
}

document.getElementById('configForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('saveBtn');
  const status = document.getElementById('status');
  btn.disabled = true;
  btn.textContent = t.saving;
  status.className = 'status';
  status.style.display = 'none';

  const fd = new FormData(e.target);
  const data = {};
  for (const [k, v] of fd.entries()) {
    if (k === '_csrf') continue;
    data[k] = v;
  }

  // Handle unchecked checkboxes
  e.target.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    if (!cb.checked) data[cb.name] = 'false';
  });

  // Skip empty password fields (keep existing value)
  e.target.querySelectorAll('input[type="password"]').forEach(pw => {
    if (!pw.value) delete data[pw.name];
  });

  try {
    const resp = await fetch('/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': fd.get('_csrf'),
      },
      body: JSON.stringify(data),
    });
    const result = await resp.json();
    if (result.ok) {
      document.getElementById('successOverlay').classList.add('show');
      setTimeout(() => window.close(), 2000);
    } else {
      status.className = 'status error';
      status.textContent = result.error || t.failedSave;
    }
  } catch (err) {
    status.className = 'status error';
    status.textContent = t.connError + err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = t.save;
  }
});
</script>
</body>
</html>`;
}
function esc(s) {
  if (s == null) return "";
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
var csrfToken = randomBytes(16).toString("hex");
var server = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    const html = buildHTML(schema, existing, csrfToken);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
    return;
  }
  if (req.method === "POST" && req.url === "/save") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString();
    try {
      const token = req.headers["x-csrf-token"];
      if (token !== csrfToken) {
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "Invalid CSRF token" }));
        return;
      }
      const data = JSON.parse(body);
      writeConfig(configPath, data);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
      console.log(JSON.stringify({ saved: true, path: configPath, fields: Object.keys(data) }));
      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 500);
    } catch (e) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
    return;
  }
  res.writeHead(404);
  res.end("Not found");
});
server.listen(port, "127.0.0.1", () => {
  const addr = server.address();
  const url = `http://127.0.0.1:${addr.port}`;
  console.log(JSON.stringify({ url, port: addr.port }));
  const cmd = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  exec(`${cmd} "${url}"`, () => {
  });
});
setTimeout(() => {
  console.error("config-ui: Timed out after 5 minutes");
  server.close();
  process.exit(1);
}, 5 * 60 * 1e3);
