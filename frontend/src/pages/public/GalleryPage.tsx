import { useListGallery } from "@workspace/api-client-react";
import { SectionHeader } from "@/components/site/SectionHeader";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { useDocumentTitle } from "@/lib/seo";
import { Reveal } from "@/components/motion/Reveal";
import { GalleryMasonrySkeleton } from "@/components/loading/skeletons/PublicSkeletons";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";

export default function GalleryPage() {
  const galleryQuery = useListGallery();
  const { data: gallery, isLoading, isError } = galleryQuery;
  useDocumentTitle("أعمالنا");

  const list = Array.isArray(gallery) ? gallery : [];

  return (
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
  );
}
