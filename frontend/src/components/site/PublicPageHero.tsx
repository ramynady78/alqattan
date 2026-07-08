import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PublicPageHeroProps = {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  backgroundImage?: string;
  align?: "center" | "right";
  className?: string;
};

const fallbackBackground =
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2200&q=80";

export function PublicPageHero({
  title,
  subtitle,
  breadcrumbs = [{ label: "الرئيسية", href: "/" }],
  backgroundImage = fallbackBackground,
  align = "center",
  className,
}: PublicPageHeroProps) {
  const centered = align === "center";

  return (
    <section className={cn("relative overflow-hidden border-b", className)}>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,17,12,0.72),rgba(22,17,12,0.52),rgba(250,246,240,0.92))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(184,150,90,0.42),transparent_40%),radial-gradient(circle_at_82%_28%,rgba(107,124,90,0.28),transparent_34%)]" />

      <div className="lux-container relative py-12 sm:py-16 md:py-20">
        <div
          className={cn(
            "mx-auto max-w-5xl",
            centered ? "text-center" : "text-right",
          )}
        >
          <div
            className={cn(
              "mb-5 flex flex-wrap items-center gap-2 text-sm text-white/82",
              centered ? "justify-center" : "justify-start",
            )}
          >
            {breadcrumbs.map((item, index) => (
              <div key={`${item.label}-${index}`} className="flex items-center gap-2">
                {item.href ? (
                  <Link to={item.href} className="transition-colors hover:text-white">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-white font-medium">{item.label}</span>
                )}
                {index < breadcrumbs.length - 1 ? (
                  <ChevronLeft className="h-4 w-4 text-white/60" />
                ) : null}
              </div>
            ))}
          </div>

          <div className="rounded-[2rem] border border-white/12 bg-white/10 px-5 py-7 shadow-[0_24px_70px_rgba(17,12,7,0.18)] sm:px-8 sm:py-9 md:px-10">
            <p className="mb-3 text-sm font-medium tracking-[0.2em] text-white/72">
              الستائر العصرية
            </p>
            <h1 className="text-3xl font-bold leading-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:text-4xl md:text-5xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-white/88 sm:text-base md:text-lg">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
