import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({ title, value, icon, description, trend }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
          <div className="h-4 w-4">{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-3">
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          {trend ? (
            <span
              className={cn(
                "rounded-full px-2 py-1 text-[11px] font-medium",
                trend === "up" && "bg-emerald-500/10 text-emerald-600",
                trend === "down" && "bg-rose-500/10 text-rose-600",
                trend === "neutral" && "bg-muted text-muted-foreground",
              )}
            >
              {trend === "up" ? "تصاعد" : trend === "down" ? "تراجع" : "ثابت"}
            </span>
          ) : null}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
