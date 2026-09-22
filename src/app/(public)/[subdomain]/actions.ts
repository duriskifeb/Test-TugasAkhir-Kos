"use server";

import { createClient } from "@/lib/supabase/server";

export async function getTenantBySubdomain(subdomain: string) {
  const supabase = await createClient();

  const { data: tenant, error } = await supabase
    .from('tenants')
    .select(`
      id, 
      name, 
      address,
      page_sections (*)
    `)
    .eq('subdomain', subdomain)
    .single();

  if (error || !tenant) {
    return null;
  }

  return tenant;
}