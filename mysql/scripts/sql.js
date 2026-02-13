#!/usr/bin/env node

/**
 * MySQL query executor for Claude Code.
 *
 * Usage:
 *   node sql.js <connection-name> <sql> [--format=table|json|csv] [--params='["val1","val2"]']
 *   node sql.js --describe <connection> <table>   Describe table and cache schema
 *   node sql.js --schemas [connection]             List cached schemas
 *   node sql.js --list                             List connections
 *   node sql.js --test [name]                      Test connection(s)
 *   node sql.js --init                             Create template config
 *
 * Reads connection config from .claude/.mysql-connections.json in the current working directory.
 */

const fs = require("fs");
const path = require("path");

const CONFIG_DIR = ".claude";
const CONFIG_FILE = ".mysql-connections.json";
const SCHEMA_CACHE_DIR = path.join(CONFIG_DIR, ".mysql-schema-cache");
const DEFAULT_ROW_LIMIT = 10;
const DEFAULT_COL_WIDTH = 80;

const TEMPLATE = {
  connections: {
    default: {
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "",
      database: "mydb",
    },
  },
};

function getConfigPath() {
  return path.resolve(process.cwd(), CONFIG_DIR, CONFIG_FILE);
}

function ensureConfigDir() {
  const dir = path.resolve(process.cwd(), CONFIG_DIR);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadConfig() {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    ensureConfigDir();
    fs.writeFileSync(configPath, JSON.stringify(TEMPLATE, null, 2) + "\n");
    console.error(`[mysql] Created ${CONFIG_DIR}/${CONFIG_FILE} at ${configPath}`);
    console.error("[mysql] Edit it with your database connection details, then re-run the query.");
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

function printTemplate() {
  const configPath = getConfigPath();
  if (fs.existsSync(configPath)) {
    console.error(`Error: ${CONFIG_DIR}/${CONFIG_FILE} already exists at ${configPath}`);
    process.exit(1);
  }
  ensureConfigDir();
  fs.writeFileSync(configPath, JSON.stringify(TEMPLATE, null, 2) + "\n");
  console.log(`Created ${CONFIG_DIR}/${CONFIG_FILE} at ${configPath}`);
  console.log("Edit the file to add your database connection details.");
}

function listConnections() {
  const config = loadConfig();
  const names = Object.keys(config.connections || {});
  if (names.length === 0) {
    console.log("No connections defined.");
    return;
  }
  console.log("Available connections:");
  for (const name of names) {
    const c = config.connections[name];
    // Only show connection name and database - never expose user/password
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

// ── Schema Caching ───────────────────────────────────────────────────────────

function getCachePath(connName, table) {
  const safeTable = table.replace(/[`'"]/g, "").replace(/\//g, ".");
  return path.resolve(process.cwd(), SCHEMA_CACHE_DIR, `${connName}.${safeTable}.txt`);
}

function cacheSchema(connName, table, rows) {
  const cacheDir = path.resolve(process.cwd(), SCHEMA_CACHE_DIR);
  fs.mkdirSync(cacheDir, { recursive: true });
  const cachePath = getCachePath(connName, table);
  const content = formatCSV(rows, DEFAULT_COL_WIDTH);
  fs.writeFileSync(cachePath, content, "utf-8");
  return cachePath;
}

function readCachedSchema(connName, table) {
  const cachePath = getCachePath(connName, table);
  if (fs.existsSync(cachePath)) {
    return fs.readFileSync(cachePath, "utf-8");
  }
  return null;
}

async function describeTable(connName, tableName) {
  const config = loadConfig();
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

    const output = formatCSV(rows, DEFAULT_COL_WIDTH);
    console.log(output);
    console.log(`(${rows.length} columns)`);

    const cachePath = cacheSchema(connName, tableName, rows);
    console.error(`[mysql] Schema cached: ${path.relative(process.cwd(), cachePath)}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    if (err.code) console.error(`Code: ${err.code}`);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

function listCachedSchemas(connName) {
  const cacheDir = path.resolve(process.cwd(), SCHEMA_CACHE_DIR);
  if (!fs.existsSync(cacheDir)) {
    console.log("No cached schemas. Run --describe <connection> <table> to cache.");
    return;
  }

  const files = fs.readdirSync(cacheDir).filter((f) => f.endsWith(".txt"));
  const prefix = connName ? `${connName}.` : "";
  const matching = files.filter((f) => f.startsWith(prefix));

  if (matching.length === 0) {
    console.log(
      connName
        ? `No cached schemas for "${connName}".`
        : "No cached schemas."
    );
    return;
  }

  console.log("Cached schemas:");
  for (const f of matching.sort()) {
    const name = f.replace(/\.txt$/, "");
    const dotIdx = name.indexOf(".");
    const conn = name.slice(0, dotIdx);
    const table = name.slice(dotIdx + 1);
    console.log(`  ${conn} → ${table}`);
  }
}

function showCachedSchema(connName, tableName) {
  const cached = readCachedSchema(connName, tableName);
  if (!cached) {
    console.error(`No cached schema for ${connName}.${tableName}.`);
    console.error(`Run: --describe ${connName} ${tableName}`);
    process.exit(1);
  }
  console.log(cached);
  console.log(`(from cache: ${path.relative(process.cwd(), getCachePath(connName, tableName))})`);
}

// ── Formatters ───────────────────────────────────────────────────────────────

function truncate(value, maxLen) {
  const s = value == null ? "NULL" : String(value);
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 3) + "...";
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

  // --describe <connection> <table>
  if (args.includes("--describe")) {
    const idx = args.indexOf("--describe");
    const connName = args[idx + 1];
    const tableName = args[idx + 2];
    if (!connName || !tableName || connName.startsWith("--") || tableName.startsWith("--")) {
      console.error("Usage: --describe <connection> <table>");
      process.exit(1);
    }
    await describeTable(connName, tableName);
    return;
  }

  // --schemas [connection]
  if (args.includes("--schemas")) {
    const idx = args.indexOf("--schemas");
    const connName =
      args[idx + 1] && !args[idx + 1].startsWith("--")
        ? args[idx + 1]
        : null;
    listCachedSchemas(connName);
    return;
  }

  // --cached-schema <connection> <table>
  if (args.includes("--cached-schema")) {
    const idx = args.indexOf("--cached-schema");
    const connName = args[idx + 1];
    const tableName = args[idx + 2];
    if (!connName || !tableName) {
      console.error("Usage: --cached-schema <connection> <table>");
      process.exit(1);
    }
    showCachedSchema(connName, tableName);
    return;
  }

  if (args.length < 2) {
    console.error("Usage: node sql.js <connection-name> <sql> [--format=table|json|csv] [--params='[...]']");
    console.error("       node sql.js --init                        Create template config file");
    console.error("       node sql.js --list                        List available connections");
    console.error("       node sql.js --test [name]                 Test connection(s)");
    console.error("       node sql.js --describe <conn> <table>     Describe table & cache schema");
    console.error("       node sql.js --schemas [conn]              List cached schemas");
    console.error("       node sql.js --cached-schema <conn> <tbl>  Show cached schema");
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
      params = JSON.parse(args[i].split("=").slice(1).join("="));
    } else if (args[i].startsWith("--limit=")) {
      rowLimit = parseInt(args[i].split("=")[1], 10);
    } else if (args[i].startsWith("--col-width=")) {
      colWidth = parseInt(args[i].split("=")[1], 10);
    }
  }

  const config = loadConfig();
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
      }, null, 2));
      return;
    }

    // Auto-cache DESCRIBE/DESC results
    const sqlUpper = sql.trim().toUpperCase();
    if (sqlUpper.startsWith("DESCRIBE ") || sqlUpper.startsWith("DESC ")) {
      const tableName = sql.trim().split(/\s+/)[1].replace(/[`'"]/g, "");
      if (rows.length > 0) {
        const cachePath = cacheSchema(connName, tableName, rows);
        console.error(`[mysql] Schema cached: ${path.relative(process.cwd(), cachePath)}`);
      }
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
        console.log(JSON.stringify(displayRows, null, 2));
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

    // Hint for common column errors
    if (err.message.includes("Unknown column")) {
      console.error(`\nHint: Run DESCRIBE first to see available columns:`);
      console.error(`  node sql.js --describe ${connName} <table_name>`);
      console.error(`Or check cached schemas: node sql.js --schemas ${connName}`);
    }

    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

main();
