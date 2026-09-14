import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

import { CONFIG_UI } from './config-ui.js';
import { mysqlDriver } from './drivers/mysql.js';
import { postgresqlDriver } from './drivers/postgresql.js';
import { effectiveDatabase, resolveContainer, type ConnectionConfig } from './drivers/types.js';

const cli = join(process.cwd(), 'src/database.ts');
const tsx = join(process.cwd(), '../../node_modules/tsx/dist/cli.mjs');

async function withScratchCache<T>(fn: (cache: string) => Promise<T>): Promise<T> {
  const root = await mkdtemp(join(tmpdir(), 'database-plugin-test-'));
  const cache = join(root, 'cache');
  await mkdir(cache, { recursive: true });
  try {
    return await fn(cache);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

async function writePluginConfig(cache: string, plugin: string, config: unknown): Promise<string> {
  const file = join(cache, plugin, 'config.json');
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  return file;
}

/**
 * Runs the CLI against a scratch cache. `AGENT_PLUGINS_CACHE_DIR` is the
 * isolation switch the store honours; HOME deliberately is not.
 */
function runCli(cache: string, args: string[]) {
  return spawnSync(process.execPath, [tsx, cli, ...args], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      AGENT_PLUGINS_CACHE_DIR: cache,
      AGENT_PLUGINS_NO_BROWSER: '1',
      AGENT_PLUGINS_UI_TIMEOUT_MS: '1500',
    },
    encoding: 'utf8',
  });
}

const MYSQL_CONNECTION = {
  type: 'mysql',
  host: '127.0.0.1',
  port: 1,
  user: 'root',
  password: 'secret-password',
  database: 'orders',
};

const PG_CONNECTION = {
  type: 'postgresql',
  host: '127.0.0.1',
  port: 1,
  user: 'pg',
  password: 'secret-password',
  database: 'reporting',
};

test('query exposes the PostgreSQL database override option', async () => {
  await withScratchCache(async (cache) => {
    const result = runCli(cache, ['query', '--help']);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /--database <database>/);
  });
});

test('setup command is available for manual config-ui launch', async () => {
  await withScratchCache(async (cache) => {
    const result = runCli(cache, ['setup', '--help']);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /Open the browser configuration form/);
  });
});

test('list reports the engine of every connection', async () => {
  await withScratchCache(async (cache) => {
    await writePluginConfig(cache, 'database', {
      connections: {
        orders: MYSQL_CONNECTION,
        // No port stored: the engine default should be the one shown.
        reporting: { ...PG_CONNECTION, port: undefined },
      },
    });

    const result = runCli(cache, ['list']);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /orders \[mysql\]/);
    assert.match(result.stdout, /reporting \[postgresql\]/);
    assert.match(result.stdout, /127\.0\.0\.1:1\b/);
    assert.match(result.stdout, /127\.0\.0\.1:5432/);
  });
});

test('a connection with an unknown engine is refused by name', async () => {
  await withScratchCache(async (cache) => {
    await writePluginConfig(cache, 'database', {
      connections: { legacy: { host: 'h', user: 'u', password: 'p', database: 'd' } },
    });

    const result = runCli(cache, ['query', 'legacy', 'SELECT 1']);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Connection "legacy" has type missing; expected one of: mysql, postgresql/);
  });
});

test('an unknown connection name lists the stored connections instead of opening the form', async () => {
  await withScratchCache(async (cache) => {
    await writePluginConfig(cache, 'database', { connections: { orders: MYSQL_CONNECTION } });

    const result = runCli(cache, ['query', 'nope', 'SELECT 1']);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Connection "nope" not found\./);
    assert.match(result.stderr, /Available connections:/);
    assert.match(result.stderr, /orders \[mysql\]/);
    assert.doesNotMatch(result.stderr, /Open the config UI/);
  });
});

test('the write guard refuses data-modifying SQL on both engines', async () => {
  await withScratchCache(async (cache) => {
    await writePluginConfig(cache, 'database', {
      connections: { orders: MYSQL_CONNECTION, reporting: PG_CONNECTION },
    });

    for (const connection of ['orders', 'reporting']) {
      const result = runCli(cache, ['query', connection, 'DELETE FROM t']);
      assert.notEqual(result.status, 0, connection);
      assert.match(result.stderr, /Refusing write statement without --user-confirmed/, connection);
    }
  });
});

