import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@workspace/db";
import { logger } from "./logger";

declare module "express-session" {
  interface SessionData {
    adminId?: number;
    adminEmail?: string;
    adminName?: string;
  }
}

function parseBooleanEnv(
  key: string,
  defaultValue: boolean,
): { value: boolean; source: "default" | "env"; raw?: string } {
  const raw = process.env[key];
  if (raw == null) return { value: defaultValue, source: "default" };

  const normalized = raw.trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(normalized)) {
    return { value: true, source: "env", raw };
  }
  if (["0", "false", "no", "n", "off"].includes(normalized)) {
    return { value: false, source: "env", raw };
  }

  logger.warn(
    { key, raw },
    "Invalid boolean env var value; falling back to default",
  );
  return { value: defaultValue, source: "default", raw };
}

function resolveUseDbSessionStore(): {
  useDbSessionStore: boolean;
  source: "default" | "env";
  raw?: string;
} {
  const nodeEnv = process.env["NODE_ENV"] ?? "development";
  const defaultValue = nodeEnv === "production";
  const parsed = parseBooleanEnv("USE_DB_SESSION_STORE", defaultValue);
  return {
    useDbSessionStore: parsed.value,
    source: parsed.source,
    raw: parsed.raw,
  };
}

function resolveSessionSecret(): string {
  const secret = process.env["SESSION_SECRET"]?.trim();
  if (secret) return secret;

  const nodeEnv = process.env["NODE_ENV"] ?? "development";
  if (nodeEnv === "production") {
    throw new Error(
      "SESSION_SECRET environment variable is required in production.",
    );
  }

  const fallback = crypto.randomBytes(32).toString("hex");
  logger.warn(
    { nodeEnv },
    "SESSION_SECRET is not set; using an ephemeral development secret",
  );
  return fallback;
}

export function buildSessionMiddleware() {
  const secret = resolveSessionSecret();
  const nodeEnv = process.env["NODE_ENV"] ?? "development";
  const { useDbSessionStore, source, raw } = resolveUseDbSessionStore();

  if (!useDbSessionStore) {
    logger.info(
      { nodeEnv, sessionStore: "MemoryStore", useDbSessionStore, source, raw },
      "Session store configured",
    );
    return session({
      secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: nodeEnv === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    });
  }

  // Only build the Postgres-backed store when explicitly enabled.
  // This avoids Supabase/remote DB timeouts impacting local/demo sessions.
  const PgStore = connectPgSimple(session);

  logger.info(
    {
      nodeEnv,
      sessionStore: "connect-pg-simple",
      useDbSessionStore,
      source,
      raw,
      tableName: "admin_sessions",
    },
    "Session store configured",
  );
  return session({
    store: new PgStore({
      pool,
      tableName: "admin_sessions",
      createTableIfMissing: true,
    }),
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: nodeEnv === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  });
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.session.adminId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}
