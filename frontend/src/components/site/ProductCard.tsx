import { ShoppingBag } from "lucide-react";
import { Product } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toImageUrl } from "@/lib/imageUrl";
import { useCart } from "@/lib/inquiryCart";
import { toast } from "sonner";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { Link } from "react-router-dom";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const mainImage = product.images?.[0];

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.id, product.name, 1);
    toast.success("تمت الإضافة إلى سلة الاستفسارات");
  };

  return (
    <Link to={`/products/${product.slug}`} className="block h-full w-full min-w-0">
      <Card className="group overflow-hidden cursor-pointer rounded-2xl sm:rounded-3xl lux-surface lux-outline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg h-full w-full min-w-0 flex flex-col">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted shrink-0">
          {mainImage ? (
            <img
              src={toImageUrl(mainImage)}
              alt={product.name}
              className="object-cover w-full h-full max-w-full transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              loading="lazy"
            />
          ) : (
            <ImagePlaceholder />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-90 pointer-events-none" />

          {product.categoryName && (
            <Badge className="absolute top-2 left-2 sm:top-3 sm:left-3 max-w-[calc(100%-0.75rem)] truncate bg-background/85 text-foreground backdrop-blur-sm border border-border/50 text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2">
              {product.categoryName}
            </Badge>
          )}

          <div className="absolute bottom-2 inset-x-0 flex justify-center sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-300 px-2">
            <Button
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full shadow-md"
              onClick={handleAdd}
              aria-label="إضافة للاستفسار"
            >
              <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-2.5 sm:p-4 md:p-5 flex-1 flex flex-col min-h-0 min-w-0">
          <h3 className="font-serif text-xs sm:text-base md:text-lg font-semibold line-clamp-2 mb-0.5 sm:mb-1 text-foreground break-words">
            {product.name}
          </h3>
          {product.priceText ? (
            <p className="text-primary font-medium text-xs sm:text-sm md:text-base mt-auto pt-1 truncate">
              {product.priceText}
            </p>
          ) : product.price ? (
            <p className="text-primary font-medium text-xs sm:text-sm md:text-base mt-auto pt-1">
              {product.price} ر.س
            </p>
          ) : (
            <p className="text-muted-foreground text-[11px] sm:text-xs md:text-sm mt-auto pt-1">السعر عند الطلب</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