test('--user-confirmed lets the statement through to the connection', async () => {
  await withScratchCache(async (cache) => {
    await writePluginConfig(cache, 'database', { connections: { orders: MYSQL_CONNECTION } });

    const refused = runCli(cache, ['query', 'orders', 'DELETE FROM t']);
    const allowed = runCli(cache, ['--user-confirmed', 'query', 'orders', 'DELETE FROM t']);

    assert.match(refused.stderr, /Refusing write statement/);
    // Past the guard, the failure is the unreachable server rather than a refusal.
    assert.doesNotMatch(allowed.stderr, /Refusing write statement/);
    assert.match(allowed.stderr, /ECONNREFUSED/);
  });
});

test('a read-only statement is never blocked by the guard', async () => {
  await withScratchCache(async (cache) => {
    await writePluginConfig(cache, 'database', { connections: { orders: MYSQL_CONNECTION } });

    const result = runCli(cache, ['query', 'orders', 'SELECT 1']);

    assert.doesNotMatch(result.stderr, /Refusing write statement/);
    assert.match(result.stderr, /ECONNREFUSED/);
  });
});

test('an engine-specific command is gated and names the engines that support it', async () => {
  await withScratchCache(async (cache) => {
    await writePluginConfig(cache, 'database', { connections: { orders: MYSQL_CONNECTION } });

    const result = runCli(cache, ['schemas', 'orders']);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /`schemas` is not available for mysql connections/);
    assert.match(result.stderr, /Engines that support it: postgresql/);
  });
});

test('--database retargets a command for either engine', async () => {
  await withScratchCache(async (cache) => {
    await writePluginConfig(cache, 'database', {
      connections: { orders: MYSQL_CONNECTION, reporting: PG_CONNECTION },
    });

    for (const connection of ['orders', 'reporting']) {
      const result = runCli(cache, ['query', connection, 'SELECT 1', '--database', 'other']);
      assert.doesNotMatch(result.stderr, /not supported/, connection);
      // Past the option handling, the failure is the unreachable server.
      assert.match(result.stderr, /ECONNREFUSED/, connection);
    }
  });
});

test('a connection with no database is listed and still usable', async () => {
  await withScratchCache(async (cache) => {
    await writePluginConfig(cache, 'database', {
      connections: {
        // Describes a server only: the database is chosen per command.
        server: { type: 'mysql', host: '127.0.0.1', port: 1, user: 'root', password: 'p' },
      },
    });

    const listed = runCli(cache, ['list']);
    assert.equal(listed.status, 0, listed.stderr);
    assert.match(listed.stdout, /server \[mysql\] → \(no default database\)/);

    const queried = runCli(cache, ['query', 'server', 'SELECT 1']);
    // A statement that qualifies its own tables needs no default database.
    assert.doesNotMatch(queried.stderr, /no default database/);
    assert.match(queried.stderr, /ECONNREFUSED/);
  });
});

test('copy-connection clones a connection without printing credentials', async () => {
  await withScratchCache(async (cache) => {
    const configFile = await writePluginConfig(cache, 'database', { connections: { orders: MYSQL_CONNECTION } });

    const result = runCli(cache, ['copy-connection', 'orders', 'orders_archive', '--database', 'orders_archive']);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Copied connection "orders" to "orders_archive"/);
    assert.doesNotMatch(result.stdout + result.stderr, /secret-password|root@|127\.0\.0\.1/);

    const config = JSON.parse(await readFile(configFile, 'utf8'));
    assert.equal(config.connections.orders_archive.database, 'orders_archive');
    assert.equal(config.connections.orders_archive.type, 'mysql');
  });
});

test('copy-connection refuses to overwrite an existing connection without --overwrite', async () => {
  await withScratchCache(async (cache) => {
    const configFile = await writePluginConfig(cache, 'database', {
      connections: {
        orders: MYSQL_CONNECTION,
        orders_archive: { ...MYSQL_CONNECTION, database: 'other' },
      },
    });

    const result = runCli(cache, ['copy-connection', 'orders', 'orders_archive', '--database', 'target_db']);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /already exists/);
    const config = JSON.parse(await readFile(configFile, 'utf8'));
    assert.equal(config.connections.orders_archive.database, 'other');
  });
});

