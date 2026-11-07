import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const supabase = await createClient();
  let verified = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      verified = true;
    } else {
      console.error("Gagal memverifikasi kode undangan staf:", error.message);
    }
  } else if (tokenHash && type === "invite") {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "invite",
    });
    if (!error) {
      verified = true;
    } else {
      console.error("Gagal memverifikasi tautan undangan staf:", error.message);
    }
  }

  if (verified) {
    const { data: activated, error } = await supabase.rpc("activate_staff_invitation");
    if (error || !activated) {
      console.error(
        "Undangan terverifikasi, tetapi akses staf gagal diaktifkan:",
        error?.message ?? "Tidak ditemukan undangan untuk akun ini.",
      );
      return NextResponse.redirect(
        new URL("/atur-sandi-baru?invite_error=activation", request.url),
      );
    }

    return NextResponse.redirect(new URL("/atur-sandi-baru", request.url));
  }

  return NextResponse.redirect(new URL("/atur-sandi-baru", request.url));
}
