import { useState } from "react";
import {
  useListGallery,
  useCreateGalleryItem,
  useUpdateGalleryItem,
  useDeleteGalleryItem,
  getListGalleryQueryKey,
} from "@workspace/api-client-react";
import type { GalleryItem, GalleryInput } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Edit2, Plus, Trash2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTableShell } from "@/components/admin/AdminTableShell";
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
import { MultiImageUploader } from "@/components/admin/MultiImageUploader";
import { toImageUrl } from "@/lib/imageUrl";
import { useDocumentTitle } from "@/lib/seo";
import { AdminTableRowsSkeleton } from "@/components/loading/skeletons/AdminSkeletons";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";

export default function GalleryAdminPage() {
  useDocumentTitle("إدارة المعرض");
  const queryClient = useQueryClient();
  const galleryQuery = useListGallery();
  const { data: gallery, isLoading, isError } = galleryQuery;

  const createItem = useCreateGalleryItem();
  const updateItem = useUpdateGalleryItem();
  const deleteItem = useDeleteGalleryItem();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState<GalleryInput>({
    title: "",
    description: "",
    imageUrl: "",
    images: [],
    sortOrder: 0,
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ title: "", description: "", imageUrl: "", images: [], sortOrder: 0 });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      description: item.description ?? "",
      imageUrl: item.imageUrl,
      images: item.images ?? (item.imageUrl ? [item.imageUrl] : []),
      sortOrder: item.sortOrder,
    });
    setIsFormOpen(true);
  };

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListGalleryQueryKey() });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedImages = formData.images?.filter(Boolean) ?? [];
    if (normalizedImages.length === 0) {
      toast.error("يرجى رفع صورة واحدة على الأقل للمعرض");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("يرجى إدخال عنوان");
      return;
    }
    const payload: GalleryInput = {
      ...formData,
      imageUrl: normalizedImages[0] ?? formData.imageUrl ?? "",
      images: normalizedImages,
    };

    if (editingId) {
      updateItem.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            toast.success("تم حفظ التعديلات بنجاح");
            invalidate();
            setIsFormOpen(false);
          },
          onError: () => toast.error("حدث خطأ، حاول مرة أخرى"),
        },
      );
      return;
    }

    createItem.mutate(
      { data: payload },
      {
        onSuccess: () => {
          toast.success("تمت إضافة الصورة بنجاح");
          invalidate();
          setIsFormOpen(false);
        },
        onError: () => toast.error("حدث خطأ، حاول مرة أخرى"),
      },
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteItem.mutate(
      { id: deleteId },
      {
        onSuccess: () => {
          toast.success("تم حذف الصورة بنجاح");
          invalidate();
          setDeleteId(null);
        },
        onError: () => toast.error("حدث خطأ، حاول مرة أخرى"),
      },
    );
  };

  const items = Array.isArray(gallery) ? gallery : [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="معرض الأعمال"
        description="إدارة صور المعرض والترتيب والعناوين."
        actions={
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة صورة
          </Button>
        }
      />

      <AdminTableShell>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[110px]">الصورة</TableHead>
              <TableHead>العنوان</TableHead>
              <TableHead className="hidden lg:table-cell">الوصف</TableHead>
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
                    title="تعذر تحميل المعرض"
                    description="يرجى التحقق من الاتصال ثم إعادة المحاولة."
                    onRetry={() => galleryQuery.refetch()}
                  />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-6">
                  <EmptyState variant="admin" title="لا توجد عناصر" description="لا توجد عناصر في المعرض حالياً." />
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell>
                    <img
                      src={toImageUrl(item.images?.[0] || item.imageUrl)}
                      alt={item.title}
                      className="h-16 w-20 rounded-xl object-cover ring-1 ring-black/5"
                      loading="lazy"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="line-clamp-1">{item.title}</div>
                    <div className="text-xs text-muted-foreground">#{item.id}</div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    <div className="line-clamp-2 max-w-[520px]">{item.description || "—"}</div>
                  </TableCell>
                  <TableCell className="text-center tabular-nums">{item.sortOrder}</TableCell>
                  <TableCell className="!text-left">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)} aria-label="تعديل">
                        <Edit2 className="h-4 w-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)} aria-label="حذف">
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
                <DialogTitle className="text-lg font-semibold">
                  {editingId ? "تعديل عنصر" : "إضافة عنصر"}
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-muted-foreground">
                  اجعل النموذج مريحاً على جميع الشاشات — المحتوى يتم تمريره داخلياً.
                </DialogDescription>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>
                    الصور <span className="text-destructive">*</span>
                  </Label>
                  <MultiImageUploader
                    value={formData.images ?? []}
                    onChange={(images) =>
                      setFormData((p) => ({ ...p, images, imageUrl: images[0] ?? "" }))
                    }
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      العنوان <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      required
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
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
                    <p className="text-xs text-muted-foreground">
                      يتم ترتيب العناصر تصاعدياً حسب هذا الرقم.
                    </p>
                  </div>
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
                <Button type="submit" disabled={createItem.isPending || updateItem.isPending}>
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
            <AlertDialogDescription>هل أنت متأكد من حذف هذا العنصر من المعرض؟</AlertDialogDescription>
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
