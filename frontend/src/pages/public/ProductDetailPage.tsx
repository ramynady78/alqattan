import { useMemo, useState } from "react";
import {
  useGetProductBySlug,
  useGetRelatedProducts,
  useGetSettings,
} from "@workspace/api-client-react";
import { SectionHeader } from "@/components/site/SectionHeader";
import { ProductCard } from "@/components/site/ProductCard";
import { ImagePlaceholder } from "@/components/site/ImagePlaceholder";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toImageUrl } from "@/lib/imageUrl";
import { useCart } from "@/lib/inquiryCart";
import { toast } from "sonner";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { buildWhatsAppUrl, formatProductMessage } from "@/lib/whatsapp";
import { useDocumentTitle } from "@/lib/seo";
import { Reveal } from "@/components/motion/Reveal";
import { useParams } from "react-router-dom";

export default function ProductDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();

  const { data: product, isLoading } = useGetProductBySlug(slug, {
    query: { enabled: !!slug, queryKey: ["/api/products/by-slug", slug] },
  });

  const { data: related } = useGetRelatedProducts(product?.id || 0, {
    query: { enabled: !!product?.id, queryKey: ["/api/products", product?.id, "related"] },
  });

  const { data: settings } = useGetSettings();
  const { addItem } = useCart();

  useDocumentTitle(product?.name || "تفاصيل المنتج");

  const images = useMemo(() => (product?.images && product.images.length > 0 ? product.images : []), [product?.images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];
  if (isLoading) {
    return (
      <div className="lux-section lux-noise">
        <div className="lux-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <Skeleton className="aspect-square rounded-3xl" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4 rounded-full" />
              <Skeleton className="h-6 w-1/4 rounded-full" />
              <Skeleton className="h-32 w-full rounded-3xl" />
              <Skeleton className="h-12 w-1/3 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="lux-section lux-noise">
        <div className="lux-container text-center py-20">
          <Reveal>
            <h2 className="text-2xl font-serif mb-4">المنتج غير موجود</h2>
            <p className="text-muted-foreground mb-8">عذراً، لم نتمكن من العثور على المنتج المطلوب.</p>
            <Button variant="outline" className="rounded-full px-8" onClick={() => window.history.back()}>
              العودة
            </Button>
          </Reveal>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    addItem(product.id, product.name, 1);
    toast.success("تمت الإضافة إلى سلة الاستفسارات");
  };

  const handleWhatsApp = () => {
    if (!settings?.whatsapp) {
      toast.error("رقم الواتساب غير متوفر حالياً");
      return;
    }
    const url = buildWhatsAppUrl(settings.whatsapp, formatProductMessage(product));
    window.open(url, "_blank");
  };

  return (
    <div className="lux-section lux-noise">
      <div className="lux-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 md:gap-12 mb-10 sm:mb-16 items-start">
            <Reveal>
              <div className="space-y-4">
                <div className="aspect-square rounded-3xl overflow-hidden bg-muted border lux-outline">
                  {activeImage ? (
                    <img
                      src={toImageUrl(activeImage)}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                    />
                  ) : (
                    <ImagePlaceholder />
                  )}
                </div>

                {images.length > 1 && (
                  <div className="grid grid-cols-5 gap-3">
                    {images.slice(0, 5).map((img, i) => {
                      const isActive = i === activeIndex;
                      return (
                        <button
                          key={img}
                          type="button"
                          onClick={() => setActiveIndex(i)}
                          className={`aspect-square rounded-2xl overflow-hidden border transition ${
                            isActive ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"
                          }`}
                          aria-label={`صورة ${i + 1}`}
                        >
                          <img src={toImageUrl(img)} alt="" className="w-full h-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="rounded-2xl sm:rounded-3xl lux-surface lux-outline p-5 sm:p-7 md:p-8">
                {product.categoryName && (
                  <Badge variant="outline" className="mb-4 text-sm font-medium tracking-wide">
                    {product.categoryName}
                  </Badge>
                )}

                <h1 className="text-2xl sm:text-3xl md:text-5xl font-serif font-bold text-foreground mb-3 leading-tight">
                  {product.name}
                </h1>
                {product.nameEn && (
                  <p className="text-muted-foreground font-serif text-xl mb-4">{product.nameEn}</p>
                )}

                <div className="text-2xl font-bold text-primary mt-5">
                  {product.priceText
                    ? product.priceText
                    : product.price
                      ? `${product.price} ر.س`
                      : "السعر عند الطلب"}
                </div>

                <Separator className="my-7" />

                {product.description && (
                  <div className="prose prose-stone max-w-none dark:prose-invert">
                    <p className="text-foreground/80 leading-relaxed text-lg whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </div>
                )}

                {product.specs && (
                  <div className="mt-7">
                    <h3 className="font-serif text-xl font-bold mb-3">المواصفات</h3>
                    <p className="text-foreground/70 leading-relaxed whitespace-pre-wrap">{product.specs}</p>
                  </div>
                )}

                <div className="mt-10 flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="flex-1 h-14 text-base rounded-full" onClick={handleAdd}>
                    <ShoppingBag className="ml-2 h-5 w-5" />
                    إضافة للاستفسار
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 h-14 text-base rounded-full border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
                    onClick={handleWhatsApp}
                  >
                    <MessageCircle className="ml-2 h-5 w-5" />
                    استفسار واتساب
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>

          {Array.isArray(related) && related.length > 0 && (
            <div className="pt-14 border-t">
              <Reveal>
                <SectionHeader title="منتجات مشابهة" align="center" />
              </Reveal>
              <div className="lux-product-grid">
                {related.map((p) => (
                  <Reveal key={p.id} delay={0.03} className="h-full">
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

