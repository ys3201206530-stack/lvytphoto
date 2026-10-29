import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { HeaderAuth } from "@/components/header-auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://lvytphoto.vercel.app"),
  title: {
    default: "lvytphoto · 个人摄影作品集",
    template: "%s · lvytphoto",
  },
  description:
    "lvytphoto，一个个人摄影作品集。记录光、影与旅途中遇见的瞬间：风光、城市、人像、街拍、建筑与旅行。",
  openGraph: {
    title: "lvytphoto · 个人摄影作品集",
    description: "光与影之间，收藏每一次遇见。",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="flex min-h-full flex-col bg-ink text-paper antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-paper focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
        >
          跳到主要内容
        </a>
        <SiteHeader
          authSlot={
            <Suspense fallback={<span className="hidden h-3 w-16 md:block" aria-hidden />}>
              <HeaderAuth />
            </Suspense>
          }
        />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
