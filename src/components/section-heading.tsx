import Link from "next/link";

export function SectionHeading({
  index,
  title,
  description,
  href,
  linkLabel = "查看全部",
}: {
  index: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.34em] text-accent">
          {index}
        </p>
        <h2 className="mt-3 text-2xl font-medium tracking-tight md:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
            {description}
          </p>
        ) : null}
      </div>

      {href ? (
        <Link
          href={href}
          className="group inline-flex items-center gap-2 pb-1 text-[13px] tracking-[0.14em] text-muted transition-colors hover:text-accent"
        >
          {linkLabel}
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
      ) : null}
    </div>
  );
}
