#!/usr/bin/env python3
"""pf CLI — Python reference implementation (Rust build pending toolchain repair)."""

import sys
import json
import sqlite3
import hashlib
import uuid
from pathlib import Path
from datetime import datetime, timezone

DB_PATH = Path.home() / ".prompt-forge" / "prompts.db"


def _now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _ensure_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    sql_file = Path(__file__).parent.parent / "src" / "migrations" / "001_init.sql"
    if sql_file.exists():
        conn.executescript(sql_file.read_text())
    conn.commit()
    return conn


def cmd_prompt_list(args):
    conn = _ensure_db()
    where = []
    params = []
    if hasattr(args, 'category') and args.category:
        where.append("category = ?")
        params.append(args.category)
    if hasattr(args, 'rating') and args.rating:
        where.append("rating >= ?")
        params.append(float(args.rating))
    limit = getattr(args, 'limit', 50)
    sql = "SELECT id, title, category, rating FROM prompts"
    if where:
        sql += " WHERE " + " AND ".join(where)
    sql += " ORDER BY rating DESC LIMIT ?"
    params.append(limit)
    for r in conn.execute(sql, params):
        print(f"{r['id'][:8]}  {r['rating']:.1f}★  {r['category']:30s}  {r['title']}")
    print(f"\n{conn.execute('SELECT COUNT(*) FROM prompts').fetchone()[0]} total prompts")
    conn.close()


def cmd_prompt_search(args):
    conn = _ensure_db()
    try:
        for r in conn.execute(
            "SELECT id, title, category, rating FROM prompts_fts WHERE prompts_fts MATCH ? ORDER BY rank LIMIT 20",
            (args.query,),
        ):
            print(f"{r['id'][:8]}  {r['rating']:.1f}★  {r['category']:30s}  {r['title']}")
    except sqlite3.OperationalError:
        for r in conn.execute(
            "SELECT id, title, category, rating FROM prompts WHERE title LIKE ? OR prompt_text LIKE ? LIMIT 20",
            (f"%{args.query}%", f"%{args.query}%"),
        ):
            print(f"{r['id'][:8]}  {r['rating']:.1f}★  {r['category']:30s}  {r['title']}")
    conn.close()


def cmd_prompt_show(args):
    conn = _ensure_db()
    r = conn.execute("SELECT * FROM prompts WHERE id = ? OR id LIKE ?", (args.id, f"{args.id}%")).fetchone()
    if r:
        for k in r.keys():
            v = r[k]
            if v and len(str(v)) > 200:
                v = str(v)[:200] + "..."
            print(f"{k}: {v}")
    else:
        print(f"Prompt {args.id} not found")
    conn.close()


def cmd_prompt_add(args):
    conn = _ensure_db()
    uid = str(uuid.uuid4())[:16]
    now = _now()
    conn.execute(
        "INSERT INTO prompts(id, title, category, prompt_text, source_type, created_at, updated_at) VALUES(?,?,?,?,?,?,?)",
        (uid, args.title, args.category or "unclassified", args.text or "", args.source or "manual", now, now),
    )
    conn.commit()
    print(f"Added: {uid}")
    conn.close()


def cmd_image_link(args):
    conn = _ensure_db()
    img_path = Path(args.image_path)
    if not img_path.exists():
        print(f"Error: {img_path} not found")
        return
    uid = str(uuid.uuid4())[:16]
    stat = img_path.stat()
    conn.execute(
        "INSERT INTO images(id, prompt_id, file_path, file_size, created_at) VALUES(?,?,?,?,?)",
        (uid, args.prompt_id, str(img_path.resolve()), stat.st_size, _now()),
    )
    conn.commit()
    print(f"Linked: {uid} -> {args.prompt_id}")
    conn.close()


def cmd_image_rate(args):
    conn = _ensure_db()
    score = int(args.score)
    if not 1 <= score <= 5:
        print("Score must be 1-5")
        return
    uid = str(uuid.uuid4())[:16]
    conn.execute(
        "INSERT INTO ratings(id, prompt_id, score, created_at) VALUES(?,?,?,?)",
        (uid, args.prompt_id, score, _now()),
    )
    avg = conn.execute("SELECT AVG(score) FROM ratings WHERE prompt_id=?", (args.prompt_id,)).fetchone()[0]
    conn.execute("UPDATE prompts SET rating=? WHERE id=? OR id LIKE ?", (avg, args.prompt_id, f"{args.prompt_id}%"))
    conn.commit()
    print(f"Rated: {args.prompt_id} = {score}/5 (avg: {avg:.1f})")
    conn.close()


def cmd_source_import(args):
    conn = _ensure_db()
    count = 0
    with open(args.file) as fh:
        for line in fh:
            rec = json.loads(line)
            text = rec.get("prompt_text", "")
            sig = hashlib.sha256(text.encode()).hexdigest()[:16]
            existing = conn.execute("SELECT id FROM prompts WHERE id LIKE ?", (f"{sig}%",)).fetchone()
            if existing:
                continue
            uid = sig + str(uuid.uuid4())[:8]
            conn.execute(
                "INSERT INTO prompts(id, title, category, prompt_text, source_url, source_type, created_at, updated_at) VALUES(?,?,?,?,?,?,?,?)",
                (uid, rec.get("title", ""), rec.get("category", "unclassified"),
                 text, rec.get("source_url", ""), rec.get("source_type", "import"), _now(), _now()),
            )
            count += 1
    conn.commit()
    print(f"Imported: {count} prompts (deduped)")
    conn.close()


