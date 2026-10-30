import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPhotoLikeState,
  getPublishedPhoto,
  listPhotoComments,
} from "@/lib/public-photos";
import { getSessionUser } from "@/lib/auth";
import { publicPhotoUrl } from "@/lib/photo-url";
import { LikeButton } from "@/components/like-button";
import { CommentForm } from "@/components/comment-form";
import { CommentList } from "@/components/comment-list";
import { PhotoZoom } from "@/components/photo-zoom";

export const instant = false;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!UUID_RE.test(id)) return { title: "作品不存在" };

  const photo = await getPublishedPhoto(id);
  if (!photo) return { title: "作品不存在" };

  return {
    title: photo.title,
    description: photo.description ?? `${photo.title} · lvyt.top 摄影作品`,
    openGraph: {
      title: photo.title,
      images: [{ url: publicPhotoUrl(photo.storagePath, "lg") }],
    },
  };
}

export default async function PhotoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // 详情页要读评论/点赞数，必须请求时渲染，不能进静态预渲染
  await connection();
  if (!UUID_RE.test(id)) notFound();

  const photo = await getPublishedPhoto(id);
  if (!photo) notFound();

  const session = await getSessionUser();
  const [comments, like] = await Promise.all([
    listPhotoComments(id),
    getPhotoLikeState(id, session?.user.id ?? null),
  ]);
  const loginHref = `/login?next=/photo/${id}`;

  const srcSet = [
    `${publicPhotoUrl(photo.storagePath, "md")} 1280w`,
    `${publicPhotoUrl(photo.storagePath, "lg")} 2560w`,
  ].join(", ");

  return (
    <div className="mx-auto w-full max-w-[1500px] px-5 pb-24 pt-28 sm:px-8">
      <Link
        href="/works"
        className="text-[11px] tracking-[0.2em] text-faint transition-colors hover:text-muted"
      >
        ← 全部作品
      </Link>

      <div className="mt-6 flex w-full items-center justify-center bg-surface">
        <PhotoZoom
          src={publicPhotoUrl(photo.storagePath, "lg")}
          srcSet={srcSet}
          sizes="(max-width: 1024px) 100vw, 1280px"
          width={photo.width}
          height={photo.height}
          alt={photo.title}
        />
      </div>

      <div className="mx-auto mt-10 max-w-3xl">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.22em] text-faint">
          {photo.category ? (
            <Link
              href={`/works?category=${encodeURIComponent(photo.category.slug)}`}
              className="text-accent transition-opacity hover:opacity-80"
            >
              {photo.category.name}
            </Link>
          ) : (
            <span>未分类</span>
          )}
          {photo.shotAt ? <span>拍摄于 {photo.shotAt}</span> : null}
          <span>上传于 {photo.createdAt.slice(0, 10)}</span>
        </div>

        <h1 className="mt-5 font-serif text-3xl tracking-wide text-paper sm:text-4xl">
          {photo.title}
        </h1>

        {photo.description ? (
          <div className="mt-6 space-y-4 text-sm leading-8 text-muted">
            {photo.description.split(/\n+/).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-line pt-6">
          <LikeButton
            photoId={photo.id}
            initialLiked={like.liked}
            initialCount={like.count}
            isLoggedIn={Boolean(session)}
            loginHref={loginHref}
          />
          <span className="text-xs text-faint">{comments.length} 条评论</span>
        </div>

        <section className="mt-12 border-t border-line pt-8">
          <h2 className="font-serif text-xl tracking-wide text-paper">
            评论 <span className="ml-1 text-sm text-faint">{comments.length}</span>
          </h2>

          <CommentForm
            photoId={photo.id}
            isLoggedIn={Boolean(session)}
            loginHref={loginHref}
          />

          <CommentList
            comments={comments}
            photoId={photo.id}
            currentUserId={session?.user.id ?? null}
            isAdmin={session?.profile?.role === "admin"}
          />
        </section>

        <div className="mt-12 border-t border-line pt-6 text-[11px] text-faint">
          照片版权归作者所有，未经许可请勿转载。
        </div>
      </div>
    </div>
  );
}
