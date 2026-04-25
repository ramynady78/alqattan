import pg from "pg";
import { pool as targetPool } from "@workspace/db";
import { bootstrapDatabase } from "./lib/dbBootstrap";
import { logger } from "./lib/logger";

const { Pool } = pg;

function resolveSslOption(connectionString: string): pg.PoolConfig["ssl"] {
  const modeRaw =
    process.env["SOURCE_DATABASE_SSL"] ??
    process.env["PGSSLMODE"] ??
    process.env["PG_SSLMODE"];
  const mode = modeRaw?.trim().toLowerCase();
  if (mode === "disable" || mode === "off" || mode === "false" || mode === "0") {
    return undefined;
  }
  if (mode === "require" || mode === "on" || mode === "true" || mode === "1") {
    return { rejectUnauthorized: false };
  }

  return /(?:\?|&)sslmode=require(?:&|$)/i.test(connectionString)
    ? { rejectUnauthorized: false }
    : undefined;
}

function getSourceDatabaseUrl(): string {
  const url =
    process.env["SOURCE_DATABASE_URL"] ??
    process.env["LEGACY_DATABASE_URL"] ??
    process.env["OLD_DATABASE_URL"];
  if (!url) {
    throw new Error(
      "SOURCE_DATABASE_URL must be set to your old database connection string (the destination is DATABASE_URL from .env).",
    );
  }
  return url;
}

async function ensureTargetEmptyOrAllowed(tableName: string): Promise<void> {
  const allow = process.env["MIGRATE_ALLOW_NONEMPTY"] === "true";
  const { rows } = await targetPool.query<{ count: string }>(
    `select count(*)::text as count from ${tableName};`,
  );
  const count = Number(rows[0]?.count ?? "0");
  if (!Number.isFinite(count)) return;
  if (count > 0 && !allow) {
    throw new Error(
      `Target table "${tableName}" is not empty (${count} rows). Set MIGRATE_ALLOW_NONEMPTY=true if you intend to merge/overwrite.`,
    );
  }
}

async function copyRows(
  sourcePool: pg.Pool,
  tableName: string,
  columns: readonly string[],
): Promise<number> {
  const columnList = columns.map((c) => `"${c}"`).join(", ");
  const { rows } = await sourcePool.query<Record<string, unknown>>(
    `select ${columnList} from ${tableName} order by id asc;`,
  );

  if (rows.length === 0) return 0;

  const updateAssignments = columns
    .filter((c) => c !== "id")
    .map((c) => `"${c}" = excluded."${c}"`)
    .join(", ");

  const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
  const sql = `insert into ${tableName} (${columnList}) values (${placeholders})
    on conflict (id) do update set ${updateAssignments};`;

  let inserted = 0;
  for (const row of rows) {
    const values = columns.map((c) => row[c]);
    await targetPool.query(sql, values);
    inserted += 1;
  }
  return inserted;
}

async function bumpSequence(tableName: string): Promise<void> {
  // Keep ids consistent after inserting explicit id values.
  await targetPool.query(`
    select setval(
      pg_get_serial_sequence('${tableName}', 'id'),
      coalesce((select max(id) from ${tableName}), 1),
      true
    );
  `);
}

async function main(): Promise<void> {
  const sourceUrl = getSourceDatabaseUrl();
  const sourcePool = new Pool({
    connectionString: sourceUrl,
    ssl: resolveSslOption(sourceUrl),
  });

  try {
    await bootstrapDatabase();

    // Basic safety: avoid accidental duplicate merges.
    for (const t of [
      "admins",
      "categories",
      "products",
      "gallery_items",
      "inquiries",
      "site_settings",
    ]) {
      await ensureTargetEmptyOrAllowed(t);
    }

    const adminCount = await copyRows(sourcePool, "admins", [
      "id",
      "email",
      "password_hash",
      "name",
      "created_at",
    ]);
    const categoriesCount = await copyRows(sourcePool, "categories", [
      "id",
      "name",
      "name_en",
      "slug",
      "description",
      "image_url",
      "sort_order",
      "created_at",
    ]);
    const productsCount = await copyRows(sourcePool, "products", [
      "id",
      "name",
      "name_en",
      "slug",
      "description",
      "specs",
      "price",
      "price_text",
      "category_id",
      "images",
      "is_featured",
      "is_available",
      "created_at",
    ]);
    const galleryCount = await copyRows(sourcePool, "gallery_items", [
      "id",
      "title",
      "description",
      "image_url",
      "sort_order",
      "created_at",
    ]);
    const inquiriesCount = await copyRows(sourcePool, "inquiries", [
      "id",
      "name",
      "phone",
      "email",
      "message",
      "items",
      "status",
      "created_at",
    ]);
    const settingsCount = await copyRows(sourcePool, "site_settings", [
      "id",
      "phone",
      "whatsapp",
      "email",
      "address",
      "map_embed_url",
      "instagram",
      "snapchat",
      "twitter",
      "brand_tagline",
      "hero_title",
      "hero_subtitle",
      "about_text",
    ]);

    for (const t of [
      "admins",
      "categories",
      "products",
      "gallery_items",
      "inquiries",
      "site_settings",
    ]) {
      await bumpSequence(t);
    }

    logger.info(
      {
        admins: adminCount,
        categories: categoriesCount,
        products: productsCount,
        galleryItems: galleryCount,
        inquiries: inquiriesCount,
        siteSettings: settingsCount,
      },
      "Migration complete",
    );
  } finally {
    await sourcePool.end();
    // targetPool is a lazy proxy; close if it has been created.
    try {
      const real = (targetPool as unknown as { end?: () => Promise<void> }).end;
      if (typeof real === "function") await real.call(targetPool);
    } catch {
      // ignore
    }
  }
}

main().catch((err) => {
  logger.error({ err }, "Migration failed");
  process.exitCode = 1;
});
