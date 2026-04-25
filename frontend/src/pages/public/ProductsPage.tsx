import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useListProducts,
  useListCategories,
} from "@workspace/api-client-react";
import { SectionHeader } from "@/components/site/SectionHeader";
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

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const categoryIdParam = searchParams.get("categoryId");
  const searchParam = searchParams.get("search") || "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  const [searchInput, setSearchInput] = useState(searchParam);

  const categoriesQuery = useListCategories();
  const { data: categories } = categoriesQuery;

  const productsQuery = useListProducts({
    categoryId: categoryIdParam ? parseInt(categoryIdParam, 10) : undefined,
    search: searchParam || undefined,
    page: pageParam,
    limit: 12,
  });
  const { data: productsData, isLoading, isError } = productsQuery;

  useDocumentTitle("المنتجات");

  const updateUrl = (params: URLSearchParams) => {
    const query = params.toString();
    navigate(query ? `/products?${query}` : "/products");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams(searchParams);

    if (searchInput) {
      params.set("search", searchInput);
    } else {
      params.delete("search");
    }

    params.set("page", "1");
    updateUrl(params);
  };

  const handleCategoryChange = (val: string) => {
    const params = new URLSearchParams(searchParams);

    if (val && val !== "all") {
      params.set("categoryId", val);
    } else {
      params.delete("categoryId");
    }

    params.set("page", "1");
    updateUrl(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    updateUrl(params);
  };

  const resetFilters = () => {
    navigate("/products");
    setSearchInput("");
  };

  return (
    <div className="lux-section lux-noise">
      <div className="lux-container">
        <Reveal>
          <SectionHeader
            title="المنتجات"
            subtitle="المجموعة الكاملة"
            align="center"
          />
        </Reveal>

        <Reveal>
          <div className="flex flex-col md:flex-row gap-4 mb-10 items-stretch md:items-center justify-between rounded-3xl lux-surface lux-outline p-4 md:p-5">
            <form onSubmit={handleSearch} className="flex w-full md:w-auto relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

              <Input
                placeholder="ابحث عن منتج…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-4 pr-10 md:w-96 rounded-full"
              />

              <Button type="submit" variant="secondary" className="mr-2 rounded-full">
                بحث
              </Button>
            </form>

            <div className="w-full md:w-72">
              <Select
                value={categoryIdParam || "all"}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="rounded-full">
                  <SelectValue placeholder="كل التصنيفات" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">كل التصنيفات</SelectItem>
                  {Array.isArray(categories)
                    ? categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))
                    : null}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Reveal>

        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : isError ? (
          <ErrorState
            title="تعذر تحميل المنتجات"
            description="يرجى التحقق من الاتصال ثم إعادة المحاولة."
            onRetry={() => productsQuery.refetch()}
          />
        ) : productsData?.items && productsData.items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {productsData.items.map((product) => (
                <Reveal key={product.id} delay={0.03}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>

            {productsData.total > (productsData.limit || 12) && (
              <div className="flex justify-center items-center mt-12 gap-2">
                <Button
                  variant="outline"
                  disabled={pageParam <= 1}
                  onClick={() => handlePageChange(pageParam - 1)}
                  size="icon"
                  className="rounded-full"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <span className="text-sm font-medium px-4">
                  صفحة {pageParam} من{" "}
                  {Math.ceil(productsData.total / (productsData.limit || 12))}
                </span>

                <Button
                  variant="outline"
                  disabled={
                    pageParam >=
                    Math.ceil(productsData.total / (productsData.limit || 12))
                  }
                  onClick={() => handlePageChange(pageParam + 1)}
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
            title="لا توجد منتجات"
            description="لم نعثر على منتجات تطابق بحثك."
            actionLabel="عرض كل المنتجات"
            onAction={resetFilters}
          />
        )}
      </div>
    </div>
  );
}
