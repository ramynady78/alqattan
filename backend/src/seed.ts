import {
  adminsTable,
  categoriesTable,
  db,
  galleryTable,
  productsTable,
  settingsTable,
} from "@workspace/db";
import { hashPassword } from "./lib/auth";
import { eq, inArray } from "drizzle-orm";
import { withDbRetry } from "./lib/dbRetry";

type SeedCategory = {
  name: string;
  nameEn?: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
};

type SeedProduct = {
  name: string;
  nameEn?: string;
  slug: string;
  description?: string;
  specs?: string;
  price?: number;
  priceText?: string;
  categoryIdx: number;
  isFeatured?: boolean;
  image: string;
};

async function seedAdmin(): Promise<void> {
  const existing = await withDbRetry(() => db.select().from(adminsTable).limit(1), {
    retries: 2,
    delayMs: 100,
    onRetry: (err, attempt) => console.warn(`[seed] transient DB error seeding admin; retry ${attempt}`, err),
  });
  if (existing.length > 0) return;

  const adminEmail = process.env["DEFAULT_ADMIN_EMAIL"] ?? "admin@alqattan.sa";
  const adminPassword = process.env["DEFAULT_ADMIN_PASSWORD"] ?? "AlQattan2026!";
  const adminName = process.env["DEFAULT_ADMIN_NAME"] ?? "Admin";

  const hash = await hashPassword(adminPassword);
  await withDbRetry(
    () =>
      db.insert(adminsTable).values({
        email: adminEmail.toLowerCase(),
        passwordHash: hash,
        name: adminName,
      }),
    {
      retries: 2,
      delayMs: 100,
      onRetry: (err, attempt) =>
        console.warn(`[seed] transient DB error inserting admin; retry ${attempt}`, err),
    },
  );
  console.log(`Created admin: ${adminEmail} / ${adminPassword}`);
}

async function seedSettings(): Promise<void> {
  const defaults = {
    phone: "+966 13 800 0000",
    whatsapp: "+966 50 000 0000",
    email: "info@alqattan.sa",
    address: "الدمام، المملكة العربية السعودية",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3580.123!2d50.103!3d26.420!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDI1JzEyLjAiTiA1MMKwMDYnMTAuOCJF!5e0!3m2!1sar!2ssa!4v1700000000000",
    instagram: "https://instagram.com/alqattan",
    snapchat: "https://snapchat.com/add/alqattan",
    twitter: "https://x.com/alqattan",
    brandTagline: "ستائر وأثاث بتفاصيل تُشبه ذوقك",
    heroTitle: "أناقة البيت تبدأ من التفاصيل",
    heroSubtitle: "ستائر تفصيل وأثاث مختار بعناية مع خدمة قياس وتركيب",
    aboutText:
      "نقدّم حلول ستائر وأثاث وديكور منزلي بتفصيل حسب المقاس وخيارات أقمشة وألوان متعددة. هذا محتوى تجريبي للاختبار ويمكن استبداله من لوحة الإدارة.",
  } as const;

  // `bootstrapDatabase()` creates a settings row with id=1 (empty defaults),
  // so seeding must be willing to UPDATE, not only INSERT.
  const [existing] = await withDbRetry(
    () =>
      db
        .select()
        .from(settingsTable)
        .where(eq(settingsTable.id, 1))
        .limit(1),
    {
      retries: 2,
      delayMs: 100,
      onRetry: (err, attempt) =>
        console.warn(`[seed] transient DB error reading settings; retry ${attempt}`, err),
    },
  );

  if (!existing) {
    await withDbRetry(() => db.insert(settingsTable).values({ id: 1, ...defaults }), {
      retries: 2,
      delayMs: 100,
      onRetry: (err, attempt) =>
        console.warn(`[seed] transient DB error inserting settings; retry ${attempt}`, err),
    });
    console.log("Created default settings.");
    return;
  }

  const looksEmpty =
    !existing.phone.trim() &&
    !existing.whatsapp.trim() &&
    !existing.email.trim() &&
    !existing.address.trim() &&
    !existing.brandTagline.trim() &&
    !existing.heroTitle.trim() &&
    !existing.heroSubtitle.trim() &&
    !existing.aboutText.trim();

  if (!looksEmpty) return;

  await withDbRetry(
    () => db.update(settingsTable).set(defaults).where(eq(settingsTable.id, 1)),
    {
      retries: 2,
      delayMs: 100,
      onRetry: (err, attempt) =>
        console.warn(`[seed] transient DB error updating settings; retry ${attempt}`, err),
    },
  );
  console.log("Updated default settings (row existed but was empty).");
}

