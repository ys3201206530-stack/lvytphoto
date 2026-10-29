import { avatarUrl } from "@/lib/auth";
import { UserGlyph } from "@/components/user-glyph";
import { DeleteCommentButton } from "@/components/delete-comment-button";
import type { PhotoComment } from "@/lib/public-photos";

const TIME_FORMAT = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function CommentList({
  comments,
  photoId,
  currentUserId,
  isAdmin,
}: {
  comments: PhotoComment[];
  photoId: string;
  currentUserId: string | null;
  isAdmin: boolean;
}) {
  if (comments.length === 0) {
    return (
      <p className="mt-6 border border-dashed border-line px-5 py-8 text-center text-sm text-faint">
        还没有评论，来说第一句吧。
      </p>
    );
  }

  return (
    <ul className="mt-6 space-y-6">
      {comments.map((comment) => {
        const src = avatarUrl(comment.avatarPath);
        const canDelete = isAdmin || comment.userId === currentUserId;

        return (
          <li key={comment.id} className="flex gap-3">
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-line bg-surface text-faint">
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserGlyph className="h-full w-full p-1.5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-3">
                <span className="truncate text-sm text-paper">{comment.displayName}</span>
                <time className="shrink-0 text-[11px] text-faint" dateTime={comment.createdAt}>
                  {TIME_FORMAT.format(new Date(comment.createdAt))}
                </time>
                {canDelete ? (
                  <DeleteCommentButton commentId={comment.id} photoId={photoId} />
                ) : null}
              </div>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-7 text-muted">
                {comment.content}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
