"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { addComment, type CommentState } from "@/app/photo/[id]/actions";

export function CommentForm({
  photoId,
  isLoggedIn,
  loginHref,
}: {
  photoId: string;
  isLoggedIn: boolean;
  loginHref: string;
}) {
  const [state, formAction, pending] = useActionState<CommentState, FormData>(
    addComment,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  if (!isLoggedIn) {
    return (
      <div className="mt-6 border border-line bg-surface px-5 py-6 text-center">
        <p className="text-sm text-muted">登录后可以发表评论。</p>
        <Link
          href={loginHref}
          className="mt-3 inline-block border border-accent px-5 py-2 text-xs tracking-[0.12em] text-accent transition-colors hover:bg-accent hover:text-ink"
        >
          去登录
        </Link>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="mt-6">
      <input type="hidden" name="photo_id" value={photoId} />
      <textarea
        name="content"
        required
        maxLength={1000}
        rows={3}
        placeholder="说点什么…（最多 1000 字）"
        className="w-full resize-y border border-line bg-surface px-4 py-3 text-sm leading-7 text-paper outline-none transition-colors placeholder:text-faint focus:border-accent"
      />
      <div className="mt-3 flex items-center justify-between gap-4">
        <span className="text-[11px] text-faint">评论会公开显示你的昵称和头像。</span>
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 border border-accent px-6 py-2 text-xs tracking-[0.12em] text-accent transition-colors hover:bg-accent hover:text-ink disabled:opacity-50"
        >
          {pending ? "发送中…" : "发表评论"}
        </button>
      </div>
      {state.error ? (
        <p className="mt-2 text-xs text-red-400">{state.error}</p>
      ) : null}
    </form>
  );
}
