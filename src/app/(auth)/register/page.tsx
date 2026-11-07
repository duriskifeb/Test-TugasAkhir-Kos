"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getAuthErrorMessage } from "@/lib/auth-error-message";
import { AuthShell, AuthToast } from "@/components/ui/AuthShell";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      const { data: invited, error: inviteError } = await supabase.rpc("is_staff_invited", {
        p_email: email.trim().toLowerCase(),
      });
      if (inviteError) {
        setError(
          inviteError.code === "PGRST202"
            ? "Pendaftaran belum siap karena pembaruan database belum diterapkan. Silakan hubungi pengelola aplikasi."
            : "Kami belum dapat memeriksa status undangan. Silakan coba lagi beberapa saat.",
        );
        return;
      }

      if (invited) {
        setError("Email ini sudah diundang sebagai pengelola kos. Silakan buka tautan undangan yang dikirim ke email Anda.");
        return;
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            role: "owner",
          },
        },
      });

      if (signUpError) {
        setError(getAuthErrorMessage(signUpError, "register"));
        return;
      }

      if (!signUpData.session) {
        setMessage("Akun berhasil dibuat. Silakan cek email untuk verifikasi sebelum masuk. Periksa juga folder spam.");
        return;
      }

      setMessage("Akun berhasil dibuat! Mengalihkan ke halaman masuk...");
      window.setTimeout(() => router.push("/login"), 1500);
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "register"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Buat Akun Baru"
      subtitle="Isi data berikut untuk membuat akun Build Kos Anda."
      aside={{
        title: "Mulai kelola kos Anda bersama Build Kos.",
        text: "Buat akun pemilik kos, lalu masuk ke dashboard Anda.",
      }}
      footer={
        <>
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Masuk sekarang
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-gray-800">
            Nama Lengkap
          </label>
          <input
            id="fullName"
            type="text"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Contoh: Siti Rahmawati"
            className="field"
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-gray-800">
            Nomor Telepon
          </label>
          <input
            id="phone"
            type="tel"
            required
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Contoh: 08123456789"
            className="field"
          />
        </div>

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
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi"
              className="field pr-11"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
          {loading ? "Memproses..." : "Daftar"}
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
