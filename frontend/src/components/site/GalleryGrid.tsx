import { useState } from "react";
import { GalleryItem } from "@workspace/api-client-react";
import { toImageUrl } from "@/lib/imageUrl";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { Link } from "react-router-dom";

function getGallerySlug(item: GalleryItem) {
  const rawSlug = (item as GalleryItem & { slug?: string | null }).slug;
  if (rawSlug && rawSlug.trim()) return rawSlug;
  if (item.id != null) return String(item.id);
  return item.title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function getGalleryCover(item: GalleryItem) {
  return item.images?.[0] || item.imageUrl || "";
}

function GalleryGridCard({ item }: { item: GalleryItem }) {
  const [imageFailed, setImageFailed] = useState(false);
  const coverImage = getGalleryCover(item);
  const itemLink = `/gallery/${getGallerySlug(item)}`;
  const imageSrc = coverImage ? toImageUrl(coverImage) : "";
  const showImage = Boolean(coverImage && imageSrc && !imageFailed);

  return (
    <Link to={itemLink} className="block">
      <article className="group relative overflow-hidden rounded-3xl lux-surface lux-outline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          {showImage ? (
            <img
              src={imageSrc}
              alt={item.title?.trim() ? item.title : "ستائر عصرية من أعمالنا"}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <ImagePlaceholder />
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90" />
        <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_35%_30%,rgba(184,150,90,0.35),transparent_55%)]" />

        <div className="absolute inset-0 flex flex-col items-start justify-end p-4 text-right opacity-100 sm:p-6 sm:opacity-0 sm:transition-opacity sm:duration-300 sm:group-hover:opacity-100">
          <h3 className="line-clamp-2 text-lg font-bold text-white sm:text-xl">{item.title}</h3>
          {item.description && (
            <p className="mt-1 line-clamp-2 max-w-[95%] text-sm leading-relaxed text-white/85">
              {item.description}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  if (!items?.length) return null;

  return (
    <div className="grid grid-cols-1 gap-4 overflow-x-hidden sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
      {items.map((item) => (
        <GalleryGridCard key={item.id} item={item} />
      ))}
    </div>
  );
}

