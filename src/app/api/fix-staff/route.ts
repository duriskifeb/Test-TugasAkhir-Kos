import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("tenant_staffs")
    .update({ status: "active" })
    .eq("status", "pending");
    
  if (error) {
    return NextResponse.json({ success: false, error });
  }
  
  return NextResponse.json({ success: true, message: "Staff updated to active" });
}
