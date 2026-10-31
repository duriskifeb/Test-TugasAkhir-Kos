import Link from "next/link";
import { House } from "lucide-react";

export function Logo({
  href = "/",
  className = "",
  asLink = true,
}: {
  href?: string;
  className?: string;
  /** false: tampil sebagai teks biasa, misalnya saat sidebar dikunci. */
  asLink?: boolean;
}) {
  const classes = `inline-flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-gray-900 ${className}`;
  const content = (
    <>
      <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-gray-900">
        <House size={17} strokeWidth={2.6} />
      </span>
      Build Kos
    </>
  );

  if (!asLink) return <span className={classes}>{content}</span>;

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