async function seedCatalog(): Promise<void> {
  const categories: SeedCategory[] = [
    {
      name: "ستائر كلاسيكية",
      slug: "curtains-classic",
      description: "تفصيل كلاسيكي بلمسات فاخرة وخيارات أقمشة تناسب المجالس والصالات.",
      imageUrl: "/static/mock/categories/classic-curtains.svg",
      sortOrder: 1,
    },
    {
      name: "ستائر مودرن",
      slug: "curtains-modern",
      description: "ستايل عصري بخطوط نظيفة وألوان حيادية مع خيارات بطانة وتعتيم.",
      imageUrl: "/static/mock/categories/modern-curtains.svg",
      sortOrder: 2,
    },
    {
      name: "ستائر شفافة",
      slug: "curtains-sheer",
      description: "شيفون وفوال يخفّف الضوء ويمنح خصوصية ناعمة وإحساسًا بالاتساع.",
      imageUrl: "/static/mock/categories/curtains-sheer.svg",
      sortOrder: 3,
    },
    {
      name: "ستائر رول وزيبرا",
      slug: "curtains-roller-zebra",
      description: "تحكم عملي بالضوء مع خيارات بلاك آوت وزيبرا وإكسسوارات تركيب أنيقة.",
      imageUrl: "/static/mock/categories/roller-zebra.svg",
      sortOrder: 4,
    },
    {
      name: "مجالس وكنب",
      slug: "furniture-sofas-majlis",
      description: "كنب ومجالس بتنجيد مريح وأقمشة متينة تناسب الاستخدام اليومي.",
      imageUrl: "/static/mock/categories/furniture-sofas.svg",
      sortOrder: 5,
    },
    {
      name: "طاولات وكونسول",
      slug: "furniture-tables-console",
      description: "طاولات قهوة وجانبية وكونسول مدخل بتفاصيل تجمع بين الخشب والمعدن.",
      imageUrl: "/static/mock/categories/furniture-tables.svg",
      sortOrder: 6,
    },
    {
      name: "وسائد وإكسسوارات ديكور",
      slug: "home-decor-accessories",
      description: "وسائد وإكسسوارات تضيف لمسة فخامة وتكمل تنسيق الستائر والأثاث.",
      imageUrl: "/static/mock/categories/decor-accessories.svg",
      sortOrder: 7,
    },
  ];

  const categorySlugs = categories.map((c) => c.slug);

  const products: SeedProduct[] = [
    // ستائر كلاسيكية
    {
      name: "طقم ستائر جاكار فاخر",
      slug: "jacquard-classic-set",
      description: "طقم ستائر جاكار بملمس غني وثبات لون عالي، مناسب للصالات والمجالس.",
      specs: "تفصيل حسب المقاس\nخيارات بطانة: عادية / تعتيم\nيشمل السكة والإكسسوارات الأساسية",
      price: 1200,
      priceText: "ابتداءً من ١٢٠٠ ر.س",
      categoryIdx: 0,
      isFeatured: true,
      image: "/static/mock/products/curtain-classic.svg",
    },
    {
      name: "ستارة مخمل مطرّزة",
      slug: "embroidered-velvet-curtain",
      description: "مخمل ثقيل بملمس فاخر مع تطريز بسيط يبرز فخامة المكان.",
      specs: "تفصيل حسب المقاس\nمناسب للمجالس\nخيارات بطانة تعتيم",
      price: 1650,
      priceText: "ابتداءً من ١٦٥٠ ر.س",
      categoryIdx: 0,
      image: "/static/mock/products/curtain-classic.svg",
    },
    {
      name: "ستارة كتان بكسرة كلاسيكية",
      slug: "classic-pleat-linen-curtain",
      description: "كسرة كلاسيكية بخامة كتان تمنح مظهرًا مرتبًا مع سقوط جميل للقماش.",
      specs: "تفصيل حسب المقاس\nكسرة كلاسيكية\nخيارات ألوان دافئة",
      price: 1100,
      priceText: "ابتداءً من ١١٠٠ ر.س",
      categoryIdx: 0,
      image: "/static/mock/products/curtain-classic.svg",
    },
    {
      name: "ستارة قطن سميك مع بطانة",
      slug: "thick-cotton-lined-curtain",
      description: "قطن سميك يوفر خصوصية عالية مع بطانة لتحسين العزل والوقاية من الشمس.",
      specs: "تفصيل حسب المقاس\nبطانة داخلية\nخيارات ألوان دافئة",
      price: 980,
      priceText: "ابتداءً من ٩٨٠ ر.س",
      categoryIdx: 0,
      image: "/static/mock/products/curtain-classic.svg",
    },
    {
      name: "ستارة مجلس (لون سادة)",
      slug: "majlis-solid-curtain",
      description: "ستارة سادة للمجالس بتفصيل مرتب وخامة متينة تعطي خصوصية وأناقة.",
      specs: "تفصيل حسب المقاس\nخامة متينة\nخيار بطانة تعتيم",
      price: 1350,
      priceText: "ابتداءً من ١٣٥٠ ر.س",
      categoryIdx: 0,
      image: "/static/mock/products/curtain-classic.svg",
    },

    // ستائر مودرن
    {
      name: "ستارة كتان مودرن (لينن)",
      slug: "linen-modern-drapes",
      description: "ستارة كتان بخامات طبيعية ومظهر بسيط يناسب الديكور العصري والألوان الهادئة.",
      specs: "تفصيل حسب المقاس\nخيارات ألوان: بيج / رمادي / أوف وايت\nإمكانية إضافة بطانة تعتيم",
      price: 950,
      priceText: "ابتداءً من ٩٥٠ ر.س",
      categoryIdx: 1,
      isFeatured: true,
      image: "/static/mock/products/curtain-modern.svg",
    },
    {
      name: "ستارة موج (Wave) سادة",
      slug: "wave-curtain-solid",
      description: "ستارة موج عصرية بخياطة دقيقة تعطي تموّجًا متساويًا ومظهرًا راقيًا.",
      specs: "تفصيل حسب المقاس\nخيار حلقات / سكة موج\nألوان: بيج / رمادي / أبيض",
      price: 1050,
      priceText: "ابتداءً من ١٠٥٠ ر.س",
      categoryIdx: 1,
      image: "/static/mock/products/curtain-modern.svg",
    },
    {
      name: "ستارة بطبقتين (شفاف + تعتيم)",
      slug: "double-layer-sheer-blackout",
      description: "تنسيق طبقتين يمنح جمال الشفاف مع قدرة التعتيم عند الحاجة.",
      specs: "تفصيل حسب المقاس\nطبقة شيفون + طبقة بلاك آوت\nخيارات ألوان متناسقة",
      price: 1450,
      priceText: "ابتداءً من ١٤٥٠ ر.س",
      categoryIdx: 1,
      isFeatured: true,
      image: "/static/mock/products/curtain-modern.svg",
    },
    {
      name: "ستارة حلقات معدنية",
      slug: "metal-grommet-curtain",
      description: "حلقات معدنية لفتح وإغلاق سهل مع مظهر مرتب يناسب الغرف والمعيشة.",
      specs: "تفصيل حسب المقاس\nحلقات مقاومة للصدأ\nقماش سادة",
      price: 720,
      priceText: "ابتداءً من ٧٢٠ ر.س",
      categoryIdx: 1,
      image: "/static/mock/products/curtain-modern.svg",
    },
    {
      name: "ستارة سادة بلون بيج",
      slug: "solid-beige-modern-curtain",
      description: "ستارة سادة ببيج دافئ لانسجام مثالي مع الأثاث والديكور الحديث.",
      specs: "تفصيل حسب المقاس\nخامة متينة\nخيار بطانة",
      price: 840,
      priceText: "ابتداءً من ٨٤٠ ر.س",
      categoryIdx: 1,
      image: "/static/mock/products/curtain-modern.svg",
    },

    // ستائر شفافة
    {
      name: "ستارة شيفون ناعم",
      slug: "soft-chiffon-sheer",
      description: "شيفون ناعم يوزّع الضوء ويمنح خصوصية خفيفة مع انسيابية عالية.",
      specs: "تفصيل حسب المقاس\nقابل للغسيل\nخيارات ألوان متعددة",
      price: 450,
      priceText: "ابتداءً من ٤٥٠ ر.س",
      categoryIdx: 2,
      isFeatured: true,
      image: "/static/mock/products/curtain-sheer.svg",
    },
    {
      name: "ستارة فوال مطرّز",
      slug: "embroidered-voile-sheer",
      description: "فوال مطرّز بنقشة هادئة يضيف لمسة فخامة بدون حجب كامل للضوء.",
      specs: "تفصيل حسب المقاس\nتطريز خفيف مقاوم للتنسيل\nمناسب للغرف والمعيشة",
      price: 520,
      priceText: "ابتداءً من ٥٢٠ ر.س",
      categoryIdx: 2,
      image: "/static/mock/products/curtain-sheer.svg",
    },
    {
      name: "ستارة أورجانزا لامعة",
      slug: "organza-sheer",
      description: "أورجانزا خفيفة بلمعة ناعمة تعطي إحساسًا فخمًا دون حجب الإضاءة.",
      specs: "تفصيل حسب المقاس\nخامة خفيفة\nمناسبة للواجهات الكبيرة",
      price: 480,
      priceText: "ابتداءً من ٤٨٠ ر.س",
      categoryIdx: 2,
      image: "/static/mock/products/curtain-sheer.svg",
    },
    {
      name: "ستارة فوال سادة (أوف وايت)",
      slug: "plain-voile-offwhite",
      description: "فوال سادة بلون أوف وايت لإطلالة هادئة وتناسق مع أي ديكور.",
      specs: "تفصيل حسب المقاس\nيناسب الشقق والفلل\nسهل التنظيف",
      price: 390,
      priceText: "ابتداءً من ٣٩٠ ر.س",
      categoryIdx: 2,
      image: "/static/mock/products/curtain-sheer.svg",
    },
    {
      name: "ستارة شفافة مع تطريز أطراف",
      slug: "sheer-with-edge-embroidery",
      description: "شفاف مع تطريز خفيف على الأطراف لإضافة تفاصيل أنيقة بدون مبالغة.",
      specs: "تفصيل حسب المقاس\nتطريز أطراف\nألوان حيادية",
      price: 560,
      priceText: "ابتداءً من ٥٦٠ ر.س",
      categoryIdx: 2,
      image: "/static/mock/products/curtain-sheer.svg",
    },

    // ستائر رول وزيبرا
    {
      name: "ستارة رول بلاك آوت",
      slug: "roller-blind-blackout",
      description: "ستارة رول بتعتيم كامل للنوم والخصوصية، بآلية تشغيل ناعمة وسهلة.",
      specs: "تفصيل حسب العرض والارتفاع\nقماش بلاك آوت 100%\nخيارات كاسيت علوي",
      price: 520,
      priceText: "ابتداءً من ٥٢٠ ر.س",
      categoryIdx: 3,
      isFeatured: true,
      image: "/static/mock/products/blind-roller-zebra.svg",
    },
    {
      name: "ستارة زيبرا مزدوجة",
      slug: "zebra-blind-premium",
      description: "زيبرا بطبقتين للتحكم بالضوء بين الشفافية والتعتيم الجزئي بتصميم أنيق.",
      specs: "تفصيل حسب المقاس\nسلسلة تشغيل معدنية\nخيارات ألوان حيادية",
      price: 600,
      priceText: "ابتداءً من ٦٠٠ ر.س",
      categoryIdx: 3,
      image: "/static/mock/products/blind-roller-zebra.svg",
    },
    {
      name: "ستارة رول شفافة",
      slug: "roller-blind-sheer",
      description: "رول شفافة لتخفيف حدة الشمس مع الحفاظ على الإضاءة الطبيعية.",
      specs: "تفصيل حسب المقاس\nقماش مقاوم للغبار\nمناسب للمكاتب والصالات",
      price: 390,
      priceText: "ابتداءً من ٣٩٠ ر.س",
      categoryIdx: 3,
      image: "/static/mock/products/blind-roller-zebra.svg",
    },
    {
      name: "ستارة رول مع كاسيت",
      slug: "roller-blind-with-cassette",
      description: "رول بكاسيت علوي مخفي يمنح شكلًا أنيقًا ويغطي آلية اللف بالكامل.",
      specs: "تفصيل حسب المقاس\nكاسيت ألمنيوم\nخيارات تعتيم",
      price: 570,
      priceText: "ابتداءً من ٥٧٠ ر.س",
      categoryIdx: 3,
      image: "/static/mock/products/blind-roller-zebra.svg",
    },
    {
      name: "ستارة رول بمحرك",
      slug: "motorized-roller-blind",
      description: "ستارة رول بمحرك للتحكم السهل عن بُعد، مناسبة للنوافذ العالية.",
      specs: "تفصيل حسب المقاس\nريموت تحكم\nخيارات بلاك آوت",
      price: 1450,
      priceText: "ابتداءً من ١٤٥٠ ر.س",
      categoryIdx: 3,
      isFeatured: true,
      image: "/static/mock/products/blind-roller-zebra.svg",
    },

    // مجالس وكنب
    {
      name: "كنبة زاوية مخملية",
      slug: "velvet-corner-sofa",
      description: "كنبة زاوية بمخمل ناعم مع إسفنج عالي الكثافة للراحة اليومية.",
      specs: "خامة مخمل\nمقاس مناسب للصالة\nألوان متعددة",
      price: 3890,
      priceText: "٣٨٩٠ ر.س",
      categoryIdx: 4,
      isFeatured: true,
      image: "/static/mock/products/sofa-majlis.svg",
    },
    {
      name: "طقم مجلس عربي (كنب أرضي)",
      slug: "arabic-majlis-floor-seating",
      description: "جلسة عربية أرضية بتنجيد مريح وتناسق ألوان يناسب المجالس.",
      specs: "تفصيل حسب المقاس\nاختيار قماش مقاوم للبقع\nيشمل وسائد ظهر",
      price: 5200,
      priceText: "ابتداءً من ٥٢٠٠ ر.س",
      categoryIdx: 4,
      image: "/static/mock/products/sofa-majlis.svg",
    },
    {
      name: "كرسي استرخاء (شيزلونج)",
      slug: "chaise-lounge",
      description: "كرسي شيزلونج لإضافة زاوية استرخاء أنيقة بجانب النافذة أو في غرفة النوم.",
      specs: "خامة قماش متين\nهيكل خشبي\nمساند مريحة",
      price: 2100,
      priceText: "٢١٠٠ ر.س",
      categoryIdx: 4,
      image: "/static/mock/products/sofa-majlis.svg",
    },
    {
      name: "كنبة ثلاثية قماش",
      slug: "three-seater-fabric-sofa",
      description: "كنبة ثلاثية عملية تناسب المساحات المتوسطة مع قماش سهل التنظيف.",
      specs: "قماش سهل التنظيف\nوسائد قابلة للفك\nألوان حيادية",
      price: 2950,
      priceText: "٢٩٥٠ ر.س",
      categoryIdx: 4,
      image: "/static/mock/products/sofa-majlis.svg",
    },
    {
      name: "كرسي مفرد مع مسند قدم",
      slug: "armchair-with-ottoman",
      description: "كرسي مفرد مع مسند قدم لإضافة جلسة مريحة بجانب الطاولة أو المكتبة.",
      specs: "هيكل قوي\nحشوة مريحة\nقماش متين",
      price: 1650,
      priceText: "١٦٥٠ ر.س",
      categoryIdx: 4,
      image: "/static/mock/products/sofa-majlis.svg",
    },

    // طاولات وكونسول
    {
      name: "طاولة قهوة بسطح رخامي",
      slug: "marble-coffee-table",
      description: "طاولة قهوة بسطح رخامي صناعي سهل التنظيف وقاعدة ثابتة.",
      specs: "سطح رخامي\nقاعدة معدنية\nمقاس متوسط",
      price: 890,
      priceText: "٨٩٠ ر.س",
      categoryIdx: 5,
      isFeatured: true,
      image: "/static/mock/products/table-console.svg",
    },
    {
      name: "طاولة جانبية معدنية",
      slug: "metal-side-table",
      description: "طاولة جانبية خفيفة بلمسة معدنية تناسب بجانب الكنب أو الكرسي.",
      specs: "هيكل معدني\nخفة حركة\nسطح مقاوم للخدش",
      price: 420,
      priceText: "٤٢٠ ر.س",
      categoryIdx: 5,
      image: "/static/mock/products/table-console.svg",
    },
    {
      name: "كونسول مدخل خشبي",
      slug: "wood-entry-console",
      description: "كونسول مدخل بسطح خشبي وأدراج للتخزين المنظم مع تصميم بسيط.",
      specs: "خشب طبيعي\nأدراج تخزين\nمناسب للمداخل",
      price: 1350,
      priceText: "١٣٥٠ ر.س",
      categoryIdx: 5,
      image: "/static/mock/products/table-console.svg",
    },
    {
      name: "وحدة تلفاز مع أدراج",
      slug: "tv-unit-with-drawers",
      description: "وحدة تلفاز بتخزين عملي لملحقات الأجهزة مع مظهر مرتب.",
      specs: "رفوف + أدراج\nخشب مع لمسات معدنية\nسعة تخزين جيدة",
      price: 1750,
      priceText: "١٧٥٠ ر.س",
      categoryIdx: 5,
      image: "/static/mock/products/table-console.svg",
    },
    {
      name: "طاولة طعام (٦ كراسي)",
      slug: "dining-table-6-chairs",
      description: "طاولة طعام مع ٦ كراسي بتنجيد مريح وتفاصيل تناسب الديكور الحديث.",
      specs: "طاولة + ٦ كراسي\nقماش متين\nتشطيب سهل التنظيف",
      price: 4900,
      priceText: "٤٩٠٠ ر.س",
      categoryIdx: 5,
      image: "/static/mock/products/table-console.svg",
    },

    // وسائد وإكسسوارات ديكور
    {
      name: "وسائد ديكور مطرّزة",
      slug: "embroidered-decor-pillows",
      description: "وسائد مطرّزة تضيف طبقة لون وتفاصيل أنيقة على الكنب والمجالس.",
      specs: "حشوة مريحة\nغلاف قابل للغسيل\nتطريز خفيف",
      price: 140,
      priceText: "١٤٠ ر.س",
      categoryIdx: 6,
      image: "/static/mock/products/decor-accessories.svg",
    },
    {
      name: "وسادة مخمل (لون سادة)",
      slug: "solid-velvet-pillow",
      description: "وسادة مخمل بلون سادة لإكمال تنسيق الستائر والأثاث بلمسة فخامة.",
      specs: "مخمل ناعم\nسحاب مخفي\nألوان متعددة",
      price: 120,
      priceText: "١٢٠ ر.س",
      categoryIdx: 6,
      image: "/static/mock/products/decor-accessories.svg",
    },
    {
      name: "مرآة بإطار ذهبي",
      slug: "gold-frame-mirror",
      description: "مرآة بإطار ذهبي أنيق تمنح الممر أو الصالة إحساسًا بالاتساع والضوء.",
      specs: "إطار معدني\nتعليق جداري\nمقاس متوسط",
      price: 650,
      priceText: "٦٥٠ ر.س",
      categoryIdx: 6,
      isFeatured: true,
      image: "/static/mock/products/decor-accessories.svg",
    },
    {
      name: "لوحة جدارية قماشية",
      slug: "textile-wall-art",
      description: "لوحة قماشية بنقشة هادئة تتناسق مع ألوان الستائر وتضيف دفئًا للمكان.",
      specs: "قماش على إطار\nألوان حيادية\nمناسب لغرفة المعيشة",
      price: 380,
      priceText: "٣٨٠ ر.س",
      categoryIdx: 6,
      image: "/static/mock/products/decor-accessories.svg",
    },
    {
      name: "حامل شموع ديكور (طقم)",
      slug: "decor-candle-holders-set",
      description: "طقم حامل شموع بتفاصيل بسيطة لإضاءة دافئة ولمسة ديكور راقية.",
      specs: "طقم قطعتين\nمعدن مطلي\nمناسب للطاولات",
      price: 220,
      priceText: "٢٢٠ ر.س",
      categoryIdx: 6,
      image: "/static/mock/products/decor-accessories.svg",
    },
  ];

  const { insertedCategoriesCount, insertedProductsCount } = await withDbRetry(
    () =>
      db.transaction(async (tx) => {
        const existingCategories = await tx
          .select()
          .from(categoriesTable)
          .where(inArray(categoriesTable.slug, categorySlugs));
        const existingCategorySlugs = new Set(existingCategories.map((c) => c.slug));

        const missingCategories = categories.filter((c) => !existingCategorySlugs.has(c.slug));
        const insertedCategories =
          missingCategories.length > 0
            ? await tx.insert(categoriesTable).values(missingCategories).returning()
            : [];

        const allCategories = [...existingCategories, ...insertedCategories];
        const categoryIdBySlug = new Map(allCategories.map((c) => [c.slug, c.id] as const));

        const productSlugs = products.map((p) => p.slug);
        const existingProducts = productSlugs.length
          ? await tx
              .select({ slug: productsTable.slug })
              .from(productsTable)
              .where(inArray(productsTable.slug, productSlugs))
          : [];
        const existingProductSlugs = new Set(existingProducts.map((p) => p.slug));

        const toInsertProducts = products
          .filter((p) => !existingProductSlugs.has(p.slug))
          .map((p) => {
            const categorySlug = categorySlugs[p.categoryIdx]!;
            const categoryId = categoryIdBySlug.get(categorySlug);
            if (!categoryId) {
              throw new Error(`Missing category id for slug: ${categorySlug}`);
            }
            return {
              name: p.name,
              nameEn: p.nameEn ?? null,
              slug: p.slug,
              description: p.description ?? null,
              specs: p.specs ?? null,
              price: p.price === undefined ? null : String(p.price),
              priceText: p.priceText ?? null,
              categoryId,
              images: [p.image],
              isFeatured: p.isFeatured ?? false,
              isAvailable: true,
            };
          });

        if (toInsertProducts.length > 0) {
          await tx.insert(productsTable).values(toInsertProducts);
        }

        return {
          insertedCategoriesCount: insertedCategories.length,
          insertedProductsCount: toInsertProducts.length,
        };
      }),
    {
      retries: 2,
      delayMs: 150,
      onRetry: (err, attempt) =>
        console.warn(`[seed] transient DB error seeding catalog; retry ${attempt}`, err),
    },
  );

  if (insertedCategoriesCount > 0) {
    console.log(`Created ${insertedCategoriesCount} categories.`);
  }
  if (insertedProductsCount > 0) {
    console.log(`Created ${insertedProductsCount} products.`);
  }
}

