type AuthErrorContext = "login" | "register";

function getErrorDetails(error: unknown): {
  code?: string;
  status?: number;
  message?: string;
} {
  if (typeof error !== "object" || error === null) return {};

  const details = error as { code?: unknown; status?: unknown; message?: unknown };
  return {
    code: typeof details.code === "string" ? details.code : undefined,
    status: typeof details.status === "number" ? details.status : undefined,
    message: typeof details.message === "string" ? details.message : undefined,
  };
}

export function getAuthErrorMessage(error: unknown, context: AuthErrorContext): string {
  const { code, status, message } = getErrorDetails(error);

  switch (code) {
    case "invalid_credentials":
      return "Email atau kata sandi salah. Periksa kembali lalu coba lagi.";
    case "email_not_confirmed":
      return "Email Anda belum diverifikasi. Silakan cek email dan klik tautan verifikasi sebelum masuk.";
    case "email_exists":
    case "user_already_exists":
      return "Email ini sudah terdaftar. Silakan masuk atau gunakan fitur lupa kata sandi.";
    case "weak_password":
      return "Kata sandi belum cukup kuat. Silakan gunakan kata sandi yang lebih kuat.";
    case "email_address_invalid":
      return "Format email tidak valid. Periksa kembali alamat email Anda.";
    case "over_request_rate_limit":
    case "too_many_requests":
      return "Terlalu banyak percobaan. Silakan tunggu beberapa saat sebelum mencoba lagi.";
    case "signup_disabled":
      return "Pendaftaran akun sedang dinonaktifkan. Silakan hubungi pengelola aplikasi.";
    case "user_banned":
      return "Akun Anda sedang dinonaktifkan. Silakan hubungi pengelola aplikasi.";
    case "validation_failed":
      return "Data yang dimasukkan belum sesuai. Periksa kembali formulir Anda.";
  }

  if (error instanceof TypeError || /network|fetch/i.test(message ?? "")) {
    return "Tidak dapat terhubung ke layanan. Periksa koneksi internet Anda lalu coba lagi.";
  }
  if (status === 429) {
    return "Terlalu banyak percobaan. Silakan tunggu beberapa saat sebelum mencoba lagi.";
  }
  if (status !== undefined && status >= 500) {
    return "Layanan sedang mengalami gangguan. Silakan coba lagi beberapa saat.";
  }

  return context === "login"
    ? "Login belum berhasil. Periksa data Anda dan coba lagi."
    : "Pendaftaran belum berhasil. Periksa data Anda dan coba lagi.";
}
