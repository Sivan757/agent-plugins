#!/usr/bin/env node

/**
 * mysql.mjs - MySQL query executor for Claude Code.
 *
 * Usage:
 *   node mysql.mjs <connection-name> <sql> [--format=table|json|csv] [--params='["val1","val2"]']
 *   node mysql.mjs --columns <connection> <table>   List column names of a table
 *   node mysql.mjs --list                             List connections
 *   node mysql.mjs --test [name]                      Test connection(s)
 *   node mysql.mjs --init                             Create template config
 *
 * Config: ~/.cache/apex-plugin/mysql.json
 * Legacy fallback: .claude/.mysql-connections.json
 */

import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const CONFIG_PATH = path.join(os.homedir(), ".cache", "apex-plugin", ".mysql-connections.json");
const LEGACY_CONFIG_DIR = ".claude";
const LEGACY_CONFIG_FILE = ".mysql-connections.json";
const DEFAULT_ROW_LIMIT = 1;
const DEFAULT_COL_WIDTH = 40;

const TEMPLATE = {
  connections: {},
};

function info(msg) {
  process.stderr.write(`[mysql] ${msg}\n`);
}

// ── Configuration ────────────────────────────────────────────────────────────

function findLegacyConfig() {
  const configName = path.join(LEGACY_CONFIG_DIR, LEGACY_CONFIG_FILE);
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    const candidate = path.join(dir, configName);
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }
  return null;
}

function findConfig() {
  if (fs.existsSync(CONFIG_PATH)) return { path: CONFIG_PATH, legacy: false };
  const legacyPath = findLegacyConfig();
  if (legacyPath) return { path: legacyPath, legacy: true };
  return null;
}

function loadConfig() {
  const result = findConfig();
  if (!result) return null;
  if (result.legacy) {
    info(`Using legacy config: ${result.path}`);
    info(`Run --init to create global config at ${CONFIG_PATH}, then migrate your settings.`);
  }
  try {
    return JSON.parse(fs.readFileSync(result.path, "utf8"));
  } catch (e) {
    console.error(`Error: Failed to parse ${result.path}: ${e.message}`);
    console.error("Check for syntax errors in your config file.");
    process.exit(1);
  }
}

function printTemplate() {
  if (fs.existsSync(CONFIG_PATH)) {
    console.error(`Error: Config already exists at ${CONFIG_PATH}`);
    process.exit(1);
  }
  const configDir = path.dirname(CONFIG_PATH);
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(TEMPLATE, null, 2) + "\n");
  console.log(`Created: ${CONFIG_PATH}`);
  console.log("Edit this file to add your database connection details.");
  console.log("");
  console.log("Example connection format:");
  console.log('  { "connections": { "mydb": { "host": "127.0.0.1", "port": 3306, "user": "root", "password": "", "database": "mydb" } } }');

  const legacyPath = findLegacyConfig();
  if (legacyPath) {
    console.log(`\nNote: Legacy config found at ${legacyPath}`);
    console.log("Copy your connections from the legacy file, then remove it.");
  }
}

function listConnections() {
  const config = loadConfig();
  if (!config) {
    console.error(`No config found. Run --init to create ${CONFIG_PATH}`);
    process.exit(1);
  }
  const names = Object.keys(config.connections || {});
  if (names.length === 0) {
    console.log("No connections defined.");
    return;
  }
  console.log("Available connections:");
  for (const name of names) {
    const c = config.connections[name];
    console.log(`  ${name} → ${c.database} (${c.host}:${c.port || 3306})`);
  }
}

function loadMysql2() {
  const pluginRoot = path.resolve(__dirname, "..");
  try {
    const mysql2Path = require.resolve("mysql2/promise", {
      paths: [pluginRoot],
    });
    return require(mysql2Path);
  } catch {
    console.error("Error: mysql2 package not found in plugin directory.");
    console.error(`Run: npm install --prefix "${pluginRoot}"`);
    process.exit(1);
  }
}

