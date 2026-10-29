import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DeleteCommentButton } from "@/components/delete-comment-button";

export const instant = false;

type CommentRow = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  photos: { id: string; title: string } | { id: string; title: string }[] | null;
  profiles: { display_name: string | null } | { display_name: string | null }[] | null;
};

function pickOne<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

const TIME_FORMAT = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export default async function AdminCommentsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("comments")
    .select("id, content, created_at, user_id, photos(id, title), profiles(display_name)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) console.error("admin comments query failed:", error.message);
  const comments = (data ?? []) as unknown as CommentRow[];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-accent">COMMENTS</p>
          <h2 className="mt-2 font-serif text-2xl tracking-wide text-paper">评论管理</h2>
        </div>
        <p className="text-xs text-faint">最近 200 条，按时间倒序</p>
      </div>

      {comments.length === 0 ? (
        <p className="mt-10 border border-dashed border-line px-6 py-16 text-center text-sm text-faint">
          还没有任何评论。
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {comments.map((comment) => {
            const photo = pickOne(comment.photos);
            const author = pickOne(comment.profiles);

            return (
              <li key={comment.id} className="py-5">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs text-faint">
                  <span className="text-paper">{author?.display_name ?? "匿名访客"}</span>
                  <time dateTime={comment.created_at}>
                    {TIME_FORMAT.format(new Date(comment.created_at))}
                  </time>
                  {photo ? (
                    <Link
                      href={`/photo/${photo.id}`}
                      className="text-accent transition-opacity hover:opacity-80"
                    >
                      {photo.title}
                    </Link>
                  ) : null}
                  {photo ? (
                    <DeleteCommentButton commentId={comment.id} photoId={photo.id} />
                  ) : null}
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-muted">
                  {comment.content}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
