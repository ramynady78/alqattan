import { useEffect, useMemo, useState } from "react";
import {
  useListCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  getListCategoriesQueryKey,
} from "@workspace/api-client-react";
import type { Category, CategoryInput } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Edit2, Plus, Trash2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTableShell } from "@/components/admin/AdminTableShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import { ImageUploader } from "@/components/admin/ImageUploader";
import { toImageUrl } from "@/lib/imageUrl";
import { useDocumentTitle } from "@/lib/seo";
import { AdminTableRowsSkeleton } from "@/components/loading/skeletons/AdminSkeletons";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";

function generateSlug(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-أ-ي]/g, "");
}

export default function CategoriesAdminPage() {
  useDocumentTitle("إدارة التصنيفات");
  const queryClient = useQueryClient();
  const categoriesQuery = useListCategories();
  const { data: categories, isLoading, isError } = categoriesQuery;
  const items = Array.isArray(categories) ? categories : [];

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const q = search.trim();
    if (!q) return items;
    return items.filter((c) => `${c.name} ${c.nameEn ?? ""} ${c.slug}`.toLowerCase().includes(q.toLowerCase()));
  }, [items, search]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState<CategoryInput>({
    name: "",
    nameEn: "",
    slug: "",
    description: "",
    imageUrl: null,
    sortOrder: 0,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: "", nameEn: "", slug: "", description: "", imageUrl: null, sortOrder: 0 });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      nameEn: category.nameEn ?? "",
      slug: category.slug,
      description: category.description ?? "",
      imageUrl: category.imageUrl,
      sortOrder: category.sortOrder,
    });
    setIsFormOpen(true);
  };

  useEffect(() => {
    if (!editingId && formData.name && !formData.slug) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(formData.name) }));
    }
  }, [formData.name, editingId, formData.slug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("يرجى إدخال اسم التصنيف");
      return;
    }
    if (!formData.slug.trim()) {
      toast.error("يرجى إدخال الرابط الدائم (Slug)");
      return;
    }

    if (editingId) {
      updateCategory.mutate(
        { id: editingId, data: formData },
        {
          onSuccess: () => {
            toast.success("تم تحديث التصنيف");
            invalidate();
            setIsFormOpen(false);
          },
          onError: () => toast.error("تعذر تحديث التصنيف"),
        },
      );
      return;
    }

    createCategory.mutate(
      { data: formData },
      {
        onSuccess: () => {
          toast.success("تم إنشاء التصنيف");
          invalidate();
          setIsFormOpen(false);
        },
        onError: () => toast.error("تعذر إنشاء التصنيف"),
      },
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteCategory.mutate(
      { id: deleteId },
      {
        onSuccess: () => {
          toast.success("تم حذف التصنيف");
          invalidate();
          setDeleteId(null);
        },
        onError: () => toast.error("تعذر حذف التصنيف"),
      },
    );
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="التصنيفات"
        description="إدارة تصنيفات المنتجات (الاسم، الصورة، الترتيب، والرابط الدائم)."
        actions={
          <>
            <div className="w-full sm:w-72">
              <Input placeholder="بحث في التصنيفات..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة تصنيف
            </Button>
          </>
        }
      />

      <AdminTableShell>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[110px]">الصورة</TableHead>
              <TableHead>التصنيف</TableHead>
              <TableHead className="hidden lg:table-cell">Slug</TableHead>
              <TableHead className="w-[90px] text-center">الترتيب</TableHead>
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
                    title="تعذر تحميل التصنيفات"
                    description="يرجى التحقق من الاتصال ثم إعادة المحاولة."
                    onRetry={() => categoriesQuery.refetch()}
                  />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-6">
                  <EmptyState variant="admin" title="لا توجد تصنيفات" description="لا توجد تصنيفات مطابقة لنتائج البحث." />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((cat) => (
                <TableRow key={cat.id} className="hover:bg-muted/30">
                  <TableCell>
                    {cat.imageUrl ? (
                      <img
                        src={toImageUrl(cat.imageUrl)}
                        alt={cat.name}
                        className="h-16 w-20 rounded-xl object-cover ring-1 ring-black/5"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-16 w-20 rounded-xl bg-muted" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="line-clamp-1">{cat.name}</div>
                    <div className="text-xs text-muted-foreground">{cat.nameEn || "—"}</div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <code dir="ltr" className="text-xs rounded bg-muted px-2 py-1">
                      {cat.slug}
                    </code>
                  </TableCell>
                  <TableCell className="text-center tabular-nums">{cat.sortOrder}</TableCell>
                  <TableCell className="!text-left">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(cat)} aria-label="تعديل">
                        <Edit2 className="h-4 w-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(cat.id)} aria-label="حذف">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminTableShell>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-3xl p-0">
          <form onSubmit={handleSubmit} className="flex max-h-[90vh] flex-col">
            <div className="flex items-start justify-between gap-4 border-b bg-card/70 px-5 py-4 backdrop-blur">
              <div className="min-w-0">
                <div className="text-lg font-semibold">{editingId ? "تعديل تصنيف" : "إضافة تصنيف"}</div>
                <div className="mt-1 text-sm text-muted-foreground">النافذة لا تتجاوز ارتفاع الشاشة، مع تمرير داخلي.</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>صورة التصنيف</Label>
                  <ImageUploader
                    value={formData.imageUrl || null}
                    onChange={(url) => setFormData((p) => ({ ...p, imageUrl: url }))}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      الاسم بالعربية <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      required
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nameEn">الاسم بالإنجليزية</Label>
                    <Input
                      id="nameEn"
                      value={formData.nameEn || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, nameEn: e.target.value }))}
                      dir="ltr"
                      className="text-right"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">
                    الرابط الدائم (Slug) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    required
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                    dir="ltr"
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortOrder">الترتيب</Label>
                  <Input
                    type="number"
                    id="sortOrder"
                    value={formData.sortOrder || 0}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))
                    }
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
              </div>
            </div>

            <div className="shrink-0 border-t bg-card/80 px-5 py-4 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending}>
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
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا التصنيف؟ سيؤثر ذلك على المنتجات المرتبطة به.
            </AlertDialogDescription>
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
