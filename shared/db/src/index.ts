import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.js";

const { Pool } = pg;

let poolInstance: pg.Pool | undefined;
let dbInstance: ReturnType<typeof drizzle> | undefined;
let poolErrorHandlerAttached = false;
let lastResolvedPoolSsl: pg.PoolConfig["ssl"] | undefined;

type PoolKeepAliveConfig = {
  keepAlive?: boolean;
  keepAliveInitialDelayMillis?: number;
};

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function buildDatabaseUrlFromParts(): string | undefined {
  const host =
    process.env["DATABASE_HOST"] ??
    // Typo-friendly fallback (seen in some local .envs)
    process.env["DATABASE_HOSET"];
  const port = process.env["DATABASE_PORT"];
  const user = process.env["DATABASE_USER"];
  const password = process.env["DATABASE_PASSWORD"];
  const database = process.env["DATABASE_NAME"];

  if (!host || !user || !password || !database) return undefined;

  const url = new URL("postgresql://placeholder");
  url.username = user;
  url.password = password;
  url.hostname = host;
  if (port) url.port = port;
  url.pathname = `/${database}`;

  return url.toString();
}

function getDatabaseUrl(): string {
  const raw = process.env["DATABASE_URL"] ?? buildDatabaseUrlFromParts();
  if (!raw) {
    throw new Error(
      "DATABASE_URL must be set (or DATABASE_HOST/DATABASE_USER/DATABASE_PASSWORD/DATABASE_NAME). Did you forget to provision a database?",
    );
  }
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function resolveSslOption(connectionString: string): pg.PoolConfig["ssl"] {
  const modeRaw =
    process.env["DATABASE_SSL"] ??
    process.env["PGSSLMODE"] ??
    process.env["PG_SSLMODE"];
  const mode = modeRaw?.trim().toLowerCase();
  if (mode === "disable" || mode === "off" || mode === "false" || mode === "0") {
    return undefined;
  }
  if (
    mode === "require" ||
    mode === "verify-full" ||
    mode === "verify-ca" ||
    mode === "on" ||
    mode === "true" ||
    mode === "1"
  ) {
    return { rejectUnauthorized: false };
  }

  // Auto: enable SSL for non-local hosts (e.g. Supabase/managed Postgres).
  // Local Postgres typically runs without TLS and will fail if SSL is forced.
  try {
    const url = new URL(connectionString);
    const sslmode = url.searchParams.get("sslmode")?.trim().toLowerCase();
    if (sslmode === "disable" || sslmode === "off") return undefined;
    if (sslmode === "require" || sslmode === "verify-full" || sslmode === "verify-ca") {
      return { rejectUnauthorized: false };
    }

    const sslParam = url.searchParams.get("ssl")?.trim().toLowerCase();
    if (sslParam === "true" || sslParam === "1" || sslParam === "on") {
      return { rejectUnauthorized: false };
    }

    const host = url.hostname;
    const isLocalhost = host === "localhost" || host === "127.0.0.1" || host === "::1";
    return isLocalhost ? undefined : { rejectUnauthorized: false };
  } catch {
    return undefined;
  }
}

export function getPoolSslInfo(): {
  enabled: boolean;
  rejectUnauthorized?: boolean;
  host?: string;
  sslmode?: string;
} {
  const connectionString = getDatabaseUrl();
  let host: string | undefined;
  let sslmode: string | undefined;
  try {
    const url = new URL(connectionString);
    host = url.host || undefined;
    sslmode = url.searchParams.get("sslmode")?.trim() || undefined;
  } catch {
    // ignore
  }

  const ssl = lastResolvedPoolSsl ?? resolveSslOption(connectionString);
  if (!ssl) return { enabled: false, host, sslmode };
  if (typeof ssl === "object") {
    const rejectUnauthorized =
      "rejectUnauthorized" in ssl ? (ssl as { rejectUnauthorized?: boolean }).rejectUnauthorized : undefined;
    return { enabled: true, rejectUnauthorized, host, sslmode };
  }
  return { enabled: Boolean(ssl), host, sslmode };
}

export function getPool(): pg.Pool {
  const connectionString = getDatabaseUrl();
  const ssl = resolveSslOption(connectionString);
  lastResolvedPoolSsl = ssl;
  poolInstance ??= new Pool({
    connectionString,
    ssl,
    max: parsePositiveInt(process.env["DATABASE_POOL_MAX"], 10),
    idleTimeoutMillis: parsePositiveInt(process.env["DATABASE_IDLE_TIMEOUT_MS"], 30_000),
    connectionTimeoutMillis: parsePositiveInt(
      process.env["DATABASE_CONNECTION_TIMEOUT_MS"],
      10_000,
    ),
    // Keep TCP connections alive so idle pool connections are less likely to be
    // silently dropped by NAT/proxies (common with managed Postgres/poolers).
    ...(process.env["DATABASE_KEEP_ALIVE"] === "false"
      ? {}
      : ({ keepAlive: true, keepAliveInitialDelayMillis: 0 } satisfies PoolKeepAliveConfig)),
  } as pg.PoolConfig);

  // IMPORTANT: pg Pool emits 'error' events on idle clients. If unhandled, this
  // becomes an uncaught exception and can crash the process, causing frontend
  // proxy ECONNREFUSED spikes.
  if (!poolErrorHandlerAttached) {
    poolErrorHandlerAttached = true;
    poolInstance.on("error", (err: unknown) => {
      // Avoid dependency on backend logger; keep this package standalone.
      // eslint-disable-next-line no-console
      console.error("[db] unexpected pg pool error (idle client)", err);
    });
  }
  return poolInstance;
}

export function getDb(): ReturnType<typeof drizzle> {
  dbInstance ??= drizzle(getPool(), { schema });
  return dbInstance;
}

function lazyProxy<T extends object>(factory: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop) {
      const real = factory();
      const value = Reflect.get(real as unknown as object, prop, real);
      return typeof value === "function" ? value.bind(real) : value;
    },
    set(_target, prop, value) {
      const real = factory();
      return Reflect.set(real as unknown as object, prop, value, real);
    },
    has(_target, prop) {
      return Reflect.has(factory() as unknown as object, prop);
    },
    ownKeys() {
      return Reflect.ownKeys(factory() as unknown as object);
    },
    getOwnPropertyDescriptor(_target, prop) {
      return Object.getOwnPropertyDescriptor(factory() as unknown as object, prop);
    },
  });
}

export const pool = lazyProxy(getPool);
export const db = lazyProxy(getDb);

export * from "./schema/index.js";
