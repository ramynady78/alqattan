import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  useListProducts,
  useListCategories,
  useGetCategoryBySlug,
} from "@workspace/api-client-react";
import { ProductCard } from "@/components/site/ProductCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Search } from "lucide-react";
import { useDocumentTitle } from "@/lib/seo";
import { Reveal } from "@/components/motion/Reveal";
import { ProductGridSkeleton } from "@/components/loading/skeletons/PublicSkeletons";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PublicPageHero } from "@/components/site/PublicPageHero";
import { buildCategoryUrl } from "@/lib/routes";

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { slug } = useParams<{ slug?: string }>();

  const categoryIdParam = searchParams.get("categoryId");
  const initialSearchParam = searchParams.get("search") || "";
  const initialPageParam = parseInt(searchParams.get("page") || "1", 10);

  const [searchInput, setSearchInput] = useState(initialSearchParam);
  const [appliedSearch, setAppliedSearch] = useState(initialSearchParam);
  const [page, setPage] = useState(initialPageParam);

  const categoriesQuery = useListCategories();
  const { data: categories } = categoriesQuery;
  const categoriesList = Array.isArray(categories) ? categories : [];

  const categoryBySlugQuery = useGetCategoryBySlug(slug ?? "", {
    query: { enabled: !!slug, queryKey: ["/api/categories/by-slug", slug] },
  });

  const selectedCategory = useMemo(() => {
    if (slug && categoryBySlugQuery.data) return categoryBySlugQuery.data;
    if (!categoryIdParam) return null;
    const categoryId = parseInt(categoryIdParam, 10);
    return categoriesList.find((item) => item.id === categoryId) ?? null;
  }, [slug, categoryBySlugQuery.data, categoryIdParam, categoriesList]);

  const selectedCategoryId = selectedCategory?.id;

  const productsQuery = useListProducts({
    categoryId: selectedCategoryId,
    search: appliedSearch || undefined,
    page,
    limit: 12,
  });
  const { data: productsData, isLoading, isError } = productsQuery;

  useDocumentTitle(selectedCategory ? selectedCategory.name : "المنتجات");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const normalizedSearch = searchInput.trim();
      setAppliedSearch((prev) => {
        if (prev === normalizedSearch) return prev;
        setPage(1);
        return normalizedSearch;
      });
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const handleCategoryChange = (val: string) => {
    const params = new URLSearchParams(searchParams);
    setPage(1);
    const normalizedSearch = searchInput.trim();
    if (normalizedSearch) {
      params.set("search", normalizedSearch);
    } else {
      params.delete("search");
    }

    if (val && val !== "all") {
      params.delete("page");
      params.delete("categoryId");
      const category = categoriesList.find((item) => item.id.toString() === val);
      navigate(category ? buildCategoryUrl(category) + (params.toString() ? `?${params.toString()}` : "") : "/products");
    } else {
      params.delete("categoryId");
      params.delete("page");
      navigate(params.toString() ? `/products?${params.toString()}` : "/products");
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const resetFilters = () => {
    navigate(selectedCategory ? buildCategoryUrl(selectedCategory) : "/products");
    setSearchInput("");
    setAppliedSearch("");
    setPage(1);
  };

  const breadcrumbItems = [
    { label: "الرئيسية", href: "/" },
    selectedCategory
      ? { label: "التصنيفات", href: "/categories" }
      : { label: "المنتجات" },
    ...(selectedCategory ? [{ label: selectedCategory.name }] : []),
  ];

  const heroTitle = selectedCategory ? selectedCategory.name : "المنتجات";
  const heroSubtitle = selectedCategory
    ? selectedCategory.description || "تشكيلة أنيقة من الستائر والخامات المختارة بعناية لهذه الفئة."
    : "تصفح المجموعة الكاملة واستخدم البحث والفلترة للوصول سريعًا إلى ما يناسب ذوقك.";

  return (
    <div>
      <PublicPageHero
        title={heroTitle}
        subtitle={heroSubtitle}
        breadcrumbs={breadcrumbItems}
        backgroundImage="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2200&q=80"
      />

      <div className="lux-section lux-noise">
        <div className="lux-container">
          <Reveal>
            <div className="mb-8 sm:mb-10 rounded-[1.75rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,244,238,0.96))] p-4 shadow-[0_18px_50px_rgba(42,31,23,0.06)] ring-1 ring-black/5 backdrop-blur sm:rounded-[2rem] sm:p-5 md:p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="order-2 flex-1 md:order-1">
                  <div className="mb-2 text-sm font-medium text-foreground">ابحث عن منتج</div>
                  <form onSubmit={(e) => e.preventDefault()} className="relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ابحث عن منتج…"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="h-12 w-full rounded-2xl border-border/80 bg-background/80 pr-10 pl-4 shadow-none"
                    />
                  </form>
                </div>

                <div className="order-1 w-full md:order-2 md:w-72 md:shrink-0">
                  <div className="mb-2 text-sm font-medium text-foreground">التصنيف</div>
                  <Select
                    value={selectedCategory?.id?.toString() || "all"}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className="h-12 rounded-2xl border-border/80 bg-background/80 shadow-none">
                      <SelectValue placeholder="كل التصنيفات" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="all">كل التصنيفات</SelectItem>
                      {categoriesList.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Reveal>

          {slug && categoryBySlugQuery.isLoading ? (
            <ProductGridSkeleton count={8} />
          ) : slug && categoryBySlugQuery.isError ? (
            <ErrorState
              title="تعذر تحميل التصنيف"
              description="تعذر قراءة رابط التصنيف المطلوب. يرجى المحاولة مرة أخرى."
              onRetry={() => categoryBySlugQuery.refetch()}
            />
          ) : isLoading ? (
            <ProductGridSkeleton count={8} />
          ) : isError ? (
            <ErrorState
              title="تعذر تحميل المنتجات"
              description="يرجى التحقق من الاتصال ثم إعادة المحاولة."
              onRetry={() => productsQuery.refetch()}
            />
          ) : productsData?.items && productsData.items.length > 0 ? (
            <>
              <div className="lux-product-grid">
                {productsData.items.map((product) => (
                  <Reveal key={product.id} delay={0.03} className="h-full">
                    <ProductCard product={product} />
                  </Reveal>
                ))}
              </div>

              {productsData.total > (productsData.limit || 12) && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                    size="icon"
                    className="rounded-full"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <span className="px-4 text-sm font-medium">
                    صفحة {page} من {Math.ceil(productsData.total / (productsData.limit || 12))}
                  </span>

                  <Button
                    variant="outline"
                    disabled={page >= Math.ceil(productsData.total / (productsData.limit || 12))}
                    onClick={() => handlePageChange(page + 1)}
                    size="icon"
                    className="rounded-full"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title="لا توجد منتجات مطابقة"
              description="جرّب تعديل عبارة البحث أو تغيير التصنيف للحصول على نتائج أخرى."
              actionLabel="إعادة ضبط الفلاتر"
              onAction={resetFilters}
            />
          )}
        </div>
      </div>
    </div>
  );
}
