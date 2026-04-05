import { RecommendationInput, RecommendationResult, PersuasiveReason, RefinementSignal } from "@/types/recommend";

/**
 * Generates a grounded, evidence-backed persuasive reason for a recommendation.
 * Logic:
 * 1. Identify the highest-contributing scored dimension.
 * 2. Map it to a template grounded in user input/unit properties.
 * 3. Add a contrast clause if rank 1 beat rank 2 on a specific decisive factor.
 */
export function generatePersuasiveReason(
  result: RecommendationResult,
  input: RecommendationInput,
  context?: { runnerUp?: RecommendationResult }
): PersuasiveReason {
  const { breakdown } = result;

  // 1. Identify dominant dimension (highest score relative to max)
  // Max possible scores from scoring.ts: 
  // UseCase: 40, Environment: 15, Budget: 20, Preference: 10, Scale: 10, Availability: 5
  const dimensions: { key: PersuasiveReason["dominantDimension"]; score: number; max: number }[] = [
    { key: "useCase", score: breakdown.useCase, max: 40 },
    { key: "environment", score: breakdown.environment, max: 15 },
    { key: "budget", score: breakdown.budget, max: 20 },
    { key: "purchaseMode", score: breakdown.purchasePreference, max: 10 },
    { key: "scale", score: breakdown.deploymentScale, max: 10 },
    { key: "availability", score: breakdown.availability, max: 5 },
  ];

  // Find the one closest to its maximum (percentage-wise)
  const dominant = dimensions.reduce((prev, curr) => 
    (curr.score / curr.max) > (prev.score / prev.max) ? curr : prev
  );

  let text = "";
  let reasonType: PersuasiveReason["reasonType"] = "dominant_match";

  // 2. Map to grounded template
  switch (dominant.key) {
    case "useCase":
      text = `Specifically engineered for ${input.useCase.replace("_", " ")} throughput requirements.`;
      break;
    case "environment":
      text = `Validated for high-performance navigation within ${input.environment} topographies.`;
      break;
    case "budget":
      text = `Optimized for ${input.budgetBand.replace("_", " ")} constraints without sacrificing core capability.`;
      reasonType = "constraint_fit";
      break;
    case "scale":
      text = `Architected for ${input.deploymentScale.replace("_", " ")} coordination and fleet management.`;
      break;
    default:
      text = "Selected for high overall operational fitness across all diagnostic parameters.";
  }

  // 3. Optional Contrast Clause (if gap >= 10 and rank 1 beat rank 2 on this dimension)
  if (context?.runnerUp && (result.score - context.runnerUp.score) >= 10) {
    const scoreKey = dominant.key === "scale" ? "deploymentScale" : 
                     dominant.key === "purchaseMode" ? "purchasePreference" : 
                     dominant.key;
    const runnerUpScore = (context.runnerUp.breakdown as any)[scoreKey];
    if (dominant.score > runnerUpScore) {
      const diff = dominant.score - runnerUpScore;
      if (diff >= 5) {
        text = `${text} This unit provides a decisive advantage in ${dominant.key.replace("purchaseMode", "procurement")} over the next viable option.`;
        reasonType = "differentiator";
      }
    }
  }

  return {
    text,
    dominantDimension: dominant.key,
    reasonType
  };
}

/**
 * Derives specific refinement signals based on result distribution and input.
 * Answers: "Why is confidence low here?"
 */
export function deriveRefinementSignals(
  results: RecommendationResult[],
  input: RecommendationInput
): { uncertaintyReason: string; signals: RefinementSignal[] } {
  const top = results[0];
  const runnerUp = results[1];
  const signals: RefinementSignal[] = [];
  let uncertaintyReason = "";

  if (!top || !runnerUp) return { uncertaintyReason, signals };

  const gap = top.score - runnerUp.score;

  // 1. Score Parity (Tight cluster at the top)
  if (gap < 3) {
    uncertaintyReason = "Multiple configurations match your requirements with near-parity scores.";
    signals.push({
      key: "environment",
      title: "Navigation Context",
      description: "Specify precision obstacles or topography constraints.",
      actionLabel: "Refine Environment"
    });
  }

  // 2. Budget Ambiguity (Top results span divergent budget expectations)
  const budgetDiff = Math.abs(top.breakdown.budget - runnerUp.breakdown.budget);
  if (budgetDiff > 10) {
    uncertaintyReason = uncertaintyReason || "Cost/Performance balance is ambiguous across your inputs.";
    signals.push({
      key: "budget",
      title: "Budget Band",
      description: "Tighten your budget window to improve unit separation.",
      actionLabel: "Narrow Budget"
    });
  }

  // 3. Deployment Scaling (Low specificity on fleet vs single)
  if (top.breakdown.deploymentScale < 5 && runnerUp.breakdown.deploymentScale < 5) {
     signals.push({
      key: "scale",
      title: "Fleet Scale",
      description: "Define if this is a single node or a multi-unit deployment.",
      actionLabel: "Set Scale"
    });
  }

  // Fallback
  if (signals.length === 0) {
    signals.push({
      key: "purchaseMode",
      title: "Purchase Timing",
      description: "Clarify if you require immediate shipping or quote consultation.",
      actionLabel: "Update Preference"
    });
  }

  return { uncertaintyReason, signals };
}
