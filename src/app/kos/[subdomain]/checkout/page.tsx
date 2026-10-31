import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "./CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage(props: {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ room?: string }>;
}) {
  const { subdomain } = await props.params;
  const { room: roomId } = await props.searchParams;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, status")
    .eq("subdomain", subdomain)
    .maybeSingle();

  if (!tenant || tenant.status !== "VERIFIED") {
    notFound();
  }

  const { data: room } = roomId
    ? await supabase
        .from("rooms")
        .select("id, name, price")
        .eq("id", roomId)
        .eq("boarding_house_id", tenant.id)
        .is("deleted_at", null)
        .maybeSingle()
    : { data: null };

  return <CheckoutForm subdomain={subdomain} tenant={{ id: tenant.id, name: tenant.name }} room={room} />;
}
