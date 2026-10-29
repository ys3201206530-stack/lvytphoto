"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleLike } from "@/app/photo/[id]/actions";

export function LikeButton({
  photoId,
  initialLiked,
  initialCount,
  isLoggedIn,
  loginHref,
}: {
  photoId: string;
  initialLiked: boolean;
  initialCount: number;
  isLoggedIn: boolean;
  loginHref: string;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (pending) return;
    const previous = { liked, count };
    setError(null);
    setLiked(!liked);
    setCount(count + (liked ? -1 : 1));

    startTransition(async () => {
      const result = await toggleLike(photoId);
      if (!result.ok) {
        setLiked(previous.liked);
        setCount(previous.count);
        if ("error" in result && result.error) setError(result.error);
        return;
      }
      setLiked(result.liked);
      setCount(result.count);
    });
  }

  const className = `inline-flex items-center gap-2 border px-4 py-2 text-xs tracking-[0.1em] transition-colors ${
    liked
      ? "border-accent bg-accent/10 text-accent"
      : "border-line text-muted hover:border-line-strong hover:text-paper"
  }`;

  return (
    <div>
      {isLoggedIn ? (
        <button
          type="button"
          onClick={handleClick}
          disabled={pending}
          aria-pressed={liked}
          aria-label={liked ? "取消点赞" : "点赞"}
          className={`${className} disabled:opacity-60`}
        >
          <Heart filled={liked} />
          <span>{liked ? "已赞" : "点赞"}</span>
          <span className="tabular-nums text-faint">{count}</span>
        </button>
      ) : (
        <Link href={loginHref} title="登录后可以点赞" className={className}>
          <Heart filled={false} />
          <span>点赞</span>
          <span className="tabular-nums text-faint">{count}</span>
        </Link>
      )}
      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden
      className="h-4 w-4"
    >
      <path d="M12 20.4S4.7 15.9 2.9 11.5C1.6 8.1 3.8 5 6.8 5c1.9 0 3.4 1 4.4 2.5h1.6C13.8 6 15.3 5 17.2 5c3 0 5.2 3.1 3.9 6.5-1.8 4.4-9.1 8.9-9.1 8.9Z" />
    </svg>
  );
}
