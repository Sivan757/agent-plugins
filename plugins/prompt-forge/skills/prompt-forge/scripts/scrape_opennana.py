#!/usr/bin/env python3
"""Scrape prompts from OpenNana API and output JSONL for `pf source import`."""

import json
import sys
import time
import urllib.request
from pathlib import Path

API = "https://api.opennana.com/api/prompts"
HEADERS = {
    "accept": "*/*",
    "origin": "https://opennana.com",
    "referer": "https://opennana.com/",
    "user-agent": "Mozilla/5.0",
}


def fetch_page(page: int, limit: int = 30) -> dict:
    url = f"{API}?page={page}&limit={limit}&sort=reviewed_at&order=DESC"
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())


def normalize(item: dict) -> dict:
    """Map OpenNana fields to prompt-forge schema."""
    return {
        "title": item.get("title", ""),
        "prompt_text": "",  # OpenNana list doesn't include full text
        "category": "unclassified",
        "tags": json.dumps([]),
        "source_url": f"https://opennana.com/prompts/{item.get('slug', '')}",
        "source_type": "opennana",
        "parameters": json.dumps({}),
    }


def main():
    pages = int(sys.argv[1]) if len(sys.argv) > 1 else 10
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("opennana_prompts.jsonl")

    count = 0
    with open(out, "w", encoding="utf-8") as fh:
        for page in range(1, pages + 1):
            try:
                data = fetch_page(page)
                items = data.get("data", {}).get("items", [])
                for item in items:
                    rec = normalize(item)
                    fh.write(json.dumps(rec, ensure_ascii=False) + "\n")
                    count += 1
                print(f"Page {page}: {len(items)} items (total: {count})")
            except Exception as e:
                print(f"Page {page} error: {e}", file=sys.stderr)
            time.sleep(0.5)  # polite delay

    print(f"\nDone. {count} items saved to {out}")
    print(f"Import with: pf source import {out}")


if __name__ == "__main__":
    main()
