import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import router from "./routes";
import { logger } from "./lib/logger";
import { buildSessionMiddleware } from "./lib/auth";
import { isTransientDbError } from "./lib/dbRetry";
import { mountSeoRoutes, mountSpaSeoFallback } from "./seo/http";

const app: Express = express();

function extractErrorCode(err: unknown): string | undefined {
  let current: unknown = err;
  for (let i = 0; i < 4; i += 1) {
    if (!current || typeof current !== "object") return undefined;
    const code = (current as { code?: unknown }).code;
    if (typeof code === "string") return code;
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}

function extractErrorMessage(err: unknown): string | undefined {
  let current: unknown = err;
  for (let i = 0; i < 4; i += 1) {
    if (!current || typeof current !== "object") return undefined;
    const message = (current as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.set("trust proxy", 1);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(buildSessionMiddleware());

// Local dev helper: serve mock/static assets from `backend/public/*` via the API origin.
// This is useful for seeded placeholder images without relying on external URLs.
app.use("/api/static", express.static(path.resolve(process.cwd(), "public")));

app.use("/api", router);
mountSeoRoutes(app);

const nodeEnv = process.env["NODE_ENV"] ?? "development";

if (nodeEnv === "production") {
  const backendRootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const clientDir = path.resolve(backendRootDir, "public", "app");
  const indexHtmlPath = path.join(clientDir, "index.html");

  app.use(
    express.static(clientDir, {
      index: false,
    }),
  );

  mountSpaSeoFallback(app, indexHtmlPath);
}

app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err, method: req.method, url: req.url?.split("?")[0] }, "Unhandled error");
  // Let pino-http include the real error object (and stack) in its automatic request log.
  // It checks `res.err` when logging "request errored".
  (res as unknown as { err?: unknown }).err = err;

  const code = extractErrorCode(err);
  const isDbAuth = code === "28P01";
  const isDbMissing = code === "3D000";
  const isDbConnRefused = code === "ECONNREFUSED";
  const isDbDns = code === "ENOTFOUND";
  const isDbConnReset = code === "ECONNRESET";
  const isDbConnFailure =
    code === "57P01" ||
    code === "57P02" ||
    code === "57P03" ||
    code === "08006" ||
    code === "08003";
  const message = extractErrorMessage(err);
  const isDbMessageTransient = Boolean(
    message &&
      (/connection terminated unexpectedly/i.test(message) ||
        /server closed the connection unexpectedly/i.test(message) ||
        /terminating connection due to administrator command/i.test(message)),
  );

  const isDbUnavailable =
    isDbAuth ||
    isDbMissing ||
    isDbConnRefused ||
    isDbDns ||
    isDbConnReset ||
    isDbConnFailure ||
    isDbMessageTransient ||
    isTransientDbError(err);

  if (isDbUnavailable) {
    if (nodeEnv !== "production") {
      const hint = isDbAuth
        ? "Postgres auth failed (28P01). Verify DATABASE_URL username/password or start docker-compose."
        : isDbMissing
          ? "Postgres database missing (3D000). Create the database referenced by DATABASE_URL or start docker-compose."
          : isDbConnRefused
            ? "Postgres connection refused (ECONNREFUSED). Ensure Postgres is running and reachable."
            : isDbDns
              ? "Postgres hostname could not be resolved (ENOTFOUND). Check DATABASE_URL host / DNS / internet connectivity."
              : isDbConnReset
                ? "Postgres connection reset (ECONNRESET). Often a network/TLS issue; if using Supabase set DATABASE_SSL=require."
                : isDbConnFailure || isDbMessageTransient
                  ? "Postgres connection was interrupted. This is often a transient pooler/network issue; retrying should succeed shortly."
                  : "Postgres connection error. This is often transient; retrying should succeed shortly.";
      res.status(503).json({ error: "Database unavailable", code, hint });
      return;
    }

    res.status(503).json({ error: "Service unavailable" });
    return;
  }

  res.status(500).json({ error: "Internal server error" });
});

export default app;
