import type { Express, Request, Response } from "express";
import { readFile } from "node:fs/promises";
import { db, productsTable, categoriesTable, galleryTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  BRAND_NAME,
  DEFAULT_OG_IMAGE_PATH,
  STATIC_SEO,
  buildCategoryDescription,
  buildCategoryKeywords,
  buildCategoryTitle,
  buildGalleryDescription,
  buildGalleryKeywords,
  buildGalleryTitle,
  buildProductDescription,
  buildProductKeywords,
  buildProductTitle,
  safeText,
  type PageSeo,
} from "./content";

function getSiteUrl(req: Request): string {
  const envUrl = (
    process.env["SITE_URL"] ||
    process.env["PUBLIC_SITE_URL"] ||
    process.env["VITE_SITE_URL"] ||
    process.env["RENDER_EXTERNAL_URL"] ||
    ""
  )
    .trim()
    .replace(/\/$/, "");
  if (envUrl) return envUrl;
  const proto = String(req.headers["x-forwarded-proto"] || req.protocol || "https").split(",")[0]?.trim();
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0]?.trim();
  if (!host) return "";
  return `${proto}://${host}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toPublicImagePath(objectPath: string | null | undefined): string {
  const raw = safeText(objectPath, "");
  if (!raw) return DEFAULT_OG_IMAGE_PATH;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/static/")) return `/api${raw}`;
  if (raw.startsWith("/")) return raw;
  return `/api/storage${raw.startsWith("/") ? raw : `/${raw}`}`;
}

function absoluteUrl(siteUrl: string, pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${siteUrl}${path}`;
}

function xmlEscape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

type MatchedRoute =
  | { kind: "static"; key: keyof typeof STATIC_SEO }
  | { kind: "product"; slug: string }
  | { kind: "category"; slug: string }
  | { kind: "gallery"; slug: string }
  | { kind: "admin" }
  | { kind: "unknown" };

function matchPublicPath(pathname: string): MatchedRoute {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path.startsWith("/admin")) return { kind: "admin" };
  if (path === "/") return { kind: "static", key: "home" };
  if (path === "/about") return { kind: "static", key: "about" };
  if (path === "/contact") return { kind: "static", key: "contact" };
  if (path === "/categories") return { kind: "static", key: "categories" };
  if (path === "/products") return { kind: "static", key: "products" };
  if (path === "/gallery") return { kind: "static", key: "gallery" };
  if (path === "/inquiry") return { kind: "static", key: "inquiry" };

  const product = path.match(/^\/products\/([^/]+)$/);
  if (product?.[1]) return { kind: "product", slug: decodeURIComponent(product[1]) };
  const category = path.match(/^\/categories\/([^/]+)$/);
  if (category?.[1]) return { kind: "category", slug: decodeURIComponent(category[1]) };
  const gallery = path.match(/^\/gallery\/([^/]+)$/);
  if (gallery?.[1]) return { kind: "gallery", slug: decodeURIComponent(gallery[1]) };
  return { kind: "unknown" };
}

async function resolveSeo(req: Request): Promise<{ seo: PageSeo; status: number }> {
  const matched = matchPublicPath(req.path);
  if (matched.kind === "admin") {
    return {
      status: 200,
      seo: {
        ...STATIC_SEO.notFound,
        title: `لوحة الإدارة | ${BRAND_NAME}`,
        description: STATIC_SEO.inquiry.description,
        path: req.path,
        robots: "noindex, nofollow",
        ogType: "website",
      },
    };
  }
  if (matched.kind === "static") {
    return { status: 200, seo: { ...STATIC_SEO[matched.key] } };
  }
  if (matched.kind === "unknown") {
    return { status: 404, seo: { ...STATIC_SEO.notFound, path: req.path } };
  }

  try {
    if (matched.kind === "product") {
      const [row] = await db
        .select({
          product: productsTable,
          categoryName: categoriesTable.name,
        })
        .from(productsTable)
        .leftJoin(categoriesTable, eq(categoriesTable.id, productsTable.categoryId))
        .where(eq(productsTable.slug, matched.slug))
        .limit(1);
      if (!row) return { status: 404, seo: { ...STATIC_SEO.notFound, path: req.path } };
      const name = safeText(row.product.name, "منتج ستائر عصرية");
      const path = `/products/${row.product.slug}`;
      const image = toPublicImagePath(row.product.images?.[0]);
      return {
        status: 200,
        seo: {
          title: buildProductTitle(name),
          description: buildProductDescription(name),
          path,
          h1: name,
          keywords: buildProductKeywords({
            name,
            categoryName: row.categoryName,
            nameEn: row.product.nameEn,
            description: row.product.description,
            specs: row.product.specs,
          }),
          ogType: "product",
          ogImagePath: image,
          robots: "index, follow",
        },
      };
    }

    if (matched.kind === "category") {
      const [row] = await db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.slug, matched.slug))
        .limit(1);
      if (!row) return { status: 404, seo: { ...STATIC_SEO.notFound, path: req.path } };
      const name = safeText(row.name, "تصنيف ستائر عصرية");
      const path = `/categories/${row.slug}`;
      return {
        status: 200,
        seo: {
          title: buildCategoryTitle(name),
          description: buildCategoryDescription(name, { description: row.description }),
          path,
          h1: name,
          keywords: buildCategoryKeywords({ name, nameEn: row.nameEn }),
          ogType: "website",
          ogImagePath: toPublicImagePath(row.imageUrl),
          robots: "index, follow",
        },
      };
    }

    const [row] = await db
      .select()
      .from(galleryTable)
      .where(eq(galleryTable.slug, matched.slug))
      .limit(1);
    if (!row) return { status: 404, seo: { ...STATIC_SEO.notFound, path: req.path } };
    const title = safeText(row.title, "عمل من معرض الستائر");
    const path = `/gallery/${row.slug}`;
    const cover = row.images?.[0] || row.imageUrl;
    return {
      status: 200,
      seo: {
        title: buildGalleryTitle(title),
        description: buildGalleryDescription(title, { description: row.description }),
        path,
        h1: title,
        keywords: buildGalleryKeywords({ title }),
        ogType: "website",
        ogImagePath: toPublicImagePath(cover),
        robots: "index, follow",
      },
    };
  } catch {
    return { status: 200, seo: { ...STATIC_SEO.home } };
  }
}

