#!/usr/bin/env node

// src/postgresql.ts
import pg from "pg";

// ../packages/core/dist/config.js
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { homedir } from "os";

// ../packages/core/dist/errors.js
var PluginError = class extends Error {
  code;
  exitCode;
  constructor(message, code, exitCode = 1) {
    super(message);
    this.code = code;
    this.exitCode = exitCode;
    this.name = "PluginError";
  }
};

// ../packages/core/dist/config.js
var CACHE_DIR = join(homedir(), ".cache", "apex-plugin");
function configPath(pluginName) {
  return join(CACHE_DIR, `${pluginName}.json`);
}
async function loadConfig(pluginName) {
  const path = configPath(pluginName);
  if (!existsSync(path))
    return null;
  try {
    const raw = await readFile(path, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    throw new PluginError(`Failed to parse config at ${path}: ${e.message}`, "CONFIG_INVALID");
  }
}
async function saveConfig(pluginName, data, merge = false) {
  const path = configPath(pluginName);
  await mkdir(dirname(path), { recursive: true });
  let finalData = data;
  if (merge) {
    const existing = await loadConfig(pluginName);
    if (existing) {
      finalData = { ...existing, ...data };
    }
  }
  await writeFile(path, JSON.stringify(finalData, null, 2) + "\n", "utf-8");
}
async function requireConfig(pluginName) {
  const config = await loadConfig(pluginName);
  if (!config) {
    throw new PluginError(`No config found at ${configPath(pluginName)}. Run the plugin setup to configure credentials.`, "CONFIG_MISSING");
  }
  return config;
}

// src/postgresql.ts
var { Client } = pg;
var DEFAULT_ROW_LIMIT = 1;
var DEFAULT_COL_WIDTH = 40;
function info(msg) {
  process.stderr.write(`[postgresql] ${msg}
`);
}
function die(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}
function printTemplate() {
  const CONFIG_PATH = configPath("postgresql");
  import("fs").then(({ existsSync: existsSync2 }) => {
    if (existsSync2(CONFIG_PATH)) {
      console.error(`Error: Config already exists at ${CONFIG_PATH}`);
      process.exit(1);
    }
  });
  const template = { connections: {} };
  saveConfig("postgresql", template).then(() => {
    console.log(`Created: ${CONFIG_PATH}`);
    console.log("Edit this file to add your database connection details.");
    console.log("");
    console.log("Example connection format:");
    console.log('  { "connections": { "mydb": { "host": "127.0.0.1", "port": 5432, "user": "postgres", "password": "", "database": "mydb" } } }');
  }).catch((e) => {
    console.error(`Error creating config: ${e.message}`);
    process.exit(1);
  });
}
async function listConnections() {
  let config;
  try {
    config = await requireConfig("postgresql");
  } catch (e) {
    if (e instanceof PluginError && e.code === "CONFIG_MISSING") {
      console.error(`No config found. Run --init to create ${configPath("postgresql")}`);
      process.exit(1);
    }
    throw e;
  }
  const names = Object.keys(config.connections || {});
  if (names.length === 0) {
    console.log("No connections defined.");
    return;
  }
  console.log("Available connections:");
  for (const name of names) {
    const c = config.connections[name];
    console.log(`  ${name} \u2192 ${c.database} (${c.host}:${c.port || 5432})`);
  }
}
function createClient(connConfig) {
  const needsSSL = connConfig.host !== "localhost" && connConfig.host !== "127.0.0.1" && connConfig.host !== "::1";
  const clientConfig = {
    host: connConfig.host,
    port: connConfig.port || 5432,
    user: connConfig.user,
    password: connConfig.password,
    database: connConfig.database,
    connectionTimeoutMillis: 1e4
  };
  if (connConfig.ssl !== void 0) {
    clientConfig["ssl"] = connConfig.ssl ? { rejectUnauthorized: false } : false;
  } else if (needsSSL) {
    clientConfig["ssl"] = { rejectUnauthorized: false };
  }
  return new Client(clientConfig);
}
async function testConnections(targetName) {
  let config;
  try {
    config = await requireConfig("postgresql");
  } catch (e) {
    if (e instanceof PluginError && e.code === "CONFIG_MISSING") {
      console.error(`No config found. Run --init to create ${configPath("postgresql")}`);
      process.exit(1);
    }
    throw e;
  }
  const entries = Object.entries(config.connections || {});
  if (entries.length === 0) {
    console.log("No connections defined.");
    return;
  }
  const toTest = targetName ? entries.filter(([name]) => name === targetName) : entries;
  if (targetName && toTest.length === 0) {
    console.error(`Error: Connection "${targetName}" not found.`);
    await listConnections();
    process.exit(1);
  }
  for (const [name, connConfig] of toTest) {
    const client = createClient(connConfig);
    try {
      await client.connect();
      await client.query("SELECT 1");
      await client.end();
      console.log(`  ${name} \u2192 OK (${connConfig.database})`);
    } catch (err) {
      await client.end().catch(() => {
      });
      console.log(`  ${name} \u2192 FAILED: ${err.message}`);
    }
  }
}
async function listColumns(connName, schemaName, tableName) {
  let config;
  try {
    config = await requireConfig("postgresql");
  } catch (e) {
    if (e instanceof PluginError && e.code === "CONFIG_MISSING") {
      die(`No config found. Run --init to create ${configPath("postgresql")}`);
    }
    throw e;
  }
  const connConfig = (config.connections || {})[connName];
  if (!connConfig) {
    console.error(`Error: Connection "${connName}" not found.`);
    await listConnections();
    process.exit(1);
  }
  const client = createClient(connConfig);
  try {
    await client.connect();
    const schema = schemaName || "public";
    const query = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = $2
      ORDER BY ordinal_position`;
    const res = await client.query(query, [schema, tableName]);
    if (res.rows.length === 0) {
      console.log(`(table "${schema}.${tableName}" not found or empty)`);
      return;
    }
    for (const row of res.rows) {
      console.log(`${row.column_name} (${row.data_type}${row.is_nullable === "YES" ? ", nullable" : ""})`);
    }
    info(`${res.rows.length} columns in ${schema}.${tableName}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  } finally {
    await client.end().catch(() => {
    });
  }
}
async function listDatabases(connName) {
  let config;
  try {
    config = await requireConfig("postgresql");
  } catch (e) {
    if (e instanceof PluginError && e.code === "CONFIG_MISSING") {
      die(`No config found. Run --init to create ${configPath("postgresql")}`);
    }
    throw e;
  }
  const connConfig = (config.connections || {})[connName];
  if (!connConfig) {
    console.error(`Error: Connection "${connName}" not found.`);
    await listConnections();
    process.exit(1);
  }
  const client = createClient(connConfig);
  try {
    await client.connect();
    const res = await client.query(
      "SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname"
    );
    const systemDbs = /* @__PURE__ */ new Set(["postgres", "template0", "template1"]);
    const dbs = res.rows.map((r) => r.datname).filter((d) => !systemDbs.has(d));
    console.log("Available databases:");
    for (const db of dbs) {
      const marker = db === connConfig.database ? " (default)" : "";
      console.log(`  ${db}${marker}`);
    }
    info(`${dbs.length} databases on ${connConfig.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  } finally {
    await client.end().catch(() => {
    });
  }
}
async function listSchemas(connName) {
  let config;
  try {
    config = await requireConfig("postgresql");
  } catch (e) {
    if (e instanceof PluginError && e.code === "CONFIG_MISSING") {
      die(`No config found. Run --init to create ${configPath("postgresql")}`);
    }
    throw e;
  }
  const connConfig = (config.connections || {})[connName];
  if (!connConfig) {
    console.error(`Error: Connection "${connName}" not found.`);
    await listConnections();
    process.exit(1);
  }
  const client = createClient(connConfig);
  try {
    await client.connect();
    const res = await client.query(`
      SELECT schema_name FROM information_schema.schemata
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schema_name`);
    console.log("Available schemas:");
    for (const row of res.rows) {
      console.log(`  ${row.schema_name}`);
    }
    info(`${res.rows.length} schemas`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  } finally {
    await client.end().catch(() => {
    });
  }
}
async function findTable(connName, tableName) {
  let config;
  try {
    config = await requireConfig("postgresql");
  } catch (e) {
    if (e instanceof PluginError && e.code === "CONFIG_MISSING") {
      die(`No config found. Run --init to create ${configPath("postgresql")}`);
    }
    throw e;
  }
  const connConfig = (config.connections || {})[connName];
  if (!connConfig) {
    console.error(`Error: Connection "${connName}" not found.`);
    await listConnections();
    process.exit(1);
  }
  const client = createClient(connConfig);
  try {
    await client.connect();
    const isPattern = tableName.includes("%");
    let query;
    let params;
    if (isPattern) {
      query = `
        SELECT table_schema, table_name,
          (SELECT reltuples FROM pg_class WHERE relname = table_name) AS estimated_rows
        FROM information_schema.tables
        WHERE table_name LIKE $1
          AND table_schema NOT IN ('pg_catalog', 'information_schema')
          AND table_type = 'BASE TABLE'
        ORDER BY table_schema, table_name`;
      params = [tableName];
    } else {
      query = `
        SELECT table_schema, table_name,
          (SELECT reltuples FROM pg_class WHERE relname = table_name) AS estimated_rows
        FROM information_schema.tables
        WHERE table_name = $1
          AND table_schema NOT IN ('pg_catalog', 'information_schema')
          AND table_type = 'BASE TABLE'
        ORDER BY table_schema, table_name`;
      params = [tableName];
    }
    const res = await client.query(query, params);
    if (res.rows.length === 0) {
      console.error(`Table "${tableName}" not found in any schema on this connection.`);
      if (!isPattern) {
        console.error(`Hint: Try fuzzy search with --find-table ${connName} "%${tableName}%"`);
      }
      process.exit(1);
    }
    for (const row of res.rows) {
      const rows = row.estimated_rows != null ? `~${Math.round(Number(row.estimated_rows))}` : "?";
      console.log(`${row.table_schema}.${row.table_name} (~${rows} rows)`);
    }
    info(`Found in ${res.rows.length} location(s). Use schema.table syntax in queries, e.g.:`);
    if (res.rows.length > 0) {
      const first = res.rows[0];
      info(`  node postgresql.mjs ${connName} "SELECT * FROM ${first.table_schema}.${first.table_name} LIMIT 1"`);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  } finally {
    await client.end().catch(() => {
    });
  }
}
function truncate(value, maxLen) {
  const s = value == null ? "NULL" : String(value);
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 3) + "...";
}
function formatCompact(rows, colWidth) {
  if (!rows || rows.length === 0) return "(empty)";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join("	")];
  for (const row of rows) {
    lines.push(headers.map((h) => truncate(row[h], colWidth)).join("	"));
  }
  return lines.join("\n");
}
function formatCSV(rows, colWidth) {
  if (!rows || rows.length === 0) return "(empty result set)";
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    const s = truncate(v, colWidth);
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
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
  const widths = headers.map(
    (h, i) => Math.min(colWidth, Math.max(h.length, ...cells.map((c) => c[i].length)))
  );
  const sep = "+" + widths.map((w) => "-".repeat(w + 2)).join("+") + "+";
  const fmt = (vals) => "|" + vals.map((v, i) => " " + v.padEnd(widths[i]) + " ").join("|") + "|";
  return [sep, fmt(headers), sep, ...cells.map((c) => fmt(c)), sep].join("\n");
}
async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    const CONFIG_PATH = configPath("postgresql");
    console.log(`Usage:
  node postgresql.mjs <connection-name> <sql> [options]
  node postgresql.mjs --init                             Create config template
  node postgresql.mjs --list                             List available connections
  node postgresql.mjs --test [name]                      Test connection(s)
  node postgresql.mjs --columns <conn> [schema] <table>  List column names of a table
  node postgresql.mjs --databases <conn>                 List all databases on the connection
  node postgresql.mjs --schemas <conn>                   List all schemas in the connection's database
  node postgresql.mjs --find-table <conn> <table|%pat%>  Find which schema a table belongs to

Config: ${CONFIG_PATH}

Options:
  --format=csv|table|json|compact  Output format (default: csv)
  --params='["val"]'             Parameterized query values
  --limit=N                      Max rows (default: 1, 0=unlimited)
  --col-width=N                  Max column width (default: 40)`);
    return;
  }
  if (args.includes("--init")) {
    printTemplate();
    return;
  }
  if (args.includes("--list")) {
    await listConnections();
    return;
  }
  if (args.includes("--test")) {
    const testIdx = args.indexOf("--test");
    const targetName = args[testIdx + 1] && !args[testIdx + 1].startsWith("--") ? args[testIdx + 1] : null;
    await testConnections(targetName);
    return;
  }
  if (args.includes("--columns")) {
    const idx = args.indexOf("--columns");
    const connName2 = args[idx + 1];
    const schemaName = args[idx + 2];
    const tableName = args[idx + 3];
    if (!connName2 || !tableName || connName2.startsWith("--") || tableName.startsWith("--")) {
      console.error("Usage: --columns <connection> [schema] <table>");
      console.error("       (schema defaults to 'public')");
      process.exit(1);
    }
    await listColumns(connName2, schemaName, tableName);
    return;
  }
  if (args.includes("--databases")) {
    const idx = args.indexOf("--databases");
    const connName2 = args[idx + 1];
    if (!connName2 || connName2.startsWith("--")) {
      console.error("Usage: --databases <connection>");
      process.exit(1);
    }
    await listDatabases(connName2);
    return;
  }
  if (args.includes("--schemas")) {
    const idx = args.indexOf("--schemas");
    const connName2 = args[idx + 1];
    if (!connName2 || connName2.startsWith("--")) {
      console.error("Usage: --schemas <connection>");
      process.exit(1);
    }
    await listSchemas(connName2);
    return;
  }
  if (args.includes("--find-table")) {
    const idx = args.indexOf("--find-table");
    const connName2 = args[idx + 1];
    const tableName = args[idx + 2];
    if (!connName2 || !tableName || connName2.startsWith("--") || tableName.startsWith("--")) {
      console.error("Usage: --find-table <connection> <table_name_or_pattern>");
      process.exit(1);
    }
    await findTable(connName2, tableName);
    return;
  }
  if (args.length < 2) {
    console.error("Usage: node postgresql.mjs <connection-name> <sql> [--format=table|json|csv] [--params='[...]']");
    console.error("       node postgresql.mjs --help                         Show full help");
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
        console.error("Error: Invalid --limit value. Must be a non-negative integer.");
        process.exit(1);
      }
    } else if (args[i].startsWith("--col-width=")) {
      colWidth = parseInt(args[i].split("=")[1], 10);
    }
  }
  let config;
  try {
    config = await requireConfig("postgresql");
  } catch (e) {
    if (e instanceof PluginError && e.code === "CONFIG_MISSING") {
      console.error(`No config found. Run --init to create ${configPath("postgresql")}`);
      process.exit(1);
    }
    throw e;
  }
  const connConfig = (config.connections || {})[connName];
  if (!connConfig) {
    console.error(`Error: Connection "${connName}" not found.`);
    await listConnections();
    process.exit(1);
  }
  const client = createClient(connConfig);
  try {
    await client.connect();
    const res = await client.query(
      { text: sql, values: params, rowMode: "object" }
    );
    if (res.fields === void 0 || res.fields.length === 0) {
      console.log(JSON.stringify({
        rowCount: res.rowCount,
        command: res.command
      }));
      return;
    }
    const rows = res.rows;
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
    if (truncated) {
      console.log(`(${rowLimit} of ${totalRows} rows shown, use --limit=0 for all)`);
    } else {
      console.log(`(${totalRows} rows)`);
    }
  } catch (err) {
    const pgErr = err;
    console.error(`Error: ${pgErr.message}`);
    if (pgErr.code) console.error(`Code: ${pgErr.code}`);
    if (pgErr.schema) console.error(`Schema: ${pgErr.schema}`);
    if (pgErr.table) console.error(`Table: ${pgErr.table}`);
    if (pgErr.message.includes("does not exist") || pgErr.code === "42P01") {
      const tableMatch = pgErr.message.match(/"([^"]+)"$/);
      const badTable = tableMatch ? tableMatch[1] : "<table>";
      if (badTable && !badTable.includes(" ")) {
        console.error(`
Hint: The table may exist in a different schema. Find it with:`);
        console.error(`  node postgresql.mjs --find-table ${connName} ${badTable}`);
        console.error(`  node postgresql.mjs --schemas ${connName}`);
      }
    }
    if (pgErr.message.includes("undefined column") || pgErr.code === "42703") {
      const colMatch = pgErr.message.match(/column "([^"]+)"/i);
      const badCol = colMatch ? colMatch[1] : null;
      if (badCol && pgErr.table) {
        console.error(`
Hint: Check column names with:`);
        console.error(`  node postgresql.mjs --columns ${connName} <schema> ${pgErr.table}`);
      }
    }
    process.exit(1);
  } finally {
    await client.end().catch(() => {
    });
  }
}
main();
