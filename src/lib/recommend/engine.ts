import { Unit } from "@/types/unit";
import { RecommendationInput, RecommendationResult } from "@/types/recommend";
import { 
  scoreUseCase, 
  scoreEnvironment, 
  scorePurchasePreference, 
  scoreBudget, 
  scoreDeploymentScale, 
  scoreAvailability 
} from "./scoring";
import { buildRecommendationReasons } from "./explanations";
import { deriveRefinementSignals } from "./reasons";

export function getRecommendations(
  units: Unit[],
  input: RecommendationInput
): { 
  results: RecommendationResult[]; 
  metadata: { 
    confidenceGap: number; 
    confidenceLevel: "HIGH" | "MEDIUM" | "LOW";
    uncertaintyReason?: string;
    refinementSignals?: import("@/types/recommend").RefinementSignal[];
  } 
} {
  // 1. Initial Soft Filtering
  const eligible = units;

  // 2. Score all eligible units
  const scored = eligible.map((unit) => {
    const useCase = scoreUseCase(unit, input);
    const environment = scoreEnvironment(unit, input);
    const purchasePreference = scorePurchasePreference(unit, input);
    const budget = scoreBudget(unit, input);
    const deploymentScale = scoreDeploymentScale(unit, input);
    const availability = scoreAvailability(unit);

    const total =
      useCase +
      environment +
      purchasePreference +
      budget +
      deploymentScale +
      availability;

    const breakdown = {
      useCase,
      environment,
      purchasePreference,
      budget,
      deploymentScale,
      availability,
      total,
    };

    const reasons = buildRecommendationReasons(unit, input, breakdown);

    return {
      unitId: unit.id,
      slug: unit.slug,
      score: total,
      breakdown,
      reasons,
    };
  });

  // 3. Sort deterministic
  const sorted = scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.breakdown.useCase !== a.breakdown.useCase)
      return b.breakdown.useCase - a.breakdown.useCase;
    if (b.breakdown.purchasePreference !== a.breakdown.purchasePreference)
      return b.breakdown.purchasePreference - a.breakdown.purchasePreference;
    if (b.breakdown.availability !== a.breakdown.availability)
      return b.breakdown.availability - a.breakdown.availability;
    return a.slug.localeCompare(b.slug);
  });

  // 4. Calculate Confidence
  const top = sorted[0];
  const runnerUp = sorted[1];
  const gap = top && runnerUp ? top.score - runnerUp.score : 0;
  
  let level: "HIGH" | "MEDIUM" | "LOW" = "LOW";
  if (gap >= 15) level = "HIGH";
  else if (gap >= 5) level = "MEDIUM";

  // 5. Build Uncertainty Signals (if LOW)
  let uncertaintyReason = "";
  let refinementSignals: import("@/types/recommend").RefinementSignal[] = [];

  if (level === "LOW") {
    const derived = deriveRefinementSignals(sorted, input);
    uncertaintyReason = derived.uncertaintyReason;
    refinementSignals = derived.signals;
  }

  return {
    results: sorted,
    metadata: {
      confidenceGap: gap,
      confidenceLevel: level,
      uncertaintyReason,
      refinementSignals
    }
  };
}
