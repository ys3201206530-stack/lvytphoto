import type { Photo } from "@/lib/photos";
import { PhotoCard } from "./photo-card";

export function MasonryGrid({
  photos,
  className = "",
}: {
  photos: Photo[];
  className?: string;
}) {
  return (
    <div
      className={`columns-1 gap-4 sm:columns-2 lg:columns-3 lg:gap-6 ${className}`}
    >
      {photos.map((photo) => (
        <PhotoCard key={photo.slug} photo={photo} />
      ))}
    </div>
  );
}
