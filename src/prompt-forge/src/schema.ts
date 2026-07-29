/**
 * Prompt Forge schema.
 *
 * Embedded verbatim from src/migrations/001_init.sql of the original
 * Python reference implementation. SQLite with WAL mode and FTS5 for
 * full-text search.
 *
 * Note: prompts_fts is an external-content FTS5 table (content='prompts').
 * The schema does not declare sync triggers, so callers must rebuild the
 * FTS index after mutations via:
 *   INSERT INTO prompts_fts(prompts_fts) VALUES('rebuild');
 */
export const SCHEMA_SQL = `-- Prompt Forge: Initial Schema
-- SQLite with WAL mode, FTS5 for full-text search

PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
PRAGMA busy_timeout=60000;
PRAGMA foreign_keys=ON;

-- Core prompts table
CREATE TABLE IF NOT EXISTS prompts (
    id            TEXT PRIMARY KEY,
    title         TEXT NOT NULL,
    description   TEXT DEFAULT '',
    category      TEXT NOT NULL,
    tags          TEXT DEFAULT '[]',          -- JSON array
    prompt_text   TEXT NOT NULL,
    template_json TEXT,                       -- nullable: only for templated prompts
    parameters    TEXT DEFAULT '{}',          -- JSON: {model, aspect_ratio, resolution, ...}
    source_url    TEXT DEFAULT '',
    source_type   TEXT DEFAULT 'manual',      -- opennana | github | manual | import
    rating        REAL DEFAULT 0,             -- avg of ratings, 0 = unrated
    usage_count   INTEGER DEFAULT 0,
    created_at    TEXT NOT NULL,
    updated_at    TEXT NOT NULL
);

-- Generated images linked to prompts
CREATE TABLE IF NOT EXISTS images (
    id              TEXT PRIMARY KEY,
    prompt_id       TEXT NOT NULL REFERENCES prompts(id),
    file_path       TEXT NOT NULL,
    thumbnail_path  TEXT,
    width           INTEGER,
    height          INTEGER,
    file_size       INTEGER,
    rating          INTEGER DEFAULT 0,
    is_primary      INTEGER DEFAULT 0,
    generated_at    TEXT,
    created_at      TEXT NOT NULL
);

-- User ratings
CREATE TABLE IF NOT EXISTS ratings (
    id          TEXT PRIMARY KEY,
    prompt_id   TEXT NOT NULL REFERENCES prompts(id),
    image_id    TEXT REFERENCES images(id),
    score       INTEGER NOT NULL CHECK(score BETWEEN 1 AND 5),
    comment     TEXT DEFAULT '',
    rated_by    TEXT DEFAULT 'user',
    created_at  TEXT NOT NULL
);

-- Extracted patterns
CREATE TABLE IF NOT EXISTS patterns (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    description   TEXT DEFAULT '',
    structure     TEXT NOT NULL,
    keywords      TEXT DEFAULT '[]',
    applicable_to TEXT DEFAULT '[]',
    examples      TEXT DEFAULT '[]',
    confidence    REAL DEFAULT 0.0,
    created_at    TEXT NOT NULL
);

-- Full-text search on prompts
CREATE VIRTUAL TABLE IF NOT EXISTS prompts_fts USING fts5(
    title,
    description,
    prompt_text,
    tags,
    content='prompts',
    content_rowid='rowid'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_rating ON prompts(rating);
CREATE INDEX IF NOT EXISTS idx_prompts_source ON prompts(source_type);
CREATE INDEX IF NOT EXISTS idx_images_prompt ON images(prompt_id);
CREATE INDEX IF NOT EXISTS idx_ratings_prompt ON ratings(prompt_id);
`;
