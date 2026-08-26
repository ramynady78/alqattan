/** Keep in sync with frontend/src/seo/content.ts */
export const BRAND_NAME = "الستائر العصرية";
export const DEFAULT_OG_IMAGE_PATH = "/logo-curtain.png";

export const TITLE_MIN = 65;
export const TITLE_MAX_PREFERRED = 90;
export const DESCRIPTION_MIN = 200;
export const DESCRIPTION_MAX_PREFERRED = 300;

export type SeoRobots = "index, follow" | "noindex, nofollow";

export type PageSeo = {
  title: string;
  description: string;
  path: string;
  h1: string;
  keywords: string[];
  ogType: "website" | "product";
  ogImagePath?: string | null;
  robots?: SeoRobots;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
};

export function seoLen(value: string): number {
  return [...value].length;
}

export function safeText(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const text = value.replace(/\s+/g, " ").trim();
  if (!text || text === "undefined" || text === "null" || text === "[object Object]") {
    return fallback;
  }
  return text;
}

function unique(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const text = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
    if (!text || seen.has(text)) continue;
    seen.add(text);
    result.push(text);
  }
  return result;
}

function withBrand(lead: string): string {
  const cleaned = lead.replace(/\s*\|\s*الستائر العصرية\s*$/u, "").trim();
  return `${cleaned} | ${BRAND_NAME}`;
}

/** Pads a dynamic title until it meets the 65-character minimum without stuffing. */
export function ensureTitle(lead: string): string {
  const cleaned = lead.replace(/\s*\|\s*الستائر العصرية\s*$/u, "").trim();
  const pads = ["", " يناسب مساحتكم", " بلمسة أنيقة تناسب مساحتكم"];
  const candidates = pads.map((pad) => withBrand(`${cleaned}${pad}`));
  const longEnough = candidates.filter((title) => seoLen(title) >= TITLE_MIN);
  if (longEnough.length > 0) {
    return longEnough.find((title) => seoLen(title) <= TITLE_MAX_PREFERRED) ?? longEnough[0];
  }
  return withBrand(`${cleaned} بتصميم راق وتفصيل حسب الطلب يناسب مساحتكم`);
}

export function ensureDescription(text: string): string {
  let description = text.replace(/\s+/g, " ").trim();
  if (seoLen(description) >= DESCRIPTION_MIN) return description;
  if (!description.includes("تواصلوا معنا")) {
    description = `${description} تواصلوا معنا لمعرفة الخيارات المتاحة.`.trim();
  }
  if (seoLen(description) < DESCRIPTION_MIN) {
    description = `${description} نساعدكم تختارون التصميم اللي يناسب مساحتكم وذوقكم.`.trim();
  }
  return description;
}

export const HOME_H1 = "ستائر عصرية بتصاميم فاخرة وتفصيل حسب الطلب";

export const PAGE_CRUMB = {
  home: "الرئيسية",
  categories: "التصنيفات",
  products: "المنتجات",
  gallery: "أعمالنا",
  about: "من نحن",
  contact: "تواصلوا معنا",
} as const;

