import { useListCategories } from "@workspace/api-client-react";
import { SectionHeader } from "@/components/site/SectionHeader";
import { CategoryCard } from "@/components/site/CategoryCard";
import { useDocumentTitle } from "@/lib/seo";
import { Reveal } from "@/components/motion/Reveal";
import { CategoryGridSkeleton } from "@/components/loading/skeletons/PublicSkeletons";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PublicPageHero } from "@/components/site/PublicPageHero";

export default function CategoriesPage() {
  const categoriesQuery = useListCategories();
  const { data: categories, isLoading, isError } = categoriesQuery;
  useDocumentTitle("التصنيفات");

  const list = Array.isArray(categories) ? categories : [];

  return (
    <div>
      <PublicPageHero
        title="التصنيفات"
        subtitle="اكتشف تشكيلاتنا الراقية واختر الفئة الأقرب لأسلوب منزلك."
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
            <SectionHeader title="التصنيفات" subtitle="اكتشف تشكيلاتنا" align="center" />
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
            <EmptyState title="لا توجد تصنيفات" description="لا توجد تصنيفات متاحة حالياً." />
          )}
        </div>
      </div>
    </div>
  );
}
