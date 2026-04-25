import { pool } from "@workspace/db";
import { hashPassword } from "./auth";
import { logger } from "./logger";

async function ensureDevelopmentAdmin(): Promise<void> {
  const nodeEnv = process.env["NODE_ENV"] ?? "development";
  if (nodeEnv === "production") return;

  const email = (process.env["DEFAULT_ADMIN_EMAIL"] ?? "admin@alqattan.sa").toLowerCase();
  const password = process.env["DEFAULT_ADMIN_PASSWORD"] ?? "AlQattan2026!";
  const name = process.env["DEFAULT_ADMIN_NAME"] ?? "Admin";
  const force = process.env["DEFAULT_ADMIN_FORCE"] === "true";

  const { rows } = await pool.query<{ id: number }>(
    `select id from admins where email = $1 limit 1;`,
    [email],
  );

  if (rows.length === 0) {
    const passwordHash = await hashPassword(password);
    await pool.query(
      `insert into admins (email, password_hash, name) values ($1, $2, $3)`,
      [email, passwordHash, name],
    );
    logger.warn(
      { email },
      "Seeded a default admin user for development; change DEFAULT_ADMIN_PASSWORD and reseed for real deployments",
    );
    return;
  }

  if (force) {
    const passwordHash = await hashPassword(password);
    await pool.query(
      `update admins set password_hash = $2, name = $3 where email = $1;`,
      [email, passwordHash, name],
    );
    logger.warn(
      { email },
      "Updated DEFAULT_ADMIN credentials because DEFAULT_ADMIN_FORCE=true (development-only convenience)",
    );
  }
}

export async function bootstrapDatabase(): Promise<void> {
  const skipBootstrap = process.env["SKIP_DB_BOOTSTRAP"] === "true";

  if (skipBootstrap) {
    logger.warn("Skipping database bootstrap because SKIP_DB_BOOTSTRAP=true");
    return;
  }

  try {
    await pool.query(`
      create table if not exists admins (
        id serial primary key,
        email varchar(255) not null unique,
        password_hash text not null,
        name varchar(255) not null,
        created_at timestamptz not null default now()
      );

      create table if not exists categories (
        id serial primary key,
        name varchar(255) not null,
        name_en varchar(255),
        slug varchar(255) not null unique,
        description text,
        image_url text,
        sort_order integer not null default 0,
        created_at timestamptz not null default now()
      );

      create table if not exists products (
        id serial primary key,
        name varchar(255) not null,
        name_en varchar(255),
        slug varchar(255) not null unique,
        description text,
        specs text,
        price numeric(10, 2),
        price_text varchar(255),
        category_id integer references categories(id) on delete set null,
        images text[] not null default '{}'::text[],
        is_featured boolean not null default false,
        is_available boolean not null default true,
        created_at timestamptz not null default now()
      );

      create table if not exists gallery_items (
        id serial primary key,
        title varchar(255) not null,
        description text,
        image_url text not null,
        sort_order integer not null default 0,
        created_at timestamptz not null default now()
      );

      create table if not exists inquiries (
        id serial primary key,
        name varchar(255) not null,
        phone varchar(64) not null,
        email varchar(255),
        message text,
        items jsonb not null default '[]'::jsonb,
        status varchar(32) not null default 'new',
        created_at timestamptz not null default now()
      );

      create table if not exists site_settings (
        id serial primary key,
        phone text not null default '',
        whatsapp text not null default '',
        email text not null default '',
        address text not null default '',
        map_embed_url text not null default '',
        instagram text not null default '',
        snapchat text not null default '',
        twitter text not null default '',
        brand_tagline text not null default '',
        hero_title text not null default '',
        hero_subtitle text not null default '',
        about_text text not null default ''
      );
    `);

    await pool.query(`
      insert into site_settings (id)
      values (1)
      on conflict (id) do nothing;
    `);

    await ensureDevelopmentAdmin();
  } catch (err) {
    logger.error({ err }, "Database bootstrap failed");

    if (process.env["NODE_ENV"] !== "production") {
      logger.warn(
        "Continuing server startup despite database bootstrap failure in development mode",
      );
      return;
    }

    throw err;
  }
}
