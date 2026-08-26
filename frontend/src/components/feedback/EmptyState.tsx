import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title = "لا توجد بيانات",
  description = "لا توجد عناصر لعرضها حاليا.",
  icon,
  actionLabel,
  onAction,
  variant = "public",
}: {
  title?: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "public" | "admin";
}) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-3xl border text-center p-10 md:p-12",
        variant === "public" ? "lux-surface lux-outline" : "bg-card",
      )}
    >
      {icon ? (
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl border bg-muted/30 text-primary">
          {icon}
        </div>
      ) : null}
      <p className="text-xl font-serif font-bold">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
      {actionLabel && onAction ? (
        <div className="mt-6">
          <Button variant={variant === "public" ? "outline" : "secondary"} className="rounded-full px-8" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

