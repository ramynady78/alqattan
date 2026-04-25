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
    <CardShell>
      <Skeleton className="h-[260px] sm:h-[280px] lg:h-[300px] rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4 rounded-full" />
        <Skeleton className="h-4 w-1/2 rounded-full" />
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-10 flex-1 rounded-full" />
          <Skeleton className="h-10 w-12 rounded-full" />
        </div>
      </div>
    </CardShell>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <CardShell>
      <Skeleton className="aspect-square rounded-none" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-6 w-2/3 rounded-full" />
        <Skeleton className="h-4 w-4/5 rounded-full" />
      </div>
    </CardShell>
  );
}

export function CategoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
