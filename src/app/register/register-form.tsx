"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type RegisterState } from "./actions";

const initialState: RegisterState = {};

const inputClass =
  "w-full border border-line bg-surface px-4 py-3 text-sm text-paper outline-none transition-colors duration-300 placeholder:text-faint focus:border-accent";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label
          htmlFor="display_name"
          className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-muted"
        >
          昵称
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          required
          maxLength={20}
          autoComplete="nickname"
          className={inputClass}
          placeholder="评论和点赞时会显示"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-muted"
        >
          邮箱
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-muted"
        >
          密码
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
          placeholder="至少 8 位"
        />
      </div>

      <div>
        <label
          htmlFor="confirm"
          className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-muted"
        >
          再输一次密码
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
          placeholder="••••••••"
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="border border-[#c25b4e]/40 bg-[#c25b4e]/10 px-4 py-3 text-sm text-[#e5a49b]"
        >
          {state.error}
        </p>
      ) : null}

      {state.message ? (
        <p className="border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full border border-accent px-6 py-3 text-sm tracking-[0.2em] text-accent transition-colors duration-300 hover:bg-accent hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "注册中…" : "注 册"}
      </button>

      <p className="text-center text-xs text-faint">
        已有账号？{" "}
        <Link href="/login" className="text-muted underline underline-offset-4 hover:text-paper">
          直接登录
        </Link>
      </p>
    </form>
  );
}
