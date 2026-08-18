#!/usr/bin/env python3
"""Fetch and parse prompts from awesome-gpt-image-2 repository."""

import json
import re
import subprocess
import sys
import os
import time

BASE_URL = "https://raw.githubusercontent.com/EvoLinkAI/awesome-gpt-image-2-API-and-Prompts/main"
REPO_API = "https://api.github.com/repos/EvoLinkAI/awesome-gpt-image-2-API-and-Prompts/contents"
OUTPUT = os.path.join(os.path.dirname(__file__), "awesome-gpt-image2_prompts.jsonl")

CATEGORY_MAP = {
    "e-commerce": "ecommerce",
    "ecommerce": "ecommerce",
    "ad-creative": "ad-creative",
    "ad creative": "ad-creative",
    "portrait": "portrait",
    "portrait & photography": "portrait",
    "poster": "poster",
    "poster & illustration": "poster",
    "character": "character",
    "character design": "character",
    "ui": "ui",
    "ui & social media mockup": "ui",
    "comparison": "comparison",
    "comparison & community": "comparison",
}

README_CATEGORY_SECTIONS = [
    ("ecommerce", "E-commerce Cases"),
    ("ad-creative", "Ad Creative Cases"),
    ("portrait", "Portrait & Photography Cases"),
    ("poster", "Poster & Illustration Cases"),
    ("character", "Character Design Cases"),
    ("ui", "UI & Social Media Mockup Cases"),
    ("comparison", "Comparison & Community Examples"),
]

CASE_FILES = [
    "ad-creative.md",
    "character.md",
    "comparison.md",
    "ecommerce.md",
    "portrait.md",
    "poster.md",
    "ui.md",
]

RESULT_FILES = [
    "gpt_image_2_recent_prompts_20260602_100000_summary.json",
    "gpt_image_2_recent_prompts_20260607_100000_summary.json",
    "gpt_image_2_recent_prompts_20260608_100000_summary.json",
]


def curl_fetch(url, retries=3):
    """Fetch URL content via curl with retries."""
    for attempt in range(retries):
        result = subprocess.run(
            ["curl", "-sL", "--connect-timeout", "30", "--max-time", "120", url],
            capture_output=True, timeout=180
        )
        if result.returncode == 0:
            return result.stdout.decode("utf-8", errors="replace")
        if attempt < retries - 1:
            print(f"  Retry {attempt+1}/{retries} for {url}...", file=sys.stderr)
            time.sleep(2)
    print(f"  WARNING: curl failed for {url}: {result.stderr.decode('utf-8', errors='replace')}", file=sys.stderr)
    return ""


def parse_case_block(text, category, source_url):
    """
    Parse markdown case blocks.
    Pattern: ### Case NNN: [Title](url) ... **Prompt:** ``` ...prompt text... ```
    """
    results = []
    # Find all case headings
    case_pattern = re.compile(
        r'###\s+Case\s+(\d+):\s+\[([^\]]+)\]\(([^)]+)\)\s+\(by\s+\[([^\]]+)\]\(([^)]+)\)\)'
    )
    for match in case_pattern.finditer(text):
        case_num = match.group(1)
        title = match.group(2)
        tweet_url = match.group(3)
        author = match.group(4)
        author_url = match.group(5)

        # Find the prompt text after this heading
        # Look for **Prompt:** or **Prompt**
        start = match.end()
        # Find the next case heading or end of content
        next_case = re.search(r'###\s+Case\s+\d+:', text[start:])
        if next_case:
            end = start + next_case.start()
        else:
            end = len(text)

        section_text = text[start:end]

        # Extract prompt(s) from code blocks
        # Pattern: **Prompt:** ... ``` ... ```
        prompt_section = re.search(r'\*\*Prompt:?\*\*\s*', section_text)
        if prompt_section:
            prompt_start = prompt_section.end()
            prompt_remainder = section_text[prompt_start:]

            # Find code blocks
            code_blocks = re.findall(r'```(.*?)```', prompt_remainder, re.DOTALL)
            if not code_blocks:
                # Try alternative - plain text after Prompt: until next heading
                # Sometimes prompts are not in code blocks but in quoted text
                continue

            # Combine all code blocks
            prompt_text = "\n\n---\n\n".join(block.strip() for block in code_blocks)
            prompt_text = prompt_text.strip()

            if not prompt_text or len(prompt_text) < 20:
                continue

            results.append({
                "title": title,
                "case_id": f"Case {case_num}",
                "category": category,
                "prompt_text": prompt_text,
                "source_url": source_url,
                "tweet_url": tweet_url,
                "author": author,
                "source_type": "awesome-gpt-image2",
            })

    return results


def parse_readme_for_category(text, category_label, category_key, source_url):
    """Find a category section in the README and parse its inline cases."""
    # Find the section header
    section_pattern = re.compile(
        r'##\s+[^#]*?' + re.escape(category_label) + r'.*?\n',
        re.IGNORECASE
    )
    matches = list(section_pattern.finditer(text))
    if not matches:
        print(f"  WARNING: Could not find section '{category_label}' in README", file=sys.stderr)
        return []

    start = matches[0].start()
    # Find the next ## section
    next_section = re.search(r'\n##\s+', text[matches[0].end():])
    if next_section:
        end = matches[0].end() + next_section.start()
    else:
        end = len(text)

    section_text = text[start:end]
    return parse_case_block(section_text, category_key, source_url)


