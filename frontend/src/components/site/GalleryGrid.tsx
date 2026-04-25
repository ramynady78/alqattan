import { GalleryItem } from "@workspace/api-client-react";
import { toImageUrl } from "@/lib/imageUrl";
import { ImagePlaceholder } from "./ImagePlaceholder";

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  if (!items?.length) return null;

  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
      {items.map((item) => (
        <div
          key={item.id}
          className="group relative overflow-hidden rounded-3xl break-inside-avoid lux-surface lux-outline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          {item.imageUrl ? (
            <img
              src={toImageUrl(item.imageUrl)}
              alt={item.title}
              className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : (
            <div className="aspect-square">
              <ImagePlaceholder />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_35%_30%,rgba(184,150,90,0.35),transparent_55%)]" />

          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-start justify-end p-6 text-right">
            <h3 className="text-white font-serif text-xl font-bold mb-1">{item.title}</h3>
            {item.description && (
              <p className="text-white/85 text-sm leading-relaxed line-clamp-2 max-w-[95%]">
                {item.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

