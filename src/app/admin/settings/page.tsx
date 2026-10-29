import { requireAdmin } from "@/lib/auth";
import { publicPhotoUrl } from "@/lib/photo-url";
import { getBackgroundRecord } from "@/lib/site-background";
import { BackgroundForm } from "./background-form";

export const instant = false;
export const metadata = { title: "站点背景" };

export default async function SettingsPage() {
  await requireAdmin();

  const record = await getBackgroundRecord();
  const previewUrl = record ? publicPhotoUrl(record.path, "lg") : null;

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8">
      <p className="text-[11px] uppercase tracking-[0.42em] text-accent">SETTINGS</p>
      <h1 className="mt-3 font-serif text-3xl tracking-wide text-paper">站点背景</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
        这张图会铺在首页最上方，作为整站的“第一眼”。只有管理员能更换；访客和普通注册用户看不到入口，也无法通过接口修改。
      </p>

      <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden border border-line bg-surface">
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
    </div>
  );
}
