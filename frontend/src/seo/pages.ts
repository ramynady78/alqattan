import { toImageUrl } from "@/lib/imageUrl";
import { getClientSiteUrl, toAbsoluteUrl } from "./apply";
import {
  BRAND_NAME,
  PAGE_CRUMB,
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
  mergeCategoryIndexKeywords,
  safeText,
  type PageSeo,
} from "./content";
import {
  buildAboutPageJsonLd,
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildContactPageJsonLd,
  buildProductJsonLd,
} from "./schema";

function jsonLdList(
  ...items: Array<Record<string, unknown> | undefined | null>
): Array<Record<string, unknown>> {
  return items.filter((item): item is Record<string, unknown> => Boolean(item));
}

export function staticPageSeo(
  key: keyof typeof STATIC_SEO,
  extras?: Partial<Pick<PageSeo, "jsonLd" | "ogImagePath" | "keywords">>,
): PageSeo {
  const page = STATIC_SEO[key];
  const siteUrl = getClientSiteUrl();
  const crumbName =
    key === "categories"
      ? PAGE_CRUMB.categories
      : key === "products"
        ? PAGE_CRUMB.products
        : key === "gallery"
          ? PAGE_CRUMB.gallery
          : key === "about"
            ? PAGE_CRUMB.about
            : key === "contact"
              ? PAGE_CRUMB.contact
              : page.h1;

  const breadcrumbs =
    key === "home"
      ? undefined
      : buildBreadcrumbJsonLd(siteUrl, [
          { name: PAGE_CRUMB.home, path: "/" },
          { name: crumbName, path: page.path || "/" },
        ]);

  const typedSchema =
    key === "about"
      ? buildAboutPageJsonLd({ siteUrl, name: page.h1, description: page.description, path: page.path })
      : key === "contact"
        ? buildContactPageJsonLd({ siteUrl, name: page.h1, description: page.description, path: page.path })
        : key === "categories" || key === "products" || key === "gallery"
          ? buildCollectionPageJsonLd({
              siteUrl,
              name: page.h1,
              description: page.description,
              path: page.path,
            })
          : undefined;

  return {
    ...page,
    keywords: extras?.keywords ?? page.keywords,
    ogImagePath: extras?.ogImagePath,
    jsonLd: extras?.jsonLd ?? jsonLdList(breadcrumbs, typedSchema),
  };
}

export function categoriesIndexSeo(categoryNames?: Array<string | null | undefined>): PageSeo {
  return staticPageSeo("categories", {
    keywords: mergeCategoryIndexKeywords(categoryNames ?? []),
  });
}

export function productPageSeo(product: {
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  specs?: string | null;
  categoryName?: string | null;
  nameEn?: string | null;
  images?: string[] | null;
  price?: number | null;
  isAvailable?: boolean | null;
}): PageSeo {
  const name = safeText(product.name, "ستائر عصرية");
  const slug = safeText(product.slug, "");
  const path = slug ? `/products/${slug}` : "/products";
  const description = buildProductDescription(name);
  const siteUrl = getClientSiteUrl();
  const images = (product.images ?? [])
    .map((image) => toAbsoluteUrl(siteUrl, toImageUrl(image)))
    .filter(Boolean);
  const ogImagePath = product.images?.[0] ? toImageUrl(product.images[0]) : undefined;

  return {
    title: buildProductTitle(name),
    description,
    path,
    h1: name,
    keywords: buildProductKeywords(product),
    ogType: "product",
    ogImagePath,
    robots: "index, follow",
    jsonLd: jsonLdList(
      buildBreadcrumbJsonLd(siteUrl, [
        { name: PAGE_CRUMB.home, path: "/" },
        { name: PAGE_CRUMB.products, path: "/products" },
        { name, path },
      ]),
      buildProductJsonLd({
        siteUrl,
        name,
        description: safeText(product.description, description),
        path,
        images,
        categoryName: product.categoryName,
        price: product.price,
        isAvailable: product.isAvailable,
      }),
    ),
  };
}

export function categoryPageSeo(category: {
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  nameEn?: string | null;
  imageUrl?: string | null;
}): PageSeo {
  const name = safeText(category.name, "تصنيف ستائر عصرية");
  const slug = safeText(category.slug, "");
  const path = slug ? `/categories/${slug}` : "/categories";
  const description = buildCategoryDescription(name, { description: category.description });
  const siteUrl = getClientSiteUrl();

  return {
    title: buildCategoryTitle(name),
    description,
    path,
    h1: name,
    keywords: buildCategoryKeywords(category),
    ogType: "website",
    ogImagePath: category.imageUrl ? toImageUrl(category.imageUrl) : undefined,
    robots: "index, follow",
    jsonLd: jsonLdList(
      buildBreadcrumbJsonLd(siteUrl, [
        { name: PAGE_CRUMB.home, path: "/" },
        { name: PAGE_CRUMB.categories, path: "/categories" },
        { name, path },
      ]),
      buildCollectionPageJsonLd({
        siteUrl,
        name,
        description,
        path,
      }),
    ),
  };
}

export function galleryItemPageSeo(item: {
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  images?: string[] | null;
}): PageSeo {
  const title = safeText(item.title, "عمل من معرض الستائر");
  const slug = safeText(item.slug, "");
  const path = slug ? `/gallery/${slug}` : "/gallery";
  const description = buildGalleryDescription(title, { description: item.description });
  const siteUrl = getClientSiteUrl();
  const cover = item.images?.[0] || item.imageUrl;

  return {
    title: buildGalleryTitle(title),
    description,
    path,
    h1: title,
    keywords: buildGalleryKeywords({ title }),
    ogType: "website",
    ogImagePath: cover ? toImageUrl(cover) : undefined,
    robots: "index, follow",
    jsonLd: jsonLdList(
      buildBreadcrumbJsonLd(siteUrl, [
        { name: PAGE_CRUMB.home, path: "/" },
        { name: PAGE_CRUMB.gallery, path: "/gallery" },
        { name: title, path },
      ]),
    ),
  };
}

export function productLoadingSeo(slug?: string): PageSeo {
  const path = slug ? `/products/${slug}` : "/products";
  return {
    title: buildProductTitle("ستائر عصرية"),
    description: buildProductDescription("ستائر عصرية"),
    path,
    h1: BRAND_NAME,
    keywords: buildProductKeywords({ name: "ستائر عصرية" }),
    ogType: "website",
    robots: "index, follow",
  };
}
