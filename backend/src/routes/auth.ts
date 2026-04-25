import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, adminsTable } from "@workspace/db";
import { AdminLoginBody } from "@workspace/api-zod";
import { verifyPassword } from "../lib/auth";
import { rateLimit } from "../lib/rateLimit";

const router: IRouter = Router();

const loginLimiter = rateLimit({ windowMs: 60_000, max: 10 });

router.post("/auth/login", loginLimiter, async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;
  const [admin] = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.email, email.toLowerCase()));
  if (!admin) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const ok = await verifyPassword(password, admin.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  req.session.adminId = admin.id;
  req.session.adminEmail = admin.email;
  req.session.adminName = admin.name;

  await new Promise<void>((resolve, reject) => {
    req.session.save((err) => {
      if (err) reject(err);
      else resolve();
    });
  }).catch((err) => {
    req.log.error({ err }, "Failed to persist session");
    res.status(503).json({ error: "Session store unavailable" });
  });

  if (res.headersSent) return;

  res.json({ id: admin.id, email: admin.email, name: admin.name });
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.status(204).send();
  });
});

router.get("/auth/me", (req, res): void => {
  if (!req.session.adminId) {
    // Treat unauthenticated users as "no session" rather than an error.
    // This keeps the endpoint usable for "am I logged in?" checks without
    // surfacing noisy 401s in clients.
    res.json(null);
    return;
  }
  res.json({
    id: req.session.adminId,
    email: req.session.adminEmail ?? "",
    name: req.session.adminName ?? "",
  });
});

export default router;
