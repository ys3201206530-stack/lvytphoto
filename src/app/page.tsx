import Link from "next/link";
import { PhotoTile } from "@/components/photo-tile";
import { SectionHeading } from "@/components/section-heading";
import { listPublicCategories, listPublishedPhotos } from "@/lib/public-photos";
import { getHomeContent } from "@/lib/home-content";
import { getSiteBackground } from "@/lib/site-background";
import { site } from "@/lib/site";

export const instant = false;

const heroBackground =
  "radial-gradient(120% 90% at 68% 16%, rgba(198,166,132,0.28), transparent 58%), radial-gradient(90% 80% at 18% 82%, rgba(70,96,112,0.45), transparent 62%), linear-gradient(168deg, #101820 0%, #1d2a31 45%, #080a0c 100%)";

const heroOverlay =
  "linear-gradient(180deg, rgba(11,11,12,0.58) 0%, rgba(11,11,12,0.10) 38%, rgba(11,11,12,0.72) 80%, #0b0b0c 100%)";

const CATEGORY_GRADIENTS = [
  "linear-gradient(160deg, #1c2630 0%, #0d1116 70%)",
  "linear-gradient(160deg, #2a2118 0%, #100d0a 70%)",
  "linear-gradient(160deg, #231d24 0%, #100d11 70%)",
  "linear-gradient(160deg, #1a2420 0%, #0b110f 70%)",
  "linear-gradient(160deg, #20222c 0%, #0d0e13 70%)",
  "linear-gradient(160deg, #2b2420 0%, #120f0d 70%)",
];

export default async function HomePage() {
  const [featured, categories, background, home] = await Promise.all([
    listPublishedPhotos({ limit: 6 }),
    listPublicCategories(),
    getSiteBackground(),
    getHomeContent(),
  ]);

  return (
    <>
      {/* ---------- 主视觉 ---------- */}
      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
        {background ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={background.url}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover"
              style={
                background.blurDataUrl
                  ? {
                      backgroundImage: `url(${background.blurDataUrl})`,
                      backgroundSize: "cover",
                    }
                  : undefined
              }
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-t from-black/95 via-black/55 to-black/15"
            />
          </>
        ) : (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ backgroundImage: heroBackground }}
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ backgroundImage: heroOverlay }}
        />

        <div className="relative mx-auto w-full max-w-[1440px] px-5 pb-16 md:px-10 md:pb-24">
          <p
            className="animate-fade-up text-[10px] uppercase tracking-[0.42em] text-accent"
            style={{ animationDelay: "80ms" }}
          >
            {home.eyebrow}
          </p>

          <h1
            className="animate-fade-up mt-6 text-[clamp(2.25rem,7vw,4.5rem)] font-light text-paper"
            style={{ animationDelay: "160ms", letterSpacing: "0.22em" }}
          >
            {home.title}
          </h1>

          <p
            className="animate-fade-up mt-6 max-w-md text-sm leading-8 text-white/70 md:text-base"
            style={{ animationDelay: "260ms" }}
          >
            {home.tagline}
          </p>

          <div
            className="animate-fade-up mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "360ms" }}
          >
            <Link
              href="/works"
              style={{ borderColor: "rgba(200, 169, 126, 0.5)" }}
              className="lv-glass lv-glass-pill inline-flex h-12 items-center justify-center px-8 text-[13px] tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-[#16130e]"
            >
              浏览作品
            </Link>
            <Link
              href="/about"
              className="inline-flex h-12 items-center justify-center px-6 text-[13px] tracking-[0.18em] text-white/75 transition-colors hover:text-paper"
            >
              关于我
            </Link>
          </div>

          <ul className="mt-14 hidden flex-wrap gap-x-7 gap-y-2 text-[10px] uppercase tracking-[0.26em] text-white/40 md:flex">
            {categories.map((category) => (
              <li key={category.slug}>{category.name}</li>
            ))}
          </ul>
        </div>

        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex">
          <span className="text-[9px] uppercase tracking-[0.32em] text-white/35">
            Scroll
          </span>
          <span className="h-10 w-px bg-linear-to-b from-white/35 to-transparent" />
        </div>
      </section>

      {/* ---------- 精选作品 ---------- */}
      <section id="selected" className="scroll-mt-20 py-20 md:py-28">
        <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
          <SectionHeading
            index="01 — Selected"
            title="精选作品"
            description="从最近的拍摄里挑出的几张。悬停或轻触可以看到标题与分类。"
            href="/works"
            linkLabel="全部作品"
          />

          <div className="mt-10 md:mt-14">
            {featured.length === 0 ? (
              <div className="border border-dashed border-line px-6 py-20 text-center">
                <p className="text-sm text-muted">还没有公开的作品。</p>
              </div>
            ) : (
              <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 lg:gap-6">
                {featured.map((photo) => (
                  <PhotoTile key={photo.id} photo={photo} eager />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------- 分类入口 ---------- */}
      <section id="categories" className="scroll-mt-20 border-t border-line py-20 md:py-28">
        <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
          <SectionHeading index="02 — Categories" title="按分类浏览" />

          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((category, index) => (
              <Link
                key={category.slug}
                href={`/works?category=${encodeURIComponent(category.slug)}`}
                className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden p-4"
                style={{
                  backgroundImage: CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length],
                }}
              >
                <span className="absolute inset-0 bg-black/20 transition-colors duration-500 group-hover:bg-black/0" />
                <span className="relative text-sm tracking-[0.18em] text-paper">
                  {category.name}
                </span>
                {category.description ? (
                  <span className="relative mt-1 line-clamp-2 text-[10px] leading-4 tracking-[0.14em] text-white/45">
                    {category.description}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 关于片段 ---------- */}
      <section id="about" className="scroll-mt-20 border-t border-line py-20 md:py-28">
        <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
          <div className="grid gap-10 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-4">
              <p className="text-[10px] uppercase tracking-[0.34em] text-accent">
                03 — About
              </p>
              <h2 className="mt-3 text-2xl font-medium tracking-tight md:text-3xl">
                关于我
              </h2>
            </div>

            <div className="md:col-span-8">
              <p className="max-w-2xl text-[15px] leading-8 text-muted md:text-base">
                {site.intro}
              </p>
              <Link
                href="/about"
                className="group mt-8 inline-flex items-center gap-2 text-[13px] tracking-[0.14em] text-muted transition-colors hover:text-accent"
              >
                了解更多
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
