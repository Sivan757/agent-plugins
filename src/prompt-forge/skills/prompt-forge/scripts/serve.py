#!/usr/bin/env python3
"""pf serve — Simple web viewer for prompt-forge database."""
import sqlite3, json
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler

DB = Path.home() / '.prompt-forge' / 'prompts.db'
PORT = 8765

HTML = """<!DOCTYPE html><html lang="zh"><head><meta charset="UTF-8"><title>Prompt Forge</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#1a1a2e;color:#eee;display:flex;height:100vh}
.sidebar{width:260px;background:#16213e;padding:20px;overflow-y:auto}
.main{flex:1;padding:30px;overflow-y:auto}
.card{background:#16213e;border-radius:8px;padding:20px;margin-bottom:15px;border:1px solid #0f3460}
.card h3{color:#e94560;margin-bottom:8px}
.card .meta{color:#888;font-size:12px;margin-bottom:10px}
.card pre{background:#0f3460;padding:12px;border-radius:4px;font-size:13px;white-space:pre-wrap;max-height:300px;overflow-y:auto}
.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;margin-right:4px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
.stat{background:#16213e;padding:16px;border-radius:8px;text-align:center}
.stat .num{font-size:28px;font-weight:bold;color:#e94560}
.stat .label{color:#888;font-size:12px;margin-top:4px}
.cat{display:flex;justify-content:space-between;padding:8px 12px;margin:4px 0;background:#0f3460;border-radius:4px;cursor:pointer}
.cat:hover{background:#1a1a4e}.cat .bar{color:#e94560;font-weight:bold}
.search{margin-bottom:20px}
.search input{width:100%;padding:10px;border-radius:6px;border:1px solid #0f3460;background:#0f3460;color:#eee;font-size:14px}
</style></head><body>
<div class="sidebar"><h2 style="color:#e94560;margin-bottom:16px">Prompt Forge</h2><div id="cats"></div></div>
<div class="main"><div class="stats" id="stats"></div>
<div class="search"><input type="text" id="q" placeholder="Search 26000+ prompts..." onkeyup="search()"></div>
<div id="results"><p style="color:#888">Enter a search term or click a category</p></div></div>
<script>
async function load(){
let r=await fetch('/api/stats');let d=await r.json();
document.getElementById('stats').innerHTML='<div class=stat><div class=num>'+d.total+'</div><div class=label>Prompts</div></div><div class=stat><div class=num>'+d.sources+'</div><div class=label>Sources</div></div><div class=stat><div class=num>'+d.patterns+'</div><div class=label>Patterns</div></div><div class=stat><div class=num>'+d.rated+'</div><div class=label>Rated</div></div>';
let cats='';
for(let[c,n]of Object.entries(d.categories).sort((a,b)=>b[1]-a[1])){
cats+='<div class=cat onclick="searchCat(\''+c+'\')"><span>'+c+'</span><span class=bar>'+n+'</span></div>';}
document.getElementById('cats').innerHTML=cats;}
async function search(){
let q=document.getElementById('q').value;if(!q)return;
let r=await fetch('/api/search?q='+encodeURIComponent(q));render(await r.json());}
async function searchCat(c){document.getElementById('q').value='';
let r=await fetch('/api/search?category='+encodeURIComponent(c));render(await r.json());}
function render(items){document.getElementById('results').innerHTML=items.map(p=>'<div class=card><h3>'+(p.title||'Untitled')+'</h3><div class=meta><span class=badge style=background:#e94560>'+p.category+'</span>'+(p.model?'<span class=badge style=background:#0f3460>'+p.model+'</span>':'')+(p.rating>0?'<span class=badge style=background:#ffc107;color:#000>'+p.rating.toFixed(1)+'</span>':'')+'<span class=badge style=background:#333>'+p.source_type+'</span></div><pre>'+((p.prompt_text||'').substring(0,500))+'</pre></div>').join('')||'<p style=color:#888>No results</p>';}
load();</script></body></html>"""

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        conn = sqlite3.connect(str(DB))
        conn.row_factory = sqlite3.Row
        try:
            if self.path.startswith('/api/stats'):
                total = conn.execute('SELECT COUNT(*) FROM prompts').fetchone()[0]
                sources = conn.execute('SELECT COUNT(DISTINCT source_type) FROM prompts').fetchone()[0]
                patterns = conn.execute('SELECT COUNT(*) FROM patterns').fetchone()[0]
                rated = conn.execute('SELECT COUNT(*) FROM prompts WHERE rating > 0').fetchone()[0]
                cats = {r[0]:r[1] for r in conn.execute('SELECT category, COUNT(*) as c FROM prompts GROUP BY category ORDER BY c DESC')}
                self._json({'total':total,'sources':sources,'patterns':patterns,'rated':rated,'categories':cats})
            elif self.path.startswith('/api/search'):
                import urllib.parse as up
                qs = up.parse_qs(up.urlparse(self.path).query)
                q = qs.get('q',[''])[0]; cat = qs.get('category',[''])[0]
                if cat:
                    rows = conn.execute("SELECT title,category,prompt_text,rating,source_type,json_extract(parameters,'$.model') as model FROM prompts WHERE category=? ORDER BY rating DESC, length(prompt_text) DESC LIMIT 50",(cat,)).fetchall()
                elif q:
                    rows = conn.execute("SELECT title,category,prompt_text,rating,source_type,json_extract(parameters,'$.model') as model FROM prompts WHERE title LIKE ? OR prompt_text LIKE ? ORDER BY rating DESC LIMIT 50",(f'%{q}%',f'%{q}%')).fetchall()
                else: rows = []
                self._json([dict(r) for r in rows])
            else:
                self.send_response(200); self.send_header('Content-Type','text/html'); self.end_headers()
                self.wfile.write(HTML.encode())
        finally: conn.close()
    def _json(self,data):
        self.send_response(200); self.send_header('Content-Type','application/json'); self.end_headers()
        self.wfile.write(json.dumps(data,ensure_ascii=False,default=str).encode())

if __name__ == '__main__':
    print(f'Prompt Forge: http://localhost:{PORT}')
    HTTPServer(('', PORT), Handler).serve_forever()
