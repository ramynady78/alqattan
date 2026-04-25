import app from "./app";
import { logger } from "./lib/logger";
import { bootstrapDatabase } from "./lib/dbBootstrap";
import { getPoolSslInfo } from "@workspace/db";
import fs from "node:fs";
import path from "node:path";

const rawPort = process.env["PORT"] ?? "3000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

function readEnvFileValue(filePath: string, key: string): string | undefined {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    for (const lineRaw of raw.split(/\r?\n/)) {
      const line = lineRaw.trim();
      if (!line || line.startsWith("#")) continue;
      const idx = line.indexOf("=");
      if (idx <= 0) continue;
      const k = line.slice(0, idx).trim();
      if (k !== key) continue;
      let value = line.slice(idx + 1).trim();
      if (
        (value.startsWith("\"") && value.endsWith("\"")) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      return value;
    }
  } catch {
    // Ignore missing/unreadable .env; startup can still work via other env sources.
  }
  return undefined;
}

function describeDbUrl(urlRaw: string): { host?: string; username?: string } {
  try {
    const url = new URL(urlRaw);
    return { host: url.host, username: url.username || undefined };
  } catch {
    return {};
  }
}

function logEnvFileOverrideHint(): void {
  // Node's `--env-file` intentionally does NOT override existing environment
  // variables. This is a common footgun on Windows when DATABASE_URL is set as a
  // user/system env var and you expect `backend/.env` to win.
  const current = process.env["DATABASE_URL"]?.trim();
  if (!current) return;

  const envPath = path.join(process.cwd(), ".env");
  const fromFile = readEnvFileValue(envPath, "DATABASE_URL")?.trim();
  if (!fromFile) return;
  if (fromFile === current) return;

  const currentDesc = describeDbUrl(current);
  const fileDesc = describeDbUrl(fromFile);

  logger.warn(
    {
      currentDatabaseUrlHost: currentDesc.host,
      envFileDatabaseUrlHost: fileDesc.host,
      envFilePath: envPath,
    },
    "DATABASE_URL is already set in the shell, so Node's `--env-file .env` will not override it. Clear DATABASE_URL in your terminal/system env vars (or start a new shell) to use the value from .env.",
  );
}

function logPortEnvOverrideHint(): void {
  const current = process.env["PORT"]?.trim();
  if (!current) return;

  const envPath = path.join(process.cwd(), ".env");
  const fromFile = readEnvFileValue(envPath, "PORT")?.trim();
  if (!fromFile) return;
  if (fromFile === current) return;

  logger.warn(
    { currentPort: current, envFilePort: fromFile, envFilePath: envPath },
    "PORT is already set in the shell, so Node's `--env-file .env` will not override it. Ensure your frontend proxy points to the actual backend port, or clear PORT in your terminal/system env vars to use the value from .env.",
  );
}

function getErrorCode(err: unknown): string | undefined {
  if (!err || typeof err !== "object") return undefined;
  const code = (err as { code?: unknown }).code;
  return typeof code === "string" ? code : undefined;
}

function logDatabaseBootstrapHint(err: unknown): void {
  const code = getErrorCode(err);
  if (code === "28P01") {
    logger.error(
      {
        databaseUrlHost: (() => {
          try {
            const u = new URL(process.env["DATABASE_URL"] ?? "");
            return u.host;
          } catch {
            return undefined;
          }
        })(),
        code,
      },
      "Postgres authentication failed (28P01). Check DATABASE_URL username/password. If you intended to use docker-compose, run `docker compose up -d` and ensure nothing else is already using port 5432.",
    );
    return;
  }

  if (code === "3D000") {
    logger.error(
      { code },
      "Postgres database does not exist (3D000). Create the database referenced by DATABASE_URL (or start docker-compose which provisions it).",
    );
    return;
  }

  if (code === "ECONNREFUSED") {
    logger.error(
      { code },
      "Postgres connection refused (ECONNREFUSED). Ensure Postgres is running and reachable from DATABASE_URL.",
    );
    return;
  }

  if (code === "ECONNRESET") {
    logger.error(
      { code },
      "Postgres connection reset (ECONNRESET). This is often a network/TLS issue with hosted Postgres. If using Supabase, ensure DNS works and set DATABASE_SSL=require (or PGSSLMODE=require).",
    );
  }
}

(async () => {
  logEnvFileOverrideHint();
  logPortEnvOverrideHint();
  logger.info({ poolSsl: getPoolSslInfo() }, "Postgres pool SSL configuration");
  try {
    await bootstrapDatabase();
    logger.info("Database bootstrap complete");
  } catch (err) {
    logger.error({ err }, "Database bootstrap failed");
    logDatabaseBootstrapHint(err);
    const nodeEnv = process.env["NODE_ENV"] ?? "development";
    const allow = process.env["ALLOW_DB_BOOTSTRAP_FAILURE"] === "true";
    if (nodeEnv === "production" && !allow) {
      process.exit(1);
    }
  }

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
})().catch((err) => {
  logger.error({ err }, "Fatal startup error");
  process.exit(1);
});
