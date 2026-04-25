import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, inquiriesTable, type InquiryItemJson } from "@workspace/db";
import { CreateInquiryBody, UpdateInquiryBody } from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";
import { rateLimit } from "../lib/rateLimit";
import { toIsoString } from "../lib/dates";

const router: IRouter = Router();

function serialize(i: typeof inquiriesTable.$inferSelect) {
  return {
    id: i.id,
    name: i.name,
    phone: i.phone,
    email: i.email,
    message: i.message,
    items: i.items ?? [],
    status: i.status,
    createdAt: toIsoString(i.createdAt),
  };
}

const submitLimiter = rateLimit({ windowMs: 60_000, max: 5 });

router.post("/inquiries", submitLimiter, async (req, res): Promise<void> => {
  const parsed = CreateInquiryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const items: InquiryItemJson[] = (parsed.data.items ?? []).map((it) => ({
    productId: Number(it.productId),
    productName: String(it.productName),
    quantity: Number(it.quantity ?? 1),
  }));
  const [row] = await db
    .insert(inquiriesTable)
    .values({
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email ?? null,
      message: parsed.data.message ?? null,
      items,
      status: "new",
    })
    .returning();
  res.status(201).json(serialize(row));
});

router.get("/inquiries", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(inquiriesTable)
    .orderBy(desc(inquiriesTable.createdAt));
  res.json(rows.map(serialize));
});

router.patch("/inquiries/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params["id"]);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateInquiryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const update: Partial<typeof inquiriesTable.$inferInsert> = {};
  if (parsed.data.status) update.status = parsed.data.status;
  const [row] = await db
    .update(inquiriesTable)
    .set(update)
    .where(eq(inquiriesTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Inquiry not found" });
    return;
  }
  res.json(serialize(row));
});

router.delete("/inquiries/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params["id"]);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(inquiriesTable).where(eq(inquiriesTable.id, id));
  res.status(204).send();
});

export default router;
