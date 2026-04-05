import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { createBrand } from "@/lib/catalog/mutations";

export async function POST(req: NextRequest) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  try {
    const rawBody = await req.json();
    const data = await createBrand(rawBody);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    console.error("[Brands POST Error]:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