function applySeoToHtml(html: string, seo: PageSeo, siteUrl: string): string {
  const title = escapeHtml(safeText(seo.title, BRAND_NAME));
  const description = escapeHtml(safeText(seo.description, BRAND_NAME));
  const canonical = absoluteUrl(siteUrl, seo.path || "/");
  const image = absoluteUrl(siteUrl, seo.ogImagePath || DEFAULT_OG_IMAGE_PATH);
  const robots = seo.robots || "index, follow";
  const ogType = seo.ogType || "website";

  let next = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  if (/<meta[^>]*name=["']description["'][^>]*>/i.test(next)) {
    next = next.replace(
      /<meta[^>]*name=["']description["'][^>]*>/i,
      `<meta name="description" content="${description}" />`,
    );
  } else {
    next = next.replace("</head>", `    <meta name="description" content="${description}" />\n  </head>`);
  }

  const tags = [
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta name="robots" content="${escapeHtml(robots)}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta property="og:type" content="${escapeHtml(ogType)}" />`,
    `<meta property="og:locale" content="ar_SA" />`,
    `<meta property="og:site_name" content="${escapeHtml(BRAND_NAME)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
  ].join("\n    ");

  next = next
    .replace(/<link rel="canonical"[^>]*>/gi, "")
    .replace(/<meta name="robots"[^>]*>/gi, "")
    .replace(/<meta property="og:[^"]+"[^>]*>/gi, "")
    .replace(/<meta name="twitter:[^"]+"[^>]*>/gi, "");

  return next.replace("</head>", `    ${tags}\n  </head>`);
}

async function handleRobots(req: Request, res: Response): Promise<void> {
  const siteUrl = getSiteUrl(req);
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /admin/",
    "Disallow: /inquiry",
    "",
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "",
  ].join("\n");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(body);
}

async function handleSitemap(req: Request, res: Response): Promise<void> {
  const siteUrl = getSiteUrl(req);
  const urls: Array<{ loc: string; lastmod?: string }> = [
    { loc: `${siteUrl}/` },
    { loc: `${siteUrl}/about` },
    { loc: `${siteUrl}/categories` },
    { loc: `${siteUrl}/products` },
    { loc: `${siteUrl}/gallery` },
    { loc: `${siteUrl}/contact` },
  ];

  try {
    const [categories, products, gallery] = await Promise.all([
      db.select({ slug: categoriesTable.slug, createdAt: categoriesTable.createdAt }).from(categoriesTable),
      db
        .select({
          slug: productsTable.slug,
          createdAt: productsTable.createdAt,
          isAvailable: productsTable.isAvailable,
        })
        .from(productsTable)
        .where(eq(productsTable.isAvailable, true)),
      db.select({ slug: galleryTable.slug, createdAt: galleryTable.createdAt }).from(galleryTable),
    ]);

    for (const category of categories) {
      if (!category.slug) continue;
      urls.push({
        loc: `${siteUrl}/categories/${category.slug}`,
        lastmod: category.createdAt?.toISOString(),
      });
    }
    for (const product of products) {
      if (!product.slug) continue;
      urls.push({
        loc: `${siteUrl}/products/${product.slug}`,
        lastmod: product.createdAt?.toISOString(),
      });
    }
    for (const item of gallery) {
      if (!item.slug) continue;
      urls.push({
        loc: `${siteUrl}/gallery/${item.slug}`,
        lastmod: item.createdAt?.toISOString(),
      });
    }
  } catch {
    // Keep static URLs if the database is unavailable.
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((entry) => {
      const lastmod = entry.lastmod ? `<lastmod>${xmlEscape(entry.lastmod)}</lastmod>` : "";
      return `<url><loc>${xmlEscape(entry.loc)}</loc>${lastmod}</url>`;
    }),
    "</urlset>",
    "",
  ].join("");

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.send(xml);
}

export function mountSeoRoutes(app: Express): void {
  app.get("/robots.txt", (req, res) => {
    void handleRobots(req, res);
  });
  app.get("/sitemap.xml", (req, res) => {
    void handleSitemap(req, res);
  });
}

export function mountSpaSeoFallback(app: Express, indexHtmlPath: string): void {
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (req.path.includes(".")) return next();
    if (req.method === "GET") {
      const accept = req.headers.accept ?? "";
      if (!accept.includes("text/html")) return next();
    }

    void (async () => {
      try {
        const [html, resolved] = await Promise.all([readFile(indexHtmlPath, "utf8"), resolveSeo(req)]);
        const injected = applySeoToHtml(html, resolved.seo, getSiteUrl(req));
        res.status(resolved.status).setHeader("Content-Type", "text/html; charset=utf-8").send(injected);
      } catch (error) {
        next(error);
      }
    })();
  });
}