function createConnection(mysql, connConfig) {
  return mysql.createConnection({
    host: connConfig.host,
    port: connConfig.port || 3306,
    user: connConfig.user,
    password: connConfig.password,
    database: connConfig.database,
    connectTimeout: 10000,
    supportBigNumbers: true,
    bigNumberStrings: true,
    dateStrings: true,
    ...(connConfig.ssl ? { ssl: connConfig.ssl } : {}),
  });
}

async function testConnections(targetName) {
  const config = loadConfig();
  if (!config) {
    console.error(`No config found. Run --init to create ${CONFIG_PATH}`);
    process.exit(1);
  }
  const entries = Object.entries(config.connections || {});
  if (entries.length === 0) {
    console.log("No connections defined.");
    return;
  }

  const mysql = loadMysql2();
  const toTest = targetName
    ? entries.filter(([name]) => name === targetName)
    : entries;

  if (targetName && toTest.length === 0) {
    console.error(`Error: Connection "${targetName}" not found.`);
    listConnections();
    process.exit(1);
  }

  for (const [name, connConfig] of toTest) {
    let connection;
    try {
      connection = await createConnection(mysql, connConfig);
      const [rows] = await connection.execute("SELECT 1");
      console.log(`  ${name} → OK (${connConfig.database})`);
    } catch (err) {
      console.log(`  ${name} → FAILED: ${err.message}`);
    } finally {
      if (connection) await connection.end();
    }
  }
}

// ── Column Listing ───────────────────────────────────────────────────────────

