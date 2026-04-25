import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  subtitle,
  align = "center",
}: {
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
}) {
  const alignClass =
    align === "center" ? "text-center" : align === "left" ? "text-left" : "text-right";

  const lineClass =
    align === "center" ? "mx-auto" : align === "left" ? "mr-auto" : "ml-auto";

  return (
    <div className={cn("mb-10 md:mb-14", alignClass)}>
      {subtitle && (
        <div className={cn("inline-flex items-center gap-2 text-sm text-primary/90", align === "center" ? "justify-center" : "")}>
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="tracking-[0.18em] uppercase text-[12px]">{subtitle}</span>
        </div>
      )}
      <h2 className="mt-4 text-3xl md:text-4xl font-serif font-bold text-foreground leading-tight">
        {title}
      </h2>
      <div className={cn("mt-6 h-px w-40 lux-divider opacity-70", lineClass)} />
    </div>
  );
}

