import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { track } from "@/lib/analytics/track";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { unitId, email } = body;

    if (!unitId || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
      user_id: user ? user.id : null,
      unit_id: unitId,
      name: "Waitlist Entrant",
      email: email,
      message: `[Priority Waitlist Entry: ${unitId}]`,
      status: "waitlist"
    };

    const { data, error } = await supabase
      .from('quote_requests')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    // Track downstream completion
    await track("waitlist_locked", { 
      unitSlug: unitId,
      fulfillmentType: "waitlist"
    });

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err: any) {
    console.error("[Waitlist API Error]:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
