/**
 * The seam between the CLI shell and one database engine.
 *
 * The shell owns everything independent of the engine: config load and
 * adoption, connection lookup, session lifecycle, the write guard, result
 * rendering and capability gating. A driver owns how a connection is opened,
 * which catalog queries answer a discovery question, and how an engine error
 * becomes something actionable.
 *
 * Adding an engine is one file here plus one registry entry.
 */

export type DriverType = 'mysql' | 'postgresql';

export const DRIVER_TYPES: readonly DriverType[] = ['mysql', 'postgresql'];

export interface ConnectionConfig {
  type: DriverType;
  host: string;
  port?: number;
  user: string;
  password: string;
  /** Optional: a connection may describe a server and let each command pick a database. */
  database?: string;
  ssl?: boolean | Record<string, unknown>;
}

export interface DatabaseConfig extends Record<string, unknown> {
  connections: Record<string, ConnectionConfig>;
}

/** A statement outcome: a result set, or a count-style summary for DDL/DML. */
export type StatementResult =
  | { kind: 'rows'; rows: Record<string, unknown>[] }
  | { kind: 'summary'; summary: Record<string, unknown> };

/** An open connection. The shell guarantees `close()` runs exactly once. */
export interface Session {
  /** The connection this session was opened with, for engine defaults. */
  readonly connection: ConnectionConfig;
  query(sql: string, params?: unknown[]): Promise<StatementResult>;
  close(): Promise<void>;
}

/**
 * A discovery question an engine answers. The shell refuses a command whose
 * capability the connection's engine does not declare, and names the engines
 * that do.
 */
export type Capability = 'schemas' | 'search-columns' | 'relationships' | 'profile';

export interface ColumnInfo {
  name: string;
  type?: string;
  nullable?: boolean;
}

/** A table's namespace: a MySQL database or a PostgreSQL schema. */
export interface ContainerTarget {
  container?: string;
  table: string;
}

export interface TableLocation {
  container: string;
  table: string;
  estimatedRows: number | null;
}

export interface ColumnLocation {
  container: string;
  table: string;
  column: string;
  type: string;
}

export interface TableRelationships {
  container: string;
  table: string;
  /** `table.column → container.table.column` */
  outgoing: string[];
  incoming: string[];
  joinCandidates: string[];
}

export interface TableProfile {
  container: string;
  table: string;
  estimatedRows: number | null;
  dateRanges: Array<{ column: string; min: unknown; max: unknown }>;
}

export interface Driver {
  readonly type: DriverType;
  /** Display name for messages: "MySQL", "PostgreSQL". */
  readonly label: string;
  /** What the engine calls a table's namespace: "database" or "schema". */
  readonly containerLabel: string;
  readonly defaultPort: number;
  /**
   * The database to open when the connection does not store one. Omitted by
   * engines that can connect without selecting a database.
   */
  readonly fallbackDatabase?: string;
  readonly capabilities: ReadonlySet<Capability>;

  open(conn: ConnectionConfig): Promise<Session>;

  /** Statement that proves a connection works. */
  healthCheck(): string;

  /** Extra actionable lines for an engine error — nearby ground truth. */
  describeError(err: unknown, context: { connection: string; sql?: string }): string[];

  listDatabases(session: Session): Promise<string[]>;
  listColumns(session: Session, target: ContainerTarget): Promise<ColumnInfo[]>;
  findTable(session: Session, table: string): Promise<TableLocation[]>;

  listSchemas?(session: Session): Promise<string[]>;
  searchColumns?(session: Session, pattern: string): Promise<ColumnLocation[]>;
  relationships?(session: Session, target: ContainerTarget): Promise<TableRelationships>;
  profile?(session: Session, target: ContainerTarget): Promise<TableProfile>;
}

/** An engine error, narrowed enough to build a useful next step from. */
export interface EngineError {
  message: string;
  code?: string;
}

export function asEngineError(err: unknown): EngineError {
  const candidate = err as { message?: unknown; code?: unknown };
  return {
    message: typeof candidate?.message === 'string' ? candidate.message : String(err),
    code: typeof candidate?.code === 'string' ? candidate.code : undefined,
  };
}

/** The database a session opens against: the connection's own, or the engine fallback. */
export function effectiveDatabase(driver: Driver, conn: ConnectionConfig): string | undefined {
  return conn.database || driver.fallbackDatabase;
}

/**
 * Resolve a table's namespace from an explicit container, a dotted table name,
 * or the connection's default — and when none of those applies, say what to do
 * instead of sending an unqualified name to the server.
 */
export function resolveContainer(
  driver: Driver,
  conn: ConnectionConfig,
  target: ContainerTarget,
): { container: string; table: string } {
  if (target.container) return { container: target.container, table: target.table };
  if (target.table.includes('.')) {
    const [container, table] = target.table.split('.');
    return { container, table };
  }

  const fallback = effectiveDatabase(driver, conn);
  if (fallback) return { container: fallback, table: target.table };

  throw new Error(
    `Cannot tell which ${driver.containerLabel} "${target.table}" is in: this connection has no default ` +
      `${driver.containerLabel}. Name it as ${driver.containerLabel}.${target.table}, pass the ` +
      `${driver.containerLabel} as an argument, or set a default with \`config --ui\`.`,
  );
}
