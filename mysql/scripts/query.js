#!/usr/bin/env node

/**
 * MySQL query executor for Claude Code.
 *
 * Usage:
 *   node query.js <connection-name> <sql> [--format=table|json|csv] [--params='["val1","val2"]']
 *
 * Reads connection config from .claude/.mysql-connections.json in the current working directory.
 */

const fs = require("fs");
const path = require("path");

const CONFIG_DIR = ".claude";
const CONFIG_FILE = ".mysql-connections.json";
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
    // Auto-create template on first use
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
      connection = await mysql.createConnection({
        host: connConfig.host,
        port: connConfig.port || 3306,
        user: connConfig.user,
        password: connConfig.password,
        database: connConfig.database,
        connectTimeout: 10000,
        ...(connConfig.ssl ? { ssl: connConfig.ssl } : {}),
      });
      const [rows] = await connection.execute("SELECT 1");
      console.log(`  ${name} → OK (${connConfig.database})`);
    } catch (err) {
      console.log(`  ${name} → FAILED: ${err.message}`);
    } finally {
      if (connection) await connection.end();
    }
  }
}

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
    // Test specific connection or all connections
    const testIdx = args.indexOf("--test");
    const targetName = args[testIdx + 1] && !args[testIdx + 1].startsWith("--")
      ? args[testIdx + 1]
      : null;
    await testConnections(targetName);
    return;
  }

  if (args.length < 2) {
    console.error("Usage: node query.js <connection-name> <sql> [--format=table|json|csv] [--params='[...]']");
    console.error("       node query.js --init        Create template config file");
    console.error("       node query.js --list        List available connections");
    console.error("       node query.js --test [name] Test connection(s)");
    process.exit(1);
  }

  const connName = args[0];
  const sql = args[1];

  let format = "table";
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
    connection = await mysql.createConnection({
      host: connConfig.host,
      port: connConfig.port || 3306,
      user: connConfig.user,
      password: connConfig.password,
      database: connConfig.database,
      connectTimeout: 10000,
      ...(connConfig.ssl ? { ssl: connConfig.ssl } : {}),
    });

    const [rows, fields] = await connection.execute(sql, params);

    // DDL/DML statements return OkPacket
    if (!Array.isArray(rows)) {
      console.log(JSON.stringify({
        affectedRows: rows.affectedRows,
        insertId: rows.insertId != null ? Number(rows.insertId) : undefined,
        changedRows: rows.changedRows,
        info: rows.info,
      }, null, 2));
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

    // Summary line: always show count, note truncation if applicable
    if (truncated) {
      console.log(`(${rowLimit} of ${totalRows} rows shown, use --limit=0 for all)`);
    } else {
      console.log(`(${totalRows} rows)`);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    if (err.code) console.error(`Code: ${err.code}`);
    if (err.sqlState) console.error(`SQL State: ${err.sqlState}`);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

main();
