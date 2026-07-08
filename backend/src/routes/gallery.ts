import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, galleryTable } from "@workspace/db";
import { CreateGalleryItemBody, UpdateGalleryItemBody } from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";
import { toIsoString } from "../lib/dates";
import { withDbRetry } from "../lib/dbRetry";
import { assertValidImageObjectPath } from "../lib/imageUploads";

const router: IRouter = Router();

function serialize(g: typeof galleryTable.$inferSelect) {
  return {
    id: g.id,
    title: g.title,
    description: g.description,
    imageUrl: g.imageUrl,
    sortOrder: g.sortOrder,
    createdAt: toIsoString(g.createdAt),
  };
}

router.get("/gallery", async (req, res): Promise<void> => {
  const rows = await withDbRetry(
    () =>
      db
        .select()
        .from(galleryTable)
        .orderBy(asc(galleryTable.sortOrder), asc(galleryTable.id)),
    {
      onRetry: (err) => req.log.warn({ err }, "Transient database error; retrying GET /gallery"),
    },
  );
  res.json(rows.map(serialize));
});

router.post("/gallery", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateGalleryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    await assertValidImageObjectPath(parsed.data.imageUrl, true);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Only image files are allowed" });
    return;
  }
  const [row] = await db
    .insert(galleryTable)
    .values({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      imageUrl: parsed.data.imageUrl,
      sortOrder: parsed.data.sortOrder ?? 0,
    })
    .returning();
  res.status(201).json(serialize(row));
});

router.patch("/gallery/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params["id"]);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateGalleryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    await assertValidImageObjectPath(parsed.data.imageUrl, true);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Only image files are allowed" });
    return;
  }
  const [row] = await db
    .update(galleryTable)
    .set({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      imageUrl: parsed.data.imageUrl,
      sortOrder: parsed.data.sortOrder ?? 0,
    })
    .where(eq(galleryTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Gallery item not found" });
    return;
  }
  res.json(serialize(row));
});

router.delete("/gallery/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params["id"]);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(galleryTable).where(eq(galleryTable.id, id));
  res.status(204).send();
});

export default router;
