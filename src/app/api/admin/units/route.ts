import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { createUnit } from "@/lib/catalog/mutations";
import { unitValidationSchema, validateUnitServerMode } from "@/lib/validation/unit";

export async function POST(req: NextRequest) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  try {
    const rawBody = await req.json();
    const validatedData = unitValidationSchema.parse(rawBody);
    validateUnitServerMode(validatedData);

    const data = await createUnit(validatedData);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    console.error("[Units POST API Error]:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
