import { useMemo, useState } from "react";
import {
  useListInquiries,
  useUpdateInquiry,
  useDeleteInquiry,
  getListInquiriesQueryKey,
} from "@workspace/api-client-react";
import type { Inquiry, InquiryUpdateStatus } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, Search, Trash2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTableShell } from "@/components/admin/AdminTableShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import { useDocumentTitle } from "@/lib/seo";
import { AdminTableRowsSkeleton } from "@/components/loading/skeletons/AdminSkeletons";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";

const STATUS_LABEL: Record<string, string> = {
  new: "جديد",
  contacted: "تم التواصل",
  closed: "مغلق",
};

function statusBadgeVariant(status: string) {
  if (status === "new") return "default";
  if (status === "contacted") return "secondary";
  return "outline";
}

export default function InquiriesAdminPage() {
  useDocumentTitle("إدارة الطلبات");
  const queryClient = useQueryClient();

  const inquiriesQuery = useListInquiries();
  const { data: inquiries, isLoading, isError } = inquiriesQuery;
  const updateInquiry = useUpdateInquiry();
  const deleteInquiry = useDeleteInquiry();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const [viewInquiry, setViewInquiry] = useState<Inquiry | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const items = Array.isArray(inquiries) ? inquiries : [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (!q) return true;
      return `${i.id} ${i.name} ${i.phone} ${i.email ?? ""}`.toLowerCase().includes(q);
    });
  }, [items, search, statusFilter]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListInquiriesQueryKey() });

  const handleStatusChange = (id: number, status: InquiryUpdateStatus) => {
    updateInquiry.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          toast.success("تم تحديث حالة الطلب");
          invalidate();
          if (viewInquiry && viewInquiry.id === id) setViewInquiry({ ...viewInquiry, status });
        },
        onError: () => toast.error("تعذر تحديث حالة الطلب"),
      },
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteInquiry.mutate(
      { id: deleteId },
      {
        onSuccess: () => {
          toast.success("تم حذف الطلب");
          invalidate();
          setDeleteId(null);
          setViewInquiry(null);
        },
        onError: () => toast.error("تعذر حذف الطلب"),
      },
    );
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="الطلبات"
        description="إدارة طلبات العملاء وتحديث الحالة والمتابعة."
        actions={
          <>
            <div className="w-full sm:w-60">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger dir="rtl">
                  <SelectValue placeholder="تصفية حسب الحالة" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="new">جديد</SelectItem>
                  <SelectItem value="contacted">تم التواصل</SelectItem>
                  <SelectItem value="closed">مغلق</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="بحث بالاسم/الجوال/الرقم..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10" />
            </div>
          </>
        }
      />

      <AdminTableShell>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[90px]">الرقم</TableHead>
              <TableHead>العميل</TableHead>
              <TableHead className="hidden lg:table-cell">الجوال</TableHead>
              <TableHead className="hidden xl:table-cell">التاريخ</TableHead>
              <TableHead className="w-[170px] text-center">الحالة</TableHead>
              <TableHead className="w-[120px] !text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <AdminTableRowsSkeleton columns={6} rows={8} />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="py-6">
                  <ErrorState
                    variant="admin"
                    title="تعذر تحميل الطلبات"
                    description="يرجى التحقق من الاتصال ثم إعادة المحاولة."
                    onRetry={() => inquiriesQuery.refetch()}
                  />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-6">
                  <EmptyState variant="admin" title="لا توجد طلبات" description="لا توجد طلبات مطابقة لنتائج البحث/التصفية." />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((inquiry) => (
                <TableRow key={inquiry.id} className="hover:bg-muted/30">
                  <TableCell className="tabular-nums">#{inquiry.id}</TableCell>
                  <TableCell className="font-medium">
                    <div className="line-clamp-1">{inquiry.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{inquiry.email || "—"}</div>
                  </TableCell>
                  <TableCell dir="ltr" className="hidden lg:table-cell text-right tabular-nums">
                    {inquiry.phone}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {new Date(inquiry.createdAt).toLocaleString("ar-SA")}
                  </TableCell>
                  <TableCell className="text-center">
                    <Select value={inquiry.status} onValueChange={(v: InquiryUpdateStatus) => handleStatusChange(inquiry.id, v)}>
                      <SelectTrigger className="h-9 justify-center border-0 bg-muted/60 text-sm" dir="rtl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent dir="rtl">
                        <SelectItem value="new">جديد</SelectItem>
                        <SelectItem value="contacted">تم التواصل</SelectItem>
                        <SelectItem value="closed">مغلق</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="!text-left">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="ghost" size="icon" onClick={() => setViewInquiry(inquiry)} aria-label="عرض">
                        <Eye className="h-4 w-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(inquiry.id)} aria-label="حذف">
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

      <Dialog open={!!viewInquiry} onOpenChange={(open) => !open && setViewInquiry(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-4xl p-0">
          {viewInquiry ? (
            <div className="flex max-h-[90vh] flex-col">
              <div className="border-b bg-card/70 px-5 py-4 backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-lg font-semibold">تفاصيل الطلب #{viewInquiry.id}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {new Date(viewInquiry.createdAt).toLocaleString("ar-SA")}
                    </div>
                  </div>
                  <Badge variant={statusBadgeVariant(viewInquiry.status)}>
                    {STATUS_LABEL[viewInquiry.status] ?? viewInquiry.status}
                  </Badge>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border bg-muted/20 p-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">الاسم</div>
                    <div className="font-medium">{viewInquiry.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">الجوال</div>
                    <a className="font-medium underline underline-offset-4" href={`tel:${viewInquiry.phone}`} dir="ltr">
                      {viewInquiry.phone}
                    </a>
                  </div>
                  {viewInquiry.email ? (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">البريد الإلكتروني</div>
                      <a className="font-medium underline underline-offset-4" href={`mailto:${viewInquiry.email}`} dir="ltr">
                        {viewInquiry.email}
                      </a>
                    </div>
                  ) : null}
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">الحالة</div>
                    <Select
                      value={viewInquiry.status}
                      onValueChange={(v: InquiryUpdateStatus) => handleStatusChange(viewInquiry.id, v)}
                    >
                      <SelectTrigger dir="rtl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent dir="rtl">
                        <SelectItem value="new">جديد</SelectItem>
                        <SelectItem value="contacted">تم التواصل</SelectItem>
                        <SelectItem value="closed">مغلق</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {viewInquiry.message ? (
                  <div>
                    <h4 className="font-semibold mb-2">الرسالة</h4>
                    <div className="rounded-2xl border bg-card p-4 text-sm leading-relaxed whitespace-pre-wrap">
                      {viewInquiry.message}
                    </div>
                  </div>
                ) : null}

                <div>
                  <h4 className="font-semibold mb-2">المنتجات المطلوبة</h4>
                  {viewInquiry.items && viewInquiry.items.length > 0 ? (
                    <div className="rounded-2xl border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40">
                            <TableHead>المنتج</TableHead>
                            <TableHead className="w-24 text-center">الكمية</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {viewInquiry.items.map((item) => (
                            <TableRow key={item.productId}>
                              <TableCell className="font-medium">{item.productName}</TableCell>
                              <TableCell className="text-center tabular-nums">{item.quantity}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                      لا توجد عناصر ضمن الطلب.
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 border-t bg-card/80 px-5 py-4 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <Button variant="outline" onClick={() => setViewInquiry(null)}>
                    إغلاق
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setDeleteId(viewInquiry.id);
                    }}
                  >
                    حذف الطلب
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذا الطلب نهائياً؟</AlertDialogDescription>
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
