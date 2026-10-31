"use client";

import Link from "next/link";
import { MailCheck } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell, AuthToast } from "@/components/ui/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/atur-sandi-baru`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan yang tidak terduga.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Lupa Kata Sandi"
      subtitle="Masukkan email akun Anda. Kami akan mengirim tautan untuk mengatur kata sandi baru."
      aside={{
        title: "Akun Anda bisa dipulihkan dalam beberapa langkah.",
        text: "Tautan pemulihan dikirim ke email yang Anda gunakan saat mendaftar.",
      }}
      footer={
        <>
          Ingat kata sandi?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Masuk sekarang
          </Link>
        </>
      }
    >
      {sent ? (
        <div role="status" className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-center">
          <MailCheck className="mx-auto size-8 text-primary" strokeWidth={1.75} />
          <p className="mt-3 font-semibold text-gray-900">Periksa email Anda</p>
          <p className="mt-1 text-sm text-gray-600">
            Jika {email} terdaftar, tautan untuk mengatur kata sandi baru sudah kami kirim. Cek juga folder spam.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-800">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="field"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
            {loading ? "Mengirim..." : "Kirim Tautan"}
          </button>
        </form>
      )}

      <AuthToast error={error} message={null} onClose={() => setError(null)} />
    </AuthShell>
  );
}
