import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { Logo } from "./Logo";
import { AuthIllustration } from "./AuthIllustration";

export function AuthShell({
  title,
  subtitle,
  footer,
  aside,
  children,
}: {
  title: string;
  subtitle: string;
  footer: ReactNode;
  aside: { title: string; text: string };
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-white lg:grid lg:grid-cols-2 lg:gap-5 lg:p-5">
      <div className="flex min-h-dvh flex-col px-5 py-6 sm:px-10 lg:min-h-[calc(100dvh-2.5rem)] lg:px-8 lg:py-4 xl:px-12">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">
            <h1 className="text-center font-display text-3xl font-bold tracking-tight text-balance text-gray-900 sm:text-4xl">
              {title}
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-center text-gray-600">{subtitle}</p>
            <div className="mt-10">{children}</div>
            <p className="mt-6 text-center text-sm text-gray-600">{footer}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm text-gray-600">
          <p>&copy; 2026 Build Kos</p>
          <Link href="/kebijakan-privasi" className="hover:text-gray-900 hover:underline">
            Kebijakan Privasi
          </Link>
        </div>
      </div>

      <aside
        aria-hidden
        className="relative hidden self-start overflow-hidden rounded-2xl bg-primary lg:sticky lg:top-5 lg:block lg:h-[calc(100dvh-2.5rem)]"
      >
        <AuthIllustration title={aside.title} text={aside.text} />
      </aside>
    </div>
  );
}

export function AuthToast({
  error,
  message,
  onClose,
}: {
  error: string | null;
  message: string | null;
  onClose: () => void;
}) {
  if (!error && !message) return null;
  return (
    <div className="fixed inset-x-4 top-4 z-50 sm:inset-x-auto sm:right-5 sm:top-5 sm:w-80">
      <div
        role={error ? "alert" : "status"}
        className={`flex items-start gap-3 rounded-xl border bg-white p-4 shadow-pop ${
          error ? "border-red-200" : "border-green-200"
        }`}
      >
        {error ? (
          <XCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
        ) : (
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" />
        )}
        <p className="flex-1 text-sm text-gray-800">{error || message}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup pemberitahuan"
          className="shrink-0 text-gray-500 hover:text-gray-900"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
