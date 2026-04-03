/**
 * config-ui.ts — Embedded browser-based configuration form for plugins.
 *
 * Launches a local HTTP server with a schema-driven form that writes
 * credentials directly to a config file. Credentials never pass through the LLM.
 *
 * Bundled as a library — no external scripts or file searching required.
 */
import { createServer } from 'http';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { exec } from 'child_process';
import { randomBytes } from 'crypto';
import { configPath } from './config.js';
import { PluginError } from './errors.js';
import { requireConfig } from './config.js';
// ── Config read/write helpers ────────────────────────────────────────────────
function setNested(obj, dotKey, value) {
    const parts = dotKey.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!(parts[i] in cur) || typeof cur[parts[i]] !== 'object')
            cur[parts[i]] = {};
        cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
}
function getNested(obj, dotKey) {
    const parts = dotKey.split('.');
    let cur = obj;
    for (const p of parts) {
        if (cur == null || typeof cur !== 'object')
            return undefined;
        cur = cur[p];
    }
    return cur;
}
function readConfigFile(cfgPath) {
    if (!existsSync(cfgPath))
        return {};
    const raw = readFileSync(cfgPath, 'utf-8').trim();
    if (!raw)
        return {};
    try {
        return JSON.parse(raw);
    }
    catch {
        return {};
    }
}
function writeConfigFile(cfgPath, data) {
    mkdirSync(dirname(cfgPath), { recursive: true });
    const existing = readConfigFile(cfgPath);
    for (const [k, v] of Object.entries(data)) {
        if (k.includes('.')) {
            setNested(existing, k, v);
        }
        else {
            existing[k] = v;
        }
    }
    writeFileSync(cfgPath, JSON.stringify(existing, null, 2) + '\n');
}
// ── HTML escape ──────────────────────────────────────────────────────────────
function esc(s) {
    if (s == null)
        return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
// ── i18n ─────────────────────────────────────────────────────────────────────
const i18n = {
    en: {
        defaultTitle: 'Plugin Configuration',
        reset: 'Reset', save: 'Save Configuration', saving: 'Saving...',
        saved: 'Configuration Saved',
        savedHint: 'You can close this tab and return to your session.',
        failedSave: 'Failed to save', connError: 'Connection error: ',
        togglePw: 'Toggle visibility',
    },
    zh: {
        defaultTitle: '插件配置',
        reset: '重置', save: '保存配置', saving: '保存中...',
        saved: '配置已保存',
        savedHint: '你可以关闭此页面并返回会话。',
        failedSave: '保存失败', connError: '连接错误：',
        togglePw: '切换可见性',
    },
};
// ── HTML template ────────────────────────────────────────────────────────────
function buildHTML(schema, cfgPath, existing, csrfToken) {
    const title = schema.title ?? '__DEFAULT_TITLE__';
    const description = schema.description ?? '';
    const fields = schema.fields ?? [];
    const fieldRows = fields.map((f) => {
        const key = f.key;
        const label = f.label ?? key;
        const type = f.type ?? 'text';
        const required = f.required ? 'required' : '';
        const placeholder = f.placeholder ?? '';
        const help = f.help ?? '';
        const existingVal = (key.includes('.') ? getNested(existing, key) : existing[key]) ?? '';
        const defaultVal = f.default ?? '';
        const value = (existingVal || defaultVal);
        let inputHTML;
        if (type === 'select') {
            const opts = (f.options ?? []).map((o) => {
                const selected = value === o ? 'selected' : '';
                return `<option value="${esc(o)}" ${selected}>${esc(o)}</option>`;
            }).join('');
            inputHTML = `<select name="${esc(key)}" id="f-${esc(key)}" ${required} class="field-input">${opts}</select>`;
        }
        else if (type === 'textarea') {
            inputHTML = `<textarea name="${esc(key)}" id="f-${esc(key)}" ${required} placeholder="${esc(placeholder)}" class="field-input" rows="3">${esc(value)}</textarea>`;
        }
        else if (type === 'checkbox') {
            const checked = value === 'true' || value === '1' ? 'checked' : '';
            inputHTML = `<label class="checkbox-wrap"><input type="checkbox" name="${esc(key)}" id="f-${esc(key)}" value="true" ${checked} class="field-checkbox"><span class="checkbox-label">${esc(label)}</span></label>`;
        }
        else if (type === 'password') {
            const masked = existingVal ? '••••••••' : '';
            inputHTML = `<div class="password-wrap"><input type="password" name="${esc(key)}" id="f-${esc(key)}" ${required} placeholder="${masked || esc(placeholder)}" class="field-input" autocomplete="off"><button type="button" class="toggle-pw" onclick="togglePw(this)" tabindex="-1" aria-label="__TOGGLE_PW__"><svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg></button></div>`;
        }
        else {
            inputHTML = `<input type="${esc(type)}" name="${esc(key)}" id="f-${esc(key)}" value="${esc(value)}" ${required} placeholder="${esc(placeholder)}" class="field-input" autocomplete="off">`;
        }
        const labelHTML = type === 'checkbox' ? '' : `<label for="f-${esc(key)}" class="field-label">${esc(label)}${f.required ? '<span class="req">*</span>' : ''}</label>`;
        const helpHTML = help ? `<span class="field-help">${esc(help)}</span>` : '';
        const keyTag = type === 'checkbox' ? '' : `<span class="field-key">${esc(key)}</span>`;
        return `<div class="field-row" data-type="${type}">${labelHTML}${keyTag}${inputHTML}${helpHTML}</div>`;
    }).join('\n');
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} &mdash; Configuration</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=DM+Sans:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#0e1117;--surface:#161b22;--surface-hover:#1c2230;--border:#2a3140;--border-focus:#3fb950;--text:#e6edf3;--text-muted:#7d8590;--text-dim:#484f58;--accent:#3fb950;--accent-dim:rgba(63,185,80,0.15);--danger:#f85149;--radius:8px;--mono:'JetBrains Mono','Fira Code','Cascadia Code','PingFang SC','Microsoft YaHei',monospace;--sans:'DM Sans',-apple-system,BlinkMacSystemFont,'PingFang SC','Hiragino Sans GB','Microsoft YaHei','Noto Sans SC',sans-serif}
html{font-size:15px}
body{font-family:var(--sans);background:var(--bg);color:var(--text);min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:48px 20px 80px;-webkit-font-smoothing:antialiased}
body::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(63,185,80,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(63,185,80,0.02) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;z-index:0}
.container{width:100%;max-width:520px;position:relative;z-index:1;animation:fadeUp .5s ease-out}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.header{margin-bottom:36px;padding-bottom:24px;border-bottom:1px solid var(--border)}
.header-icon{width:36px;height:36px;border-radius:10px;background:var(--accent-dim);border:1px solid rgba(63,185,80,0.25);display:flex;align-items:center;justify-content:center;margin-bottom:16px}
.header-icon svg{width:18px;height:18px;color:var(--accent)}
.header h1{font-family:var(--sans);font-size:1.5rem;font-weight:600;letter-spacing:-0.02em;margin-bottom:6px}
.header p{color:var(--text-muted);font-size:0.9rem;line-height:1.5}
.config-path{display:inline-flex;align-items:center;gap:6px;margin-top:12px;padding:6px 10px;background:var(--surface);border:1px solid var(--border);border-radius:6px;font-family:var(--mono);font-size:0.72rem;color:var(--text-dim);word-break:break-all}
.config-path svg{width:12px;height:12px;color:var(--text-dim);flex-shrink:0}
.form-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:28px}
.field-row{margin-bottom:22px}.field-row:last-of-type{margin-bottom:0}
.field-label{display:block;font-size:0.85rem;font-weight:500;color:var(--text);margin-bottom:4px}
.req{color:var(--danger);margin-left:3px}
.field-key{display:block;font-family:var(--mono);font-size:0.68rem;color:var(--text-dim);margin-bottom:8px;letter-spacing:0.02em}
.field-input{width:100%;padding:10px 12px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:var(--mono);font-size:0.85rem;outline:none;transition:border-color .2s,box-shadow .2s}
.field-input:focus{border-color:var(--border-focus);box-shadow:0 0 0 3px var(--accent-dim)}
.field-input::placeholder{color:var(--text-dim);font-family:var(--mono)}
select.field-input{appearance:none;background-image:url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%237d8590' fill='none' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px;cursor:pointer}
textarea.field-input{resize:vertical;min-height:72px;line-height:1.5}
.password-wrap{position:relative}.password-wrap .field-input{padding-right:42px}
.toggle-pw{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:4px;color:var(--text-dim);transition:color .2s;display:flex;align-items:center}
.toggle-pw:hover{color:var(--text-muted)}.eye-icon{width:18px;height:18px}
.checkbox-wrap{display:flex;align-items:center;gap:10px;cursor:pointer;padding:10px 0}
.field-checkbox{width:18px;height:18px;accent-color:var(--accent);cursor:pointer}
.checkbox-label{font-size:0.85rem;color:var(--text);user-select:none}
.field-help{display:block;font-size:0.75rem;color:var(--text-dim);margin-top:6px;line-height:1.4}
.actions{display:flex;gap:12px;margin-top:28px;padding-top:24px;border-top:1px solid var(--border)}
.btn{flex:1;padding:11px 20px;border-radius:6px;font-family:var(--sans);font-size:0.85rem;font-weight:500;cursor:pointer;border:1px solid var(--border);transition:all .2s}
.btn-secondary{background:var(--surface);color:var(--text-muted)}.btn-secondary:hover{background:var(--surface-hover);color:var(--text)}
.btn-primary{background:var(--accent);color:#0e1117;border-color:var(--accent);font-weight:600}.btn-primary:hover{background:#46c358;border-color:#46c358}.btn-primary:active{transform:scale(0.98)}
.btn:disabled{opacity:0.5;cursor:not-allowed}
.status{text-align:center;padding:16px;margin-top:16px;border-radius:6px;font-size:0.85rem;display:none}
.status.error{display:block;background:rgba(248,81,73,0.1);border:1px solid rgba(248,81,73,0.3);color:var(--danger)}
.status.success{display:block;background:var(--accent-dim);border:1px solid rgba(63,185,80,0.3);color:var(--accent)}
.success-overlay{position:fixed;inset:0;background:rgba(14,17,23,0.92);display:flex;align-items:center;justify-content:center;z-index:100;opacity:0;visibility:hidden;transition:all .3s}
.success-overlay.show{opacity:1;visibility:visible}
.success-content{text-align:center;animation:successPop .4s ease-out}
@keyframes successPop{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
.success-check{width:56px;height:56px;border-radius:50%;background:var(--accent-dim);border:2px solid var(--accent);display:flex;align-items:center;justify-content:center;margin:0 auto 20px}
.success-check svg{width:28px;height:28px;color:var(--accent)}
.success-content h2{font-size:1.2rem;font-weight:600;margin-bottom:8px}
.success-content p{color:var(--text-muted);font-size:0.85rem}
@media(max-width:560px){body{padding:24px 16px 60px}.form-card{padding:20px}.actions{flex-direction:column}}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></div>
    <h1>${esc(title)}</h1>
    ${description ? `<p>${esc(description)}</p>` : ''}
    <div class="config-path"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>${esc(cfgPath)}</div>
  </div>
  <form id="configForm" class="form-card" autocomplete="off">
    <input type="hidden" name="_csrf" value="${csrfToken}">
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
    <div class="success-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
    <h2 data-i18n="saved">Configuration Saved</h2>
    <p data-i18n="savedHint">You can close this tab and return to your session.</p>
  </div>
</div>
<script>
const _i18n=${JSON.stringify(i18n)};
function _detectLang(){const n=navigator.language||'en';return n.startsWith('zh')?'zh':'en'}
const t=_i18n[_detectLang()]||_i18n.en;
document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.getAttribute('data-i18n');if(t[k])el.textContent=t[k]});
document.querySelectorAll('[aria-label="__TOGGLE_PW__"]').forEach(el=>el.setAttribute('aria-label',t.togglePw));
const h1=document.querySelector('.header h1');
if(h1&&h1.textContent==='__DEFAULT_TITLE__')h1.textContent=t.defaultTitle;
if(document.title.includes('__DEFAULT_TITLE__'))document.title=document.title.replace('__DEFAULT_TITLE__',t.defaultTitle);
function togglePw(btn){const i=btn.parentElement.querySelector('input');i.type=i.type==='password'?'text':'password'}
function resetForm(){document.getElementById('configForm').reset()}
document.getElementById('configForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const btn=document.getElementById('saveBtn'),status=document.getElementById('status');
  btn.disabled=true;btn.textContent=t.saving;status.className='status';status.style.display='none';
  const fd=new FormData(e.target),data={};
  for(const[k,v]of fd.entries()){if(k==='_csrf')continue;data[k]=v}
  e.target.querySelectorAll('input[type="checkbox"]').forEach(cb=>{if(!cb.checked)data[cb.name]='false'});
  e.target.querySelectorAll('input[type="password"]').forEach(pw=>{if(!pw.value)delete data[pw.name]});
  try{
    const resp=await fetch('/save',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':fd.get('_csrf')},body:JSON.stringify(data)});
    const result=await resp.json();
    if(result.ok){document.getElementById('successOverlay').classList.add('show');setTimeout(()=>window.close(),2000)}
    else{status.className='status error';status.textContent=result.error||t.failedSave}
  }catch(err){status.className='status error';status.textContent=t.connError+err.message}
  finally{btn.disabled=false;btn.textContent=t.save}
});
</script>
</body>
</html>`;
}
// ── Server ───────────────────────────────────────────────────────────────────
/**
 * Launch a browser-based configuration form. Starts a local HTTP server,
 * opens the browser, and resolves when the user submits or the timeout expires.
 *
 * @returns true if configuration was saved successfully
 */
export function launchConfigUI(pluginName, schema) {
    const cfgPath = configPath(pluginName);
    return new Promise((resolve) => {
        const csrfToken = randomBytes(16).toString('hex');
        const existing = readConfigFile(cfgPath);
        const server = createServer(async (req, res) => {
            if (req.method === 'GET' && req.url === '/') {
                const html = buildHTML(schema, cfgPath, existing, csrfToken);
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(html);
                return;
            }
            if (req.method === 'POST' && req.url === '/save') {
                const chunks = [];
                for await (const chunk of req)
                    chunks.push(chunk);
                const body = Buffer.concat(chunks).toString();
                try {
                    const token = req.headers['x-csrf-token'];
                    if (token !== csrfToken) {
                        res.writeHead(403, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ ok: false, error: 'Invalid CSRF token' }));
                        return;
                    }
                    const data = JSON.parse(body);
                    writeConfigFile(cfgPath, data);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: true }));
                    // Shut down after response is flushed
                    setTimeout(() => { server.close(); resolve(true); }, 500);
                }
                catch (e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: false, error: e.message }));
                }
                return;
            }
            res.writeHead(404);
            res.end('Not found');
        });
        server.listen(0, '127.0.0.1', () => {
            const addr = server.address();
            const url = `http://127.0.0.1:${addr.port}`;
            process.stderr.write(`[setup] Opening configuration form in browser...\n`);
            process.stderr.write(JSON.stringify({ url, port: addr.port }) + '\n');
            const cmd = process.platform === 'darwin' ? 'open' :
                process.platform === 'win32' ? 'start' : 'xdg-open';
            exec(`${cmd} "${url}"`, () => { });
        });
        // Timeout: auto-close after 5 minutes
        setTimeout(() => {
            server.close();
            resolve(false);
        }, 5 * 60 * 1000);
    });
}
// ── High-level config loader with auto-setup ─────────────────────────────────
/**
 * Load config with auto-setup: if config is missing or invalid, automatically
 * launches the browser config form. After the user completes setup, retries.
 *
 * @param pluginName - Plugin name used for config path resolution
 * @param schema - Config-UI schema for the setup form
 * @param validate - Optional function; return true if config needs (re-)setup
 */
export async function requireConfigWithSetup(pluginName, schema, validate) {
    let config;
    // Load config (auto-launch setup if missing)
    try {
        config = await requireConfig(pluginName);
    }
    catch (e) {
        if (e instanceof PluginError && e.code === 'CONFIG_MISSING') {
            if (await launchConfigUI(pluginName, schema)) {
                try {
                    config = await requireConfig(pluginName);
                    if (!validate || !validate(config))
                        return config;
                }
                catch { /* fall through */ }
            }
            throw new PluginError(`No config found. Run: ${pluginName} setup (or init)`, 'CONFIG_MISSING');
        }
        throw e;
    }
    // Validate (auto-launch setup if invalid)
    if (validate && validate(config)) {
        process.stderr.write(`[${pluginName}] Configuration is incomplete.\n`);
        if (await launchConfigUI(pluginName, schema)) {
            try {
                const newConfig = await requireConfig(pluginName);
                if (!validate(newConfig))
                    return newConfig;
            }
            catch { /* fall through */ }
        }
        throw new PluginError(`Invalid configuration. Run: ${pluginName} setup`, 'CONFIG_INVALID');
    }
    return config;
}
//# sourceMappingURL=config-ui.js.map