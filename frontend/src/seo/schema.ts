import { BRAND_NAME, DEFAULT_OG_IMAGE_PATH, safeText } from "./content";

export type BreadcrumbEntry = {
  name: string;
  path: string;
};

export function buildBreadcrumbJsonLd(siteUrl: string, items: BreadcrumbEntry[]) {
  const origin = siteUrl.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: safeText(item.name, BRAND_NAME),
      item: `${origin}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
    })),
  };
}

export function buildOrganizationJsonLd(
  siteUrl: string,
  extras?: {
    phone?: string | null;
    email?: string | null;
    sameAs?: Array<string | null | undefined>;
  },
) {
  const origin = siteUrl.replace(/\/$/, "");
  const sameAs = (extras?.sameAs ?? []).map((item) => safeText(item, "")).filter((item) => {
    if (!item) return false;
    if (item === "https://instagram.com/" || item === "https://facebook.com/") return false;
    if (item.includes("snapchat.com/add/") && item.endsWith("add/")) return false;
    if (item.includes("example.com")) return false;
    return true;
  });

  const org: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    url: origin || undefined,
    logo: origin ? `${origin}${DEFAULT_OG_IMAGE_PATH}` : DEFAULT_OG_IMAGE_PATH,
    description: "ستائر عصرية بتصاميم فاخرة وتفصيل حسب الطلب.",
  };

  const phone = safeText(extras?.phone, "");
  const email = safeText(extras?.email, "");
  const looksFakePhone = !phone || /000000/.test(phone) || phone === "+966500000000";
  const looksFakeEmail = !email || email.includes("example.com");

  if (!looksFakePhone || !looksFakeEmail) {
    org.contactPoint = {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["Arabic"],
      ...(looksFakePhone ? {} : { telephone: phone }),
      ...(looksFakeEmail ? {} : { email }),
    };
  }
  if (sameAs.length > 0) org.sameAs = sameAs;
  return org;
}

export function buildWebSiteJsonLd(siteUrl: string) {
  const origin = siteUrl.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND_NAME,
    url: origin || undefined,
    inLanguage: "ar-SA",
    potentialAction: {
      "@type": "SearchAction",
      target: `${origin}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildProductJsonLd(input: {
  siteUrl: string;
  name: string;
  description: string;
  path: string;
  images: string[];
  categoryName?: string | null;
  price?: number | null;
  isAvailable?: boolean | null;
}) {
  const origin = input.siteUrl.replace(/\/$/, "");
  const images = input.images.filter(Boolean);
  const product: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: safeText(input.name, BRAND_NAME),
    description: safeText(input.description, `اكتشفوا ${safeText(input.name, "هذا المنتج")} من ${BRAND_NAME}.`),
    brand: { "@type": "Brand", name: BRAND_NAME },
    url: `${origin}${input.path}`,
  };
  if (images.length > 0) product.image = images;
  const categoryName = safeText(input.categoryName, "");
  if (categoryName) product.category = categoryName;
  if (typeof input.price === "number" && Number.isFinite(input.price) && input.price > 0) {
    product.offers = {
      "@type": "Offer",
      url: `${origin}${input.path}`,
      priceCurrency: "SAR",
      price: String(input.price),
      availability:
        input.isAvailable === false
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
    };
  }
  return product;
}

export function buildCollectionPageJsonLd(input: {
  siteUrl: string;
  name: string;
  description: string;
  path: string;
}) {
  const origin = input.siteUrl.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: safeText(input.name, BRAND_NAME),
    description: safeText(input.description, BRAND_NAME),
    url: `${origin}${input.path.startsWith("/") ? input.path : `/${input.path}`}`,
    inLanguage: "ar-SA",
    isPartOf: {
      "@type": "WebSite",
      name: BRAND_NAME,
      url: origin || undefined,
    },
  };
}

export function buildAboutPageJsonLd(input: { siteUrl: string; name: string; description: string; path: string }) {
  const origin = input.siteUrl.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: safeText(input.name, BRAND_NAME),
    description: safeText(input.description, BRAND_NAME),
    url: `${origin}${input.path}`,
    inLanguage: "ar-SA",
    about: {
      "@type": "Organization",
      name: BRAND_NAME,
      url: origin || undefined,
    },
  };
}

export function buildContactPageJsonLd(input: { siteUrl: string; name: string; description: string; path: string }) {
  const origin = input.siteUrl.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: safeText(input.name, BRAND_NAME),
    description: safeText(input.description, BRAND_NAME),
    url: `${origin}${input.path}`,
    inLanguage: "ar-SA",
  };
}
