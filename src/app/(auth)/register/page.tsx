"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  const [role, setRole] = useState<"owner" | "staff">("owner");

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

    setLoading(true);

    try {
      // Peran akun ditetapkan oleh database (trigger handle_new_user). Di sini hanya
      // memastikan pilihan pendaftar sesuai dengan undangan dari pemilik kos.
      const { data: invited, error: inviteError } = await supabase.rpc("is_staff_invited", {
        p_email: email,
      });
      if (inviteError) throw inviteError;

      if (role === "staff" && !invited) {
        setError("Email ini belum didaftarkan oleh pemilik kos. Minta pemilik menambahkannya di menu Kelola Akun Staf.");
        return;
      }
      if (role === "owner" && invited) {
        setError('Email ini terdaftar sebagai pengelola kos. Pilih "Pengelola Kos" untuk mendaftar.');
        return;
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            role: role,
          },
        },
      });

      if (signUpError) throw signUpError;

      setMessage("Registrasi berhasil! Silakan login dengan akun Anda.");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(
        err?.code === "PGRST202"
          ? "Pendaftaran belum siap: migrasi database terbaru (is_staff_invited) belum dijalankan."
          : err?.message || "Terjadi kesalahan yang tidak terduga.",
      );
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: "owner", label: "Pemilik Kos" },
    { value: "staff", label: "Pengelola Kos" },
  ] as const;

  return (
    <AuthShell
      title="Buat Akun Baru"
      subtitle="Isi data berikut untuk membuat akun Build Kos Anda."
      aside={{
        title: "Mulai kelola kos Anda bersama Build Kos.",
        text: "Buat akun pemilik kos atau pengelola kos, lalu masuk ke dashboard Anda.",
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
        <fieldset>
          <legend className="mb-1.5 block text-sm font-medium text-gray-800">Daftar sebagai</legend>
          <div className="grid grid-cols-2 gap-2">
            {roleOptions.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-400 has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:checked]:text-primary has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary"
              >
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={role === option.value}
                  onChange={() => setRole(option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
          {role === "staff" && (
            <p className="mt-2 text-sm text-gray-600">
              Gunakan email yang didaftarkan pemilik kos di menu Kelola Akun Staf.
            </p>
          )}
        </fieldset>

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
