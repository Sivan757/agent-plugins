#!/usr/bin/env node

/**
 * postgresql.ts - PostgreSQL query executor for Claude Code.
 *
 * Usage:
 *   node postgresql.mjs query <connection-name> <sql> [--format=table|json|csv] [--params='["val1","val2"]']
 *   node postgresql.mjs columns <connection> [schema] <table>  List column names of a table
 *   node postgresql.mjs list                             List connections
 *   node postgresql.mjs test [name]                     Test connection(s)
 *   node postgresql.mjs init                             Create template config
 *
 * Config: ~/.cache/apex-plugin/postgresql.json
 */

import pg from 'pg';
import { Command } from 'commander';

import { requireConfigWithSetup, saveConfig, configPath } from '@apex/core';
import type { ConfigUIOptions } from '@apex/core';

const { Client } = pg;

const DEFAULT_ROW_LIMIT = 1;
const DEFAULT_COL_WIDTH = 40;

interface PostgresConnectionConfig {
  host: string;
  port?: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean | Record<string, unknown>;
}

interface PostgresConfig extends Record<string, unknown> {
  connections: Record<string, PostgresConnectionConfig>;
}

function info(msg: string): void {
  process.stderr.write(`[postgresql] ${msg}\n`);
}

function die(msg: string): never {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

const PG_CONFIG_UI: ConfigUIOptions = {
  spec: {
    root: 'page',
    elements: {
      'page': {
        type: 'Header',
        props: { title: 'PostgreSQL', description: { en: 'Configure your database connections', zh: '配置数据库连接' }, configPath: null },
        children: ['connections', 'save'],
      },
      'connections': {
        type: 'Collection',
        props: { title: { en: 'Connections', zh: '连接' }, itemLabel: { en: 'Connection', zh: '连接' }, statePath: '/connections', nameEditable: true },
        children: ['conn-host', 'conn-port', 'conn-user', 'conn-password', 'conn-database', 'conn-ssl'],
      },
      'conn-host': {
        type: 'Field',
        props: { label: { en: 'Host', zh: '主机地址' }, type: 'text', required: true, help: null, placeholder: '127.0.0.1', options: null, statePath: 'host' },
      },
      'conn-port': {
        type: 'Field',
        props: { label: { en: 'Port', zh: '端口' }, type: 'number', required: false, help: null, placeholder: '5432', options: null, statePath: 'port' },
      },
      'conn-user': {
        type: 'Field',
        props: { label: { en: 'Username', zh: '用户名' }, type: 'text', required: true, help: null, placeholder: null, options: null, statePath: 'user' },
      },
      'conn-password': {
        type: 'Field',
        props: { label: { en: 'Password', zh: '密码' }, type: 'password', required: true, help: null, placeholder: null, options: null, statePath: 'password' },
      },
      'conn-database': {
        type: 'Field',
        props: { label: { en: 'Database', zh: '数据库' }, type: 'text', required: true, help: null, placeholder: null, options: null, statePath: 'database' },
      },
      'conn-ssl': {
        type: 'Field',
        props: { label: { en: 'SSL', zh: 'SSL 加密' }, type: 'checkbox', required: false, help: { en: 'Disable for local/VPN connections', zh: '本地或 VPN 连接可关闭' }, placeholder: null, options: null, statePath: 'ssl' },
      },
      'save': {
        type: 'SaveBar',
        props: { saveLabel: null, resetLabel: null },
      },
    },
    state: {
      connections: [
        { _name: 'default', host: '127.0.0.1', port: '5432', user: '', password: '', database: '', ssl: 'false' },
      ],
    },
  },
  collections: [{ statePath: '/connections' }],
};

async function loadConfig(): Promise<PostgresConfig> {
  return requireConfigWithSetup<PostgresConfig>('postgresql', PG_CONFIG_UI);
}

// ── Configuration ────────────────────────────────────────────────────────────

function printTemplate(): void {
  const CONFIG_PATH = configPath('postgresql');
  import('fs').then(({ existsSync }) => {
    if (existsSync(CONFIG_PATH)) {
      console.error(`Error: Config already exists at ${CONFIG_PATH}`);
      process.exit(1);
    }
  });
  const template = { connections: {} };
  saveConfig('postgresql', template).then(() => {
    console.log(`Created: ${CONFIG_PATH}`);
    console.log('Edit this file to add your database connection details.');
    console.log('');
    console.log('Example connection format:');
    console.log('  { "connections": { "mydb": { "host": "127.0.0.1", "port": 5432, "user": "postgres", "password": "", "database": "mydb" } } }');
  }).catch((e: Error) => {
    console.error(`Error creating config: ${e.message}`);
    process.exit(1);
  });
}

async function listConnections(): Promise<void> {
  const config = await loadConfig();
  const names = Object.keys(config.connections || {});
  if (names.length === 0) {
    console.log('No connections defined.');
    return;
  }
  console.log('Available connections:');
  for (const name of names) {
    const c = config.connections[name];
    console.log(`  ${name} → ${c.database} (${c.host}:${c.port || 5432})`);
  }
}

function createClient(connConfig: PostgresConnectionConfig): InstanceType<typeof Client> {
  const needsSSL =
    connConfig.host !== 'localhost' &&
    connConfig.host !== '127.0.0.1' &&
    connConfig.host !== '::1';

  const clientConfig: Record<string, unknown> = {
    host: connConfig.host,
    port: connConfig.port || 5432,
    user: connConfig.user,
    password: connConfig.password,
    database: connConfig.database,
    connectionTimeoutMillis: 10000,
  };

  if (connConfig.ssl !== undefined) {
    clientConfig['ssl'] = connConfig.ssl ? { rejectUnauthorized: false } : false;
  } else if (needsSSL) {
    clientConfig['ssl'] = { rejectUnauthorized: false };
  }

  return new Client(clientConfig);
}

async function testConnections(targetName: string | null): Promise<void> {
  const config = await loadConfig();

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
    const client = createClient(connConfig);
    try {
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      console.log(`  ${name} → OK (${connConfig.database})`);
    } catch (err) {
      await client.end().catch(() => {});
      console.log(`  ${name} → FAILED: ${(err as Error).message}`);
    }
  }
}

