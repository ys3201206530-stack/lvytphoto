import { requireAdmin } from "@/lib/auth";
import { getAboutContent } from "@/lib/about-content";
import { publicPhotoUrl } from "@/lib/photo-url";
import { getBackgroundRecord } from "@/lib/site-background";
import { AboutForm } from "./about-form";
import { BackgroundForm } from "./background-form";

export const instant = false;
export const metadata = { title: "站点设置" };

export default async function SettingsPage() {
  await requireAdmin();

  const [record, about] = await Promise.all([getBackgroundRecord(), getAboutContent()]);
  const previewUrl = record ? publicPhotoUrl(record.path, "lg") : null;

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8">
      <p className="text-[11px] uppercase tracking-[0.42em] text-accent">SETTINGS</p>
      <h1 className="mt-3 font-serif text-3xl tracking-wide text-paper">站点设置</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
        这里的两块内容都只有管理员能改：访客和普通注册用户看不到入口，也无法通过接口修改。
      </p>

      <section className="mt-12">
        <h2 className="font-serif text-xl tracking-wide text-paper">首页背景</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          这张图会铺在首页最上方，作为整站的“第一眼”。
        </p>

        <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden border border-line bg-surface">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="当前首页背景"
              className="h-full w-full object-cover"
              style={
                record?.blurDataUrl
                  ? { backgroundImage: `url(${record.blurDataUrl})`, backgroundSize: "cover" }
                  : undefined
              }
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(120%_90%_at_68%_16%,rgba(198,166,132,0.28),transparent_58%),radial-gradient(90%_80%_at_18%_82%,rgba(70,96,112,0.45),transparent_62%),linear-gradient(168deg,#101820_0%,#1d2a31_45%,#080a0c_100%)]">
              <span className="text-xs tracking-[0.2em] text-white/45">当前使用默认渐变</span>
            </div>
          )}
        </div>

        <BackgroundForm hasBackground={Boolean(record)} />
      </section>

      <section className="mt-16 border-t border-line pt-10">
        <h2 className="font-serif text-xl tracking-wide text-paper">关于我页面</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          “关于我”页面的正文和联系邮箱。改完保存，前台立刻生效。
        </p>

        <div className="mt-6">
          <AboutForm intro={about.intro} email={about.email} />
        </div>
      </section>
    </div>
  );
}
