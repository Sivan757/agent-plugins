#!/usr/bin/env node

/**
 * database.ts — query executor for every engine this plugin ships.
 *
 * Usage:
 *   node database.mjs query <connection> <sql> [options]
 *   node database.mjs list                          List connections
 *   node database.mjs test [name]                   Test connection(s)
 *   node database.mjs columns <connection> <table>  List a table's columns
 *   node database.mjs config --ui                   Open the configuration form
 *
 * Connections live in one file, each tagged with the engine it speaks:
 *   ~/.cache/agent-plugins/database/config.json
 *
 * The shell below is engine-independent: config load and adoption, connection
 * lookup, session lifecycle, the write guard, result rendering and capability
 * gating. Engine specifics live in `src/drivers/`.
 */

import { Command } from 'commander';

import {
  DEFAULT_COL_WIDTH,
  DEFAULT_ROW_LIMIT,
  assertWriteAllowed,
  configPath,
  loadConfig as readStoredConfig,
  openConfigUI,
  renderRows,
  requireConfigWithSetup,
  resolveQueryOptions,
  saveConfig,
  summarizeConfig,
} from '@agent-plugins/config-center';
import type { Session } from './drivers/types.js';

import { CONFIG_UI as DATABASE_CONFIG_UI } from './config-ui.js';
import { adoptLegacyConnections } from './legacy-config.js';
import {
  driverForType,
  enginesWith,
  knownTypes,
  type Driver,
  type DriverType,
} from './drivers/index.js';
import {
  asEngineError,
  effectiveDatabase,
  type Capability,
  type ConnectionConfig,
  type DatabaseConfig,
} from './drivers/types.js';

const PLUGIN = 'database';
const REASON_NEEDS_CONFIG = DATABASE_CONFIG_UI.reason ?? '';

function info(msg: string): void {
  process.stderr.write(`[database] ${msg}\n`);
}

function die(msg: string): never {
  console.error(`Error: ${msg}`);
  process.exit(1);
}

// ── Configuration ────────────────────────────────────────────────────────────

