import type { createClient } from "@/lib/supabase/server";

type Client = Awaited<ReturnType<typeof createClient>>;

/**
 * True bila pengguna yang sedang masuk adalah admin.
 * Server action bisa dipanggil langsung tanpa melewati layout admin, jadi setiap aksi admin memeriksanya sendiri.
 */
export async function isAdmin(supabase: Client): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return data?.role === "admin";
}
