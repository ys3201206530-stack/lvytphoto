export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="border-b border-line pb-10 md:pb-14">
      <p className="text-[10px] uppercase tracking-[0.4em] text-accent">
        {eyebrow}
      </p>
      <h1 className="mt-5 text-3xl font-light tracking-tight md:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-5 max-w-xl text-sm leading-7 text-muted">
          {description}
        </p>
      ) : null}
    </header>
  );
}
