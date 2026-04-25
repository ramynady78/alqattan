import { useGetSettings, useListCategories, useListProducts, useListGallery } from "@workspace/api-client-react";
import { Hero, type HeroSlide } from "@/components/site/Hero";
import { SectionHeader } from "@/components/site/SectionHeader";
import { CategoryCard } from "@/components/site/CategoryCard";
import { ProductCard } from "@/components/site/ProductCard";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { WhatsappButton } from "@/components/site/WhatsappButton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BadgeDollarSign, Layers, Ruler, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import { useDocumentTitle } from "@/lib/seo";
import { Reveal } from "@/components/motion/Reveal";
import { Link } from "react-router-dom";
import {
  CategoryCardSkeleton,
  GalleryMasonrySkeleton,
  ProductGridSkeleton,
} from "@/components/loading/skeletons/PublicSkeletons";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";

export default function HomePage() {
  const settingsQuery = useGetSettings();
  const categoriesQuery = useListCategories();
  const productsQuery = useListProducts({ featured: true, limit: 4 });
  const galleryQuery = useListGallery();

  const { data: settings } = settingsQuery;
  const { data: categories } = categoriesQuery;
  const { data: products } = productsQuery;
  const { data: gallery } = galleryQuery;

  useDocumentTitle("الرئيسية");

  const featuredCategories = Array.isArray(categories) ? categories.slice(0, 3) : [];
  const galleryPreview = Array.isArray(gallery) ? gallery.slice(0, 6) : [];

  const slides: HeroSlide[] = [
    {
      id: "signature",
      imageUrl:
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2400&q=80",
      heading: settings?.heroTitle || "القطّان للستائر",
      subheading: settings?.heroSubtitle || "أناقة تليق بمنزلك… وفخامة تُصمَّم لتدوم.",
      primaryCta: { label: "تصفح المنتجات", href: "/products" },
    },
    {
      id: "craft",
      imageUrl:
        "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=2400&q=80",
      heading: "أناقة تُحاك بعناية",
      subheading: "اختيار الخامة، دقة التنفيذ، ولمسة نهائية تليق بذوقك الرفيع.",
      primaryCta: { label: "اكتشف التصنيفات", href: "/categories" },
    },
    {
      id: "bespoke",
      imageUrl:
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=2400&q=80",
      heading: "تفصيل حسب الطلب",
      subheading: "من الفكرة إلى التركيب… تجربة سلسة ومريحة في كل خطوة.",
      primaryCta: { label: "اطلب استشارة", href: "/contact" },
    },
  ];

  return (
    <div>
      <Hero slides={slides} />

      <section className="lux-section lux-noise">
        <div className="lux-container">
          <Reveal>
            <SectionHeader title="التصنيفات المميزة" subtitle="تشكيلاتنا" align="center" />
          </Reveal>

          {categoriesQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <CategoryCardSkeleton key={i} />
              ))}
            </div>
          ) : categoriesQuery.isError ? (
            <ErrorState
              title="تعذر تحميل التصنيفات"
              description="يرجى التحقق من الاتصال ثم إعادة المحاولة."
              onRetry={() => categoriesQuery.refetch()}
            />
          ) : featuredCategories.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredCategories.map((cat, idx) => (
                  <Reveal key={cat.id} delay={0.03 + idx * 0.05}>
                    <CategoryCard category={cat} />
                  </Reveal>
                ))}
              </div>
              <div className="text-center mt-12">
                <Link to="/categories">
                  <Button variant="outline" size="lg" className="font-serif rounded-full px-8">
                    عرض كل التصنيفات
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <EmptyState title="لا توجد تصنيفات" description="سيتم عرض التصنيفات هنا فور إضافتها." />
          )}
        </div>
      </section>

      <section className="lux-section bg-muted/20">
        <div className="lux-container">
          <Reveal>
            <SectionHeader title="منتجات مختارة" subtitle="الأكثر طلباً" align="center" />
          </Reveal>

          {productsQuery.isLoading ? (
            <ProductGridSkeleton count={4} />
          ) : productsQuery.isError ? (
            <ErrorState
              title="تعذر تحميل المنتجات"
              description="يرجى التحقق من الاتصال ثم إعادة المحاولة."
              onRetry={() => productsQuery.refetch()}
            />
          ) : products?.items && products.items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.items.map((product, idx) => (
                  <Reveal key={product.id} delay={0.02 + idx * 0.04}>
                    <ProductCard product={product} />
                  </Reveal>
                ))}
              </div>
              <div className="text-center mt-12">
                <Link to="/products">
                  <Button variant="outline" size="lg" className="font-serif rounded-full px-8">
                    تصفح المنتجات
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <EmptyState title="لا توجد منتجات" description="سيتم عرض المنتجات المميزة هنا فور توفرها." />
          )}
        </div>
      </section>

      <section className="relative lux-section overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.35),transparent_50%)]" />
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(184,150,90,0.35),transparent_60%)]" />

        <div className="lux-container relative">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-5">لماذا القطّان؟</h2>
              <p className="text-primary-foreground/85 leading-relaxed">
                نُقدّم تجربة راقية من البداية حتى النهاية… لأن الفخامة ليست مظهراً فقط، بل جودةٌ وخدمةٌ واهتمامٌ بالتفاصيل.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: "جودة عالية",
                text: "خامات مختارة بعناية وتشطيب متقن يبرز جمال المكان.",
                Icon: ShieldCheck,
              },
              {
                title: "تصاميم عصرية",
                text: "ألوان وتنسيقات تواكب أحدث صيحات الديكور بروح عربية راقية.",
                Icon: Sparkles,
              },
              {
                title: "تركيب احترافي",
                text: "فريق متخصص لضمان قياس دقيق وتركيب نظيف ونتيجة مثالية.",
                Icon: Wrench,
              },
              {
                title: "خدمة متكاملة",
                text: "استشارة، اختيار، قياس، تفصيل، تركيب… كل شيء في مكان واحد.",
                Icon: Layers,
              },
              {
                title: "تفصيل حسب الطلب",
                text: "حلول مرنة تناسب المقاسات والاحتياجات وتفاصيل الأثاث.",
                Icon: Ruler,
              },
              {
                title: "أسعار مناسبة",
                text: "توازن ذكي بين الجودة والسعر مع خيارات متعددة تناسب الجميع.",
                Icon: BadgeDollarSign,
              },
            ].map((f, idx) => (
              <Reveal key={f.title} delay={0.03 + idx * 0.05}>
                <div className="group relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 backdrop-blur px-6 py-7 text-right transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
                  <div className="relative">
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                      <f.Icon className="h-5 w-5 text-white/80 transition-colors duration-300 group-hover:text-primary" />
                    </div>
                    <h3 className="text-xl font-bold font-serif mb-2">{f.title}</h3>
                    <p className="text-primary-foreground/85 leading-relaxed">{f.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="lux-section lux-noise">
        <div className="lux-container">
          <Reveal>
            <SectionHeader title="من أعمالنا" subtitle="معرض الصور" align="center" />
          </Reveal>

          {galleryQuery.isLoading ? (
            <div className="lux-surface lux-outline rounded-3xl p-4 md:p-6">
              <GalleryMasonrySkeleton count={6} />
            </div>
          ) : galleryQuery.isError ? (
            <ErrorState
              title="تعذر تحميل المعرض"
              description="يرجى التحقق من الاتصال ثم إعادة المحاولة."
              onRetry={() => galleryQuery.refetch()}
            />
          ) : galleryPreview.length > 0 ? (
            <>
              <Reveal>
                <div className="lux-surface lux-outline rounded-3xl p-4 md:p-6">
                  <GalleryGrid items={galleryPreview} />
                </div>
              </Reveal>
              <div className="text-center mt-12">
                <Link to="/gallery">
                  <Button variant="outline" size="lg" className="font-serif rounded-full px-8">
                    عرض المعرض كاملاً
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <EmptyState title="لا توجد صور" description="سيتم عرض الصور هنا فور إضافتها إلى المعرض." />
          )}
        </div>
      </section>

      <section className="lux-section bg-card border-t border-b">
        <div className="lux-container text-center">
          <Reveal>
            <h2 className="text-3xl font-serif font-bold mb-6">هل تبحث عن تصميم مخصص؟</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
              فريقنا جاهز لتلبية طلباتك وتصميم الستائر التي تناسب مساحتك بدقة واحترافية.
            </p>
            <Link to="/contact">
              <Button size="lg" className="font-serif h-14 px-8 text-lg rounded-full">
                تواصل معنا الآن
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </Link>
          </Reveal>
        </div>
      </section>

      <WhatsappButton />
    </div>
  );
}