export const STATIC_SEO = {
  home: {
    title: "ستائر عصرية بتصاميم فاخرة وتفصيل حسب الطلب لكل مساحة | الستائر العصرية",
    description:
      "اكتشفوا الستائر العصرية بتصاميم فاخرة تناسب مختلف المساحات والأذواق، مع جودة عالية واهتمام بالتفاصيل وتنفيذ راق يبرز جمال المكان. اختاروا من خياراتنا التصميم اللي يناسب ذوقكم ومساحتكم، وتواصلوا معنا اليوم عشان نساعدكم في تصميم وطلب ستائركم.",
    path: "/",
    h1: HOME_H1,
    keywords: [
      "ستائر عصرية",
      "ستائر مودرن",
      "تفصيل ستائر",
      "تصميم ستائر",
      "ستائر حسب الطلب",
      "ستائر فاخرة",
      "ستائر منزلية",
      "تركيب ستائر",
      "تنفيذ ستائر",
      "ديكورات ستائر",
      "ستائر السعودية",
      "اسعار الستائر",
      "ستائر للمنازل",
      "تصميم ستائر عصرية",
      "تفصيل ستائر حسب الطلب",
    ],
    ogType: "website" as const,
    robots: "index, follow" as const,
  },
  about: {
    title: "تعرفوا على الستائر العصرية ورؤيتنا في تصميم ستائر تليق بكل مساحة وذوق | الستائر العصرية",
    description:
      "تعرفوا على الستائر العصرية ورؤيتنا في تقديم تصاميم تجمع بين الأناقة والجودة والاهتمام بالتفاصيل. نحرص أن يكون لكل مساحة طابعها الخاص، ونساعدكم في اختيار الستائر اللي تكمل جمال المكان وتناسب ذوقكم، من الفكرة وحتى التنفيذ النهائي بلمسة عصرية ونتيجة تليق بمساحتكم.",
    path: "/about",
    h1: "عن الستائر العصرية",
    keywords: [
      "الستائر العصرية",
      "عن الستائر العصرية",
      "تصميم الستائر",
      "تفصيل الستائر",
      "تنفيذ الستائر",
      "ستائر عصرية",
      "ستائر فاخرة",
      "ستائر حسب الطلب",
      "تصاميم ستائر",
      "جودة الستائر",
      "حلول الستائر",
      "ستائر السعودية",
      "تصميم ستائر عصرية",
      "خدمات الستائر",
      "تفصيل وتصميم الستائر",
    ],
    ogType: "website" as const,
    robots: "index, follow" as const,
  },
  contact: {
    title: "تواصلوا معنا لتصميم وطلب ستائر عصرية تناسب مساحتكم وذوقكم | الستائر العصرية",
    description:
      "تواصلوا معنا في الستائر العصرية وشاركونا احتياجكم والمساحة اللي تبغون تكملونها بلمسة أنيقة. نساعدكم في اختيار التصميم والتفاصيل المناسبة لذوقكم، ونرتب معكم خطوات الطلب والتنفيذ بكل وضوح واهتمام. ابدؤوا معنا من الفكرة، وتواصلوا اليوم لتصميم ستائر تناسب مساحتكم وتكمل جمال المكان.",
    path: "/contact",
    h1: "تواصلوا معنا",
    keywords: [
      "تواصل الستائر العصرية",
      "طلب ستائر",
      "طلب تفصيل ستائر",
      "تصميم ستائر حسب الطلب",
      "طلب تصميم ستائر",
      "استفسار عن الستائر",
      "تواصل لطلب ستائر",
      "تفصيل ستائر",
      "تصميم ستائر",
      "ستائر عصرية",
      "ستائر السعودية",
      "اسعار الستائر",
      "طلب تركيب ستائر",
      "طلب ستائر عصرية",
      "التواصل لتفصيل الستائر",
    ],
    ogType: "website" as const,
    robots: "index, follow" as const,
  },
  categories: {
    title: "تصنيفات الستائر العصرية بتصاميم متنوعة تناسب كل مساحة وذوق | الستائر العصرية",
    description:
      "اكتشفوا تصنيفات الستائر العصرية واختاروا من بين تصاميم وخيارات متنوعة تناسب مختلف المساحات والأذواق. نساعدكم في الوصول للتصميم الأنسب لكم بجودة عالية وتفاصيل أنيقة وتنفيذ راق، لتكون كل ستارة جزءا متكاملا من جمال المكان. تصفحوا التصنيفات وابدؤوا اختيار ستائركم اليوم.",
    path: "/categories",
    h1: "اكتشفوا تصنيفات الستائر العصرية",
    keywords: [
      "تصنيفات الستائر",
      "انواع الستائر",
      "انواع ستائر المنزل",
      "ستائر عصرية",
      "ستائر مودرن",
      "تصاميم ستائر",
      "ستائر حسب الطلب",
      "ستائر فاخرة",
      "خيارات الستائر",
      "ستائر منزلية",
      "ديكورات ستائر",
      "تفصيل ستائر",
      "ستائر السعودية",
      "اشكال ستائر",
      "تصاميم ستائر عصرية",
    ],
    ogType: "website" as const,
    robots: "index, follow" as const,
  },
  products: {
    title: "تشكيلة ستائر عصرية بتصاميم فاخرة وجودة عالية لكل المساحات | الستائر العصرية",
    description:
      "تصفحوا تشكيلتنا من الستائر العصرية المصممة لتناسب مختلف المساحات والأذواق، مع خيارات تجمع بين الأناقة والجودة والاهتمام بالتفاصيل. اختاروا التصميم اللي يكمل ديكور مساحتكم ويعكس ذوقكم، واستفيدوا من تنفيذ راق وأسعار مناسبة. اكتشفوا المنتجات واطلبوا ستائركم اليوم.",
    path: "/products",
    h1: "تشكيلة الستائر العصرية",
    keywords: [
      "منتجات ستائر",
      "ستائر عصرية",
      "شراء ستائر",
      "ستائر مودرن",
      "ستائر فاخرة",
      "ستائر حسب الطلب",
      "تفصيل ستائر",
      "تصميم ستائر",
      "ستائر منزلية",
      "اسعار الستائر",
      "ستائر السعودية",
      "تنفيذ ستائر",
      "ستائر بتصاميم عصرية",
      "ستائر للمنازل",
      "طلب ستائر",
    ],
    ogType: "website" as const,
    robots: "index, follow" as const,
  },
  gallery: {
    title: "معرض أعمالنا في تصميم وتنفيذ الستائر بلمسات خاصة لكل مساحة | الستائر العصرية",
    description:
      "كل مشروع ننفذه له حكاية ولمسة خاصة تصنع الفرق في المكان. في معرض أعمالنا تشوفون تصاميم ستائر نفذت بعناية لتكمل تفاصيل كل مساحة وتنسجم مع ذوق أصحابها، من الفكرة واختيار التفاصيل إلى النتيجة النهائية. تصفحوا مشاريعنا واستلهموا منها أفكار تناسب مساحتكم، وتواصلوا معنا لتصميم ستائركم.",
    path: "/gallery",
    h1: "أعمالنا في تصميم وتنفيذ الستائر",
    keywords: [
      "اعمال ستائر",
      "معرض ستائر",
      "مشاريع ستائر",
      "تصاميم ستائر",
      "تنفيذ ستائر",
      "تركيب ستائر",
      "ستائر عصرية",
      "ستائر فاخرة",
      "افكار ستائر",
      "ديكورات ستائر",
      "ستائر مودرن",
      "ستائر حسب الطلب",
      "صور ستائر",
      "مشاريع تصميم ستائر",
      "افكار تصميم ستائر",
    ],
    ogType: "website" as const,
    robots: "index, follow" as const,
  },
  inquiry: {
    title: ensureTitle("أرسلوا استفساركم لطلب ستائر عصرية تناسب مساحتكم وذوقكم"),
    description: ensureDescription(
      "أرسلوا استفساركم إلى الستائر العصرية بعد اختيار المنتجات، ووضحوا مساحتكم وذوقكم لنساعدكم تصلون للتصميم المناسب. اطلبوا عبر النموذج أو واتساب، مع اهتمام بالتفاصيل والتنفيذ حسب الطلب.",
    ),
    path: "/inquiry",
    h1: "سلة الاستفسارات",
    keywords: [
      "استفسار ستائر",
      "طلب ستائر",
      "سلة طلبات الستائر",
      "واتساب ستائر",
      "ارسال طلب ستائر",
      "استشارة تفصيل ستائر",
      "طلب قياس ستائر",
      "تواصل لطلب الستائر",
      "متابعة طلب ستائر",
      "الستائر العصرية استفسار",
    ],
    ogType: "website" as const,
    robots: "noindex, nofollow" as const,
  },
  notFound: {
    title: "الصفحة غير موجودة عودوا لتصفح تصاميم الستائر العصرية | الستائر العصرية",
    description:
      "الصفحة المطلوبة غير متاحة حاليا في الستائر العصرية. عودوا للرئيسية أو تصفحوا التصنيفات والمنتجات لاختيار ستائر عصرية تناسب مساحتكم، ثم تواصلوا معنا لنساعدكم تختارون التصميم اللي يناسب ذوقكم ومساحتكم بسهولة.",
    path: "",
    h1: "الصفحة غير موجودة",
    keywords: [
      "صفحة غير موجودة",
      "ستائر عصرية",
      "تصفح المنتجات",
      "تصنيفات الستائر",
      "الستائر العصرية",
      "طلب ستائر",
      "معرض الأعمال",
      "تواصل معنا",
      "ستائر حسب الطلب",
      "العودة للرئيسية",
    ],
    ogType: "website" as const,
    robots: "noindex, nofollow" as const,
  },
} satisfies Record<string, Omit<PageSeo, "jsonLd" | "ogImagePath">>;

