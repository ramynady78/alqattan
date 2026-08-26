import { useMemo } from "react";
import { useListCategories } from "@workspace/api-client-react";
import { SectionHeader } from "@/components/site/SectionHeader";
import { CategoryCard } from "@/components/site/CategoryCard";
import { Reveal } from "@/components/motion/Reveal";
import { CategoryGridSkeleton } from "@/components/loading/skeletons/PublicSkeletons";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PublicPageHero } from "@/components/site/PublicPageHero";
import { categoriesIndexSeo } from "@/seo/pages";
import { usePageSeo } from "@/seo/usePageSeo";
import { STATIC_SEO } from "@/seo/content";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CategoriesPage() {
  const categoriesQuery = useListCategories();
  const { data: categories, isLoading, isError } = categoriesQuery;
  const list = Array.isArray(categories) ? categories : [];
  const categoryNames = useMemo(
    () => list.map((item) => item.name),
    [categories],
  );
  const seo = useMemo(() => categoriesIndexSeo(categoryNames), [categoryNames]);
  usePageSeo(seo);

  return (
    <div>
      <PublicPageHero
        title={STATIC_SEO.categories.h1}
        subtitle="تصفحوا تصنيفاتنا واختاروا الخيار الأقرب لذوقكم ومساحتكم، وبعدها نساعدكم تصلون للتصميم المناسب."
        breadcrumbs={[
          { label: "الرئيسية", href: "/" },
          { label: "التصنيفات" },
        ]}
        backgroundImage="https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=2200&q=80"
        align="center"
      />

      <div className="lux-section lux-noise">
        <div className="lux-container">
          <Reveal>
            <SectionHeader title="تصفحوا تصنيفات الستائر" subtitle="اكتشفوا تشكيلاتنا" align="center" />
            <p className="mx-auto mb-10 max-w-3xl text-center text-muted-foreground leading-relaxed">
              كل تصنيف يجمع خيارات تناسب استخدامات مختلفة داخل المنزل. اختاروا التصنيف الأقرب لكم، ثم انتقلوا إلى{" "}
              <Link to="/products" className="text-primary hover:underline">
                المنتجات
              </Link>{" "}
              أو{" "}
              <Link to="/contact" className="text-primary hover:underline">
                تواصلوا معنا
              </Link>{" "}
              إذا تبغون مساعدة في الاختيار.
            </p>
          </Reveal>

          {isLoading ? (
            <CategoryGridSkeleton count={6} />
          ) : isError ? (
            <ErrorState
              title="تعذر تحميل التصنيفات"
              description="يرجى التحقق من الاتصال ثم إعادة المحاولة."
              onRetry={() => categoriesQuery.refetch()}
            />
          ) : list.length > 0 ? (
            <div className="lux-category-grid">
              {list.map((category) => (
                <Reveal key={category.id} delay={0.03} className="h-full">
                  <CategoryCard category={category} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState title="لا توجد تصنيفات" description="لا توجد تصنيفات متاحة حاليا." />
          )}
        </div>
      </div>

      <section className="lux-section bg-muted/20">
        <div className="lux-container max-w-3xl text-center">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-4">كيف تختارون الستائر المناسبة لمساحتكم؟</h2>
            <p className="text-muted-foreground leading-relaxed">
              فكروا في الإضاءة، مستوى الخصوصية، وذوق الأثاث الموجود. اختاروا التصنيف الأقرب لاستخدام المساحة، وبعدها
              نساعدكم تختارون التفاصيل اللي تناسبكم.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="lux-section lux-noise">
        <div className="lux-container max-w-3xl text-center">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-4">اختاروا تصميما يكمل تفاصيل مساحتكم</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              الهدف أن تكون الستارة جزءا من جمال المكان، مو عنصرا منفصلا عنه. تصفحوا التصنيفات، واختاروا اللي يناسب ذوقكم.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/products">
                <Button size="lg" className="rounded-full px-8">
                  تصفحوا المنتجات
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="rounded-full px-8">
                  تواصلوا معنا للمساعدة
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
