#!/usr/bin/env node
//
// guard-write-operations.js - PreToolUse hook for Bash
//
// Intercepts SQL write operations (INSERT, UPDATE, DELETE, DROP, etc.)
// and blocks them unless --user-confirmed flag is present.
//
// Hook input (stdin): { tool_name, tool_input: { command } }
// Exit 0: allow
// Exit 2: block (output shown to Claude as reason)
//

"use strict";

const fs = require("fs");

let input;
try {
  input = JSON.parse(fs.readFileSync("/dev/stdin", "utf8"));
} catch {
  process.exit(0);
}

const cmd = (input.tool_input || {}).command || "";

// Only check mysql plugin's mysql.mjs
if (!cmd.match(/mysql[\\/].*mysql\.mjs/)) process.exit(0);

// Allow non-SQL subcommands
if (/--(?:init|list|test|describe|schemas|cached-schema|help)\b/.test(cmd)) process.exit(0);

// Allow if user already confirmed
if (cmd.includes("--user-confirmed")) process.exit(0);

// Extract SQL: second positional arg after connection name, in quotes
let sqlMatch = cmd.match(/mysql\.mjs\s+\S+\s+"([^"]*)"/);
if (!sqlMatch) sqlMatch = cmd.match(/mysql\.mjs\s+\S+\s+'([^']*)'/);
if (!sqlMatch) process.exit(0);

const sql = sqlMatch[1].trim();
const sqlUpper = sql.replace(/^\s+/, "").toUpperCase();

const WRITE_OPS = [
  "INSERT",
  "UPDATE",
  "DELETE",
  "DROP",
  "ALTER",
  "TRUNCATE",
  "CREATE",
  "RENAME",
  "REPLACE",
  "GRANT",
  "REVOKE",
  "LOAD DATA",
  "CALL",
];

for (const op of WRITE_OPS) {
  if (
    sqlUpper.startsWith(op + " ") ||
    sqlUpper.startsWith(op + "\t") ||
    sqlUpper.startsWith(op + "\n") ||
    sqlUpper === op
  ) {
    const preview = sql.length > 150 ? sql.substring(0, 150) + "..." : sql;
    console.error("⛔ WRITE OPERATION BLOCKED");
    console.error("");
    console.error(`Operation: ${op}`);
    console.error(`SQL: ${preview}`);
    console.error("");
    console.error("Database write operations are FORBIDDEN without explicit user confirmation.");
    console.error("You MUST:");
    console.error("  1. Show the full SQL to the user");
    console.error("  2. Ask the user to confirm the operation");
    console.error("  3. If confirmed, re-run with --user-confirmed added to the command");
    process.exit(2);
  }
}

process.exit(0);
