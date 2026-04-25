import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, ne, or, sql } from "drizzle-orm";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { CreateProductBody, UpdateProductBody } from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";
import { toIsoString } from "../lib/dates";
import { withDbRetry } from "../lib/dbRetry";

const router: IRouter = Router();

type ProductRow = typeof productsTable.$inferSelect;

function serialize(p: ProductRow, categoryName: string | null) {
  return {
    id: p.id,
    name: p.name,
    nameEn: p.nameEn,
    slug: p.slug,
    description: p.description,
    specs: p.specs,
    price: p.price !== null ? Number(p.price) : null,
    priceText: p.priceText,
    categoryId: p.categoryId,
    categoryName,
    images: p.images,
    isFeatured: p.isFeatured,
    isAvailable: p.isAvailable,
    createdAt: toIsoString(p.createdAt),
  };
}

router.get("/products", async (req, res): Promise<void> => {
  const categoryId = req.query["categoryId"]
    ? Number(req.query["categoryId"])
    : undefined;
  const search = req.query["search"] ? String(req.query["search"]).trim() : "";
  const featuredQ = req.query["featured"];
  const featured =
    featuredQ === "true" || featuredQ === "1"
      ? true
      : featuredQ === "false" || featuredQ === "0"
        ? false
        : undefined;
  const page = Math.max(1, Number(req.query["page"] ?? 1) || 1);
  const limit = Math.min(60, Math.max(1, Number(req.query["limit"] ?? 12) || 12));
  const offset = (page - 1) * limit;

  const filters: any[] = [];
  if (categoryId && Number.isFinite(categoryId)) {
    filters.push(eq(productsTable.categoryId, categoryId));
  }
  if (search.length > 0) {
    const pattern = `%${search}%`;
    filters.push(
      or(
        ilike(productsTable.name, pattern),
        ilike(productsTable.nameEn, pattern),
        ilike(productsTable.description, pattern),
      )!,
    );
  }
  if (featured !== undefined) {
    filters.push(eq(productsTable.isFeatured, featured));
  }
  const where = filters.length > 0 ? and(...filters) : undefined;

  const { rows, count } = await withDbRetry(
    async () => {
      const rows = await db
        .select({
          product: productsTable,
          categoryName: categoriesTable.name,
        })
        .from(productsTable)
        .leftJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
        .where(where)
        .orderBy(desc(productsTable.isFeatured), desc(productsTable.createdAt))
        .limit(limit)
        .offset(offset);

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(productsTable)
        .where(where);

      return { rows, count };
    },
    {
      onRetry: (err) =>
        req.log.warn({ err }, "Transient database error; retrying GET /products"),
    },
  );

  res.json({
    items: rows.map((r) => serialize(r.product, r.categoryName)),
    total: Number(count),
    page,
    limit,
  });
});

router.get("/products/by-slug/:slug", async (req, res): Promise<void> => {
  const slug = String(req.params["slug"]);
  const [row] = await withDbRetry(
    () =>
      db
        .select({ product: productsTable, categoryName: categoriesTable.name })
        .from(productsTable)
        .leftJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
        .where(eq(productsTable.slug, slug)),
    {
      onRetry: (err) =>
        req.log.warn(
          { err, slug },
          "Transient database error; retrying GET /products/by-slug/:slug",
        ),
    },
  );
  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(serialize(row.product, row.categoryName));
});

router.get("/products/:id/related", async (req, res): Promise<void> => {
  const id = Number(req.params["id"]);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [target] = await withDbRetry(
    () =>
      db
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, id)),
    {
      onRetry: (err) =>
        req.log.warn(
          { err, id },
          "Transient database error; retrying GET /products/:id/related (target)",
        ),
    },
  );
  if (!target) {
    res.json([]);
    return;
  }
  const where = target.categoryId
    ? and(
        eq(productsTable.categoryId, target.categoryId),
        ne(productsTable.id, id),
      )
    : ne(productsTable.id, id);
  const rows = await withDbRetry(
    () =>
      db
        .select({ product: productsTable, categoryName: categoriesTable.name })
        .from(productsTable)
        .leftJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
        .where(where)
        .orderBy(desc(productsTable.createdAt))
        .limit(6),
    {
      onRetry: (err) =>
        req.log.warn(
          { err, id },
          "Transient database error; retrying GET /products/:id/related (list)",
        ),
    },
  );
  res.json(rows.map((r) => serialize(r.product, r.categoryName)));
});

function inputToValues(data: unknown) {
  const d = data as Record<string, unknown>;
  return {
    name: String(d["name"]),
    nameEn: (d["nameEn"] as string | null | undefined) ?? null,
    slug: String(d["slug"]),
    description: (d["description"] as string | null | undefined) ?? null,
    specs: (d["specs"] as string | null | undefined) ?? null,
    price:
      d["price"] === null || d["price"] === undefined
        ? null
        : String(d["price"] as number),
    priceText: (d["priceText"] as string | null | undefined) ?? null,
    categoryId: (d["categoryId"] as number | null | undefined) ?? null,
    images: Array.isArray(d["images"]) ? (d["images"] as string[]) : [],
    isFeatured: Boolean(d["isFeatured"]),
    isAvailable: d["isAvailable"] === undefined ? true : Boolean(d["isAvailable"]),
  };
}

router.post("/products", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(productsTable)
    .values(inputToValues(parsed.data))
    .returning();
  let categoryName: string | null = null;
  if (row.categoryId) {
    const [cat] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, row.categoryId));
    categoryName = cat?.name ?? null;
  }
  res.status(201).json(serialize(row, categoryName));
});

router.patch("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params["id"]);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(productsTable)
    .set(inputToValues(parsed.data))
    .where(eq(productsTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  let categoryName: string | null = null;
  if (row.categoryId) {
    const [cat] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, row.categoryId));
    categoryName = cat?.name ?? null;
  }
  res.json(serialize(row, categoryName));
});

router.delete("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params["id"]);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.status(204).send();
});

export default router;
