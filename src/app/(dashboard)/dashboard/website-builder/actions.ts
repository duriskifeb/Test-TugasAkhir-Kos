"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveWebsiteSettings(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // 1. Ambil tenant dengan dukungan multi-cabang (cookie)
  const { data: allTenants } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id);

  if (!allTenants || allTenants.length === 0) {
    return { error: "Kos belum terdaftar." };
  }
  
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const savedTenantId = cookieStore.get('active_tenant_id')?.value;
  
  let tenantId = allTenants[0].id;
  if (savedTenantId && allTenants.some(t => t.id === savedTenantId)) {
    tenantId = savedTenantId;
  }
  
  const tenant = { id: tenantId };

  // 2. Ekstrak data tema
  const primaryColor = formData.get("primaryColor") as string;
  const fontFamily = formData.get("fontFamily") as string;
  const theme: any = { primaryColor, fontFamily };

  // Update theme di tenants
  const templateStyle = formData.get("templateStyle") as string || "modern";
  theme.templateStyle = templateStyle;
  await supabase.from("tenants").update({ theme }).eq("id", tenant.id);

  // 3. Ekstrak data hero section
  const layoutOrderStr = formData.get("layoutOrder") as string;
  const layoutOrder = layoutOrderStr ? layoutOrderStr.split(",") : ["hero", "features", "gallery"];

  const heroTitle = formData.get("heroTitle") as string;
  const heroSubtitle = formData.get("heroSubtitle") as string;
  const heroCtaText = formData.get("heroCtaText") as string;

  const heroContent = {
    title: heroTitle,
    subtitle: heroSubtitle,
    ctaText: heroCtaText,
  };

  const heroOrderIndex = layoutOrder.indexOf("hero") + 1;

  // Upsert hero section
  const { data: existingHero } = await supabase
    .from("page_sections")
    .select("id")
    .eq("tenant_id", tenant.id)
    .eq("section_type", "hero")
    .maybeSingle();

  if (existingHero) {
    await supabase.from("page_sections").update({ content: heroContent, order_index: heroOrderIndex }).eq("id", existingHero.id);
  } else {
    await supabase.from("page_sections").insert({
      tenant_id: tenant.id,
      section_type: "hero",
      content: heroContent,
      order_index: heroOrderIndex,
    });
  }

  // 4. Ekstrak data features
  const feature1Text = formData.get("feature1Text") as string;
  const feature2Text = formData.get("feature2Text") as string;
  const feature3Text = formData.get("feature3Text") as string;
  
  const roomsTitle = formData.get("roomsTitle") as string || "Pilihan Kamar";
  const whatsappNumber = formData.get("whatsappNumber") as string || "";

  const featuresContent = {
    title: formData.get("featuresTitle") as string || "Fasilitas & Keunggulan",
    roomsTitle: roomsTitle,
    whatsappNumber: whatsappNumber,
    items: [
      { icon: "CheckCircle2", text: feature1Text },
      { icon: "CheckCircle2", text: feature2Text },
      { icon: "CheckCircle2", text: feature3Text },
    ].filter(f => f.text) // Hapus yang kosong
  };

  const featuresOrderIndex = layoutOrder.indexOf("features") + 1;

  const { data: existingFeatures } = await supabase
    .from("page_sections")
    .select("id")
    .eq("tenant_id", tenant.id)
    .eq("section_type", "features")
    .maybeSingle();

  if (existingFeatures) {
    await supabase.from("page_sections").update({ content: featuresContent, order_index: featuresOrderIndex }).eq("id", existingFeatures.id);
  } else {
    await supabase.from("page_sections").insert({
      tenant_id: tenant.id,
      section_type: "features",
      content: featuresContent,
      order_index: featuresOrderIndex,
    });
  }

  // 5. Ekstrak data kamar (hanya untuk menyimpan urutannya saja jika di drag-drop)
  const roomsOrderIndex = layoutOrder.indexOf("rooms") + 1;
  const { data: existingRooms } = await supabase
    .from("page_sections")
    .select("id")
    .eq("tenant_id", tenant.id)
    .eq("section_type", "rooms")
    .maybeSingle();

  if (existingRooms) {
    await supabase.from("page_sections").update({ order_index: roomsOrderIndex, content: {} }).eq("id", existingRooms.id);
  } else {
    await supabase.from("page_sections").insert({
      tenant_id: tenant.id,
      section_type: "rooms",
      content: {},
      order_index: roomsOrderIndex,
    });
  }

  // 5. Ekstrak data gallery
  const galleryImages = [];
  const MAX_IMAGES = 6;
  
  for (let i = 0; i < MAX_IMAGES; i++) {
    const file = formData.get(`galleryImage${i}`) as File | null;
    const existingUrl = formData.get(`existingGalleryUrl${i}`) as string | null;
    
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${tenant.id}/${Math.random()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('tenant-assets')
        .upload(fileName, file);
        
      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from('tenant-assets')
          .getPublicUrl(fileName);
        galleryImages.push({ url: publicUrl });
      }
    } else if (existingUrl) {
      galleryImages.push({ url: existingUrl });
    }
  }

  const galleryContent = {
    title: "Galeri Foto",
    images: galleryImages
  };

  const galleryOrderIndex = layoutOrder.indexOf("gallery") + 1;

  const { data: existingGallery } = await supabase
    .from("page_sections")
    .select("id")
    .eq("tenant_id", tenant.id)
    .eq("section_type", "gallery")
    .maybeSingle();

  if (existingGallery) {
    await supabase.from("page_sections").update({ content: galleryContent, order_index: galleryOrderIndex }).eq("id", existingGallery.id);
  } else {
    await supabase.from("page_sections").insert({
      tenant_id: tenant.id,
      section_type: "gallery",
      content: galleryContent,
      order_index: galleryOrderIndex,
    });
  }

  revalidatePath("/dashboard/website-builder");
  return { success: "Perubahan website berhasil disimpan!" };
}