/** The browser form writes numbers as strings, and an empty field as ''. */
function toPort(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/** An empty database field means "describe this server", not "database named ''". */
function toDatabase(value: unknown): string | undefined {
  const text = String(value ?? '').trim();
  return text === '' ? undefined : text;
}

interface Resolved {
  name: string;
  driver: Driver;
  connection: ConnectionConfig;
}

/**
 * Turn one stored entry into a driver plus a connection, refusing an entry whose
 * engine we do not ship rather than guessing.
 */
function resolveConnection(name: string, raw: Record<string, unknown>): Resolved {
  const driver = driverForType(raw['type']);
  if (!driver) {
    const actual = raw['type'] === undefined ? 'missing' : JSON.stringify(raw['type']);
    console.error(`Error: Connection "${name}" has type ${actual}; expected one of: ${knownTypes().join(', ')}.`);
    console.error('Fix it with: database config --ui');
    process.exit(1);
  }

  const port = toPort(raw['port']);
  const database = toDatabase(raw['database']);
  return {
    name,
    driver,
    connection: {
      type: driver.type,
      host: String(raw['host'] ?? ''),
      ...(port === undefined ? {} : { port }),
      user: String(raw['user'] ?? ''),
      password: String(raw['password'] ?? ''),
      ...(database === undefined ? {} : { database }),
      ...(raw['ssl'] === undefined ? {} : { ssl: raw['ssl'] as boolean | Record<string, unknown> }),
    },
  };
}

/** The database a command will actually reach, engine fallback included. */
function reachableDatabase(resolved: Resolved): string | undefined {
  return effectiveDatabase(resolved.driver, resolved.connection);
}

function reportAdoption(report: { sources: string[]; adopted: number; renamed: Array<{ from: string; to: string; type: DriverType }> }): void {
  console.log(
    `Adopted ${report.adopted} connection(s) from the former ${report.sources.join(' and ')} plugin config.`,
  );
  for (const rename of report.renamed) {
    console.log(`  "${rename.from}" (${rename.type}) is now "${rename.to}" — the name was already taken.`);
  }
}

/**
 * Read this plugin's config, adopting the former per-engine configs the first
 * time it has none of its own.
 */
async function loadConfig(): Promise<DatabaseConfig> {
  const stored = await readStoredConfig<DatabaseConfig>(PLUGIN);
  if (stored) return stored;

  const adoption = await adoptLegacyConnections();
  if (adoption) {
    reportAdoption(adoption);
    return (await readStoredConfig<DatabaseConfig>(PLUGIN)) ?? { connections: {} };
  }

  return requireConfigWithSetup<DatabaseConfig>(PLUGIN, DATABASE_CONFIG_UI);
}

async function resolveByName(name: string): Promise<Resolved> {
  const config = await loadConfig();
  const raw = (config.connections ?? {})[name];
  if (!raw) {
    console.error(`Error: Connection "${name}" not found.`);
    printConnectionList(config, console.error);
    process.exit(1);
  }
  return resolveConnection(name, raw as unknown as Record<string, unknown>);
}

/** Print the stored connections; `write` picks stdout or stderr. */
function printConnectionList(config: DatabaseConfig, write: (line: string) => void): void {
  const names = Object.keys(config.connections ?? {});
  if (names.length === 0) {
    write('No connections defined.');
    return;
  }
  write('Available connections:');
  for (const name of names) {
    const raw = config.connections[name] as unknown as Record<string, unknown>;
    const driver = driverForType(raw['type']);
    const port = raw['port'] ?? driver?.defaultPort ?? '?';
    // A connection may describe only a server, so the database is optional.
    const database = toDatabase(raw['database']) ?? '(no default database)';
    write(`  ${name} [${driver ? driver.type : `unknown:${String(raw['type'])}`}] → ${database} (${String(raw['host'] ?? '')}:${port})`);
  }
}

// ── Capability gating ────────────────────────────────────────────────────────

function requireCapability(driver: Driver, command: string, capability: Capability): void {
  if (driver.capabilities.has(capability)) return;
  const supported = enginesWith(capability);
  console.error(`Error: \`${command}\` is not available for ${driver.type} connections.`);
  console.error(`This connection is ${driver.type} (${driver.label}).`);
  if (supported.length > 0) console.error(`Engines that support it: ${supported.join(', ')}.`);
  process.exit(1);
}

/**
 * Point a single command at another database. The connection's own database is
 * optional, so this is how one connection serves every database on a server.
 */
function applyDatabaseOverride(resolved: Resolved, database?: string): Resolved {
  const target = toDatabase(database);
  if (!target) return resolved;
  return { ...resolved, connection: { ...resolved.connection, database: target } };
}

// ── Session lifecycle ────────────────────────────────────────────────────────

/**
 * Render an engine error through the driver's own corrective hints and stop.
 */
function failConnection(driver: Driver, err: unknown, connection: string, sql?: string): never {
  for (const line of driver.describeError(err, { connection, sql })) {
    console.error(line);
  }
  process.exit(1);
}

/**
 * Open a session, hand it to `fn`, and always close it.
 */
async function withConnection<T>(
  resolved: Resolved,
  context: { sql?: string },
  fn: (session: Session) => Promise<T>,
): Promise<T> {
  let session: Session | undefined;
  try {
    session = await resolved.driver.open(resolved.connection);
    return await fn(session);
  } catch (err) {
    return failConnection(resolved.driver, err, resolved.name, context.sql);
  } finally {
    if (session) await session.close();
  }
}

// ── Output helpers ───────────────────────────────────────────────────────────

function printDatabases(resolved: Resolved, names: string[]): void {
  console.log('Available databases:');
  for (const name of names) {
    const marker = name === reachableDatabase(resolved) ? ' (default)' : '';
    console.log(`  ${name}${marker}`);
  }
  info(`${names.length} databases on ${resolved.connection.host}`);
}

function containerLabel(target: { container?: string; table: string }): string {
  return target.container ? `${target.container}.${target.table}` : target.table;
}

// ── Main ─────────────────────────────────────────────────────────────────────

const program = new Command();

program
  .name('database')
  .description('Query executor for MySQL and PostgreSQL')
  .version('0.2.0')
  .option('--user-confirmed', 'Bypass the write-operation guard (after user approval)');

// query command (default)
program
  .command('query', { isDefault: true })
  .description('Execute a statement against a named connection')
  .argument('<connection>', 'Connection name')
  .argument('<sql>', 'SQL statement to execute')
  .option('--database <database>', 'Temporarily connect to this database without changing saved config')
  .option('--format <fmt>', 'Output format: table|json|csv|compact', 'csv')
  .option('--params <json>', 'Parameterized query values as JSON array')
  .option('--limit <n>', 'Max rows to display (0 = unlimited)', String(DEFAULT_ROW_LIMIT))
  .option('--col-width <n>', 'Max column display width', String(DEFAULT_COL_WIDTH))
  .action(
    async (
      connection: string,
      sql: string,
      opts: { database?: string; format: string; params?: string; limit: string; colWidth: string },
      command: Command,
    ) => {
      const { format, params, rowLimit, colWidth } = resolveQueryOptions(opts);
      assertWriteAllowed(sql, Boolean(command.optsWithGlobals()['userConfirmed']));

      const resolved = applyDatabaseOverride(await resolveByName(connection), opts.database);

      await withConnection(resolved, { sql }, async (session) => {
        const result = await session.query(sql, params);
        if (result.kind === 'summary') {
          console.log(JSON.stringify(result.summary));
          return;
        }
        renderRows(result.rows, { format, rowLimit, colWidth });
      });
    },
  );

// init command
program
  .command('init')
  .description('Create config template')
  .action(async () => {
    const existing = await readStoredConfig<DatabaseConfig>(PLUGIN);
    if (existing) {
      die('Config already exists. Run `database config --ui` to edit it.');
    }
    await saveConfig(PLUGIN, { connections: {} });
    console.log('Created config file.');
    console.log('Add connections with: database config --ui');
    console.log('');
    console.log('Each connection carries its engine:');
    console.log(
      '  { "connections": { "orders": { "type": "mysql", "host": "127.0.0.1", "user": "root", "password": "" },',
    );
    console.log(
      '                     "reporting": { "type": "postgresql", "host": "127.0.0.1", "user": "postgres", "password": "" } } }',
    );
    console.log('');
    console.log('"database" is optional. Leave it out to describe a server and pick a');
    console.log('database per command — see "databases", "--database", or database.table.');
  });

// config command: print the stored connections, or open the form to change them
program
  .command('config')
  .description('Show the configured connections (passwords masked)')
  .option('--ui', 'open the configuration form, pre-filled, instead of only printing')
  .action(async (options: { ui?: boolean }) => {
    // Read the raw stored config: `loadConfig` above would open the form by
    // itself on an incomplete config, and this command decides that itself.
    let config = await readStoredConfig<DatabaseConfig>(PLUGIN);

    if (options.ui) {
      const result = await openConfigUI(PLUGIN, {
        ...DATABASE_CONFIG_UI,
        intent: config ? 'edit' : 'create',
        reason: REASON_NEEDS_CONFIG,
      });
      if (!result.opened) {
        console.error('Could not serve the configuration form; printing the stored configuration instead.');
      } else if (!result.saved) {
        console.error('No changes were saved.');
      }
      config = await readStoredConfig<DatabaseConfig>(PLUGIN);
    }

    if (!config) {
      console.error(`No configuration yet. Run: database config --ui`);
      process.exit(1);
    }
    for (const line of summarizeConfig(config, { spec: DATABASE_CONFIG_UI.spec })) console.log(line);
    console.log(`configPath=${configPath(PLUGIN)}`);
  });

// Kept as an alias: `setup` is what earlier docs and prompts tell users to run.
program
  .command('setup')
  .description('Open the browser configuration form (alias for `config --ui`)')
  .action(async () => {
    const existing = await readStoredConfig<DatabaseConfig>(PLUGIN);
    const { saved } = await openConfigUI(PLUGIN, {
      ...DATABASE_CONFIG_UI,
      intent: existing ? 'edit' : 'create',
    });
    if (!saved) {
      console.error('Configuration was not saved.');
      process.exit(1);
    }
    console.log('Configuration saved.');
  });

// list command
program
  .command('list')
  .description('List available connections')
  .action(async () => {
    printConnectionList(await loadConfig(), console.log);
  });

// test command
program
  .command('test')
  .description('Test connection(s)')
  .argument('[name]', 'Connection name to test (omit to test all)')
  .option('--database <database>', 'Temporarily connect to this database without changing saved config')
  .action(async (name: string | undefined, opts: { database?: string }) => {
    const config = await loadConfig();
    const entries = Object.entries(config.connections ?? {});
    if (entries.length === 0) {
      console.log('No connections defined.');
      return;
    }

    const selected = name ? entries.filter(([entryName]) => entryName === name) : entries;
    if (name && selected.length === 0) {
      console.error(`Error: Connection "${name}" not found.`);
      printConnectionList(config, console.error);
      process.exit(1);
    }

    for (const [entryName, raw] of selected) {
      const resolved = applyDatabaseOverride(
        resolveConnection(entryName, raw as unknown as Record<string, unknown>),
        opts.database,
      );
      let session: Session | undefined;
      try {
        session = await resolved.driver.open(resolved.connection);
        await session.query(resolved.driver.healthCheck());
        console.log(
          `  ${entryName} [${resolved.driver.type}] → OK (${reachableDatabase(resolved) ?? 'no default database'})`,
        );
      } catch (err) {
        console.log(`  ${entryName} [${resolved.driver.type}] → FAILED: ${asEngineError(err).message}`);
      } finally {
        if (session) await session.close();
      }
    }
  });

// columns command — accepts both `columns <conn> <table>` and `columns <conn> <schema> <table>`
program
  .command('columns')
  .description('List the columns of a table')
  .argument('<connection>', 'Connection name')
  .argument('<schema_or_table>', 'Schema/database name, or table name if it is omitted')
  .argument('[table]', 'Table name (when the schema was given as the second argument)')
  .option('--database <database>', 'Temporarily connect to this database without changing saved config')
  .action(
    async (
      connection: string,
      schemaOrTable: string,
      table: string | undefined,
      opts: { database?: string },
    ) => {
      const resolved = applyDatabaseOverride(await resolveByName(connection), opts.database);
      const target = table === undefined
        ? { table: schemaOrTable }
        : { container: schemaOrTable, table };

      await withConnection(resolved, {}, async (session) => {
        const columns = await resolved.driver.listColumns(session, target);
        const label = containerLabel(target);
        if (columns.length === 0) {
          console.log(`(table "${label}" not found or empty)`);
          return;
        }
        for (const column of columns) {
          const detail = column.type ? ` (${column.type}${column.nullable ? ', nullable' : ''})` : '';
          console.log(`${column.name}${detail}`);
        }
        info(`${columns.length} columns in ${label}`);
      });
    },
  );

// databases command
program
  .command('databases')
  .description('List all databases on the connection')
  .argument('<connection>', 'Connection name')
  .option('--database <database>', 'Temporarily connect to this database without changing saved config')
  .action(async (connection: string, opts: { database?: string }) => {
    const resolved = applyDatabaseOverride(await resolveByName(connection), opts.database);
    await withConnection(resolved, {}, async (session) => {
      printDatabases(resolved, await resolved.driver.listDatabases(session));
    });
  });

// schemas command
program
  .command('schemas')
  .description("List all schemas in the connection's database")
  .argument('<connection>', 'Connection name')
  .option('--database <database>', 'Temporarily connect to this database without changing saved config')
  .action(async (connection: string, opts: { database?: string }) => {
    const resolved = applyDatabaseOverride(await resolveByName(connection), opts.database);
    requireCapability(resolved.driver, 'schemas', 'schemas');
    await withConnection(resolved, {}, async (session) => {
      const schemas = await resolved.driver.listSchemas!(session);
      console.log('Available schemas:');
      for (const schema of schemas) console.log(`  ${schema}`);
      info(`${schemas.length} schemas`);
    });
  });

// find-table command
program
  .command('find-table')
  .description('Find which database or schema a table belongs to')
  .argument('<connection>', 'Connection name')
  .argument('<table>', 'Table name or pattern (e.g. %user%)')
  .option('--database <database>', 'Temporarily connect to this database without changing saved config')
  .action(async (connection: string, table: string, opts: { database?: string }) => {
    const resolved = applyDatabaseOverride(await resolveByName(connection), opts.database);
    await withConnection(resolved, {}, async (session) => {
      const locations = await resolved.driver.findTable(session, table);
      if (locations.length === 0) {
        console.error(`Table "${table}" not found in any ${resolved.driver.containerLabel} on this connection.`);
        if (!table.includes('%')) {
          console.error(`Hint: Try a fuzzy search with: database find-table ${connection} "%${table}%"`);
        }
        process.exit(1);
      }
      for (const location of locations) {
        const rows = location.estimatedRows == null ? '?' : `~${location.estimatedRows.toLocaleString()}`;
        console.log(`${location.container}.${location.table} (~${rows} rows)`);
      }
      const first = locations[0];
      info(`Found in ${locations.length} location(s). Use ${resolved.driver.containerLabel}.table syntax in queries, e.g.:`);
      info(`  database query ${connection} "SELECT * FROM ${first.container}.${first.table} LIMIT 1"`);
    });
  });

// search-columns command
program
  .command('search-columns')
  .description('Search for columns by name pattern across every database')
  .argument('<connection>', 'Connection name')
  .argument('<pattern>', 'Column name pattern (SQL LIKE, e.g. %price%)')
  .action(async (connection: string, pattern: string) => {
    const resolved = await resolveByName(connection);
    requireCapability(resolved.driver, 'search-columns', 'search-columns');
    await withConnection(resolved, {}, async (session) => {
      const matches = await resolved.driver.searchColumns!(session, pattern);
      if (matches.length === 0) {
        console.error(`No columns matching "${pattern}" found in any user database.`);
        process.exit(1);
      }
      const grouped = new Map<string, string[]>();
      for (const match of matches) {
        const key = `${match.container}.${match.table}`;
        const existing = grouped.get(key) ?? [];
        existing.push(`${match.column} (${match.type})`);
        grouped.set(key, existing);
      }
      for (const [table, columns] of grouped) {
        console.log(`${table}: ${columns.join(', ')}`);
      }
      info(`Found ${matches.length} matching columns in ${grouped.size} tables`);
    });
  });

// relationships command
program
  .command('relationships')
  .description('Show foreign keys and potential join columns for a table')
  .argument('<connection>', 'Connection name')
  .argument('<table>', 'Table name (or database.table)')
  .option('--database <database>', 'Resolve an unqualified table against this database')
  .action(async (connection: string, table: string, opts: { database?: string }) => {
    const resolved = applyDatabaseOverride(await resolveByName(connection), opts.database);
    requireCapability(resolved.driver, 'relationships', 'relationships');
    await withConnection(resolved, {}, async (session) => {
      const found = await resolved.driver.relationships!(session, { table });
      console.log(`Table: ${containerLabel({ container: found.container, table: found.table })}`);
      console.log('');

      const section = (title: string, entries: string[]): void => {
        console.log(`${title}:`);
        if (entries.length === 0) console.log('  (none)');
        else for (const entry of entries) console.log(`  ${entry}`);
        console.log('');
      };

      section(`Foreign keys FROM ${found.table}`, found.outgoing);
      section(`Foreign keys TO ${found.table}`, found.incoming);
      section(
        'Potential join columns (by naming convention)',
        found.joinCandidates.length === 0 ? [] : [`${found.table} has: ${found.joinCandidates.join(', ')}`],
      );
      info('Relationship scan complete');
    });
  });

// profile command
program
  .command('profile')
  .description('Show a table profile: row estimate and date ranges')
  .argument('<connection>', 'Connection name')
  .argument('<table>', 'Table name (or database.table)')
  .option('--database <database>', 'Resolve an unqualified table against this database')
  .action(async (connection: string, table: string, opts: { database?: string }) => {
    const resolved = applyDatabaseOverride(await resolveByName(connection), opts.database);
    requireCapability(resolved.driver, 'profile', 'profile');
    await withConnection(resolved, {}, async (session) => {
      const profile = await resolved.driver.profile!(session, { table });
      console.log(`Table: ${containerLabel({ container: profile.container, table: profile.table })}`);
      console.log(`Rows: ~${profile.estimatedRows == null ? '?' : profile.estimatedRows.toLocaleString()}`);

      if (profile.dateRanges.length > 0) {
        console.log('Date ranges:');
        for (const range of profile.dateRanges) {
          if (range.min == null && range.max == null) {
            console.log(`  ${range.column}: (all NULL)`);
            continue;
          }
          const strip = (value: unknown): string => String(value).replace(/ 00:00:00$/, '');
          console.log(`  ${range.column}: ${strip(range.min)} → ${strip(range.max)}`);
        }
      }
      info('Profile complete');
    });
  });

// copy-connection command
program
  .command('copy-connection')
  .description('Copy a saved connection under a new name and database')
  .argument('<source>', 'Existing connection name')
  .argument('<target>', 'New connection name')
  .requiredOption('--database <database>', 'Database name for the copied connection')
  .option('--overwrite', 'Replace the target connection if it already exists')
  .action(async (source: string, target: string, opts: { database: string; overwrite?: boolean }) => {
    const config = await loadConfig();
    const connectionSource = (config.connections ?? {})[source];
    if (!connectionSource) {
      console.error(`Error: Source connection "${source}" not found.`);
      printConnectionList(config, console.error);
      process.exit(1);
    }

    const resolved = resolveConnection(source, connectionSource as unknown as Record<string, unknown>);

    if ((config.connections ?? {})[target] && !opts.overwrite) {
      die(`Connection "${target}" already exists. Re-run with --overwrite to replace it.`);
    }

    await saveConfig(PLUGIN, {
      ...config,
      connections: {
        ...(config.connections ?? {}),
        [target]: { ...resolved.connection, database: opts.database },
      },
    });
    console.log(`Copied connection "${source}" to "${target}" with database "${opts.database}".`);
  });

program.parseAsync();
