import { STATIC_SEO } from "@/seo/content";

export const SITE_NAME_AR = "الستائر العصرية";
export const SITE_NAME_EN = "Modern Curtains";

export const SITE_TAGLINE = "ستائر عصرية • تفصيل • تركيب احترافي";
export const SITE_DESCRIPTION = STATIC_SEO.home.description;

/** Page title suffix: "الرئيسية | الستائر العصرية" */
export function formatPageTitle(pageTitle: string): string {
  return `${pageTitle} | ${SITE_NAME_AR}`;
}

/** Full default document title for index.html */
export function formatDefaultDocumentTitle(): string {
  return `${SITE_NAME_AR} | ${SITE_NAME_EN}`;
}