export function buildProductTitle(productName: string): string {
  const name = safeText(productName, "ستائر عصرية");
  return ensureTitle(`${name} بتصميم راق وجودة عالية وتفصيل حسب الطلب`);
}

export function buildProductDescription(productName: string): string {
  const name = safeText(productName, "هذا المنتج");
  return ensureDescription(
    `اكتشفوا ${name} من الستائر العصرية، بتصميم يناسب مختلف المساحات واهتمام بالتفاصيل وجودة عالية وتنفيذ راق. اختاروا التصميم اللي يناسب ذوقكم ومساحتكم، وتواصلوا معنا لمعرفة الخيارات المتاحة وطلب ستائركم بكل سهولة.`,
  );
}

export function buildProductKeywords(input: {
  name?: string | null;
  categoryName?: string | null;
  nameEn?: string | null;
  description?: string | null;
  specs?: string | null;
}): string[] {
  const name = safeText(input.name, BRAND_NAME);
  const categoryName = safeText(input.categoryName, "");
  const nameEn = safeText(input.nameEn, "");
  const specs = safeText(input.specs, "");
  const shortSpec = seoLen(specs) > 0 && seoLen(specs) <= 40 ? specs : "";
  return unique([
    name,
    `شراء ${name}`,
    `طلب ${name}`,
    `${name} السعودية`,
    `سعر ${name}`,
    `تصميم ${name}`,
    `${name} حسب الطلب`,
    `تفصيل ${name}`,
    `${name} للمنازل`,
    `اسعار ${name}`,
    nameEn,
    shortSpec,
    categoryName,
    categoryName ? `تصاميم ${categoryName}` : "",
    categoryName ? `تفصيل ${categoryName}` : "",
    categoryName ? `${categoryName} حسب الطلب` : "",
    categoryName ? `طلب ${categoryName}` : "",
  ]);
}

