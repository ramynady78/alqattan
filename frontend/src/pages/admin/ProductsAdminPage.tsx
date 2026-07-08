import { useEffect, useMemo, useState } from "react";
import {
  useListProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useListCategories,
  getListProductsQueryKey,
} from "@workspace/api-client-react";
import type { Product, ProductInput } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Edit2, Plus, Search, Trash2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTableShell } from "@/components/admin/AdminTableShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MultiImageUploader } from "@/components/admin/MultiImageUploader";
import { toImageUrl } from "@/lib/imageUrl";
import { useDocumentTitle } from "@/lib/seo";
import { AdminTableRowsSkeleton } from "@/components/loading/skeletons/AdminSkeletons";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { slugifyEnglish } from "@/lib/slugs";

type FeaturedFilter = "all" | "featured" | "non-featured";

export default function ProductsAdminPage() {
  useDocumentTitle("إدارة المنتجات");
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>("all");

  const { data: categories } = useListCategories();
  const categoriesList = Array.isArray(categories) ? categories : [];

  const productsQuery = useListProducts({
    page,
    limit: 10,
    search: search.trim() ? search.trim() : undefined,
    categoryId: categoryFilter !== "all" ? parseInt(categoryFilter, 10) : undefined,
    featured:
      featuredFilter === "all"
        ? undefined
        : featuredFilter === "featured"
          ? true
          : false,
  });
  const { data: productsData, isLoading, isError } = productsQuery;

  const products = productsData?.items ?? [];
  const total = productsData?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / 10));

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [englishNameError, setEnglishNameError] = useState("");

  const [formData, setFormData] = useState<ProductInput>({
    name: "",
    nameEn: "",
    slug: "",
    description: "",
    specs: "",
    price: null,
    priceText: "",
    categoryId: null,
    images: [],
    isFeatured: false,
    isAvailable: true,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });

  const categoryNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of categoriesList) map.set(c.id, c.name);
    return map;
  }, [categoriesList]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setSlugTouched(false);
    setEnglishNameError("");
    setFormData({
      name: "",
      nameEn: "",
      slug: "",
      description: "",
      specs: "",
      price: null,
      priceText: "",
      categoryId: null,
      images: [],
      isFeatured: false,
      isAvailable: true,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingId(product.id);
    setSlugTouched(false);
    setEnglishNameError("");
    setFormData({
      name: product.name,
      nameEn: product.nameEn ?? "",
      slug: product.slug,
      description: product.description ?? "",
      specs: product.specs ?? "",
      price: product.price ?? null,
      priceText: product.priceText ?? "",
      categoryId: product.categoryId ?? null,
      images: product.images ?? [],
      isFeatured: product.isFeatured,
      isAvailable: product.isAvailable,
    });
    setIsFormOpen(true);
  };

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, featuredFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("يرجى إدخال اسم المنتج");
      return;
    }
    const normalizedEnglishName = formData.nameEn?.trim() ?? "";
    if (!normalizedEnglishName) {
      setEnglishNameError("الاسم الإنجليزي مطلوب لإنشاء رابط المنتج.");
      toast.error("يرجى إدخال الاسم الإنجليزي للمنتج");
      return;
    }
    const generatedSlug = slugifyEnglish(normalizedEnglishName);
    if (!generatedSlug) {
      setEnglishNameError("الاسم الإنجليزي يجب أن يحتوي على أحرف أو أرقام إنجليزية صالحة.");
      toast.error("تعذر إنشاء الرابط من الاسم الإنجليزي");
      return;
    }
    const payload: ProductInput = {
      ...formData,
      nameEn: normalizedEnglishName,
      slug: slugTouched && formData.slug.trim() ? slugifyEnglish(formData.slug) : generatedSlug,
    };
    if (!payload.slug) {
      toast.error("يرجى إدخال رابط دائم صالح");
      return;
    }
    if (!payload.categoryId) {
      toast.error("يرجى اختيار تصنيف");
      return;
    }

    if (editingId) {
      updateProduct.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            toast.success("تم حفظ التعديلات بنجاح");
            invalidate();
            setIsFormOpen(false);
          },
          onError: (error) => toast.error(error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى"),
        },
      );
      return;
    }

    createProduct.mutate(
      { data: payload },
      {
        onSuccess: () => {
          toast.success("تمت إضافة المنتج بنجاح");
          invalidate();
          setIsFormOpen(false);
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى"),
      },
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteProduct.mutate(
      { id: deleteId },
      {
        onSuccess: () => {
          toast.success("تم حذف المنتج بنجاح");
          invalidate();
          setDeleteId(null);
        },
        onError: () => toast.error("حدث خطأ، حاول مرة أخرى"),
      },
    );
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((p) => ({ ...p, name: val }));
  };

  const handleEnglishNameChange = (value: string) => {
    const generatedSlug = slugifyEnglish(value);
    setEnglishNameError("");
    setFormData((prev) => ({
      ...prev,
      nameEn: value,
      slug: !slugTouched || !prev.slug.trim() ? generatedSlug : prev.slug,
    }));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="المنتجات"
        description="إدارة المنتجات، الصور، الأسعار، والتصنيفات."
        actions={
          <>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث في المنتجات..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10"
              />
            </div>
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة منتج
            </Button>
          </>
        }
      />

      <AdminTableShell
        toolbar={
          <div className="flex flex-col gap-4">
            <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_auto] md:items-end">
              <div className="space-y-2">
                <div className="text-sm font-medium">التصنيف</div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
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
              <div className="space-y-2">
                <div className="text-sm font-medium">حالة التمييز</div>
                <Select value={featuredFilter} onValueChange={(value) => setFeaturedFilter(value as FeaturedFilter)}>
                  <SelectTrigger>
                    <SelectValue placeholder="كل المنتجات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل المنتجات</SelectItem>
                    <SelectItem value="featured">المنتجات المميزة فقط</SelectItem>
                    <SelectItem value="non-featured">المنتجات غير المميزة فقط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="outline"
                className="md:w-auto"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("all");
                  setFeaturedFilter("all");
                }}
              >
                إعادة ضبط الفلاتر
              </Button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                إجمالي: <span className="font-medium text-foreground">{total}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  السابق
                </Button>
                <div className="text-sm tabular-nums">
                  صفحة {page} من {pages}
                </div>
                <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>
                  التالي
                </Button>
              </div>
            </div>
          </div>
        }
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[110px]">الصورة</TableHead>
              <TableHead>المنتج</TableHead>
              <TableHead className="hidden lg:table-cell">التصنيف</TableHead>
              <TableHead className="w-[170px] text-center">الحالة</TableHead>
              <TableHead className="w-[120px] !text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <AdminTableRowsSkeleton columns={5} rows={7} avatarColumn />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="py-6">
                  <ErrorState
                    variant="admin"
                    title="تعذر تحميل المنتجات"
                    description="يرجى التحقق من الاتصال ثم إعادة المحاولة."
                    onRetry={() => productsQuery.refetch()}
                  />
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-6">
                  <EmptyState variant="admin" title="لا توجد منتجات" description="لا توجد منتجات لعرضها حالياً." />
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const image = product.images?.[0] ? toImageUrl(product.images[0]) : null;
                return (
                  <TableRow key={product.id} className="hover:bg-muted/30">
                    <TableCell>
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="h-16 w-20 rounded-xl object-cover ring-1 ring-black/5"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-16 w-20 rounded-xl bg-muted" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="line-clamp-1">{product.name}</div>
                      <div className="text-xs text-muted-foreground" dir="ltr">
                        {product.slug}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {product.categoryId ? categoryNameById.get(product.categoryId) ?? "—" : "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <Badge variant={product.isAvailable ? "secondary" : "outline"}>
                          {product.isAvailable ? "متاح" : "غير متاح"}
                        </Badge>
                        {product.isFeatured ? <Badge>مميز</Badge> : <Badge variant="outline">عادي</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="!text-left">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(product)} aria-label="تعديل">
                          <Edit2 className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(product.id)} aria-label="حذف">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </AdminTableShell>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEnglishNameError("");
          }
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-4xl p-0">
          <form onSubmit={handleSubmit} className="flex max-h-[90vh] flex-col">
            <div className="flex items-start justify-between gap-4 border-b bg-card/70 px-5 py-4 pl-16 backdrop-blur">
              <div className="min-w-0">
                <DialogTitle className="text-lg font-semibold">
                  {editingId ? "تعديل منتج" : "إضافة منتج"}
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-muted-foreground">
                  نموذج مريح، مع تمرير داخلي وزر حفظ ثابت.
                </DialogDescription>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2 lg:col-span-2">
                  <Label>صور المنتج</Label>
                  <MultiImageUploader
                    value={formData.images ?? []}
                    onChange={(images) => setFormData((p) => ({ ...p, images }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">
                    الاسم بالعربية <span className="text-destructive">*</span>
                  </Label>
                  <Input required id="name" value={formData.name} onChange={handleNameChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameEn">
                    الاسم بالإنجليزية <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nameEn"
                    required
                    value={formData.nameEn || ""}
                    onChange={(e) => handleEnglishNameChange(e.target.value)}
                    dir="ltr"
                    className="text-left"
                  />
                  {englishNameError ? (
                    <p className="text-sm text-destructive">{englishNameError}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      مطلوب لإنشاء رابط المنتج بشكل صحيح.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">
                    التصنيف <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.categoryId?.toString() || ""}
                    onValueChange={(v) => setFormData((p) => ({ ...p, categoryId: parseInt(v) }))}
                  >
                    <SelectTrigger dir="rtl">
                      <SelectValue placeholder="اختر تصنيف..." />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      {categoriesList.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">
                    الرابط الدائم (Slug) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    required
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setFormData((p) => ({ ...p, slug: slugifyEnglish(e.target.value) }));
                    }}
                    dir="ltr"
                    className="text-left"
                  />
                  <p className="text-xs text-muted-foreground">
                    يُولَّد تلقائيًا من الاسم الإنجليزي ويمكن تعديله يدويًا إذا لزم.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">السعر (رقم)</Label>
                  <Input
                    type="number"
                    id="price"
                    value={formData.price ?? ""}
                    onChange={(e) => setFormData((p) => ({ ...p, price: parseFloat(e.target.value) || null }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceText">نص السعر (اختياري)</Label>
                  <Input
                    id="priceText"
                    placeholder="مثال: يبدأ من 500 ر.س"
                    value={formData.priceText || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, priceText: e.target.value }))}
                  />
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="desc">الوصف</Label>
                  <Textarea
                    id="desc"
                    rows={4}
                    value={formData.description || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="specs">المواصفات</Label>
                  <Textarea
                    id="specs"
                    rows={3}
                    value={formData.specs || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, specs: e.target.value }))}
                  />
                </div>

                <div className="lg:col-span-2 rounded-2xl border bg-muted/30 p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Switch
                        id="isAvailable"
                        checked={!!formData.isAvailable}
                        onCheckedChange={(c) => setFormData((p) => ({ ...p, isAvailable: c }))}
                      />
                      <Label htmlFor="isAvailable">متاح للطلب</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        id="isFeatured"
                        checked={!!formData.isFeatured}
                        onCheckedChange={(c) => setFormData((p) => ({ ...p, isFeatured: c }))}
                      />
                      <Label htmlFor="isFeatured">منتج مميز (يظهر في الرئيسية)</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t bg-card/80 px-5 py-4 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending}>
                  {editingId ? "حفظ التعديلات" : "إضافة"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذا المنتج؟</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
