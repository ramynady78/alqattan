import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PublicPageHero } from "@/components/site/PublicPageHero";

export default function NotFoundPublic() {
  return (
    <div>
      <PublicPageHero
        title="الصفحة غير موجودة"
        subtitle="يبدو أن الرابط الذي تبحث عنه غير متاح حاليًا أو تم نقله."
        breadcrumbs={[
          { label: "الرئيسية", href: "/" },
          { label: "404" },
        ]}
        backgroundImage="https://images.unsplash.com/photo-1519642918688-7e43b19245d8?auto=format&fit=crop&w=2200&q=80"
        align="center"
      />
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 bg-background">
        <h1 className="text-7xl sm:text-9xl font-serif font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">الصفحة غير موجودة</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <Link to="/">
          <Button size="lg" className="font-serif">العودة للرئيسية</Button>
        </Link>
      </div>
    </div>
  );
}