export function buildCategoryTitle(categoryName: string): string {
  const name = safeText(categoryName, "تصنيف ستائر عصرية");
  return ensureTitle(`${name} بتصاميم فاخرة وتفصيل حسب الطلب يناسب مساحتكم`);
}

export function buildCategoryDescription(categoryName: string, extras?: { description?: string | null }): string {
  const name = safeText(categoryName, "هذا التصنيف");
  const sourceDescription = safeText(extras?.description, "");
  const snippet = sourceDescription ? ` ${sourceDescription.replace(/\s+/g, " ").slice(0, 80).trim()}` : "";
  return ensureDescription(
    `اكتشفوا ${name} من الستائر العصرية،${snippet} بتصاميم تناسب مختلف المساحات مع جودة عالية وخيارات متنوعة. اختاروا التصميم اللي يناسب ذوقكم ومساحتكم، وتواصلوا معنا لمعرفة التفاصيل المتاحة.`,
  );
}

export function buildCategoryKeywords(input: { name?: string | null; nameEn?: string | null }): string[] {
  const name = safeText(input.name, "تصنيفات الستائر");
  const nameEn = safeText(input.nameEn, "");
  return unique([
    name,
    `${name} عصرية`,
    `تصميم ${name}`,
    `تفصيل ${name}`,
    `${name} حسب الطلب`,
    `${name} للمنازل`,
    `اشكال ${name}`,
    `${name} مودرن`,
    `اسعار ${name}`,
    `طلب ${name}`,
    `تصاميم ${name}`,
    nameEn,
  ]);
}

