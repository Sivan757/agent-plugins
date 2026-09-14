import mysql from 'mysql2/promise';

import {
  asEngineError,
  resolveContainer,
  type Capability,
  type ColumnInfo,
  type ColumnLocation,
  type ConnectionConfig,
  type ContainerTarget,
  type Driver,
  type Session,
  type StatementResult,
  type TableLocation,
  type TableProfile,
  type TableRelationships,
} from './types.js';

const CAPABILITIES: ReadonlySet<Capability> = new Set<Capability>([
  'search-columns',
  'relationships',
  'profile',
]);

const SYSTEM_DATABASES = new Set(['information_schema', 'mysql', 'performance_schema', 'sys']);
const SYSTEM_DATABASES_SQL = `'information_schema','mysql','performance_schema','sys'`;

/** Backtick-quote each dotted segment of a table reference. */
function quoteIdentifier(name: string): string {
  return name
    .split('.')
    .map((part) => `\`${part}\``)
    .join('.');
}

function toSession(connection: mysql.Connection, conn: ConnectionConfig): Session {
  return {
    connection: conn,
    async query(sql: string, params: unknown[] = []): Promise<StatementResult> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [rows] = await connection.execute(sql, params as any);

      // DDL/DML statements return an OkPacket rather than a row array.
      if (!Array.isArray(rows)) {
        const ok = rows as mysql.OkPacket & { changedRows?: number; info?: string };
        return {
          kind: 'summary',
          summary: {
            affectedRows: ok.affectedRows,
            insertId: ok.insertId != null ? String(ok.insertId) : undefined,
            changedRows: ok.changedRows,
            info: ok.info,
          },
        };
      }

      return { kind: 'rows', rows: rows as Record<string, unknown>[] };
    },
    async close(): Promise<void> {
      await connection.end();
    },
  };
}

