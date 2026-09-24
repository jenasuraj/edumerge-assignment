import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";

type PgGlobal = typeof globalThis & {
  edumergePool?: Pool;
};

function getConnectionString() {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL;

  if (!url) {
    throw new Error("Missing DATABASE_URL or POSTGRES_URL for PostgreSQL.");
  }

  return url;
}

function createPool() {
  const connectionString = getConnectionString();
  const isLocal =
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1");

  return new Pool({
    connectionString,
    max: 10,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });
}

function getPool() {
  const globalForPg = globalThis as PgGlobal;

  if (!globalForPg.edumergePool) {
    globalForPg.edumergePool = createPool();
  }

  return globalForPg.edumergePool;
}

export const db = {
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    return getPool().query<T>(text, params);
  },
};

export function getDbClient(): Promise<PoolClient> {
  return getPool().connect();
}
