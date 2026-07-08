import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, galleryTable } from "@workspace/db";
import { CreateGalleryItemBody, UpdateGalleryItemBody } from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";
import { toIsoString } from "../lib/dates";
import { withDbRetry } from "../lib/dbRetry";
import { assertValidImageObjectPaths } from "../lib/imageUploads";

const router: IRouter = Router();

function slugifyEnglish(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeImages(
  images: string[] | null | undefined,
  imageUrl: string | null | undefined,
) {
  const cleanImages = (Array.isArray(images) ? images : [])
    .map((item) => item.trim())
    .filter(Boolean);
  if (cleanImages.length > 0) return cleanImages;
  return imageUrl?.trim() ? [imageUrl.trim()] : [];
}

async function buildUniqueSlug(title: string, excludeId?: number) {
  const baseSlug = slugifyEnglish(title) || "gallery-item";
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const rows = await db
      .select({ id: galleryTable.id })
      .from(galleryTable)
      .where(eq(galleryTable.slug, candidate));
    const conflict = rows.find((row) => row.id !== excludeId);
    if (!conflict) return candidate;
    candidate = `${baseSlug}-${suffix++}`;
  }
}

function serialize(g: typeof galleryTable.$inferSelect) {
  const images = normalizeImages(g.images, g.imageUrl);
  return {
    id: g.id,
    title: g.title,
    slug: g.slug,
    description: g.description,
    imageUrl: g.imageUrl || images[0] || "",
    images,
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

router.get("/gallery/by-slug/:slug", async (req, res): Promise<void> => {
  const slug = String(req.params["slug"]);
  const [row] = await withDbRetry(
    () => db.select().from(galleryTable).where(eq(galleryTable.slug, slug)),
    {
      onRetry: (err) =>
        req.log.warn({ err, slug }, "Transient database error; retrying GET /gallery/by-slug/:slug"),
    },
  );

  if (!row) {
    res.status(404).json({ error: "Gallery item not found" });
    return;
  }

  res.json(serialize(row));
});

router.post("/gallery", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateGalleryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const normalizedImages = normalizeImages(parsed.data.images, parsed.data.imageUrl);
  if (normalizedImages.length === 0) {
    res.status(400).json({ message: "At least one image is required" });
    return;
  }
  try {
    await assertValidImageObjectPaths(normalizedImages);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Only image files are allowed" });
    return;
  }
  const slug = await buildUniqueSlug(parsed.data.title);
  const [row] = await db
    .insert(galleryTable)
    .values({
      title: parsed.data.title,
      slug,
      description: parsed.data.description ?? null,
      imageUrl: normalizedImages[0]!,
      images: normalizedImages,
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
  const normalizedImages = normalizeImages(parsed.data.images, parsed.data.imageUrl);
  if (normalizedImages.length === 0) {
    res.status(400).json({ message: "At least one image is required" });
    return;
  }
  try {
    await assertValidImageObjectPaths(normalizedImages);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Only image files are allowed" });
    return;
  }
  const slug = await buildUniqueSlug(parsed.data.title, id);
  const [row] = await db
    .update(galleryTable)
    .set({
      title: parsed.data.title,
      slug,
      description: parsed.data.description ?? null,
      imageUrl: normalizedImages[0]!,
      images: normalizedImages,
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
