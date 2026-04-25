import { Link } from "react-router-dom";
import { Category } from "@workspace/api-client-react";
import { toImageUrl } from "@/lib/imageUrl";
import { ImagePlaceholder } from "./ImagePlaceholder";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link to={`/products?categoryId=${category.id}`}>
      <div className="group relative overflow-hidden rounded-3xl cursor-pointer lux-surface lux-outline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
        <div className="relative aspect-[1/1] overflow-hidden bg-muted">
          {category.imageUrl ? (
            <img
              src={toImageUrl(category.imageUrl)}
              alt={category.name}
              className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              loading="lazy"
            />
          ) : (
            <ImagePlaceholder />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent opacity-95" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_30%_30%,rgba(184,150,90,0.35),transparent_55%)]" />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6">
          <h3 className="text-2xl md:text-[26px] font-serif font-bold text-white mb-1 leading-tight">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-white/80 text-sm leading-relaxed line-clamp-2">
              {category.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
