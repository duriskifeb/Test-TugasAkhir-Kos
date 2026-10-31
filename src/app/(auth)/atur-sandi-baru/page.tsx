"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell, AuthToast } from "@/components/ui/AuthShell";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "ready" | "invalid">("checking");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createClient();

  // Tautan dari email membawa kode pemulihan di URL. Supabase menukarnya menjadi sesi
  // saat klien dibuat, jadi cukup menunggu sesi itu ada.
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setStatus(data.session ? "ready" : "invalid");
    });
    return () => {
      active = false;
    };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Kata sandi dan konfirmasi tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      // Keluar dulu supaya halaman masuk tidak langsung mengalihkan ke dashboard.
      await supabase.auth.signOut();
      setMessage("Kata sandi berhasil diubah. Mengalihkan ke halaman masuk...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan yang tidak terduga.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Atur Kata Sandi Baru"
      subtitle="Masukkan kata sandi baru untuk akun Anda."
      aside={{
        title: "Satu langkah lagi untuk kembali masuk.",
        text: "Pilih kata sandi baru yang mudah Anda ingat dan sulit ditebak orang lain.",
      }}
      footer={
        <>
          Kembali ke{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            halaman masuk
          </Link>
        </>
      }
    >
      {status === "checking" && <p className="text-center text-sm text-gray-600">Memeriksa tautan...</p>}

      {status === "invalid" && (
        <div role="alert" className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-center">
          <p className="font-semibold text-gray-900">Tautan tidak valid atau sudah kedaluwarsa</p>
          <p className="mt-1 text-sm text-gray-600">Minta tautan baru untuk mengatur ulang kata sandi Anda.</p>
          <Link href="/lupa-sandi" className="btn btn-primary mt-4">
            Minta tautan baru
          </Link>
        </div>
      )}

      {status === "ready" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-800">
              Kata Sandi Baru
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="field pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-gray-800">
              Konfirmasi Kata Sandi
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi"
              className="field"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
            {loading ? "Menyimpan..." : "Simpan Kata Sandi"}
          </button>
        </form>
      )}

      <AuthToast
        error={error}
        message={message}
        onClose={() => {
          setError(null);
          setMessage(null);
        }}
      />
    </AuthShell>
  );
}
