import pg from 'pg';

import {
  asEngineError,
  type Capability,
  type ColumnInfo,
  type ConnectionConfig,
  type ContainerTarget,
  type Driver,
  type Session,
  type StatementResult,
  type TableLocation,
} from './types.js';

const { Client } = pg;

const CAPABILITIES: ReadonlySet<Capability> = new Set<Capability>(['schemas']);

/**
 * PostgreSQL has no concept of a connection without a database, so a connection
 * that stores none is pointed at the conventional maintenance database; any
 * command can retarget it with `--database`.
 */
const FALLBACK_DATABASE = 'postgres';

const SYSTEM_DATABASES = new Set(['postgres', 'template0', 'template1']);
const SYSTEM_SCHEMAS = `'pg_catalog', 'information_schema'`;
const DEFAULT_SCHEMA = 'public';

interface PgResult {
  fields?: Array<unknown>;
  rows: Record<string, unknown>[];
  rowCount: number | null;
  command: string;
}

interface PgError {
  code?: string;
  schema?: string;
  table?: string;
}

function createClient(conn: ConnectionConfig): InstanceType<typeof Client> {
  const needsSSL =
    conn.host !== 'localhost' && conn.host !== '127.0.0.1' && conn.host !== '::1';

  const clientConfig: Record<string, unknown> = {
    host: conn.host,
    port: conn.port || 5432,
    user: conn.user,
    password: conn.password,
    database: conn.database || FALLBACK_DATABASE,
    connectionTimeoutMillis: 10000,
  };

  if (conn.ssl !== undefined) {
    clientConfig['ssl'] = conn.ssl ? { rejectUnauthorized: false } : false;
  } else if (needsSSL) {
    clientConfig['ssl'] = { rejectUnauthorized: false };
  }

  return new Client(clientConfig);
}

function toSession(client: InstanceType<typeof Client>, conn: ConnectionConfig): Session {
  return {
    connection: conn,
    async query(sql: string, params: unknown[] = []): Promise<StatementResult> {
      const result = (await (
        client.query as (query: Record<string, unknown>) => Promise<unknown>
      )({ text: sql, values: params, rowMode: 'object' })) as PgResult;

      // DDL/DML statements come back without a field list.
      if (result.fields === undefined || result.fields.length === 0) {
        return { kind: 'summary', summary: { rowCount: result.rowCount, command: result.command } };
      }

      return { kind: 'rows', rows: result.rows };
    },
    async close(): Promise<void> {
      await client.end().catch(() => {});
    },
  };
}

export const postgresqlDriver: Driver = {
  type: 'postgresql',
  label: 'PostgreSQL',
  containerLabel: 'schema',
  defaultPort: 5432,
  fallbackDatabase: FALLBACK_DATABASE,
  capabilities: CAPABILITIES,

  async open(conn: ConnectionConfig): Promise<Session> {
    const client = createClient(conn);
    await client.connect();
    return toSession(client, conn);
  },

  healthCheck(): string {
    return 'SELECT 1';
  },

  describeError(err: unknown, context: { connection: string; sql?: string }): string[] {
    const engineError = asEngineError(err);
    const detail = err as PgError;
    const lines = [`Error: ${engineError.message}`];
    if (engineError.code) lines.push(`Code: ${engineError.code}`);
    if (detail?.schema) lines.push(`Schema: ${detail.schema}`);
    if (detail?.table) lines.push(`Table: ${detail.table}`);

    if (engineError.message.includes('does not exist') || engineError.code === '42P01') {
      const match = engineError.message.match(/"([^"]+)"$/);
      const badTable = match ? match[1] : '<table>';
      if (badTable && !badTable.includes(' ')) {
        lines.push('');
        lines.push('Hint: The table may exist in a different schema. Find it with:');
        lines.push(`  database find-table ${context.connection} ${badTable}`);
        lines.push(`  database schemas ${context.connection}`);
      }
    }

    if (engineError.message.includes('undefined column') || engineError.code === '42703') {
      const match = engineError.message.match(/column "([^"]+)"/i);
      if (match && detail?.table) {
        lines.push('');
        lines.push('Hint: Check column names with:');
        lines.push(`  database columns ${context.connection} ${detail.table}`);
      }
    }

    if (engineError.code === '3D000') {
      lines.push('');
      lines.push(
        'Hint: That database does not exist on this server. Set a default on the connection with ' +
          `\`database config --ui\`, or target another one with \`--database <name>\`.`,
      );
    }

    return lines;
  },

  async listDatabases(session: Session): Promise<string[]> {
    const result = await session.query(
      'SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname',
    );
    if (result.kind !== 'rows') return [];
    return result.rows
      .map((row) => String(row['datname']))
      .filter((name) => !SYSTEM_DATABASES.has(name));
  },

  async listSchemas(session: Session): Promise<string[]> {
    const result = await session.query(
      `SELECT schema_name FROM information_schema.schemata
       WHERE schema_name NOT IN (${SYSTEM_SCHEMAS})
       ORDER BY schema_name`,
    );
    if (result.kind !== 'rows') return [];
    return result.rows.map((row) => String(row['schema_name']));
  },

  async listColumns(session: Session, target: ContainerTarget): Promise<ColumnInfo[]> {
    const schema = target.container || DEFAULT_SCHEMA;
    const result = await session.query(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_schema = $1 AND table_name = $2
       ORDER BY ordinal_position`,
      [schema, target.table],
    );
    if (result.kind !== 'rows') return [];
    return result.rows.map((row) => ({
      name: String(row['column_name']),
      type: String(row['data_type'] ?? ''),
      nullable: row['is_nullable'] === 'YES',
    }));
  },

  async findTable(session: Session, table: string): Promise<TableLocation[]> {
    const isPattern = table.includes('%');
    const result = await session.query(
      `SELECT table_schema, table_name,
         (SELECT reltuples FROM pg_class WHERE relname = table_name) AS estimated_rows
       FROM information_schema.tables
       WHERE table_name ${isPattern ? 'LIKE' : '='} $1
         AND table_schema NOT IN (${SYSTEM_SCHEMAS})
         AND table_type = 'BASE TABLE'
       ORDER BY table_schema, table_name`,
      [table],
    );
    if (result.kind !== 'rows') return [];
    return result.rows.map((row) => ({
      container: String(row['table_schema']),
      table: String(row['table_name']),
      estimatedRows: row['estimated_rows'] == null ? null : Math.round(Number(row['estimated_rows'])),
    }));
  },
};
