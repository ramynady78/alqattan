import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, PhoneCall, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/lib/inquiryCart";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SITE_NAME_AR, SITE_TAGLINE } from "@/config/site";

export function PublicHeader() {
  const { pathname } = useLocation();
  const { count } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: "الرئيسية" },
    { href: "/categories", label: "التصنيفات" },
    { href: "/products", label: "المنتجات" },
    { href: "/gallery", label: "أعمالنا" },
    { href: "/about", label: "من نحن" },
    { href: "/contact", label: "تواصل معنا" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full shrink-0 border-b border-border/80 bg-background/95 shadow-sm backdrop-blur">
      <div className="lux-container h-14 sm:h-16 md:h-[74px] flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden shrink-0" aria-label="فتح القائمة">
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100vw-1rem,320px)] sm:w-[400px]">
              <SheetHeader className="sr-only">
                <SheetTitle>القائمة الرئيسية</SheetTitle>
                <SheetDescription>روابط التنقل الرئيسية وخيارات التواصل في نسخة الجوال.</SheetDescription>
              </SheetHeader>
              <div className="mt-6 rounded-2xl border bg-card p-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo-curtain.png"
                    alt={SITE_NAME_AR}
                    className="h-9 w-9 object-contain mix-blend-multiply"
                    loading="eager"
                  />
                  <div className="text-lg font-serif font-bold text-primary">{SITE_NAME_AR}</div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">{SITE_TAGLINE}</div>
              </div>

              <nav className="flex flex-col gap-1 mt-6">
                {links.map((link) => (
                  <Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)}>
                    <span
                      className={cn(
                        "block rounded-xl px-3 py-2.5 text-base font-medium transition-colors hover:text-primary hover:bg-muted/50",
                        pathname === link.href ? "text-primary bg-muted/40" : "text-muted-foreground",
                      )}
                    >
                      {link.label}
                    </span>
                  </Link>
                ))}
              </nav>

              <div className="mt-6 grid gap-2">
                <Link to="/contact" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full rounded-full">اطلب استشارة</Button>
                </Link>
                <Link to="/inquiry" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full rounded-full">
                    ابدأ الاستفسار
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/" className="min-w-0">
            <span className="cursor-pointer select-none flex items-center gap-3 min-w-0">
              <img
                src="/logo-curtain.png"
                alt={SITE_NAME_AR}
                className="h-9 w-9 md:h-11 md:w-11 object-contain mix-blend-multiply shrink-0"
                loading="eager"
              />
              <span className="block min-w-0">
                <span className="block text-base sm:text-xl md:text-2xl font-serif font-bold text-primary leading-tight truncate">
                  {SITE_NAME_AR}
                </span>
              </span>
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1 rounded-full border bg-card/70 backdrop-blur px-2 py-1 lux-outline shrink-0">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} to={link.href}>
                <span
                  className={cn(
                    "relative px-3 py-2 text-sm font-medium transition-colors cursor-pointer rounded-full",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-muted"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
          <Link to="/contact">
            <Button variant="outline" className="hidden md:inline-flex rounded-full">
              <PhoneCall className="ml-2 h-4 w-4" />
              اطلب استشارة
            </Button>
          </Link>
          <Link to="/inquiry">
            <Button variant="ghost" size="icon" className="relative cursor-pointer">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute top-1 left-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
