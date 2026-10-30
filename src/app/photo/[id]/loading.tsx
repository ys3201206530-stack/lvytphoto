export default function PhotoLoading() {
  return (
    <div className="mx-auto w-full max-w-[1500px] px-5 pb-24 pt-28 sm:px-8">
      <div className="h-3 w-24 animate-pulse bg-surface" />
      <div className="mt-6 flex h-[60vh] w-full animate-pulse items-center justify-center bg-surface">
        <span className="text-[11px] tracking-[0.22em] text-faint">
          正在加载照片…
        </span>
      </div>
      <div className="mx-auto mt-10 max-w-3xl space-y-4">
        <div className="h-3 w-40 animate-pulse bg-surface" />
        <div className="h-8 w-2/3 animate-pulse bg-surface" />
        <div className="h-3 w-full animate-pulse bg-surface" />
      </div>
    </div>
  );
}
