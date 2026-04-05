import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { track } from "@/lib/analytics/track";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, name, email, company, message } = body;

    if (!items || !items.length || !name || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Map each requested item into a separate DB row, or group via JSONB
    // Standard approach: insert a single "request" with items_json
    const payload = {
      user_id: user ? user.id : null,
      unit_id: items.map((i: any) => i.unitId).join(", "),
      name,
      email,
      company,
      message: `[Bulk Quote Request for: ${JSON.stringify(items)}] \n\n ${message || ''}`,
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('quote_requests')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    // Track downstream completion
    await track("quote_submitted", { 
      resultCount: items.length,
      fulfillmentType: "partner_quote"
    });

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err: any) {
    console.error("[Quote Request API Error]:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
