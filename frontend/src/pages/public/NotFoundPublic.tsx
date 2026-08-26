import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { PublicPageHero } from "@/components/site/PublicPageHero";
import { staticPageSeo } from "@/seo/pages";
import { usePageSeo } from "@/seo/usePageSeo";
import { STATIC_SEO } from "@/seo/content";

export default function NotFoundPublic() {
  const { pathname } = useLocation();
  usePageSeo({ ...staticPageSeo("notFound"), path: pathname });

  return (
    <div>
      <PublicPageHero
        title={STATIC_SEO.notFound.h1}
        subtitle="يبدو أن الرابط الذي تبحثون عنه غير متاح حاليا أو تم نقله."
        breadcrumbs={[
          { label: "الرئيسية", href: "/" },
          { label: "404" },
        ]}
        backgroundImage="https://images.unsplash.com/photo-1519642918688-7e43b19245d8?auto=format&fit=crop&w=2200&q=80"
        align="center"
      />
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 bg-background">
        <p className="text-7xl sm:text-9xl font-serif font-bold text-primary mb-4">404</p>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">عودوا لتصفح ستائرنا العصرية</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          عذرا، الصفحة التي تبحثون عنها غير موجودة أو تم نقلها. تصفحوا المنتجات أو تواصلوا معنا لطلب ستائركم.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link to="/">
            <Button size="lg" className="font-serif rounded-full">العودة للرئيسية</Button>
          </Link>
          <Link to="/products">
            <Button size="lg" variant="outline" className="font-serif rounded-full">اختاروا من تصاميمنا</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
