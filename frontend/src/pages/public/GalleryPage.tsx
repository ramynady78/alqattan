import { useListGallery } from "@workspace/api-client-react";
import { SectionHeader } from "@/components/site/SectionHeader";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { Reveal } from "@/components/motion/Reveal";
import { GalleryMasonrySkeleton } from "@/components/loading/skeletons/PublicSkeletons";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PublicPageHero } from "@/components/site/PublicPageHero";
import { staticPageSeo } from "@/seo/pages";
import { usePageSeo } from "@/seo/usePageSeo";
import { STATIC_SEO } from "@/seo/content";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function GalleryPage() {
  const galleryQuery = useListGallery();
  const { data: gallery, isLoading, isError } = galleryQuery;
  usePageSeo(staticPageSeo("gallery"));

  const list = Array.isArray(gallery) ? gallery : [];

  return (
    <div>
      <PublicPageHero
        title={STATIC_SEO.gallery.h1}
        subtitle="كل مشروع له لمسته الخاصة. تصفحوا أعمالنا واستلهموا منها أفكار تناسب طابع مساحتكم."
        breadcrumbs={[
          { label: "الرئيسية", href: "/" },
          { label: "أعمالنا" },
        ]}
        backgroundImage="https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=2200&q=80"
        align="center"
      />

      <div className="lux-section lux-noise">
        <div className="lux-container">
          <Reveal>
            <SectionHeader title="مشاريعنا" subtitle="من التنفيذ" align="center" />
          </Reveal>

          {isLoading ? (
            <GalleryMasonrySkeleton count={6} />
          ) : isError ? (
            <ErrorState
              title="تعذر تحميل المعرض"
              description="يرجى التحقق من الاتصال ثم إعادة المحاولة."
              onRetry={() => galleryQuery.refetch()}
            />
          ) : list.length > 0 ? (
            <Reveal>
              <div className="lux-surface lux-outline rounded-3xl p-4 md:p-6">
                <GalleryGrid items={list} />
              </div>
            </Reveal>
          ) : (
            <EmptyState title="لا توجد صور" description="لا توجد صور في المعرض حاليا." />
          )}
        </div>
      </div>

      <section className="lux-section bg-muted/20">
        <div className="lux-container max-w-3xl text-center">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-4">تفاصيل تصنع الفرق في كل مشروع</h2>
            <p className="text-muted-foreground leading-relaxed">
              كل مساحة لها طابعها، وكل ستارة تنسجم مع الإضاءة والأثاث وذوق أصحاب المكان. نهتم بالتفاصيل عشان تكون النتيجة
              متماسكة ومريحة للعين.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="lux-section bg-card border-t">
        <div className="lux-container text-center">
          <Reveal>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
              استلهموا من أعمالنا وخلوا تصميم ستائركم القادم يعكس طابع مساحتكم. تواصلوا معنا للبدء.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/products">
                <Button size="lg" className="rounded-full px-8">
                  تصفحوا التصاميم
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="rounded-full px-8">
                  تواصلوا معنا
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
