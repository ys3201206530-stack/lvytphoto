export default function WorksLoading() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-5 pb-24 pt-32 sm:px-8">
      <div className="h-3 w-16 animate-pulse bg-surface" />
      <div className="mt-5 h-10 w-48 animate-pulse bg-surface" />
      <div className="mt-4 h-3 w-2/3 max-w-md animate-pulse bg-surface" />

      <div className="mt-10 flex gap-2 border-t border-line pt-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-9 w-16 animate-pulse bg-surface" />
        ))}
      </div>

      <div className="mt-10 gap-4 sm:columns-2 lg:columns-3 lg:gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="mb-4 w-full animate-pulse break-inside-avoid bg-surface lg:mb-6"
            style={{ aspectRatio: index % 2 === 0 ? "4 / 5" : "3 / 2" }}
          />
        ))}
      </div>
    </div>
  );
}
