import { BRAND_NAME, DEFAULT_OG_IMAGE_PATH, safeText, type PageSeo } from "./content";

export function getClientSiteUrl(): string {
  const fromEnv = String(import.meta.env.VITE_SITE_URL ?? "").replace(/\/$/, "").trim();
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return "";
}

export function toAbsoluteUrl(siteUrl: string, pathOrUrl: string | null | undefined): string {
  const fallback = `${siteUrl}${DEFAULT_OG_IMAGE_PATH}`;
  const raw = safeText(pathOrUrl, "");
  if (!raw) return fallback;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${siteUrl}${path}`;
}

function upsertMeta(attrs: { name?: string; property?: string }, content: string): void {
  const selector = attrs.property
    ? `meta[property="${attrs.property}"]`
    : `meta[name="${attrs.name}"]`;
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    if (attrs.property) el.setAttribute("property", attrs.property);
    if (attrs.name) el.setAttribute("name", attrs.name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string): void {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertJsonLd(data: PageSeo["jsonLd"]): void {
  const existing = document.getElementById("seo-jsonld");
  if (!data) {
    existing?.remove();
    return;
  }
  const payload = Array.isArray(data) ? data : [data];
  const script =
    existing instanceof HTMLScriptElement
      ? existing
      : document.createElement("script");
  script.id = "seo-jsonld";
  script.type = "application/ld+json";
  script.text = JSON.stringify(payload).replace(/</g, "\\u003c");
  if (!existing) document.head.appendChild(script);
}

export function applyPageSeo(seo: PageSeo, siteUrl = getClientSiteUrl()): void {
  const origin = siteUrl.replace(/\/$/, "");
  const path = seo.path.startsWith("/") || seo.path === "" ? seo.path : `/${seo.path}`;
  const canonical = origin ? `${origin}${path || "/"}` : path || "/";
  const description = safeText(seo.description, `${BRAND_NAME} — ستائر عصرية بتصاميم فاخرة وتفصيل حسب الطلب.`);
  const title = safeText(seo.title, `${BRAND_NAME} | ستائر عصرية بتصاميم فاخرة وتفصيل حسب الطلب`);
  const image = toAbsoluteUrl(origin, seo.ogImagePath || DEFAULT_OG_IMAGE_PATH);
  const robots = seo.robots || "index, follow";

  document.title = title;
  document.documentElement.lang = "ar";
  document.documentElement.dir = "rtl";

  upsertMeta({ name: "description" }, description);
  upsertMeta({ name: "robots" }, robots);
  upsertMeta({ property: "og:title" }, title);
  upsertMeta({ property: "og:description" }, description);
  upsertMeta({ property: "og:url" }, canonical);
  upsertMeta({ property: "og:image" }, image);
  upsertMeta({ property: "og:type" }, seo.ogType);
  upsertMeta({ property: "og:locale" }, "ar_SA");
  upsertMeta({ property: "og:site_name" }, BRAND_NAME);
  upsertMeta({ name: "twitter:card" }, "summary_large_image");
  upsertMeta({ name: "twitter:title" }, title);
  upsertMeta({ name: "twitter:description" }, description);
  upsertMeta({ name: "twitter:image" }, image);
  upsertLink("canonical", canonical);
  upsertJsonLd(seo.jsonLd);
}
