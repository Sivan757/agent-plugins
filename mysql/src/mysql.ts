#!/usr/bin/env node

/**
 * mysql.ts - MySQL query executor for Claude Code.
 *
 * Usage:
 *   node mysql.mjs <connection-name> <sql> [--format=table|json|csv] [--params='["val1","val2"]']
 *   node mysql.mjs --columns <connection> <table>   List column names of a table
 *   node mysql.mjs --list                             List connections
 *   node mysql.mjs --test [name]                      Test connection(s)
 *   node mysql.mjs --init                             Create template config
 *
 * Config: ~/.cache/apex-plugin/mysql.json
 */

import mysql from 'mysql2/promise';
import { Command } from 'commander';

import { requireConfig, saveConfig, configPath, PluginError } from '@apex/core';

const DEFAULT_ROW_LIMIT = 1;
const DEFAULT_COL_WIDTH = 40;

interface MySQLConnectionConfig {
  host: string;
  port?: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean | Record<string, unknown>;
}

interface MySQLConfig extends Record<string, unknown> {
  connections: Record<string, MySQLConnectionConfig>;
}

function info(msg: string): void {
  process.stderr.write(`[mysql] ${msg}\n`);
}

// ── Configuration ────────────────────────────────────────────────────────────

function printTemplate(): void {
  const CONFIG_PATH = configPath('mysql');
  import('fs').then(({ existsSync }) => {
    if (existsSync(CONFIG_PATH)) {
      console.error(`Error: Config already exists at ${CONFIG_PATH}`);
      process.exit(1);
    }
  });
  const template = { connections: {} };
  saveConfig('mysql', template).then(() => {
    console.log(`Created: ${CONFIG_PATH}`);
    console.log('Edit this file to add your database connection details.');
    console.log('');
    console.log('Example connection format:');
    console.log('  { "connections": { "mydb": { "host": "127.0.0.1", "port": 3306, "user": "root", "password": "", "database": "mydb" } } }');
  }).catch((e: Error) => {
    console.error(`Error creating config: ${e.message}`);
    process.exit(1);
  });
}

async function listConnections(): Promise<void> {
  let config: MySQLConfig | null;
  try {
    config = await requireConfig<MySQLConfig>('mysql');
  } catch (e) {
    if (e instanceof PluginError && e.code === 'CONFIG_MISSING') {
      console.error(`No config found. Run --init to create ${configPath('mysql')}`);
      process.exit(1);
    }
    throw e;
  }
  const names = Object.keys(config.connections || {});
  if (names.length === 0) {
    console.log('No connections defined.');
    return;
  }
  console.log('Available connections:');
  for (const name of names) {
    const c = config.connections[name];
    console.log(`  ${name} → ${c.database} (${c.host}:${c.port || 3306})`);
  }
}

function createConnection(connConfig: MySQLConnectionConfig): Promise<mysql.Connection> {
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
    ...(connConfig.ssl ? { ssl: connConfig.ssl as mysql.SslOptions } : {}),
  });
}

async function testConnections(targetName: string | null): Promise<void> {
  let config: MySQLConfig;
  try {
    config = await requireConfig<MySQLConfig>('mysql');
  } catch (e) {
    if (e instanceof PluginError && e.code === 'CONFIG_MISSING') {
      console.error(`No config found. Run --init to create ${configPath('mysql')}`);
      process.exit(1);
    }
    throw e;
  }

  const entries = Object.entries(config.connections || {});
  if (entries.length === 0) {
    console.log('No connections defined.');
    return;
  }

  const toTest = targetName
    ? entries.filter(([name]) => name === targetName)
    : entries;

  if (targetName && toTest.length === 0) {
    console.error(`Error: Connection "${targetName}" not found.`);
    await listConnections();
    process.exit(1);
  }

  for (const [name, connConfig] of toTest) {
    let connection: mysql.Connection | undefined;
    try {
      connection = await createConnection(connConfig);
      await connection.execute('SELECT 1');
      console.log(`  ${name} → OK (${connConfig.database})`);
    } catch (err) {
      console.log(`  ${name} → FAILED: ${(err as Error).message}`);
    } finally {
      if (connection) await connection.end();
    }
  }
}

