import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "注册",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function RegisterPage() {
  const session = await getSessionUser();
  if (session) {
    redirect("/account");
  }

  return (
    <div className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col justify-center px-5 pb-20 pt-32">
      <p className="text-[11px] uppercase tracking-[0.42em] text-accent">LVYTPHOTO</p>
      <h1 className="mt-6 font-serif text-4xl tracking-wide text-paper">注册</h1>
      <p className="mt-4 text-sm leading-7 text-muted">
        注册后可以给照片点赞、发表评论。浏览作品不需要注册。
      </p>

      <RegisterForm />
    </div>
  );
}
