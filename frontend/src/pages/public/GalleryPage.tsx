import { useListGallery } from "@workspace/api-client-react";
import { SectionHeader } from "@/components/site/SectionHeader";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { useDocumentTitle } from "@/lib/seo";
import { Reveal } from "@/components/motion/Reveal";
import { GalleryMasonrySkeleton } from "@/components/loading/skeletons/PublicSkeletons";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PublicPageHero } from "@/components/site/PublicPageHero";

export default function GalleryPage() {
  const galleryQuery = useListGallery();
  const { data: gallery, isLoading, isError } = galleryQuery;
  useDocumentTitle("أعمالنا");

  const list = Array.isArray(gallery) ? gallery : [];

  return (
    <div>
      <PublicPageHero
        title="معرض أعمالنا"
        subtitle="لقطات مختارة من أعمالنا لتستلهم منها تنسيق الستائر والخامات داخل مساحتك."
        breadcrumbs={[
          { label: "الرئيسية", href: "/" },
          { label: "معرض الأعمال" },
        ]}
        backgroundImage="https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=2200&q=80"
        align="center"
      />

      <div className="lux-section lux-noise">
        <div className="lux-container">
          <Reveal>
            <SectionHeader title="معرض أعمالنا" subtitle="إلهام وتصاميم" align="center" />
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
            <EmptyState title="لا توجد صور" description="لا توجد صور في المعرض حالياً." />
          )}
        </div>
      </div>
    </div>
  );
}
