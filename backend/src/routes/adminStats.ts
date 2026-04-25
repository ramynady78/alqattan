import { Router, type IRouter } from "express";
import { desc, eq, sql } from "drizzle-orm";
import {
  db,
  productsTable,
  categoriesTable,
  galleryTable,
  inquiriesTable,
} from "@workspace/db";
import { requireAdmin } from "../lib/auth";
import { toIsoString } from "../lib/dates";

const router: IRouter = Router();

router.get("/admin/stats", requireAdmin, async (_req, res): Promise<void> => {
  const [pCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(productsTable);
  const [cCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(categoriesTable);
  const [gCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(galleryTable);
  const [iCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(inquiriesTable);
  const [iNew] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(inquiriesTable)
    .where(eq(inquiriesTable.status, "new"));
  const [fCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(productsTable)
    .where(eq(productsTable.isFeatured, true));

  const recent = await db
    .select()
    .from(inquiriesTable)
    .orderBy(desc(inquiriesTable.createdAt))
    .limit(5);

  const byCategory = await db
    .select({
      categoryId: categoriesTable.id,
      categoryName: categoriesTable.name,
      count: sql<number>`count(${productsTable.id})::int`,
    })
    .from(categoriesTable)
    .leftJoin(productsTable, eq(productsTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id, categoriesTable.name)
    .orderBy(categoriesTable.id);

  res.json({
    productsCount: Number(pCount.c),
    categoriesCount: Number(cCount.c),
    galleryCount: Number(gCount.c),
    inquiriesCount: Number(iCount.c),
    newInquiriesCount: Number(iNew.c),
    featuredCount: Number(fCount.c),
    recentInquiries: recent.map((i) => ({
      id: i.id,
      name: i.name,
      phone: i.phone,
      email: i.email,
      message: i.message,
      items: i.items ?? [],
      status: i.status,
      createdAt: toIsoString(i.createdAt),
    })),
    productsByCategory: byCategory.map((b) => ({
      categoryId: b.categoryId,
      categoryName: b.categoryName,
      count: Number(b.count),
    })),
  });
});

export default router;
