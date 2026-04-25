import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, categoriesTable } from "@workspace/db";
import { CreateCategoryBody, UpdateCategoryBody } from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";
import { toIsoString } from "../lib/dates";
import { withDbRetry } from "../lib/dbRetry";

const router: IRouter = Router();

function serialize(c: typeof categoriesTable.$inferSelect) {
  return {
    id: c.id,
    name: c.name,
    nameEn: c.nameEn,
    slug: c.slug,
    description: c.description,
    imageUrl: c.imageUrl,
    sortOrder: c.sortOrder,
    createdAt: toIsoString(c.createdAt),
  };
}

router.get("/categories", async (req, res): Promise<void> => {
  const rows = await withDbRetry(
    () =>
      db
        .select()
        .from(categoriesTable)
        .orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.id)),
    {
      onRetry: (err) =>
        req.log.warn({ err }, "Transient database error; retrying GET /categories"),
    },
  );
  res.json(rows.map(serialize));
});

router.get("/categories/by-slug/:slug", async (req, res): Promise<void> => {
  const slug = String(req.params["slug"]);
  const [row] = await withDbRetry(
    () =>
      db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.slug, slug)),
    {
      onRetry: (err) =>
        req.log.warn(
          { err, slug },
          "Transient database error; retrying GET /categories/by-slug/:slug",
        ),
    },
  );
  if (!row) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  res.json(serialize(row));
});

router.post("/categories", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(categoriesTable)
    .values({
      name: parsed.data.name,
      nameEn: parsed.data.nameEn ?? null,
      slug: parsed.data.slug,
      description: parsed.data.description ?? null,
      imageUrl: parsed.data.imageUrl ?? null,
      sortOrder: parsed.data.sortOrder ?? 0,
    })
    .returning();
  res.status(201).json(serialize(row));
});

router.patch("/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params["id"]);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(categoriesTable)
    .set({
      name: parsed.data.name,
      nameEn: parsed.data.nameEn ?? null,
      slug: parsed.data.slug,
      description: parsed.data.description ?? null,
      imageUrl: parsed.data.imageUrl ?? null,
      sortOrder: parsed.data.sortOrder ?? 0,
    })
    .where(eq(categoriesTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  res.json(serialize(row));
});

router.delete("/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params["id"]);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  res.status(204).send();
});

export default router;