def cmd_source_dedup(args):
    conn = _ensure_db()
    dups = conn.execute(
        "SELECT prompt_text, COUNT(*) as c, GROUP_CONCAT(id) as ids FROM prompts GROUP BY prompt_text HAVING c > 1"
    ).fetchall()
    removed = 0
    for r in dups:
        ids = r["ids"].split(",")
        for dup_id in ids[1:]:
            conn.execute("DELETE FROM prompts WHERE id=?", (dup_id,))
            removed += 1
    conn.commit()
    print(f"Deduped: {removed} duplicates removed from {len(dups)} groups")
    conn.close()


def cmd_serve(args):
    import http.server
    port = getattr(args, 'port', 8765)

    class Handler(http.server.SimpleHTTPRequestHandler):
        def do_GET(self):
            if self.path == "/api/stats":
                conn = _ensure_db()
                total = conn.execute("SELECT COUNT(*) FROM prompts").fetchone()[0]
                cats = {r[0]: r[1] for r in conn.execute("SELECT category, COUNT(*) FROM prompts GROUP BY category")}
                conn.close()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"total": total, "categories": cats}).encode())
                return
            super().do_GET()

    print(f"Serving on http://localhost:{port}")
    http.server.HTTPServer(("", port), Handler).serve_forever()


COMMANDS = {
    "prompt": {"list": cmd_prompt_list, "search": cmd_prompt_search, "show": cmd_prompt_show, "add": cmd_prompt_add},
    "image": {"link": cmd_image_link, "rate": cmd_image_rate},
    "source": {"import": cmd_source_import, "dedup": cmd_source_dedup},
    "serve": cmd_serve,
}


def main():
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help"):
        print("pf — Prompt Forge CLI\n")
        print("  pf prompt list [--category CAT] [--rating N] [--limit N]")
        print("  pf prompt search <query>")
        print("  pf prompt show <id>")
        print("  pf prompt add --title T --category C --text T")
        print("  pf image link <prompt_id> <image_path>")
        print("  pf image rate <prompt_id> <score>")
        print("  pf source import <file.jsonl>")
        print("  pf source dedup")
        print("  pf serve [--port N]")
        return

    # Quick argument parsing
    class Args:
        pass

    args = Args()
    args.id = None
    args.query = None
    args.title = None
    args.category = None
    args.text = None
    args.source = None
    args.prompt_id = None
    args.image_path = None
    args.score = None
    args.file = None
    args.rating = None
    args.limit = 50
    args.port = 8765

    i = 2
    while i < len(sys.argv):
        a = sys.argv[i]
        if a in ("--category",) and i + 1 < len(sys.argv):
            args.category = sys.argv[i + 1]; i += 2
        elif a in ("--rating",) and i + 1 < len(sys.argv):
            args.rating = sys.argv[i + 1]; i += 2
        elif a in ("--limit",) and i + 1 < len(sys.argv):
            args.limit = int(sys.argv[i + 1]); i += 2
        elif a in ("--title",) and i + 1 < len(sys.argv):
            args.title = sys.argv[i + 1]; i += 2
        elif a in ("--text",) and i + 1 < len(sys.argv):
            args.text = sys.argv[i + 1]; i += 2
        elif a in ("--source",) and i + 1 < len(sys.argv):
            args.source = sys.argv[i + 1]; i += 2
        elif a in ("--port",) and i + 1 < len(sys.argv):
            args.port = int(sys.argv[i + 1]); i += 2
        elif sys.argv[1] == "prompt" and sys.argv[2] in ("show",):
            args.id = a; i += 1
        elif sys.argv[1] == "prompt" and sys.argv[2] in ("search",):
            args.query = a; i += 1
        elif sys.argv[1] == "image" and sys.argv[2] == "link":
            args.prompt_id = a; i += 1
            if i < len(sys.argv):
                args.image_path = sys.argv[i]; i += 1
        elif sys.argv[1] == "image" and sys.argv[2] == "rate":
            args.prompt_id = a; i += 1
            if i < len(sys.argv):
                args.score = sys.argv[i]; i += 1
        elif sys.argv[1] == "source" and sys.argv[2] == "import":
            args.file = a; i += 1
        else:
            i += 1

    cmd = COMMANDS.get(sys.argv[1])
    if isinstance(cmd, dict):
        sub = cmd.get(sys.argv[2])
        if sub:
            sub(args)
        else:
            print(f"Unknown subcommand: {sys.argv[2]}")
    elif cmd:
        cmd(args)
    else:
        print(f"Unknown command: {sys.argv[1]}")


if __name__ == "__main__":
    main()
