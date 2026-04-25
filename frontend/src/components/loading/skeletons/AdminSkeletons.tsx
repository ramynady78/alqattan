import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AdminTableRowsSkeleton({
  columns,
  rows = 8,
  avatarColumn = false,
}: {
  columns: number;
  rows?: number;
  avatarColumn?: boolean;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={r}>
          {Array.from({ length: columns }).map((_, c) => (
            <TableCell key={c}>
              {avatarColumn && c === 0 ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28 rounded-full" />
                    <Skeleton className="h-3 w-20 rounded-full" />
                  </div>
                </div>
              ) : (
                <Skeleton className="h-4 w-[70%] rounded-full" />
              )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function AdminSettingsSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <Card className="xl:col-span-2">
        <CardHeader>
          <Skeleton className="h-5 w-40 rounded-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={i === 3 ? "md:col-span-2 space-y-2" : "space-y-2"}>
                <Skeleton className="h-4 w-36 rounded-full" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36 rounded-full" />
        </CardHeader>
        <CardContent className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