async function listColumns(connName, tableName) {
  const config = loadConfig();
  if (!config) {
    console.error(`No config found. Run --init to create ${CONFIG_PATH}`);
    process.exit(1);
  }
  const connConfig = (config.connections || {})[connName];
  if (!connConfig) {
    console.error(`Error: Connection "${connName}" not found.`);
    listConnections();
    process.exit(1);
  }

  const mysql = loadMysql2();
  let connection;
  try {
    connection = await createConnection(mysql, connConfig);
    const [rows] = await connection.execute(`DESCRIBE \`${tableName}\``);

    if (!Array.isArray(rows) || rows.length === 0) {
      console.log(`(table "${tableName}" not found or empty)`);
      return;
    }

    for (const row of rows) {
      console.log(row.Field);
    }
    info(`${rows.length} columns in ${tableName}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    if (err.code) console.error(`Code: ${err.code}`);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

// ── Formatters ───────────────────────────────────────────────────────────────

function truncate(value, maxLen) {
  const s = value == null ? "NULL" : String(value);
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 3) + "...";
}

function formatCompact(rows, colWidth) {
  if (!rows || rows.length === 0) return "(empty)";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join("\t")];
  for (const row of rows) {
    lines.push(headers.map((h) => truncate(row[h], colWidth)).join("\t"));
  }
  return lines.join("\n");
}

function formatCSV(rows, colWidth) {
  if (!rows || rows.length === 0) return "(empty result set)";
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    const s = truncate(v, colWidth);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\n");
}

function formatTable(rows, colWidth) {
  if (!rows || rows.length === 0) return "(empty result set)";
  const headers = Object.keys(rows[0]);
  const cells = rows.map((r) => headers.map((h) => truncate(r[h], colWidth)));
  const widths = headers.map((h, i) =>
    Math.min(colWidth, Math.max(h.length, ...cells.map((c) => c[i].length)))
  );
  const sep = "+" + widths.map((w) => "-".repeat(w + 2)).join("+") + "+";
  const fmt = (vals) =>
    "|" + vals.map((v, i) => " " + v.padEnd(widths[i]) + " ").join("|") + "|";

  return [sep, fmt(headers), sep, ...cells.map((c) => fmt(c)), sep].join("\n");
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--init")) {
    printTemplate();
    return;
  }

  if (args.includes("--list")) {
    listConnections();
    return;
  }

  if (args.includes("--test")) {
    const testIdx = args.indexOf("--test");
    const targetName =
      args[testIdx + 1] && !args[testIdx + 1].startsWith("--")
        ? args[testIdx + 1]
        : null;
    await testConnections(targetName);
    return;
  }

  // --columns <connection> <table>
  if (args.includes("--columns")) {
    const idx = args.indexOf("--columns");
    const connName = args[idx + 1];
    const tableName = args[idx + 2];
    if (!connName || !tableName || connName.startsWith("--") || tableName.startsWith("--")) {
      console.error("Usage: --columns <connection> <table>");
      process.exit(1);
    }
    await listColumns(connName, tableName);
    return;
  }

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`Usage:
  node mysql.mjs <connection-name> <sql> [options]
  node mysql.mjs --init                             Create config template
  node mysql.mjs --list                             List available connections
  node mysql.mjs --test [name]                      Test connection(s)
  node mysql.mjs --columns <conn> <table>           List column names of a table

Config: ${CONFIG_PATH}

Options:
  --format=csv|table|json|compact  Output format (default: csv)
  --params='["val"]'               Parameterized query values
  --limit=N                        Max rows (default: 1, 0=unlimited)
  --col-width=N                    Max column width (default: 40)
  --user-confirmed                 Bypass write-operation guard (after user approval)`);
    return;
  }

  if (args.length < 2) {
    console.error("Usage: node mysql.mjs <connection-name> <sql> [--format=table|json|csv] [--params='[...]']");
    console.error("       node mysql.mjs --help                         Show full help");
    process.exit(1);
  }

  const connName = args[0];
  const sql = args[1];

  let format = "csv";
  let params = [];
  let rowLimit = DEFAULT_ROW_LIMIT;
  let colWidth = DEFAULT_COL_WIDTH;

  for (let i = 2; i < args.length; i++) {
    if (args[i].startsWith("--format=")) {
      format = args[i].split("=")[1];
    } else if (args[i].startsWith("--params=")) {
      try {
        params = JSON.parse(args[i].split("=").slice(1).join("="));
      } catch (e) {
        console.error(`Error: Invalid --params JSON: ${e.message}`);
        process.exit(1);
      }
    } else if (args[i].startsWith("--limit=")) {
      rowLimit = parseInt(args[i].split("=")[1], 10);
      if (isNaN(rowLimit) || rowLimit < 0) {
        console.error(`Error: Invalid --limit value. Must be a non-negative integer.`);
        process.exit(1);
      }
    } else if (args[i].startsWith("--col-width=")) {
      colWidth = parseInt(args[i].split("=")[1], 10);
    }
  }

  const config = loadConfig();
  if (!config) {
    console.error(`No config found. Run --init to create ${CONFIG_PATH}`);
    process.exit(1);
  }
  const connConfig = (config.connections || {})[connName];
  if (!connConfig) {
    console.error(`Error: Connection "${connName}" not found.`);
    listConnections();
    process.exit(1);
  }

  const mysql = loadMysql2();

  let connection;
  try {
    connection = await createConnection(mysql, connConfig);

    const [rows, fields] = await connection.execute(sql, params);

    // DDL/DML statements return OkPacket
    if (!Array.isArray(rows)) {
      console.log(JSON.stringify({
        affectedRows: rows.affectedRows,
        insertId: rows.insertId != null ? String(rows.insertId) : undefined,
        changedRows: rows.changedRows,
        info: rows.info,
      }));
      return;
    }

    if (rows.length === 0) {
      console.log("(empty result set)");
      return;
    }

    const totalRows = rows.length;
    const truncated = rowLimit > 0 && totalRows > rowLimit;
    const displayRows = truncated ? rows.slice(0, rowLimit) : rows;

    switch (format) {
      case "json":
        console.log(JSON.stringify(displayRows));
        break;
      case "compact":
        console.log(formatCompact(displayRows, colWidth));
        break;
      case "csv":
        console.log(formatCSV(displayRows, colWidth));
        break;
      case "table":
      default:
        console.log(formatTable(displayRows, colWidth));
        break;
    }

    // Summary line
    if (truncated) {
      console.log(`(${rowLimit} of ${totalRows} rows shown, use --limit=0 for all)`);
    } else {
      console.log(`(${totalRows} rows)`);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    if (err.code) console.error(`Code: ${err.code}`);
    if (err.sqlState) console.error(`SQL State: ${err.sqlState}`);

    if (err.message.includes("Unknown column")) {
      console.error(`\nHint: Run --columns to see available column names:`);
      console.error(`  node mysql.mjs --columns ${connName} <table_name>`);
    }

    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

main();
