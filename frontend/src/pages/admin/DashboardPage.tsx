import { useMemo } from "react";
import { useGetAdminStats, useListInquiries } from "@workspace/api-client-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/lib/seo";
import { BarChart3, Boxes, Image as ImageIcon, MessageSquareText, Star } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import {
  ResponsiveContainer,
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MonthBucket = { key: string; label: string; orders: number };

const STATUS_LABEL: Record<string, string> = {
  new: "جديد",
  contacted: "تم التواصل",
  closed: "مغلق",
};

const STATUS_FILL: Record<string, string> = {
  new: "hsl(var(--primary))",
  contacted: "hsl(var(--secondary))",
  closed: "hsl(var(--muted-foreground))",
};

function formatMonthLabel(date: Date) {
  const fmt = new Intl.DateTimeFormat("ar-SA", { month: "short", year: "2-digit" });
  return fmt.format(date);
}

function buildMonthBuckets(monthsBack: number): MonthBucket[] {
  const now = new Date();
  const buckets: MonthBucket[] = [];
  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.push({ key, label: formatMonthLabel(d), orders: 0 });
  }
  return buckets;
}

export default function DashboardPage() {
  useDocumentTitle("لوحة التحكم");
  const statsQuery = useGetAdminStats();
  const inquiriesQuery = useListInquiries();
  const { data: stats, isLoading: statsLoading, isError: statsError } = statsQuery;
  const { data: inquiries, isLoading: inquiriesLoading, isError: inquiriesError } = inquiriesQuery;

  const {
    monthlyOrders,
    statusSummary,
    topProducts,
    latestOrders,
    mostRequested,
  } = useMemo(() => {
    const all = Array.isArray(inquiries) ? inquiries : [];
    const monthBuckets = buildMonthBuckets(6);
    const byKey = new Map(monthBuckets.map((b) => [b.key, b]));
    const statusCounts = new Map<string, number>();
    const productCounts = new Map<string, { name: string; qty: number }>();

    for (const inquiry of all) {
      const created = new Date(inquiry.createdAt);
      const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`;
      const bucket = byKey.get(key);
      if (bucket) bucket.orders += 1;

      statusCounts.set(inquiry.status, (statusCounts.get(inquiry.status) ?? 0) + 1);

      if (Array.isArray(inquiry.items)) {
        for (const item of inquiry.items) {
          const k = String(item.productId);
          const prev = productCounts.get(k);
          const qty = (prev?.qty ?? 0) + (item.quantity ?? 1);
          productCounts.set(k, { name: item.productName, qty });
        }
      }
    }

    const statusData = Array.from(statusCounts.entries()).map(([status, count]) => ({
      status,
      label: STATUS_LABEL[status] ?? status,
      count,
    }));

    const top = Array.from(productCounts.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8)
      .map((p) => ({ name: p.name, qty: p.qty }));

    const latest = all
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);

    const most = top[0] ?? null;

    return {
      monthlyOrders: monthBuckets,
      statusSummary: statusData,
      topProducts: top,
      latestOrders: latest,
      mostRequested: most,
    };
  }, [inquiries]);

  const isLoading = statsLoading || inquiriesLoading;
  const isError = statsError || inquiriesError;

  if (isError) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="نظرة عامة"
          description="متابعة سريعة لأهم مؤشرات لوحة الإدارة."
        />
        <ErrorState
          variant="admin"
          title="تعذر تحميل بيانات لوحة التحكم"
          description="يرجى التحقق من الاتصال ثم إعادة المحاولة."
          onRetry={() => {
            statsQuery.refetch();
            inquiriesQuery.refetch();
          }}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="نظرة عامة" description="متابعة سريعة لأهم مؤشرات لوحة الإدارة." />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Skeleton className="h-[360px] rounded-xl xl:col-span-2" />
          <Skeleton className="h-[360px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="نظرة عامة"
          description="متابعة سريعة لأهم مؤشرات لوحة الإدارة."
        />
        <EmptyState variant="admin" title="لا توجد بيانات" description="لا توجد بيانات كافية لعرض الإحصاءات حالياً." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="نظرة عامة"
        description="إحصاءات وملخصات تساعدك على متابعة الطلبات والمحتوى بسهولة."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="إجمالي الطلبات" value={stats.inquiriesCount} icon={<MessageSquareText />} />
        <StatCard
          title="طلبات جديدة"
          value={stats.newInquiriesCount}
          icon={<BarChart3 />}
          description={stats.newInquiriesCount > 0 ? "هناك طلبات تحتاج متابعة." : "لا توجد طلبات جديدة حالياً."}
          trend={stats.newInquiriesCount > 0 ? "up" : "neutral"}
        />
        <StatCard title="إجمالي المنتجات" value={stats.productsCount} icon={<Boxes />} />
        <StatCard title="معرض الأعمال" value={stats.galleryCount} icon={<ImageIcon />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base">الطلبات حسب الأشهر</CardTitle>
              <p className="text-sm text-muted-foreground">آخر 6 أشهر</p>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3.5 w-3.5 text-primary" />
              {mostRequested ? `الأكثر طلباً: ${mostRequested.name}` : "—"}
            </Badge>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyOrders} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="label" tickMargin={8} />
                <YAxis allowDecimals={false} width={36} />
                <Tooltip
                  formatter={(value: unknown) => [value as number, "الطلبات"]}
                  labelFormatter={(label) => `الشهر: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#ordersFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">ملخص الحالات</CardTitle>
            <p className="text-sm text-muted-foreground">توزيع الطلبات حسب الحالة</p>
          </CardHeader>
          <CardContent className="h-[320px]">
            {statusSummary.length === 0 ? (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">لا توجد بيانات كافية</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip formatter={(value: unknown) => [value as number, "الطلبات"]} />
                  <Legend verticalAlign="bottom" height={36} />
                  <Pie
                    data={statusSummary}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {statusSummary.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_FILL[entry.status] ?? "hsl(var(--primary))"} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">أكثر المنتجات طلباً</CardTitle>
            <p className="text-sm text-muted-foreground">مستخلص من عناصر الطلبات</p>
          </CardHeader>
          <CardContent className="h-[320px]">
            {topProducts.length === 0 ? (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">لا توجد بيانات كافية</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} margin={{ left: 8, right: 16, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="name" tick={false} />
                  <YAxis allowDecimals={false} width={36} />
                  <Tooltip formatter={(value: unknown) => [value as number, "الكمية"]} />
                  <Bar dataKey="qty" fill="hsl(var(--primary))" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">أحدث الطلبات</CardTitle>
            <p className="text-sm text-muted-foreground">آخر {latestOrders.length} طلب</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestOrders.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">لا توجد طلبات حتى الآن</div>
            ) : (
              latestOrders.map((inquiry) => (
                <div key={inquiry.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{inquiry.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(inquiry.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" })}
                    </div>
                  </div>
                  <Badge variant={inquiry.status === "new" ? "default" : "secondary"}>
                    {STATUS_LABEL[inquiry.status] ?? inquiry.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
