import { useListCategories } from "@workspace/api-client-react";
import { SectionHeader } from "@/components/site/SectionHeader";
import { CategoryCard } from "@/components/site/CategoryCard";
import { useDocumentTitle } from "@/lib/seo";
import { Reveal } from "@/components/motion/Reveal";
import { CategoryGridSkeleton } from "@/components/loading/skeletons/PublicSkeletons";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";

export default function CategoriesPage() {
  const categoriesQuery = useListCategories();
  const { data: categories, isLoading, isError } = categoriesQuery;
  useDocumentTitle("التصنيفات");

  const list = Array.isArray(categories) ? categories : [];

  return (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {list.map((category) => (
              <Reveal key={category.id} delay={0.03}>
                <CategoryCard category={category} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState title="لا توجد تصنيفات" description="لا توجد تصنيفات متاحة حالياً." />
        )}
      </div>
    </div>
  );
}
