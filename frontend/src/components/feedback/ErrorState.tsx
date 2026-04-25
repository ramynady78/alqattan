import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "حدث خطأ",
  description = "تعذر تحميل البيانات. يرجى المحاولة مرة أخرى.",
  icon,
  retryLabel = "إعادة المحاولة",
  onRetry,
  variant = "public",
}: {
  title?: string;
  description?: string;
  icon?: ReactNode;
  retryLabel?: string;
  onRetry?: () => void;
  variant?: "public" | "admin";
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border text-center p-10 md:p-12",
        variant === "public" ? "lux-surface lux-outline" : "bg-card",
      )}
    >
      {icon ? (
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl border bg-destructive/10 text-destructive">
          {icon}
        </div>
      ) : null}
      <h3 className="text-xl font-serif font-bold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
      {onRetry ? (
        <div className="mt-6">
          <Button variant={variant === "public" ? "outline" : "secondary"} className="rounded-full px-8" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

