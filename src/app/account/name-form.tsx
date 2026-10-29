"use client";

import { useActionState } from "react";
import { updateNickname, type ProfileState } from "./actions";

const EMPTY: ProfileState = {};

export function NameForm({ current }: { current: string }) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    updateNickname,
    EMPTY,
  );

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          name="display_name"
          defaultValue={current}
          required
          minLength={1}
          maxLength={20}
          placeholder="1–20 个字"
          className="w-full border border-line bg-surface px-4 py-3 text-sm text-paper outline-none transition-colors placeholder:text-faint focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 border border-accent px-6 py-3 text-sm tracking-[0.12em] text-accent transition-colors hover:bg-accent hover:text-ink disabled:opacity-50"
        >
          {pending ? "保存中…" : "保存"}
        </button>
      </div>
      {state.error ? <p className="text-xs text-red-400">{state.error}</p> : null}
      {state.message ? <p className="text-xs text-accent">{state.message}</p> : null}
    </form>
  );
}
