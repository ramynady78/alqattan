import { ShoppingBag, Eye } from "lucide-react";
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
    addItem(product.id, product.name, 1);
    toast.success("تمت الإضافة إلى سلة الاستفسارات");
  };

  return (
    <Link to={`/products/${product.slug}`}>
      <Card className="group overflow-hidden cursor-pointer rounded-3xl lux-surface lux-outline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg h-full flex flex-col">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          {mainImage ? (
            <img
              src={toImageUrl(mainImage)}
              alt={product.name}
              className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              loading="lazy"
            />
          ) : (
            <ImagePlaceholder />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-90" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_35%_30%,rgba(184,150,90,0.35),transparent_55%)]" />

          {product.categoryName && (
            <Badge className="absolute top-4 left-4 bg-background/80 text-foreground hover:bg-background/90 backdrop-blur-sm border border-border/50">
              {product.categoryName}
            </Badge>
          )}

          <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex justify-center gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="h-11 w-11 rounded-full"
              onClick={(e) => {
                e.preventDefault();
              }}
              aria-label="عرض"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="icon" className="h-11 w-11 rounded-full" onClick={handleAdd} aria-label="إضافة للاستفسار">
              <ShoppingBag className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-5 flex-grow flex flex-col">
          <h3 className="font-serif text-lg font-semibold line-clamp-1 mb-1 text-foreground">
            {product.name}
          </h3>
          {product.priceText ? (
            <p className="text-primary font-medium mt-auto pt-2">{product.priceText}</p>
          ) : product.price ? (
            <p className="text-primary font-medium mt-auto pt-2">{product.price} ر.س</p>
          ) : (
            <p className="text-muted-foreground text-sm mt-auto pt-2">السعر عند الطلب</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

