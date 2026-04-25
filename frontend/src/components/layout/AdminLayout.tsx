import { ReactNode, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  List,
  Package,
  Image as ImageIcon,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
} from "lucide-react";
import {
  getGetCurrentAdminQueryKey,
  useGetCurrentAdmin,
  useAdminLogout,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/categories", label: "التصنيفات", icon: List },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/gallery", label: "المعرض", icon: ImageIcon },
  { href: "/admin/inquiries", label: "الطلبات", icon: MessageSquare },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
];

function getActiveItem(pathname: string) {
  return (
    navItems.find((i) => i.href === pathname) ??
    navItems.find((i) => pathname.startsWith(i.href + "/")) ??
    navItems[0]
  );
}

function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link key={item.href} to={item.href} onClick={onNavigate}>
            <span
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium cursor-pointer transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              <span className="truncate">{item.label}</span>
              {isActive ? (
                <span className="absolute inset-y-2 right-2 w-1 rounded-full bg-primary" />
              ) : null}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const active = useMemo(() => getActiveItem(pathname), [pathname]);
  const activeTitle = active?.label ?? "لوحة الإدارة";

  const { data: admin } = useGetCurrentAdmin();
  const logout = useAdminLogout();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.removeQueries({ queryKey: getGetCurrentAdminQueryKey() });
        navigate("/admin/login");
      },
    });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-muted/30 text-right">
      {/* Desktop: fixed sidebar on the RIGHT */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:z-40 lg:flex lg:w-72 lg:flex-col lg:border-l lg:bg-card/80 lg:backdrop-blur supports-[backdrop-filter]:lg:bg-card/70">
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <div className="flex flex-col">
            <span className="font-serif font-bold text-primary text-xl leading-none">
              لوحة الإدارة
            </span>
            <span className="text-xs text-muted-foreground mt-1">إدارة الموقع</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <AdminNav />
        </div>

        <div className="border-t p-4">
          <Button variant="outline" className="w-full justify-between" onClick={handleLogout}>
            <span className="flex items-center gap-2">
              <LogOut className="h-4 w-4 text-destructive" />
              تسجيل الخروج
            </span>
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </aside>

      {/* Content area */}
      <div className="lg:pr-72">
        <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden" aria-label="فتح القائمة">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0" dir="rtl">
                  <div className="flex h-16 items-center px-4 border-b">
                    <div className="flex flex-col">
                      <span className="font-serif font-bold text-primary text-xl leading-none">
                        لوحة الإدارة
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">إدارة الموقع</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <AdminNav onNavigate={() => setMobileOpen(false)} />
                  </div>

                  <div className="border-t p-4">
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <LogOut className="h-4 w-4 text-destructive" />
                        تسجيل الخروج
                      </span>
                      <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">لوحة الإدارة</div>
                <h1 className="truncate text-lg font-semibold leading-none">{activeTitle}</h1>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-xs text-muted-foreground">مرحباً</span>
                <span className="text-sm font-medium">{admin?.name ?? "—"}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="تسجيل الخروج">
                <LogOut className="h-5 w-5 text-destructive" />
              </Button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 md:px-6">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
