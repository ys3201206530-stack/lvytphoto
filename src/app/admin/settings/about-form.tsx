"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { saveAbout, type AboutState } from "./actions";

const EMPTY: AboutState = {};

export function AboutForm({ intro, email }: { intro: string; email: string }) {
  const [state, formAction, pending] = useActionState<AboutState, FormData>(
    saveAbout,
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
          htmlFor="intro"
          className="text-xs tracking-[0.2em] text-faint uppercase"
        >
          正文
        </label>
        <p className="mt-2 text-xs text-faint">空一行代表分段，最多 6000 字。</p>
        <textarea
          id="intro"
          name="intro"
          rows={12}
          maxLength={6000}
          defaultValue={intro}
          className="mt-3 w-full resize-y border border-line bg-surface px-4 py-3 text-sm leading-7 text-paper outline-none transition-colors placeholder:text-faint focus:border-accent"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="text-xs tracking-[0.2em] text-faint uppercase"
        >
          联系邮箱
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={email}
          placeholder="留空则不在关于页面显示邮箱"
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
          {pending ? "保存中…" : "保存关于页面"}
        </button>
        <Link
          href="/about"
          target="_blank"
          className="text-xs tracking-[0.12em] text-muted underline-offset-4 transition-colors hover:text-accent hover:underline"
        >
          预览关于页面 ↗
        </Link>
      </div>
    </form>
  );
}
