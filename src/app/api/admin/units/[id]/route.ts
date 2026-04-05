import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin";
import { updateUnit, archiveUnit } from "@/lib/catalog/mutations";
import { unitValidationSchema, validateUnitServerMode } from "@/lib/validation/unit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  try {
    const { id } = await params;
    const rawBody = await req.json();
    
    // We parse partial for patch requests just in case, or enforce full replace
    const validatedData = unitValidationSchema.parse(rawBody);
    validateUnitServerMode(validatedData);

    const data = await updateUnit(id, validatedData);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  try {
    const { id } = await params;
    const data = await archiveUnit(id);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
