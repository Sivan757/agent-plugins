"""Fetch and parse GPT-Image2-Skill gallery prompts into JSONL."""
import json
import re
import subprocess
import sys
import os
from pathlib import Path

BASE_URL = "https://raw.githubusercontent.com/wuyoscar/GPT-Image2-Skill/main/skills/gpt-image/references"
REPO_BASE = "https://github.com/wuyoscar/GPT-Image2-Skill/blob/main/skills/gpt-image/references"
OUTPUT = os.environ.get("OUTPUT_PATH", "/Users/sivan/temu_agent/.claude/skills/prompt-forge/data/gpt-image2-skill_prompts.jsonl")


def fetch(url):
    """Fetch URL via curl and return text."""
    result = subprocess.run(
        ["curl", "-sL", "--max-time", "30", url],
        capture_output=True, text=True, timeout=35
    )
    if result.returncode != 0:
        print(f"  WARN: curl failed for {url}: {result.stderr[:200]}", file=sys.stderr)
        return None
    return result.stdout


def parse_index(text):
    """Parse the gallery index, return list of (category_name, filename)."""
    # Match rows: | Category | File | Range | Count |
    # e.g. | 🎌 Anime & Manga | [`gallery-anime-and-manga.md`](gallery-anime-and-manga.md) | No. 1–12 | 12 |
    pattern = re.compile(
        r'\|\s*[^|]*?\|\s*\[`(gallery-[^`]+\.md)`\]\(([^)]+)\)'
    )
    matches = pattern.findall(text)

    categories = []
    # Extract category name from each row
    for filename, link in matches:
        # Get the category name from the same row
        # Pattern: | emoji Category Name | [...]
        # Extract from the full text around the filename
        # Rebuild: find row containing this filename
        escaped = re.escape(filename)
        row_pattern = re.compile(
            r'\|\s*(?:[^|]+?)\s*\|\s*\[`' + escaped + r'`\]'
        )
        row_match = row_pattern.search(text)
        if row_match:
            # Get the full row
            row_start = text.rfind('\n', 0, row_match.start()) + 1
            row_end = text.find('\n', row_match.end())
            if row_end == -1:
                row_end = len(text)
            row = text[row_start:row_end]
            # Extract category name: first column
            cols = row.split('|')
            if len(cols) >= 2:
                cat = cols[1].strip()
                # Remove leading emoji
                cat = re.sub(r'^[^\w\s&]+', '', cat).strip()
                categories.append((cat, filename))

    return categories


def parse_gallery(text, category_name, filename):
    """Parse a gallery-*.md file into prompt entries."""
    entries = []

    # Split by entry headers: "### No. X ·"
    # Use a strategy: split on "\n### No." to get raw chunks
    chunks = re.split(r'\n(?=### No\.\s*\d+\s*·)', text)

    for chunk in chunks:
        # Skip prelude (before first entry) - must start with "### No."
        if not chunk.startswith('### No.'):
            continue

        # Extract number and title from the first line
        first_line_end = chunk.find('\n')
        first_line = chunk[:first_line_end] if first_line_end != -1 else chunk
        # "### No. X · Title"
        title_match = re.match(r'### No\.\s*\d+\s*·\s*(.+)', first_line)
        if not title_match:
            continue
        title = title_match.group(1).strip()

        # Parse metadata line
        meta_match = re.search(r'- Metadata:\s*(.+?)(?:\n|$)', chunk)
        size = ""
        source = "Curated"
        source_url = ""
        quality = ""

        if meta_match:
            meta_str = meta_match.group(1).strip()
            parts = meta_str.split('·')
            if len(parts) >= 2:
                size = parts[1].strip().strip('`')
            if len(parts) >= 3:
                quality = parts[2].strip().strip('`')

            # Check for Author and Source
            author_match = re.search(r'Author:\s*(.+?)(?:\s*·|\s*$)', meta_str)
            if author_match:
                author = author_match.group(1).strip()
                source = author

            source_match = re.search(r'Source:\s*\[([^\]]+)\]\(([^)]+)\)', meta_str)
            if source_match:
                source = source_match.group(1).strip()
                source_url = source_match.group(2).strip()

            if 'Curated' in meta_str and not re.search(r'Author:', meta_str):
                source = "Curated"

        # Parse prompt text - try ```text first, then ```json
        prompt_text = ""
        text_match = re.search(r'```text\s*\n(.+?)\n```', chunk, re.DOTALL)
        if text_match:
            prompt_text = text_match.group(1).strip()
        else:
            json_match = re.search(r'```json\s*\n(.+?)\n```', chunk, re.DOTALL)
            if json_match:
                prompt_text = json_match.group(1).strip()

        if not prompt_text:
            continue

        entry = {
            "title": title,
            "category": category_name,
            "prompt_text": prompt_text,
            "size": size,
            "quality": quality,
            "source": source,
            "source_url": source_url,
            "source_type": "gpt-image2-skill",
        }
        entries.append(entry)

    return entries


def main():
    print("Fetching gallery index...", file=sys.stderr)
    index_text = fetch(f"{BASE_URL}/gallery.md")
    if not index_text:
        print("ERROR: Failed to fetch gallery index", file=sys.stderr)
        sys.exit(1)

    categories = parse_index(index_text)
    print(f"Found {len(categories)} categories:", file=sys.stderr)
    for cat, fname in categories:
        print(f"  - {cat} ({fname})", file=sys.stderr)

    all_entries = []
    counts = {}

    for cat_name, filename in categories:
        print(f"  Fetching {filename}...", file=sys.stderr)
        url = f"{BASE_URL}/{filename}"
        text = fetch(url)
        if not text:
            print(f"    WARN: Skipping {filename}", file=sys.stderr)
            continue

        entries = parse_gallery(text, cat_name, filename)
        all_entries.extend(entries)
        counts[cat_name] = len(entries)
        print(f"    -> {len(entries)} entries", file=sys.stderr)

    # Write JSONL
    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, 'w', encoding='utf-8') as f:
        for entry in all_entries:
            f.write(json.dumps(entry, ensure_ascii=False) + '\n')

    print(f"\nWrote {len(all_entries)} entries to {OUTPUT}", file=sys.stderr)
    print("\nCounts per category:", file=sys.stderr)
    for cat, count in sorted(counts.items(), key=lambda x: -x[1]):
        print(f"  {count:3d}  {cat}", file=sys.stderr)


if __name__ == "__main__":
    main()
