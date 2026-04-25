type ErrorLike = {
  code?: unknown;
  message?: unknown;
  cause?: unknown;
  name?: unknown;
};

function getCode(err: unknown): string | undefined {
  if (!err || typeof err !== "object") return undefined;
  const code = (err as ErrorLike).code;
  return typeof code === "string" ? code : undefined;
}

function getMessage(err: unknown): string | undefined {
  if (!err || typeof err !== "object") return undefined;
  const msg = (err as ErrorLike).message;
  return typeof msg === "string" ? msg : undefined;
}

function walkErrorChain(err: unknown, maxDepth = 8): unknown[] {
  const out: unknown[] = [];
  let current: unknown = err;
  for (let i = 0; i < maxDepth; i += 1) {
    if (!current) break;
    out.push(current);
    if (typeof current !== "object") break;
    current = (current as ErrorLike).cause;
  }
  return out;
}

const TRANSIENT_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ENOTFOUND",
  "ETIMEDOUT",
  // Postgres "operator intervention"/restart-ish:
  "57P01", // admin_shutdown
  "57P02", // crash_shutdown
  "57P03", // cannot_connect_now
  // Postgres connection exceptions:
  "08003", // connection_does_not_exist
  "08006", // connection_failure
]);

const TRANSIENT_MESSAGE_PATTERNS: RegExp[] = [
  /connection terminated unexpectedly/i,
  /server closed the connection unexpectedly/i,
  /terminating connection due to administrator command/i,
  /socket hang up/i,
  /read econnreset/i,
  /write econnreset/i,
];

export function isTransientDbError(err: unknown): boolean {
  for (const e of walkErrorChain(err)) {
    const code = getCode(e);
    if (code && TRANSIENT_CODES.has(code)) return true;

    const message = getMessage(e);
    if (message && TRANSIENT_MESSAGE_PATTERNS.some((re) => re.test(message))) {
      return true;
    }
  }
  return false;
}

export async function withDbRetry<T>(
  fn: () => Promise<T>,
  options?: {
    retries?: number;
    delayMs?: number;
    onRetry?: (err: unknown, attempt: number) => void;
  },
): Promise<T> {
  const retries = options?.retries ?? 1;
  const delayMs = options?.delayMs ?? 50;

  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries || !isTransientDbError(err)) {
        throw err;
      }
      attempt += 1;
      options?.onRetry?.(err, attempt);
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
}

