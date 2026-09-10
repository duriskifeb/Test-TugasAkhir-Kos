import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("=== 1. CHECK PROFILES ===");
  const { data: ownerProfile } = await supabase.from('profiles').select('*').ilike('email', 'pintuberkah@kos.com');
  console.log("Owner Profile:", ownerProfile);
  
  const { data: staffProfile } = await supabase.from('profiles').select('*').ilike('email', 'karyawanPintuBerkah1@gmail.com');
  console.log("Staff Profile:", staffProfile);

  console.log("\n=== 2. CHECK TENANTS OWNED BY OWNER ===");
  let ownerId = ownerProfile?.[0]?.id;
  let tenants = [];
  if (ownerId) {
    const { data: t } = await supabase.from('tenants').select('*').eq('owner_id', ownerId);
    tenants = t || [];
    console.log("Tenants owned by pintuberkah@kos.com:", tenants.map(t => ({ id: t.id, name: t.name, slug: t.slug })));
  } else {
    console.log("Owner profile not found, skipping tenants check.");
  }

  console.log("\n=== 3. CHECK STAFF REGISTRATION ===");
  const { data: staffRegs } = await supabase.from('tenant_staffs').select('*').ilike('email', 'karyawanPintuBerkah1@gmail.com');
  console.log("Staff Registration for karyawanPintuBerkah1@gmail.com:", staffRegs);
  
  if (staffRegs && staffRegs.length > 0) {
      console.log("\nStaff is registered to tenant IDs:", staffRegs.map(s => s.tenant_id));
      const isCorrectTenant = tenants.some(t => t.id === staffRegs[0].tenant_id);
      console.log("Does the tenant belong to owner (pintuberkah@kos.com)? :", isCorrectTenant);
  }
}
run();