test('adopts the former per-engine configs once, tagging each connection', async () => {
  await withScratchCache(async (cache) => {
    await writePluginConfig(cache, 'mysql', { connections: { orders: { ...MYSQL_CONNECTION } } });
    await writePluginConfig(cache, 'postgresql', { connections: { reporting: { ...PG_CONNECTION } } });

    const first = runCli(cache, ['list']);
    assert.equal(first.status, 0, first.stderr);
    assert.match(first.stdout, /Adopted 2 connection\(s\) from the former mysql and postgresql plugin config\./);
    assert.match(first.stdout, /orders \[mysql\]/);
    assert.match(first.stdout, /reporting \[postgresql\]/);

    const adopted = JSON.parse(await readFile(join(cache, 'database', 'config.json'), 'utf8'));
    assert.equal(adopted.connections.orders.type, 'mysql');
    assert.equal(adopted.connections.reporting.type, 'postgresql');
    // The connection's own fields survive the move.
    assert.equal(adopted.connections.orders.password, 'secret-password');

    const second = runCli(cache, ['list']);
    assert.doesNotMatch(second.stdout, /Adopted/);
  });
});

test('a name held by both former configs keeps both connections', async () => {
  await withScratchCache(async (cache) => {
    await writePluginConfig(cache, 'mysql', { connections: { main: { ...MYSQL_CONNECTION } } });
    await writePluginConfig(cache, 'postgresql', { connections: { main: { ...PG_CONNECTION } } });

    const result = runCli(cache, ['list']);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /"main" \(postgresql\) is now "main-postgresql"/);
    assert.match(result.stdout, /main \[mysql\]/);
    assert.match(result.stdout, /main-postgresql \[postgresql\]/);
  });
});

test('adoption is skipped when this plugin already has its own config', async () => {
  await withScratchCache(async (cache) => {
    await writePluginConfig(cache, 'mysql', { connections: { orders: { ...MYSQL_CONNECTION } } });
    await writePluginConfig(cache, 'database', { connections: { mine: PG_CONNECTION } });

    const result = runCli(cache, ['list']);

    assert.equal(result.status, 0, result.stderr);
    assert.doesNotMatch(result.stdout, /Adopted/);
    assert.match(result.stdout, /mine \[postgresql\]/);
    assert.doesNotMatch(result.stdout, /orders/);
  });
});

// ── Unit coverage that needs no server ───────────────────────────────────────

const SERVER_ONLY: ConnectionConfig = { type: 'mysql', host: 'h', user: 'u', password: 'p' };
const WITH_DEFAULT: ConnectionConfig = { ...SERVER_ONLY, database: 'shop' };

test('namespace resolution prefers the explicit container', () => {
  assert.deepEqual(resolveContainer(mysqlDriver, WITH_DEFAULT, { container: 'billing', table: 'invoices' }), {
    container: 'billing',
    table: 'invoices',
  });
});

test('namespace resolution reads a dotted table name', () => {
  assert.deepEqual(resolveContainer(mysqlDriver, SERVER_ONLY, { table: 'billing.invoices' }), {
    container: 'billing',
    table: 'invoices',
  });
});

test("namespace resolution falls back to the connection's database", () => {
  assert.deepEqual(resolveContainer(mysqlDriver, WITH_DEFAULT, { table: 'orders' }), {
    container: 'shop',
    table: 'orders',
  });
});

test('a server-only connection says how to name a database instead of guessing', () => {
  assert.throws(
    () => resolveContainer(mysqlDriver, SERVER_ONLY, { table: 'orders' }),
    /Cannot tell which database "orders" is in: this connection has no default database/,
  );
});

test('only an engine that cannot connect without a database supplies a fallback', () => {
  assert.equal(effectiveDatabase(mysqlDriver, SERVER_ONLY), undefined);
  assert.equal(effectiveDatabase(mysqlDriver, WITH_DEFAULT), 'shop');

  const pgServerOnly: ConnectionConfig = { type: 'postgresql', host: 'h', user: 'u', password: 'p' };
  assert.equal(effectiveDatabase(postgresqlDriver, pgServerOnly), 'postgres');
  // An explicit choice always wins over the engine fallback.
  assert.equal(effectiveDatabase(postgresqlDriver, { ...pgServerOnly, database: 'analytics' }), 'analytics');
});

test('the config form accepts a connection that describes only a server', () => {
  const validate = CONFIG_UI.validate!;
  assert.equal(validate({ connections: { server: { type: 'mysql', host: 'h', user: 'u' } } }), false);
});

test('the config form still asks for what a connection cannot work without', () => {
  const validate = CONFIG_UI.validate!;
  assert.equal(validate({ connections: {} }), true);
  assert.equal(validate({ connections: { c: { type: 'mysql', user: 'u' } } }), true);
  assert.equal(validate({ connections: { c: { host: 'h', user: 'u' } } }), true);
});
