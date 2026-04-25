import { Link, useLocation } from "react-router-dom";
import { Menu, PhoneCall, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/lib/inquiryCart";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const { pathname } = useLocation();
  const { count } = useCart();

  const links = [
    { href: "/", label: "الرئيسية" },
    { href: "/categories", label: "التصنيفات" },
    { href: "/products", label: "المنتجات" },
    { href: "/gallery", label: "أعمالنا" },
    { href: "/about", label: "من نحن" },
    { href: "/contact", label: "تواصل معنا" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="lux-container h-16 md:h-[74px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">القائمة</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="mt-6 rounded-2xl border bg-card p-4">
                <div className="text-lg font-serif font-bold text-primary">القطّان</div>
                <div className="text-sm text-muted-foreground mt-1">ستائر • أثاث • تنفيذ راقٍ</div>
              </div>

              <nav className="flex flex-col gap-2 mt-6">
                {links.map((link) => (
                  <Link key={link.href} to={link.href}>
                    <span
                      className={cn(
                        "rounded-xl px-3 py-2 text-base font-medium transition-colors hover:text-primary hover:bg-muted/50",
                        pathname === link.href ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {link.label}
                    </span>
                  </Link>
                ))}
              </nav>

              <div className="mt-6 grid gap-2">
                <Link to="/contact">
                  <Button className="w-full rounded-full">اطلب استشارة</Button>
                </Link>
                <Link to="/inquiry">
                  <Button variant="outline" className="w-full rounded-full">
                    ابدأ الاستفسار
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/">
            <span className="cursor-pointer select-none">
              <span className="block text-[15px] md:text-base tracking-wide text-muted-foreground">
                Al Qattan
              </span>
              <span className="block text-xl md:text-2xl font-serif font-bold text-primary leading-tight">
                القطّان للستائر
              </span>
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1 rounded-full border bg-card/70 backdrop-blur px-2 py-1 lux-outline">
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

        <div className="flex items-center gap-2 md:gap-3">
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
