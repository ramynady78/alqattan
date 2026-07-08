import { Link } from "react-router-dom";
import { Category } from "@workspace/api-client-react";
import { toImageUrl } from "@/lib/imageUrl";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { buildCategoryUrl } from "@/lib/routes";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link to={buildCategoryUrl(category)} className="block h-full w-full min-w-0">
      <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer lux-surface lux-outline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg h-full w-full min-w-0 flex flex-col">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {category.imageUrl ? (
            <img
              src={toImageUrl(category.imageUrl)}
              alt={category.name}
              className="object-cover w-full h-full max-w-full transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              loading="lazy"
            />
          ) : (
            <ImagePlaceholder />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent opacity-95" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_30%_30%,rgba(184,150,90,0.35),transparent_55%)]" />
          <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-4 md:p-6">
            <h3 className="text-sm sm:text-lg md:text-2xl font-serif font-bold text-white mb-0.5 sm:mb-1 leading-tight line-clamp-2 break-words">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-white/80 text-[11px] sm:text-sm leading-relaxed line-clamp-2 hidden sm:block">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
