import Link from "next/link";

export function PageHeader({
  title,
  backHref,
  action,
}: {
  title: string;
  backHref: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Link
        href={backHref}
        className="-ml-1.5 flex h-9 w-9 flex-none items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
        aria-label="Back"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </Link>
      <h1 className="flex-1 truncate text-xl font-bold text-slate-900">
        {title}
      </h1>
      {action}
    </div>
  );
}