export function mergeCategoryIndexKeywords(categoryNames: Array<string | null | undefined>): string[] {
  return unique([...STATIC_SEO.categories.keywords, ...categoryNames.map((name) => safeText(name, ""))]);
}

export function buildCategoryIntro(categoryName: string, description?: string | null): string {
  const name = safeText(categoryName, "هذا التصنيف");
  const sourceDescription = safeText(description, "");
  if (sourceDescription) {
    return `${sourceDescription} اختاروا من تصاميم ${name} اللي تناسب مساحتكم، وتواصلوا معنا إذا تبغون مساعدة في الاختيار.`;
  }
  return `اكتشفوا تشكيلات ${name} بتصاميم تناسب مختلف المساحات. اختاروا اللي يناسب ذوقكم، وتواصلوا معنا لنساعدكم تصلون للخيار الأنسب.`;
}

export function buildGalleryTitle(itemTitle: string): string {
  const title = safeText(itemTitle, "عمل من معرض الستائر");
  return ensureTitle(`${title} من أعمال الستائر العصرية بتصميم وتنفيذ حسب المساحة`);
}

export function buildGalleryDescription(itemTitle: string, extras?: { description?: string | null }): string {
  const title = safeText(itemTitle, "هذا العمل");
  const sourceDescription = safeText(extras?.description, "");
  const snippet = sourceDescription ? ` ${sourceDescription.replace(/\s+/g, " ").slice(0, 80).trim()}` : "";
  return ensureDescription(
    `شاهدوا ${title} من معرض أعمال الستائر العصرية،${snippet} بتنفيذ يهتم بالتفاصيل ويناسب طابع المساحة. استلهموا من المشروع، وتواصلوا معنا لتصميم يناسب ذوقكم.`,
  );
}

export function buildGalleryKeywords(input: { title?: string | null }): string[] {
  const title = safeText(input.title, "معرض أعمال الستائر");
  return unique([
    title,
    `${title} ستائر`,
    "معرض ستائر",
    "اعمال ستائر",
    "مشاريع ستائر",
    "تصاميم ستائر",
    "تنفيذ ستائر",
    "ستائر عصرية",
    "ستائر فاخرة",
    "ستائر حسب الطلب",
    "افكار ستائر",
    "ديكورات ستائر",
  ]);
}

export function buildProductFallbackCopy(productName: string, categoryName?: string | null): string {
  const name = safeText(productName, "هذا المنتج");
  const categoryBit = safeText(categoryName, "") ? ` ضمن ${safeText(categoryName, "")}` : "";
  return `اكتشفوا ${name}${categoryBit} من الستائر العصرية، بتصميم يناسب مختلف المساحات واهتمام بالتفاصيل. اختاروا اللي يناسب ذوقكم، وتواصلوا معنا لمعرفة الخيارات المتاحة.`;
}

export function validateSeoCopy(
  title: string,
  description: string,
): { titleLength: number; descriptionLength: number; ok: boolean } {
  const titleLength = seoLen(title);
  const descriptionLength = seoLen(description);
  return {
    titleLength,
    descriptionLength,
    ok: titleLength >= TITLE_MIN && descriptionLength >= DESCRIPTION_MIN,
  };
}
