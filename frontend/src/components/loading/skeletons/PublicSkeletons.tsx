import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function CardShell({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-3xl overflow-hidden lux-surface lux-outline border border-border/60",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <CardShell className="h-full flex flex-col">
      <Skeleton className="aspect-[4/5] w-full rounded-none shrink-0" />
      <div className="p-2.5 sm:p-5 space-y-2 flex-1">
        <Skeleton className="h-4 w-3/4 rounded-full" />
        <Skeleton className="h-3.5 w-1/2 rounded-full" />
      </div>
    </CardShell>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="lux-product-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <CardShell className="relative h-full">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 md:p-6 space-y-2">
        <Skeleton className="h-4 sm:h-5 w-2/3 rounded-full" />
        <Skeleton className="h-3 w-4/5 rounded-full hidden sm:block" />
      </div>
    </CardShell>
  );
}

export function CategoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="lux-category-grid">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function GalleryMasonrySkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("w-full rounded-3xl", i % 3 === 0 ? "h-80" : i % 2 === 0 ? "h-64" : "h-96")}
        />
      ))}
    </div>
  );
}