async function seedGallery(): Promise<void> {
  const existing = await withDbRetry(() => db.select().from(galleryTable).limit(1), {
    retries: 2,
    delayMs: 100,
    onRetry: (err, attempt) => console.warn(`[seed] transient DB error reading gallery; retry ${attempt}`, err),
  });
  if (existing.length > 0) return;

  const items = [
    {
      title: "تركيب ستائر طبقتين",
      slug: "double-layer-curtains-installation",
      description: "شفاف + تعتيم مع سكة موج وإكسسوارات أنيقة.",
      imageUrl: "/static/mock/gallery/01.svg",
      images: ["/static/mock/gallery/01.svg", "/static/mock/gallery/02.svg"],
      sortOrder: 1,
    },
    {
      title: "ستائر رول بلاك آوت",
      slug: "roller-blackout-showcase",
      description: "حل عملي لغرف النوم مع تعتيم كامل وسهولة تنظيف.",
      imageUrl: "/static/mock/gallery/02.svg",
      images: ["/static/mock/gallery/02.svg", "/static/mock/gallery/04.svg"],
      sortOrder: 2,
    },
    {
      title: "تنسيق مجلس كلاسيكي",
      slug: "classic-majlis-showcase",
      description: "ستائر جاكار مع مخمل وتطريز خفيف بإطلالة فخمة.",
      imageUrl: "/static/mock/gallery/03.svg",
      images: ["/static/mock/gallery/03.svg", "/static/mock/gallery/05.svg"],
      sortOrder: 3,
    },
    {
      title: "زيبرا لغرفة اجتماعات",
      slug: "zebra-meeting-room",
      description: "تحكم بالضوء بين الشفافية والخصوصية بتصميم عصري.",
      imageUrl: "/static/mock/gallery/04.svg",
      images: ["/static/mock/gallery/04.svg", "/static/mock/gallery/01.svg"],
      sortOrder: 4,
    },
    {
      title: "ستائر فيلا (تفصيل وتركيب)",
      slug: "villa-curtains-custom-installation",
      description: "تفصيل حسب المقاس مع خدمة القياس والتركيب في الموقع.",
      imageUrl: "/static/mock/gallery/05.svg",
      images: ["/static/mock/gallery/05.svg", "/static/mock/gallery/06.svg"],
      sortOrder: 5,
    },
    {
      title: "جلسة كنب مع وسائد ديكور",
      slug: "sofa-styling-with-pillows",
      description: "تنسيق ألوان حيادية ووسائد مطرّزة لإكمال الديكور.",
      imageUrl: "/static/mock/gallery/06.svg",
      images: ["/static/mock/gallery/06.svg", "/static/mock/gallery/03.svg"],
      sortOrder: 6,
    },
    {
      title: "ستائر شفافة للشرفات",
      slug: "sheer-curtains-for-balconies",
      description: "فوال سادة بإضاءة طبيعية ولمسة ناعمة.",
      imageUrl: "/static/mock/gallery/01.svg",
      images: ["/static/mock/gallery/01.svg"],
      sortOrder: 7,
    },
    {
      title: "كونسول مدخل مع مرآة",
      slug: "entry-console-with-mirror",
      description: "تفاصيل خشب ومعدن مع مرآة بإطار ذهبي.",
      imageUrl: "/static/mock/gallery/05.svg",
      images: ["/static/mock/gallery/05.svg"],
      sortOrder: 8,
    },
    {
      title: "ستائر موج لصالة المعيشة",
      slug: "wave-curtains-living-room",
      description: "قماش سادة مع تموّج متساوٍ وخياطة مرتبة.",
      imageUrl: "/static/mock/gallery/04.svg",
      images: ["/static/mock/gallery/04.svg"],
      sortOrder: 9,
    },
    {
      title: "طاولة قهوة بسطح رخامي",
      slug: "marble-coffee-table-showcase",
      description: "سطح رخامي عملي مع قاعدة ثابتة لتناسق مودرن.",
      imageUrl: "/static/mock/gallery/06.svg",
      images: ["/static/mock/gallery/06.svg"],
      sortOrder: 10,
    },
    {
      title: "زيبرا مقاومة للغبار",
      slug: "dust-resistant-zebra-blinds",
      description: "خامة سهلة التنظيف للمكاتب وغرف المعيشة.",
      imageUrl: "/static/mock/gallery/02.svg",
      images: ["/static/mock/gallery/02.svg"],
      sortOrder: 11,
    },
    {
      title: "تحديث ديكور بالوسائد",
      slug: "decor-refresh-with-pillows",
      description: "وسائد مخمل وخطوط حيادية لتجديد سريع للمكان.",
      imageUrl: "/static/mock/gallery/03.svg",
      images: ["/static/mock/gallery/03.svg"],
      sortOrder: 12,
    },
  ];

  await withDbRetry(() => db.insert(galleryTable).values(items), {
    retries: 2,
    delayMs: 100,
    onRetry: (err, attempt) =>
      console.warn(`[seed] transient DB error inserting gallery; retry ${attempt}`, err),
  });
  console.log(`Created ${items.length} gallery items.`);
}

async function main(): Promise<void> {
  console.log("Seeding mock data (Arabic RTL catalog + gallery + settings)...");
  await seedAdmin();
  await seedSettings();
  await seedCatalog();
  await seedGallery();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
