import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useListGallery } from "@workspace/api-client-react";
import { Reveal } from "@/components/motion/Reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/site/SectionHeader";
import { ImagePlaceholder } from "@/components/site/ImagePlaceholder";
import { toImageUrl } from "@/lib/imageUrl";
import { useDocumentTitle } from "@/lib/seo";

function getGallerySlugLike(entry: {
  id: number;
  title: string;
  slug?: string | null;
}) {
  const rawSlug = entry.slug?.trim();
  if (rawSlug) return rawSlug;
  return entry.title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export default function GalleryDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const galleryQuery = useListGallery();
  const { data: gallery, isLoading, isError } = galleryQuery;

  const item = useMemo(() => {
    if (!Array.isArray(gallery)) return null;
    return (
      gallery.find((entry) => {
        const slugLike = getGallerySlugLike(entry as typeof entry & { slug?: string | null });
        return (
          (entry as typeof entry & { slug?: string | null }).slug === slug ||
          slugLike === slug ||
          String(entry.id) === String(slug)
        );
      }) ?? null
    );
  }, [gallery, slug]);

  const images = useMemo(() => {
    if (!item) return [];
    const normalized = item.images?.filter(Boolean) ?? [];
    if (normalized.length > 0) return normalized;
    return item.imageUrl ? [item.imageUrl] : [];
  }, [item]);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? null;

  useEffect(() => {
    setActiveIndex(0);
  }, [slug]);

  useDocumentTitle(item?.title || "تفاصيل العمل");

  if (isLoading) {
    return (
      <div className="lux-section lux-noise">
        <div className="lux-container">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Skeleton className="aspect-[4/3] rounded-3xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-2/3 rounded-full" />
              <Skeleton className="h-28 w-full rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="lux-section lux-noise">
        <div className="lux-container text-center py-20">
          <Reveal>
            <h2 className="text-2xl font-serif mb-4">العنصر غير موجود</h2>
            <p className="text-muted-foreground mb-8">تعذر العثور على العمل المطلوب داخل المعرض.</p>
            <Button variant="outline" className="rounded-full px-8" onClick={() => window.history.back()}>
              العودة
            </Button>
          </Reveal>
        </div>
      </div>
    );
  }

  return (
    <div className="lux-section lux-noise">
      <div className="lux-container">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10 items-start">
          <Reveal>
            <div className="space-y-4">
              <div className="overflow-hidden rounded-3xl border bg-muted lux-outline">
                <div className="aspect-[4/3]">
                  {activeImage ? (
                    <img
                      src={toImageUrl(activeImage)}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImagePlaceholder />
                  )}
                </div>
              </div>

              {images.length > 1 ? (
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                  {images.map((image, index) => {
                    const isActive = index === activeIndex;
                    return (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className={`aspect-square overflow-hidden rounded-2xl border transition ${
                          isActive ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"
                        }`}
                        aria-label={`صورة ${index + 1}`}
                      >
                        <img src={toImageUrl(image)} alt="" className="h-full w-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="rounded-3xl lux-surface lux-outline p-6 sm:p-8">
              <Badge variant="outline" className="mb-4 rounded-full px-4 py-1 text-sm">
                معرض الأعمال
              </Badge>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold leading-tight">
                {item.title}
              </h1>
              {item.description ? (
                <p className="mt-5 text-base leading-8 text-muted-foreground whitespace-pre-wrap">
                  {item.description}
                </p>
              ) : (
                <p className="mt-5 text-base leading-8 text-muted-foreground">
                  لا يوجد وصف إضافي لهذا العمل حالياً.
                </p>
              )}
            </div>
          </Reveal>
        </div>

        {images.length > 1 ? (
          <div className="mt-16 border-t pt-12">
            <Reveal>
              <SectionHeader title="صور إضافية" align="center" />
            </Reveal>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image, index) => (
                <Reveal key={`${image}-gallery-${index}`} delay={0.03}>
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className="overflow-hidden rounded-3xl border bg-card text-right transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="aspect-[4/3]">
                      <img src={toImageUrl(image)} alt="" className="h-full w-full object-cover" />
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
