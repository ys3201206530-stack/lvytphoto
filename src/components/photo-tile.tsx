import Link from "next/link";
import type { PublicPhoto } from "@/lib/public-photos";
import { publicPhotoUrl } from "@/lib/photo-url";

const SIZES = "(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw";

export function PhotoTile({ photo, eager = false }: { photo: PublicPhoto; eager?: boolean }) {
  const srcSet = [
    `${publicPhotoUrl(photo.storagePath, "sm")} 480w`,
    `${publicPhotoUrl(photo.storagePath, "md")} 1280w`,
    `${publicPhotoUrl(photo.storagePath, "lg")} 2560w`,
  ].join(", ");

  return (
    <Link
      href={`/photo/${photo.id}`}
      className="group relative mb-4 block w-full break-inside-avoid overflow-hidden bg-surface [content-visibility:auto] lg:mb-6"
      style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
    >
      {photo.blurDataUrl ? (
        <span
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${photo.blurDataUrl})` }}
        />
      ) : null}

      {/* 三档 WebP 由浏览器按屏幕宽度挑，不经过图片处理服务 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={publicPhotoUrl(photo.storagePath, "md")}
        srcSet={srcSet}
        sizes={SIZES}
        width={photo.width}
        height={photo.height}
        alt={photo.title}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]"
      />

      <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent opacity-95 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100" />

      <span className="pointer-events-none absolute inset-x-0 bottom-0 p-4 transition-all duration-500 md:translate-y-2 md:p-5 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
        <span className="block text-sm tracking-wide text-paper">{photo.title}</span>
        <span className="mt-1 block text-[10px] uppercase tracking-[0.22em] text-white/55">
          {photo.category?.name ?? "未分类"}
        </span>
      </span>
    </Link>
  );
}
