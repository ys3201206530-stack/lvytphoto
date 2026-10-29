import type { Photo } from "@/lib/photos";

export function PhotoCard({ photo }: { photo: Photo }) {
  return (
    <figure
      className="group relative mb-4 w-full break-inside-avoid overflow-hidden bg-surface lg:mb-6"
      style={{ aspectRatio: photo.aspectRatio }}
    >
      {/* 第三阶段是渐变占位；第四阶段换成 <SmartImage /> 显示真实照片 */}
      <div
        role="img"
        aria-label={`${photo.title}，${photo.location}`}
        className="grain absolute inset-0 bg-cover bg-center transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]"
        style={{ backgroundImage: photo.background }}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-95 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100" />

      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 p-4 transition-all duration-500 md:translate-y-2 md:p-5 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
        <p className="text-sm tracking-wide text-paper">{photo.title}</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/55">
          {photo.category} · {photo.location}
        </p>
      </figcaption>
    </figure>
  );
}