def parse_case_file(filename, category, source_url):
    """Fetch and parse a full case file."""
    url = f"{BASE_URL}/cases/{filename}"
    content = curl_fetch(url)
    if not content:
        print(f"  WARNING: Empty content for {filename}", file=sys.stderr)
        return []
    print(f"  Parsing {filename} ({len(content)} bytes)...")
    return parse_case_block(content, category, url)


def parse_result_json(filename):
    """Fetch and parse a result JSON file."""
    url = f"{BASE_URL}/result/{filename}"
    content = curl_fetch(url)
    if not content:
        print(f"  WARNING: Empty content for {filename}", file=sys.stderr)
        return []
    try:
        data = json.loads(content)
    except json.JSONDecodeError as e:
        print(f"  WARNING: Could not parse {filename}: {e}", file=sys.stderr)
        return []

    results = []
    candidates = data.get("top_candidates", [])
    for c in candidates:
        title = c.get("suggested_title", "")
        category_raw = c.get("suggested_category", "")
        tweet_url = c.get("tweet_url", "")
        author = c.get("author_handle", "")
        prompt_text = c.get("prompt", c.get("prompt_text", c.get("full_prompt", "")))

        # Map category
        category_key = "unknown"
        for cat_raw, cat_key in CATEGORY_MAP.items():
            if cat_raw.lower() in category_raw.lower():
                category_key = cat_key
                break

        if not title:
            continue

        # Even without prompt_text, record metadata
        entry = {
            "title": title,
            "category": category_key,
            "prompt_text": prompt_text if prompt_text else "",
            "source_url": f"{BASE_URL}/result/{filename}",
            "tweet_url": tweet_url,
            "author": author,
            "source_type": "awesome-gpt-image2",
        }
        results.append(entry)

    return results


def main():
    print("=== Fetching and Parsing awesome-gpt-image-2 Prompts ===\n")

    all_prompts = {}  # keyed by title for dedup

    # 1. Parse README
    print("[1/3] Fetching README...")
    readme_url = f"{BASE_URL}/README.md"
    readme_text = curl_fetch(readme_url)
    if readme_text:
        print(f"  README: {len(readme_text)} bytes")
        for cat_key, cat_label in README_CATEGORY_SECTIONS:
            print(f"  Parsing README section: {cat_label}...")
            prompts = parse_readme_for_category(readme_text, cat_label, cat_key, readme_url)
            for p in prompts:
                key = p["title"]
                if key not in all_prompts:
                    all_prompts[key] = p
            print(f"    Found {len(prompts)} prompts")
    else:
        print("  ERROR: Could not fetch README", file=sys.stderr)
        sys.exit(1)

    # 2. Parse case files
    print("\n[2/3] Fetching case files...")
    for filename in CASE_FILES:
        category = filename.replace(".md", "")
        prompts = parse_case_file(filename, category, f"{BASE_URL}/cases/{filename}")
        for p in prompts:
            key = p["title"]
            if key not in all_prompts:
                all_prompts[key] = p
        print(f"    Found {len(prompts)} prompts in {filename}")

    # 3. Parse result JSON files
    print("\n[3/3] Fetching result JSON files...")
    for filename in RESULT_FILES:
        print(f"  Parsing {filename}...")
        prompts = parse_result_json(filename)
        added = 0
        for p in prompts:
            key = p["title"]
            if key not in all_prompts and p["prompt_text"]:
                # Only add result entries that have prompt text
                all_prompts[key] = p
                added += 1
        print(f"    Found {len(prompts)} candidates, {added} with prompt text (new)")

    # Normalize categories
    for p in all_prompts.values():
        cat = p["category"].lower().replace("_", "-").replace(" ", "-")
        if cat in CATEGORY_MAP:
            p["category"] = CATEGORY_MAP[cat]
        elif cat == "e-commerce":
            p["category"] = "ecommerce"
        elif cat == "ad-creative":
            p["category"] = "ad-creative"
        # Keep as-is if unknown

    # Write output
    prompts_list = list(all_prompts.values())
    prompts_list.sort(key=lambda x: (x["category"], x.get("case_id", "")))

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        for p in prompts_list:
            f.write(json.dumps(p, ensure_ascii=False) + "\n")

    # Report counts
    print(f"\n=== Results ===")
    print(f"Total unique prompts: {len(prompts_list)}")
    print(f"Output: {OUTPUT}")

    # Category breakdown
    cat_counts = {}
    for p in prompts_list:
        cat = p["category"]
        cat_counts[cat] = cat_counts.get(cat, 0) + 1

    print("\nCategory breakdown:")
    for cat in sorted(cat_counts.keys()):
        print(f"  {cat}: {cat_counts[cat]}")

    # Check sample
    if prompts_list:
        print(f"\nSample entry:")
        sample = prompts_list[len(prompts_list) // 2]
        print(json.dumps({
            "title": sample["title"],
            "category": sample["category"],
            "prompt_text": sample["prompt_text"][:200] + "...",
            "source_url": sample["source_url"],
            "source_type": sample["source_type"],
        }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
