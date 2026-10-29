"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { saveHome, type HomeState } from "./actions";

const EMPTY: HomeState = {};

export function HomeForm({
  eyebrow,
  title,
  tagline,
}: {
  eyebrow: string;
  title: string;
  tagline: string;
}) {
  const [state, formAction, pending] = useActionState<HomeState, FormData>(
    saveHome,
    EMPTY,
  );
  const router = useRouter();

  useEffect(() => {
    if (state.message) router.refresh();
  }, [state.message, router]);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label
          htmlFor="eyebrow"
          className="text-xs tracking-[0.2em] text-faint uppercase"
        >
          上方小字
        </label>
        <input
          id="eyebrow"
          name="eyebrow"
          maxLength={40}
          defaultValue={eyebrow}
          placeholder="PERSONAL PHOTOGRAPHY"
          className="mt-3 w-full border border-line bg-surface px-4 py-3 text-sm text-paper outline-none transition-colors placeholder:text-faint focus:border-accent"
        />
      </div>

      <div>
        <label
          htmlFor="title"
          className="text-xs tracking-[0.2em] text-faint uppercase"
        >
          大标题
        </label>
        <p className="mt-2 text-xs text-faint">
          首页最显眼的那行字，最多 30 个字符。
        </p>
        <input
          id="title"
          name="title"
          required
          maxLength={30}
          defaultValue={title}
          className="mt-3 w-full border border-line bg-surface px-4 py-3 text-sm text-paper outline-none transition-colors placeholder:text-faint focus:border-accent"
        />
      </div>

      <div>
        <label
          htmlFor="tagline"
          className="text-xs tracking-[0.2em] text-faint uppercase"
        >
          副标题
        </label>
        <input
          id="tagline"
          name="tagline"
          maxLength={120}
          defaultValue={tagline}
          placeholder="光与影之间，收藏每一次遇见。"
          className="mt-3 w-full border border-line bg-surface px-4 py-3 text-sm text-paper outline-none transition-colors placeholder:text-faint focus:border-accent"
        />
      </div>

      {state.error ? (
        <p className="text-xs text-red-400">{state.error}</p>
      ) : null}
      {state.message ? (
        <p className="text-xs text-accent">{state.message}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="border border-accent px-6 py-3 text-sm tracking-[0.12em] text-accent transition-colors hover:bg-accent hover:text-ink disabled:opacity-50"
        >
          {pending ? "保存中…" : "保存首页文案"}
        </button>
        <Link
          href="/"
          target="_blank"
          className="text-xs tracking-[0.12em] text-muted underline-offset-4 transition-colors hover:text-accent hover:underline"
        >
          预览首页 ↗
        </Link>
      </div>
    </form>
  );
}
