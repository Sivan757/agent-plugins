#!/usr/bin/env python3
"""Fetch full prompt text from OpenNana detail API for prompts with placeholder text.

Usage: python3 fetch_opennana_details.py [batch_size] [start_offset]
"""

import json, sqlite3, subprocess, sys, time
from pathlib import Path

DB = Path.home() / '.prompt-forge' / 'prompts.db'
API = 'https://api.opennana.com/api/prompts'

def fetch_slugs(conn, limit=500, offset=0):
    """Get slugs that need detail fetching."""
    rows = conn.execute(
        "SELECT id, substr(source_url, instr(source_url, '/prompts/')+10) as slug, title "
        "FROM prompts WHERE source_type='opennana' AND prompt_text LIKE '[OpenNana:%' "
        "ORDER BY id LIMIT ? OFFSET ?", (limit, offset)
    ).fetchall()
    return [(r['id'], r['slug']) for r in rows if r['slug'] and '/' not in r['slug']]

def fetch_detail(slug):
    """Fetch detail for one slug. Returns dict or None."""
    proc = subprocess.run([
        'curl', '-s', f'{API}/{slug}',
        '-H', 'accept: */*',
        '-H', 'origin: https://opennana.com',
        '-H', 'user-agent: Mozilla/5.0',
    ], capture_output=True, text=True, timeout=15)
    try:
        d = json.loads(proc.stdout)
        data = d.get('data', {})
        if not data:
            return None
        prompts = data.get('prompts', [])
        return {
            'slug': slug,
            'prompt_text': prompts[0].get('text', '') if prompts else '',
            'model': data.get('model', ''),
            'tags': data.get('tags', []),
            'images': data.get('images', []),
            'likes': data.get('like_count', 0),
            'copies': data.get('copy_count', 0),
        }
    except Exception:
        return None

def update_db(conn, rec):
    """Update one prompt with detail data."""
    conn.execute(
        "UPDATE prompts SET prompt_text=?, tags=?, parameters=? "
        "WHERE source_type='opennana' AND source_url LIKE ? AND prompt_text LIKE '[OpenNana:%'",
        (
            rec['prompt_text'],
            json.dumps(rec['tags'], ensure_ascii=False),
            json.dumps({'model': rec['model'], 'images': rec['images'],
                        'likes': rec['likes'], 'copies': rec['copies']}),
            f'%/{rec["slug"]}%'
        )
    )

def main():
    batch = int(sys.argv[1]) if len(sys.argv) > 1 else 500
    offset = int(sys.argv[2]) if len(sys.argv) > 2 else 0

    conn = sqlite3.connect(str(DB))
    conn.row_factory = sqlite3.Row

    slugs = fetch_slugs(conn, batch, offset)
    print(f'Fetching details for {len(slugs)} prompts (offset={offset})...')

    ok = 0
    fail = 0
    for i, (db_id, slug) in enumerate(slugs):
        rec = fetch_detail(slug)
        if rec and rec['prompt_text']:
            update_db(conn, rec)
            ok += 1
        else:
            fail += 1

        if (i + 1) % 50 == 0:
            conn.commit()
            remaining = conn.execute(
                "SELECT COUNT(*) FROM prompts WHERE source_type='opennana' "
                "AND prompt_text LIKE '[OpenNana:%'").fetchone()[0]
            print(f'  {i+1}/{len(slugs)}: {ok} ok, {fail} fail, {remaining} remaining')
        time.sleep(0.15)

    conn.commit()
    remaining = conn.execute(
        "SELECT COUNT(*) FROM prompts WHERE source_type='opennana' "
        "AND prompt_text LIKE '[OpenNana:%'").fetchone()[0]
    print(f'Done. {ok} updated, {fail} failed. {remaining} still remaining.')
    conn.close()

if __name__ == '__main__':
    main()