// ── Column Listing ───────────────────────────────────────────────────────────

async function listColumns(connName: string, tableName: string): Promise<void> {
  let config: MySQLConfig;
  try {
    config = await requireConfig<MySQLConfig>('mysql');
  } catch (e) {
    if (e instanceof PluginError && e.code === 'CONFIG_MISSING') {
      console.error(`No config found. Run --init to create ${configPath('mysql')}`);
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

  let connection: mysql.Connection | undefined;
  try {
    connection = await createConnection(connConfig);
    const [rows] = await connection.execute(`DESCRIBE \`${tableName}\``);

    if (!Array.isArray(rows) || rows.length === 0) {
      console.log(`(table "${tableName}" not found or empty)`);
      return;
    }

    for (const row of rows as Array<{ Field: string }>) {
      console.log(row.Field);
    }
    info(`${(rows as unknown[]).length} columns in ${tableName}`);
  } catch (err) {
    const mysqlErr = err as Error & { code?: string };
    console.error(`Error: ${mysqlErr.message}`);
    if (mysqlErr.code) console.error(`Code: ${mysqlErr.code}`);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

// ── Database Discovery ───────────────────────────────────────────────────────

async function listDatabases(connName: string): Promise<void> {
  let config: MySQLConfig;
  try {
    config = await requireConfig<MySQLConfig>('mysql');
  } catch (e) {
    if (e instanceof PluginError && e.code === 'CONFIG_MISSING') {
      console.error(`No config found. Run --init to create ${configPath('mysql')}`);
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

  let connection: mysql.Connection | undefined;
  try {
    connection = await createConnection(connConfig);
    const [rows] = await connection.execute('SHOW DATABASES');
    const systemDbs = new Set(['information_schema', 'mysql', 'performance_schema', 'sys']);
    const dbs = (rows as Array<{ Database: string }>)
      .map((r) => r.Database)
      .filter((d) => !systemDbs.has(d));
    console.log('Available databases:');
    for (const db of dbs) {
      const marker = db === connConfig.database ? ' (default)' : '';
      console.log(`  ${db}${marker}`);
    }
    info(`${dbs.length} databases on ${connConfig.host}`);
  } catch (err) {
    const mysqlErr = err as Error & { code?: string };
    console.error(`Error: ${mysqlErr.message}`);
    if (mysqlErr.code) console.error(`Code: ${mysqlErr.code}`);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

async function findTable(connName: string, tableName: string): Promise<void> {
  let config: MySQLConfig;
  try {
    config = await requireConfig<MySQLConfig>('mysql');
  } catch (e) {
    if (e instanceof PluginError && e.code === 'CONFIG_MISSING') {
      console.error(`No config found. Run --init to create ${configPath('mysql')}`);
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

  let connection: mysql.Connection | undefined;
  try {
    connection = await createConnection(connConfig);
    // Search across all databases for the table (exact or LIKE match)
    const isPattern = tableName.includes('%');
    const sql = isPattern
      ? "SELECT TABLE_SCHEMA, TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES WHERE TABLE_NAME LIKE ? AND TABLE_SCHEMA NOT IN ('information_schema','mysql','performance_schema','sys') ORDER BY TABLE_SCHEMA, TABLE_NAME"
      : "SELECT TABLE_SCHEMA, TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES WHERE TABLE_NAME = ? AND TABLE_SCHEMA NOT IN ('information_schema','mysql','performance_schema','sys') ORDER BY TABLE_SCHEMA, TABLE_NAME";
    const [rows] = await connection.execute(sql, [tableName]);

    const tableRows = rows as Array<{ TABLE_SCHEMA: string; TABLE_NAME: string; TABLE_ROWS: number | null }>;

    if (tableRows.length === 0) {
      console.error(`Table "${tableName}" not found in any database on this connection.`);
      if (!isPattern) {
        console.error(`Hint: Try fuzzy search with --find-table ${connName} "%${tableName}%"`);
      }
      process.exit(1);
    }

    for (const row of tableRows) {
      console.log(`${row.TABLE_SCHEMA}.${row.TABLE_NAME} (~${row.TABLE_ROWS ?? '?'} rows)`);
    }
    info(`Found in ${tableRows.length} location(s). Use database.table syntax in queries, e.g.:`);
    if (tableRows.length > 0) {
      info(`  node mysql.mjs ${connName} "SELECT * FROM ${tableRows[0].TABLE_SCHEMA}.${tableRows[0].TABLE_NAME} LIMIT 1"`);
    }
  } catch (err) {
    const mysqlErr = err as Error & { code?: string };
    console.error(`Error: ${mysqlErr.message}`);
    if (mysqlErr.code) console.error(`Code: ${mysqlErr.code}`);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

// ── Formatters ───────────────────────────────────────────────────────────────

function truncate(value: unknown, maxLen: number): string {
  const s = value == null ? 'NULL' : String(value);
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 3) + '...';
}

function formatCompact(rows: Record<string, unknown>[], colWidth: number): string {
  if (!rows || rows.length === 0) return '(empty)';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join('\t')];
  for (const row of rows) {
    lines.push(headers.map((h) => truncate(row[h], colWidth)).join('\t'));
  }
  return lines.join('\n');
}

function formatCSV(rows: Record<string, unknown>[], colWidth: number): string {
  if (!rows || rows.length === 0) return '(empty result set)';
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown): string => {
    const s = truncate(v, colWidth);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

function formatTable(rows: Record<string, unknown>[], colWidth: number): string {
  if (!rows || rows.length === 0) return '(empty result set)';
  const headers = Object.keys(rows[0]);
  const cells = rows.map((r) => headers.map((h) => truncate(r[h], colWidth)));
  const widths = headers.map((h, i) =>
    Math.min(colWidth, Math.max(h.length, ...cells.map((c) => c[i].length)))
  );
  const sep = '+' + widths.map((w) => '-'.repeat(w + 2)).join('+') + '+';
  const fmt = (vals: string[]): string =>
    '|' + vals.map((v, i) => ' ' + v.padEnd(widths[i]) + ' ').join('|') + '|';

  return [sep, fmt(headers), sep, ...cells.map((c) => fmt(c)), sep].join('\n');
}

// ── Main ─────────────────────────────────────────────────────────────────────

const program = new Command();

program
  .name('mysql')
  .description('MySQL query executor for Claude Code')
  .version('0.7.0')
  .option('--user-confirmed', 'Bypass write-operation guard (after user approval)');

// query command (default)
program
  .command('query', { isDefault: true })
  .description('Execute a SQL query against a named connection')
  .argument('<connection>', 'Connection name')
  .argument('<sql>', 'SQL query to execute')
  .option('--format <fmt>', 'Output format: table|json|csv|compact', 'csv')
  .option('--params <json>', 'Parameterized query values as JSON array')
  .option('--limit <n>', 'Max rows to display (0 = unlimited)', String(DEFAULT_ROW_LIMIT))
  .option('--col-width <n>', 'Max column display width', String(DEFAULT_COL_WIDTH))
  .action(async (connection: string, sql: string, opts: { format: string; params?: string; limit: string; colWidth: string }) => {
    let params: unknown[] = [];
    if (opts.params) {
      try {
        params = JSON.parse(opts.params) as unknown[];
      } catch (e) {
        console.error(`Error: Invalid --params JSON: ${(e as Error).message}`);
        process.exit(1);
      }
    }

    const rowLimit = parseInt(opts.limit, 10);
    if (isNaN(rowLimit) || rowLimit < 0) {
      console.error('Error: Invalid --limit value. Must be a non-negative integer.');
      process.exit(1);
    }

    const colWidth = parseInt(opts.colWidth, 10);

    let config: MySQLConfig;
    try {
      config = await requireConfig<MySQLConfig>('mysql');
    } catch (e) {
      if (e instanceof PluginError && e.code === 'CONFIG_MISSING') {
        console.error(`No config found. Run init to create ${configPath('mysql')}`);
        process.exit(1);
      }
      throw e;
    }

    const connConfig = (config.connections || {})[connection];
    if (!connConfig) {
      console.error(`Error: Connection "${connection}" not found.`);
      await listConnections();
      process.exit(1);
    }

    let conn: mysql.Connection | undefined;
    try {
      conn = await createConnection(connConfig);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [rows, fields] = await conn.execute(sql, params as any);

      // DDL/DML statements return OkPacket
      if (!Array.isArray(rows)) {
        const okPacket = rows as mysql.OkPacket;
        console.log(JSON.stringify({
          affectedRows: okPacket.affectedRows,
          insertId: okPacket.insertId != null ? String(okPacket.insertId) : undefined,
          changedRows: (okPacket as mysql.OkPacket & { changedRows?: number }).changedRows,
          info: (okPacket as mysql.OkPacket & { info?: string }).info,
        }));
        return;
      }

      void fields; // fields metadata available but not used for output

      if (rows.length === 0) {
        console.log('(empty result set)');
        return;
      }

      const typedRows = rows as Record<string, unknown>[];
      const totalRows = typedRows.length;
      const truncated = rowLimit > 0 && totalRows > rowLimit;
      const displayRows = truncated ? typedRows.slice(0, rowLimit) : typedRows;

      switch (opts.format) {
        case 'json':
          console.log(JSON.stringify(displayRows));
          break;
        case 'compact':
          console.log(formatCompact(displayRows, colWidth));
          break;
        case 'csv':
          console.log(formatCSV(displayRows, colWidth));
          break;
        case 'table':
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
      const mysqlErr = err as Error & { code?: string; sqlState?: string };
      console.error(`Error: ${mysqlErr.message}`);
      if (mysqlErr.code) console.error(`Code: ${mysqlErr.code}`);
      if (mysqlErr.sqlState) console.error(`SQL State: ${mysqlErr.sqlState}`);

      if (mysqlErr.message.includes('Unknown column')) {
        console.error(`\nHint: Run columns to see available column names:`);
        console.error(`  node mysql.mjs columns ${connection} <table_name>`);
      }

      if (mysqlErr.code === 'ER_NO_SUCH_TABLE') {
        // Extract table name from error message
        const tableMatch = mysqlErr.message.match(/Table '([^']+)'/);
        const badTable = tableMatch ? tableMatch[1].split('.').pop() : '<table>';
        console.error(`\nHint: The table may exist in a different database. Find it with:`);
        console.error(`  node mysql.mjs find-table ${connection} ${badTable}`);
        console.error(`  node mysql.mjs databases ${connection}`);
      }

      process.exit(1);
    } finally {
      if (conn) await conn.end();
    }
  });

// init command
program
  .command('init')
  .description('Create config template at ~/.cache/apex-plugin/mysql.json')
  .action(() => {
    printTemplate();
  });

// list command
program
  .command('list')
  .description('List available connections')
  .action(async () => {
    await listConnections();
  });

// test command
program
  .command('test')
  .description('Test connection(s)')
  .argument('[name]', 'Connection name to test (omit to test all)')
  .action(async (name?: string) => {
    await testConnections(name ?? null);
  });

// columns command
program
  .command('columns')
  .description('List column names of a table')
  .argument('<connection>', 'Connection name')
  .argument('<table>', 'Table name')
  .action(async (connection: string, table: string) => {
    await listColumns(connection, table);
  });

// databases command
program
  .command('databases')
  .description('List all databases on the connection')
  .argument('<connection>', 'Connection name')
  .action(async (connection: string) => {
    await listDatabases(connection);
  });

// find-table command
program
  .command('find-table')
  .description('Find which database a table belongs to')
  .argument('<connection>', 'Connection name')
  .argument('<table>', 'Table name or pattern (e.g. %user%)')
  .action(async (connection: string, table: string) => {
    await findTable(connection, table);
  });

program.parseAsync();
