"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell, AuthToast } from "@/components/ui/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (signInError) throw signInError;

      let redirectUrl = "/dashboard";
      if (signInData.user) {
        // PERBAIKAN: Ambil data profile TANPA menggunakan filter yang bisa diblok RLS 
        // Menggunakan "as any" untuk sementara mem-bypass masalah Typescript pada auth meta
        const userMeta = signInData.user.user_metadata as any;
        const userRoleMeta = userMeta?.role;

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", signInData.user.id)
          .single();

        // KITA CEK KEDUANYA (dari meta-data saat register DAN dari tabel profile)
        const finalRole = profile?.role || userRoleMeta;
        
        console.log("DEBUG ROLE:", finalRole);

        if (finalRole === "admin") {
          redirectUrl = "/admin/dashboard";
        } else if (finalRole === "renter") {
          redirectUrl = "/renter/dashboard";
        } else {
          redirectUrl = "/dashboard";
        }
      }

      setMessage("Login berhasil! Mengalihkan ke dashboard...");
      setTimeout(() => {
        router.push(redirectUrl);
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan yang tidak terduga.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Selamat Datang Kembali"
      subtitle="Masukkan email dan kata sandi untuk mengakses akun Anda."
      aside={{
        title: "Kelola kos Anda dengan mudah, dari kamar sampai laporan.",
        text: "Masuk untuk mengakses dashboard dan mengelola kos Anda.",
      }}
      footer={
        <>
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Daftar sekarang
          </Link>
        </>
      }
    >
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

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-800">
            Kata Sandi
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi"
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
          <div className="mt-2 text-right">
            <Link href="/lupa-sandi" className="text-sm font-semibold text-primary hover:underline">
              Lupa kata sandi?
            </Link>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>

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
