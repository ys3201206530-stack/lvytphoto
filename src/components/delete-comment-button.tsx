"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteComment } from "@/app/photo/[id]/actions";

export function DeleteCommentButton({
  commentId,
  photoId,
}: {
  commentId: string;
  photoId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleClick() {
    if (pending) return;
    if (!window.confirm("删除这条评论？删除后无法恢复。")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteComment(commentId, photoId);
      if (!result.ok) {
        setError(result.error ?? "删除失败。");
        return;
      }
      router.refresh();
    });
  }

  return (
    <span className="ml-auto">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="text-[11px] text-faint transition-colors hover:text-red-400 disabled:opacity-50"
      >
        {pending ? "删除中…" : "删除"}
      </button>
      {error ? <span className="ml-2 text-[11px] text-red-400">{error}</span> : null}
    </span>
  );
}
