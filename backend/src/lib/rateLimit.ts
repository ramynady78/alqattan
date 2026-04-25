import type { Request, Response, NextFunction } from "express";

interface Bucket {
  count: number;
  resetAt: number;
}

export function rateLimit(opts: {
  windowMs: number;
  max: number;
  key?: (req: Request) => string;
}) {
  const buckets = new Map<string, Bucket>();
  const keyOf = opts.key ?? ((req: Request) => req.ip ?? "unknown");
  return (req: Request, res: Response, next: NextFunction): void => {
    const k = keyOf(req);
    const now = Date.now();
    const b = buckets.get(k);
    if (!b || b.resetAt < now) {
      buckets.set(k, { count: 1, resetAt: now + opts.windowMs });
      next();
      return;
    }
    if (b.count >= opts.max) {
      res.status(429).json({ error: "Too many requests, please slow down." });
      return;
    }
    b.count += 1;
    next();
  };
}
