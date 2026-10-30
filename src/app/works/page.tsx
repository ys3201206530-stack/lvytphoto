import Link from "next/link";
import { PhotoTile } from "@/components/photo-tile";
import { listPublicCategories, listPublishedPhotos } from "@/lib/public-photos";

export const instant = false;

export const metadata = { title: "作品" };

export default async function WorksPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [photos, categories] = await Promise.all([
    listPublishedPhotos({ categorySlug: category }),
    listPublicCategories(),
  ]);
  const active = category ? categories.find((item) => item.slug === category) : null;

  return (
    <div className="mx-auto w-full max-w-[1600px] px-5 pb-24 pt-32 sm:px-8">
      <p className="text-[11px] uppercase tracking-[0.42em] text-accent">WORKS</p>
      <h1 className="mt-4 font-serif text-4xl tracking-wide text-paper sm:text-5xl">
        {active ? active.name : "全部作品"}
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
        {active?.description ?? "按时间倒序排列。点开任意一张可以看大图和信息。"}
      </p>

      <nav className="mt-10 -mx-5 flex gap-2 overflow-x-auto border-t border-line px-5 pt-6 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        <Link
          href="/works"
          style={active ? undefined : { borderColor: "rgba(200, 169, 126, 0.55)" }}
          className={`lv-glass lv-glass-pill shrink-0 whitespace-nowrap px-4 py-2 text-xs tracking-[0.12em] transition-colors ${
            active ? "text-muted hover:text-paper" : "text-accent"
          }`}
        >
          全部
        </Link>
        {categories.map((item) => {
          const isActive = active?.slug === item.slug;
          return (
            <Link
              key={item.slug}
              href={`/works?category=${encodeURIComponent(item.slug)}`}
              style={
                isActive
                  ? { borderColor: "rgba(200, 169, 126, 0.55)" }
                  : undefined
              }
              className={`lv-glass lv-glass-pill shrink-0 whitespace-nowrap px-4 py-2 text-xs tracking-[0.12em] transition-colors ${
                isActive ? "text-accent" : "text-muted hover:text-paper"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {photos.length === 0 ? (
        <div className="mt-16 border border-dashed border-line px-6 py-20 text-center">
          <p className="text-sm text-muted">
            {active ? "这个分类下还没有公开的作品。" : "还没有公开的作品。"}
          </p>
          {active ? (
            <Link
              href="/works"
              className="mt-4 inline-block text-xs text-accent underline-offset-4 hover:underline"
            >
              看全部作品 →
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 lg:gap-6">
          {photos.map((photo, index) => (
            <PhotoTile key={photo.id} photo={photo} eager={index < 3} />
          ))}
        </div>
      )}
    </div>
  );
}
