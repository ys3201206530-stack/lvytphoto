"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="mt-10 space-y-5">
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
          autoComplete="email"
          required
          className="w-full border border-line bg-surface px-4 py-3 text-sm text-paper outline-none transition-colors duration-300 placeholder:text-faint focus:border-accent"
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
          autoComplete="current-password"
          required
          className="w-full border border-line bg-surface px-4 py-3 text-sm text-paper outline-none transition-colors duration-300 placeholder:text-faint focus:border-accent"
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

      <button
        type="submit"
        disabled={pending}
        className="w-full border border-accent px-6 py-3 text-sm tracking-[0.2em] text-accent transition-colors duration-300 hover:bg-accent hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "登录中…" : "登 录"}
      </button>
    </form>
  );
}
