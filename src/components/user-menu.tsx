"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "user"; name: string; isAdmin: boolean };

function useAuthState() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active) return;

      if (!user) {
        setState({ status: "guest" });
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("display_name, role")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;
      setState({
        status: "user",
        name: data?.display_name || user.email?.split("@")[0] || "我",
        isAdmin: data?.role === "admin",
      });
    };

    void load();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      void load();
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setState({ status: "guest" });
    router.refresh();
  };

  return { state, signOut };
}

/** 桌面端右上角的登录状态。 */
export function UserMenu() {
  const { state, signOut } = useAuthState();

  if (state.status === "loading") {
    return <span className="hidden h-3 w-16 md:block" aria-hidden />;
  }

  if (state.status === "guest") {
    return (
      <div className="hidden items-center gap-6 md:flex">
        <Link
          href="/login"
          className="text-[13px] tracking-[0.18em] text-muted transition-colors hover:text-paper"
        >
          登录
        </Link>
        <Link
          href="/register"
          className="border border-line px-4 py-2 text-[12px] tracking-[0.16em] text-paper transition-colors hover:border-accent hover:text-accent"
        >
          注册
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-5 md:flex">
      {state.isAdmin ? (
        <Link
          href="/admin"
          className="text-[12px] tracking-[0.16em] text-accent transition-opacity hover:opacity-80"
        >
          后台
        </Link>
      ) : null}
      <Link
        href="/account"
        className="text-[13px] tracking-[0.16em] text-paper transition-colors hover:text-accent"
      >
        {state.name}
      </Link>
      <button
        type="button"
        onClick={signOut}
        className="text-[12px] tracking-[0.16em] text-faint transition-colors hover:text-muted"
      >
        退出
      </button>
    </div>
  );
}

/** 手机端抽屉菜单里的登录状态。 */
export function MobileUserMenu() {
  const { state, signOut } = useAuthState();

  if (state.status === "loading") return null;

  return (
    <div className="mt-8 border-t border-line pt-7">
      {state.status === "guest" ? (
        <div className="flex gap-3">
          <Link
            href="/login"
            className="flex-1 border border-line py-3 text-center text-sm tracking-[0.14em] text-paper"
          >
            登录
          </Link>
          <Link
            href="/register"
            className="flex-1 border border-accent py-3 text-center text-sm tracking-[0.14em] text-accent"
          >
            注册
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <Link href="/account" className="block text-sm tracking-[0.14em] text-paper">
            我的账号 · {state.name}
          </Link>
          {state.isAdmin ? (
            <Link href="/admin" className="block text-sm tracking-[0.14em] text-accent">
              进入后台
            </Link>
          ) : null}
          <button
            type="button"
            onClick={signOut}
            className="text-xs tracking-[0.14em] text-faint"
          >
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}
