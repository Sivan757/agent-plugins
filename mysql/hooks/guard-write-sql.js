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

// Only check mysql plugin's sql.js (not aliyunlog or other plugins)
if (!cmd.match(/mysql[\\/].*sql\.js/)) process.exit(0);

// Allow non-SQL subcommands
if (/--(?:init|list|test|describe|schemas|cached-schema|help)\b/.test(cmd)) process.exit(0);

// Allow if user already confirmed
if (cmd.includes("--user-confirmed")) process.exit(0);

// Extract SQL: second positional arg after connection name, in quotes
let sqlMatch = cmd.match(/query\.js\s+\S+\s+"([^"]*)"/);
if (!sqlMatch) sqlMatch = cmd.match(/query\.js\s+\S+\s+'([^']*)'/);
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
    console.log("⛔ WRITE OPERATION BLOCKED");
    console.log("");
    console.log(`Operation: ${op}`);
    console.log(`SQL: ${preview}`);
    console.log("");
    console.log("Database write operations are FORBIDDEN without explicit user confirmation.");
    console.log("You MUST:");
    console.log("  1. Show the full SQL to the user");
    console.log("  2. Ask the user to confirm the operation");
    console.log("  3. If confirmed, re-run with --user-confirmed added to the command");
    process.exit(2);
  }
}

process.exit(0);
