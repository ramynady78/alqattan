import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, settingsTable } from "@workspace/db";
import { UpdateSettingsBody } from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";
import { withDbRetry } from "../lib/dbRetry";

const router: IRouter = Router();

type SettingsRow = typeof settingsTable.$inferSelect;

function serialize(s: SettingsRow) {
  return {
    phone: s.phone,
    whatsapp: s.whatsapp,
    email: s.email,
    address: s.address,
    mapEmbedUrl: s.mapEmbedUrl,
    instagram: s.instagram,
    snapchat: s.snapchat,
    twitter: s.twitter,
    tiktokUrl: s.tiktokUrl ?? "",
    brandTagline: s.brandTagline,
    heroTitle: s.heroTitle,
    heroSubtitle: s.heroSubtitle,
    aboutText: s.aboutText,
  };
}

async function ensureRow(): Promise<SettingsRow> {
  const [existing] = await db
    .select()
    .from(settingsTable)
    .where(eq(settingsTable.id, 1))
    .limit(1);
  if (existing) return existing;

  const inserted = await db
    .insert(settingsTable)
    .values({ id: 1 })
    .onConflictDoNothing({ target: settingsTable.id })
    .returning();

  if (inserted.length > 0) return inserted[0];

  // If another request inserted concurrently, read again.
  const [row] = await db
    .select()
    .from(settingsTable)
    .where(eq(settingsTable.id, 1))
    .limit(1);
  if (!row) {
    throw new Error("Failed to ensure site settings row exists");
  }
  return row;
}

router.get("/settings", async (req, res): Promise<void> => {
  const row = await withDbRetry(() => ensureRow(), {
    onRetry: (err) => req.log.warn({ err }, "Transient database error; retrying GET /settings"),
  });
  res.json(serialize(row));
});

router.patch("/settings", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const current = await ensureRow();
  const [row] = await db
    .update(settingsTable)
    .set({
      phone: parsed.data.phone ?? current.phone,
      whatsapp: parsed.data.whatsapp ?? current.whatsapp,
      email: parsed.data.email ?? current.email,
      address: parsed.data.address ?? current.address,
      mapEmbedUrl: parsed.data.mapEmbedUrl ?? current.mapEmbedUrl,
      instagram: parsed.data.instagram ?? current.instagram,
      snapchat: parsed.data.snapchat ?? current.snapchat,
      twitter: parsed.data.twitter ?? current.twitter,
      tiktokUrl:
        parsed.data.tiktokUrl !== undefined ? parsed.data.tiktokUrl : current.tiktokUrl,
      brandTagline: parsed.data.brandTagline ?? current.brandTagline,
      heroTitle: parsed.data.heroTitle ?? current.heroTitle,
      heroSubtitle: parsed.data.heroSubtitle ?? current.heroSubtitle,
      aboutText: parsed.data.aboutText ?? current.aboutText,
    })
    .returning();
  res.json(serialize(row));
});

export default router;
