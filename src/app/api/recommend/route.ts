import { NextResponse, type NextRequest } from "next/server";
import { getPublicUnits } from "@/lib/catalog/queries";
import { getRecommendations } from "@/lib/recommend/engine";
import { RecommendationInput } from "@/types/recommend";

export async function POST(req: NextRequest) {
  try {
    const body: RecommendationInput = await req.json();
    
    if (!body || !body.useCase || !body.environment) {
      return NextResponse.json({ error: "Missing required core parameters." }, { status: 400 });
    }

    const catalog = await getPublicUnits();
    const { results: ranked, metadata } = getRecommendations(catalog, body);

    // Only return top 5, attach Unit objects strictly for rendering context
    const enrichedResults = ranked.slice(0, 5).map(res => ({
      ...res,
      unitObj: catalog.find(u => u.id === res.unitId)
    }));

    return NextResponse.json({ 
      results: enrichedResults,
      metadata 
    });
  } catch(err: any) {
    console.error("[Recommendations API] Failed to run orchestrator", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
