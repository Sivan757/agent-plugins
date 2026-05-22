import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const cli = join(process.cwd(), 'src/postgresql.ts');
const tsx = join(process.cwd(), '../../node_modules/tsx/dist/cli.mjs');

async function withTempHome<T>(fn: (home: string) => Promise<T>): Promise<T> {
  const root = await mkdtemp(join(tmpdir(), 'postgresql-plugin-test-'));
  const home = join(root, 'home');
  await mkdir(home, { recursive: true });
  try {
    return await fn(home);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

async function writeConfig(home: string, config: Record<string, unknown>): Promise<string> {
  const configFile = join(home, '.cache/agent-plugins/postgresql.json');
  await mkdir(dirname(configFile), { recursive: true });
  await writeFile(configFile, JSON.stringify(config, null, 2) + '\n', 'utf8');
  return configFile;
}

function runCli(home: string, args: string[]) {
  return spawnSync(process.execPath, [tsx, cli, ...args], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      HOME: home,
      USERPROFILE: home,
    },
    encoding: 'utf8',
  });
}

test('query exposes a temporary database override option', async () => {
  await withTempHome(async (home) => {
    const result = runCli(home, ['query', '--help']);

    assert.equal(result.status, 0);
    assert.match(result.stdout, /--database <database>/);
  });
});

test('setup command is available for manual config-ui launch', async () => {
  await withTempHome(async (home) => {
    const result = runCli(home, ['setup', '--help']);

    assert.equal(result.status, 0);
    assert.match(result.stdout, /Open the browser configuration form/);
  });
});

test('copy-connection clones an existing connection with a new database without printing credentials', async () => {
  await withTempHome(async (home) => {
    const configFile = await writeConfig(home, {
      connections: {
        source: {
          host: 'db.example.test',
          port: 5432,
          user: 'db_user',
          password: 'secret-password',
          database: 'source_db',
          ssl: true,
        },
      },
    });

    const result = runCli(home, ['copy-connection', 'source', 'target', '--database', 'target_db']);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Copied connection "source" to "target"/);
    assert.doesNotMatch(result.stdout + result.stderr, /secret-password|db_user|db\.example\.test/);

    const config = JSON.parse(await readFile(configFile, 'utf8'));
    assert.deepEqual(config.connections.target, {
      host: 'db.example.test',
      port: 5432,
      user: 'db_user',
      password: 'secret-password',
      database: 'target_db',
      ssl: true,
    });
  });
});

test('copy-connection refuses to overwrite an existing connection without --overwrite', async () => {
  await withTempHome(async (home) => {
    const configFile = await writeConfig(home, {
      connections: {
        source: {
          host: 'db.example.test',
          port: 5432,
          user: 'db_user',
          password: 'secret-password',
          database: 'source_db',
        },
        target: {
          host: 'other.example.test',
          port: 5432,
          user: 'other_user',
          password: 'other-secret',
          database: 'other_db',
        },
      },
    });

    const result = runCli(home, ['copy-connection', 'source', 'target', '--database', 'target_db']);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /already exists/);
    const config = JSON.parse(await readFile(configFile, 'utf8'));
    assert.equal(config.connections.target.database, 'other_db');
  });
});