// ── Column Listing ───────────────────────────────────────────────────────────

async function listColumns(connName: string, schemaName: string, tableName: string): Promise<void> {
  const config = await loadConfig();

  const connConfig = (config.connections || {})[connName];
  if (!connConfig) {
    console.error(`Error: Connection "${connName}" not found.`);
    await listConnections();
    process.exit(1);
  }

  const client = createClient(connConfig);
  try {
    await client.connect();
    const schema = schemaName || 'public';
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

    for (const row of res.rows as Array<{ column_name: string; data_type: string; is_nullable: string }>) {
      console.log(`${row.column_name} (${row.data_type}${row.is_nullable === 'YES' ? ', nullable' : ''})`);
    }
    info(`${res.rows.length} columns in ${schema}.${tableName}`);
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

// ── Database / Schema Discovery ─────────────────────────────────────────────

async function listDatabases(connName: string): Promise<void> {
  const config = await loadConfig();

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
      'SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname'
    );
    const systemDbs = new Set(['postgres', 'template0', 'template1']);
    const dbs = (res.rows as Array<{ datname: string }>)
      .map((r) => r.datname)
      .filter((d) => !systemDbs.has(d));
    console.log('Available databases:');
    for (const db of dbs) {
      const marker = db === connConfig.database ? ' (default)' : '';
      console.log(`  ${db}${marker}`);
    }
    info(`${dbs.length} databases on ${connConfig.host}`);
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

async function listSchemas(connName: string): Promise<void> {
  const config = await loadConfig();

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
    console.log('Available schemas:');
    for (const row of res.rows as Array<{ schema_name: string }>) {
      console.log(`  ${row.schema_name}`);
    }
    info(`${res.rows.length} schemas`);
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

async function findTable(connName: string, tableName: string): Promise<void> {
  const config = await loadConfig();

  const connConfig = (config.connections || {})[connName];
  if (!connConfig) {
    console.error(`Error: Connection "${connName}" not found.`);
    await listConnections();
    process.exit(1);
  }

  const client = createClient(connConfig);
  try {
    await client.connect();
    const isPattern = tableName.includes('%');
    let query: string;
    let params: string[];
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

    for (const row of res.rows as Array<{ table_schema: string; table_name: string; estimated_rows: number | null }>) {
      const rows = row.estimated_rows != null ? `~${Math.round(Number(row.estimated_rows))}` : '?';
      console.log(`${row.table_schema}.${row.table_name} (~${rows} rows)`);
    }
    info(`Found in ${res.rows.length} location(s). Use schema.table syntax in queries, e.g.:`);
    if (res.rows.length > 0) {
      const first = res.rows[0] as { table_schema: string; table_name: string };
      info(`  node postgresql.mjs ${connName} "SELECT * FROM ${first.table_schema}.${first.table_name} LIMIT 1"`);
    }
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
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
  .name('postgresql')
  .description('PostgreSQL query executor for Claude Code')
  .version('0.2.0');

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

    const config = await loadConfig();

    const connConfig = (config.connections || {})[connection];
    if (!connConfig) {
      console.error(`Error: Connection "${connection}" not found.`);
      await listConnections();
      process.exit(1);
    }

    const client = createClient(connConfig);

    try {
      await client.connect();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (client.query as (q: Record<string, unknown>) => Promise<any>)(
        { text: sql, values: params, rowMode: 'object' }
      ) as { fields: Array<unknown>; rows: Record<string, unknown>[]; rowCount: number; command: string };

      // DDL/DML statements
      if (res.fields === undefined || res.fields.length === 0) {
        console.log(JSON.stringify({
          rowCount: res.rowCount,
          command: res.command,
        }));
        return;
      }

      const rows = res.rows as Record<string, unknown>[];
      if (rows.length === 0) {
        console.log('(empty result set)');
        return;
      }

      const totalRows = rows.length;
      const truncated = rowLimit > 0 && totalRows > rowLimit;
      const displayRows = truncated ? rows.slice(0, rowLimit) : rows;

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

      if (truncated) {
        console.log(`(${rowLimit} of ${totalRows} rows shown, use --limit=0 for all)`);
      } else {
        console.log(`(${totalRows} rows)`);
      }
    } catch (err) {
      const pgErr = err as Error & { code?: string; schema?: string; table?: string };
      console.error(`Error: ${pgErr.message}`);
      if (pgErr.code) console.error(`Code: ${pgErr.code}`);
      if (pgErr.schema) console.error(`Schema: ${pgErr.schema}`);
      if (pgErr.table) console.error(`Table: ${pgErr.table}`);

      // Hint for missing table
      if (pgErr.message.includes('does not exist') || pgErr.code === '42P01') {
        const tableMatch = pgErr.message.match(/"([^"]+)"$/);
        const badTable = tableMatch ? tableMatch[1] : '<table>';
        if (badTable && !badTable.includes(' ')) {
          console.error(`\nHint: The table may exist in a different schema. Find it with:`);
          console.error(`  node postgresql.mjs find-table ${connection} ${badTable}`);
          console.error(`  node postgresql.mjs schemas ${connection}`);
        }
      }

      // Hint for missing column
      if (pgErr.message.includes('undefined column') || pgErr.code === '42703') {
        const colMatch = pgErr.message.match(/column "([^"]+)"/i);
        const badCol = colMatch ? colMatch[1] : null;
        if (badCol && pgErr.table) {
          console.error(`\nHint: Check column names with:`);
          console.error(`  node postgresql.mjs columns ${connection} <schema> ${pgErr.table}`);
        }
      }

      process.exit(1);
    } finally {
      await client.end().catch(() => {});
    }
  });

// init command
program
  .command('init')
  .description('Create config template at ~/.cache/apex-plugin/postgresql.json')
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

// columns command — <connection> <schemaOrTable> [table]
// Handles both: columns <conn> <table>  and  columns <conn> <schema> <table>
program
  .command('columns')
  .description('List column names of a table')
  .argument('<connection>', 'Connection name')
  .argument('<schema_or_table>', 'Schema name, or table name if schema is omitted')
  .argument('[table]', 'Table name (if schema was provided as second argument)')
  .action(async (connection: string, schemaOrTable: string, table?: string) => {
    let schemaName: string;
    let tableName: string;
    if (table === undefined) {
      // Only 2 positional args: columns <conn> <table>  → schema defaults to 'public'
      schemaName = '';
      tableName = schemaOrTable;
    } else {
      // 3 positional args: columns <conn> <schema> <table>
      schemaName = schemaOrTable;
      tableName = table;
    }
    await listColumns(connection, schemaName, tableName);
  });

// databases command
program
  .command('databases')
  .description('List all databases on the connection')
  .argument('<connection>', 'Connection name')
  .action(async (connection: string) => {
    await listDatabases(connection);
  });

// schemas command
program
  .command('schemas')
  .description('List all schemas in the connection\'s database')
  .argument('<connection>', 'Connection name')
  .action(async (connection: string) => {
    await listSchemas(connection);
  });

// find-table command
program
  .command('find-table')
  .description('Find which schema a table belongs to')
  .argument('<connection>', 'Connection name')
  .argument('<table>', 'Table name or pattern (e.g. %user%)')
  .action(async (connection: string, table: string) => {
    await findTable(connection, table);
  });

program.parseAsync();