export const mysqlDriver: Driver = {
  type: 'mysql',
  label: 'MySQL',
  containerLabel: 'database',
  defaultPort: 3306,
  capabilities: CAPABILITIES,

  async open(conn: ConnectionConfig): Promise<Session> {
    const connection = await mysql.createConnection({
      host: conn.host,
      port: conn.port || 3306,
      user: conn.user,
      password: conn.password,
      // A connection may describe only the server; the database is then chosen
      // per command by qualifying the table or passing --database.
      ...(conn.database ? { database: conn.database } : {}),
      connectTimeout: 10000,
      supportBigNumbers: true,
      bigNumberStrings: true,
      dateStrings: true,
      ...(conn.ssl ? { ssl: conn.ssl as mysql.SslOptions } : {}),
    });
    return toSession(connection, conn);
  },

  healthCheck(): string {
    return 'SELECT 1';
  },

  describeError(err: unknown, context: { connection: string; sql?: string }): string[] {
    const { message, code } = asEngineError(err);
    const lines = [`Error: ${message}`];
    if (code) lines.push(`Code: ${code}`);

    if (code === 'ER_NO_SUCH_TABLE') {
      const match = message.match(/Table '([^']+)'/);
      const badTable = match ? match[1].split('.').pop() : '<table>';
      lines.push('');
      lines.push('Hint: The table may exist in a different database. Find it with:');
      lines.push(`  database find-table ${context.connection} ${badTable}`);
      lines.push(`  database databases ${context.connection}`);
    }

    if (code === 'ER_BAD_FIELD_ERROR') {
      const match = message.match(/Unknown column '([^']+)'/);
      lines.push('');
      lines.push('Hint: Check column names with:');
      lines.push(`  database columns ${context.connection} <table>`);
      if (match) lines.push(`  database search-columns ${context.connection} %${match[1]}%`);
    }

    return lines;
  },

  async listDatabases(session: Session): Promise<string[]> {
    const result = await session.query('SHOW DATABASES');
    if (result.kind !== 'rows') return [];
    return result.rows
      .map((row) => String(row['Database']))
      .filter((name) => !SYSTEM_DATABASES.has(name));
  },

  async listColumns(session: Session, target: ContainerTarget): Promise<ColumnInfo[]> {
    // Resolve first: an unqualified table on a connection with no default
    // database would otherwise reach the server as "No database selected".
    const { container, table } = resolveContainer(mysqlDriver, session.connection, target);
    const qualify = Boolean(target.container) || target.table.includes('.');
    const result = await session.query(`DESCRIBE ${quoteIdentifier(qualify ? `${container}.${table}` : table)}`);
    if (result.kind !== 'rows') return [];
    return result.rows.map((row) => ({
      name: String(row['Field']),
      type: String(row['Type'] ?? ''),
      nullable: row['Null'] === 'YES',
    }));
  },

  async findTable(session: Session, table: string): Promise<TableLocation[]> {
    const isPattern = table.includes('%');
    const sql = isPattern
      ? `SELECT TABLE_SCHEMA, TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES
           WHERE TABLE_NAME LIKE ? AND TABLE_SCHEMA NOT IN (${SYSTEM_DATABASES_SQL})
           ORDER BY TABLE_SCHEMA, TABLE_NAME`
      : `SELECT TABLE_SCHEMA, TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES
           WHERE TABLE_NAME = ? AND TABLE_SCHEMA NOT IN (${SYSTEM_DATABASES_SQL})
           ORDER BY TABLE_SCHEMA, TABLE_NAME`;
    const result = await session.query(sql, [table]);
    if (result.kind !== 'rows') return [];
    return result.rows.map((row) => ({
      container: String(row['TABLE_SCHEMA']),
      table: String(row['TABLE_NAME']),
      estimatedRows: row['TABLE_ROWS'] == null ? null : Number(row['TABLE_ROWS']),
    }));
  },

  async searchColumns(session: Session, pattern: string): Promise<ColumnLocation[]> {
    const sql = `SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, COLUMN_TYPE
      FROM information_schema.COLUMNS
      WHERE COLUMN_NAME LIKE ? AND TABLE_SCHEMA NOT IN (${SYSTEM_DATABASES_SQL})
      ORDER BY TABLE_SCHEMA, TABLE_NAME, ORDINAL_POSITION`;
    const result = await session.query(sql, [pattern]);
    if (result.kind !== 'rows') return [];
    return result.rows.map((row) => ({
      container: String(row['TABLE_SCHEMA']),
      table: String(row['TABLE_NAME']),
      column: String(row['COLUMN_NAME']),
      type: String(row['COLUMN_TYPE']),
    }));
  },

  async relationships(session: Session, target: ContainerTarget): Promise<TableRelationships> {
    const { container, table } = resolveContainer(mysqlDriver, session.connection, target);

    const outgoing = await session.query(
      `SELECT COLUMN_NAME, REFERENCED_TABLE_SCHEMA, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
       FROM information_schema.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL
       ORDER BY COLUMN_NAME`,
      [container, table],
    );
    const incoming = await session.query(
      `SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, REFERENCED_COLUMN_NAME
       FROM information_schema.KEY_COLUMN_USAGE
       WHERE REFERENCED_TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME = ?
       ORDER BY TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME`,
      [container, table],
    );
    const byConvention = await session.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME LIKE '%\\_id' AND COLUMN_KEY != 'PRI'
       ORDER BY ORDINAL_POSITION`,
      [container, table],
    );

    return {
      container,
      table,
      outgoing:
        outgoing.kind === 'rows'
          ? outgoing.rows.map(
              (row) =>
                `${table}.${String(row['COLUMN_NAME'])} → ${String(row['REFERENCED_TABLE_SCHEMA'])}.${String(row['REFERENCED_TABLE_NAME'])}.${String(row['REFERENCED_COLUMN_NAME'])}`,
            )
          : [],
      incoming:
        incoming.kind === 'rows'
          ? incoming.rows.map(
              (row) =>
                `${String(row['TABLE_SCHEMA'])}.${String(row['TABLE_NAME'])}.${String(row['COLUMN_NAME'])} → ${table}.${String(row['REFERENCED_COLUMN_NAME'])}`,
            )
          : [],
      joinCandidates:
        byConvention.kind === 'rows' ? byConvention.rows.map((row) => String(row['COLUMN_NAME'])) : [],
    };
  },

  async profile(session: Session, target: ContainerTarget): Promise<TableProfile> {
    const { container, table } = resolveContainer(mysqlDriver, session.connection, target);

    const tableInfo = await session.query(
      'SELECT TABLE_ROWS FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
      [container, table],
    );
    if (tableInfo.kind !== 'rows' || tableInfo.rows.length === 0) {
      throw Object.assign(new Error(`Table "${container}.${table}" not found.`), { code: 'ER_NO_SUCH_TABLE' });
    }

    const estimatedRows = tableInfo.rows[0]['TABLE_ROWS'];
    const dateColumnsResult = await session.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND DATA_TYPE IN ('datetime', 'timestamp')
       ORDER BY ORDINAL_POSITION`,
      [container, table],
    );
    const dateColumns =
      dateColumnsResult.kind === 'rows'
        ? dateColumnsResult.rows.map((row) => String(row['COLUMN_NAME']))
        : [];

    let dateRanges: TableProfile['dateRanges'] = [];
    if (dateColumns.length > 0) {
      // One round trip for every date column rather than one per column.
      const selects = dateColumns.map((column) => {
        const escaped = `\`${column}\``;
        return `MIN(${escaped}) AS \`${column}_min\`, MAX(${escaped}) AS \`${column}_max\``;
      });
      const ranges = await session.query(
        `SELECT ${selects.join(', ')} FROM ${quoteIdentifier(`${container}.${table}`)}`,
      );
      const row = ranges.kind === 'rows' ? ranges.rows[0] : undefined;
      dateRanges = dateColumns.map((column) => ({
        column,
        min: row?.[`${column}_min`],
        max: row?.[`${column}_max`],
      }));
    }

    return {
      container,
      table,
      estimatedRows: estimatedRows == null ? null : Number(estimatedRows),
      dateRanges,
    };
  },
};
