import { Unit } from "@/types/unit";
import { RecommendationInput, RecommendationScoreBreakdown } from "@/types/recommend";

export function buildRecommendationReasons(unit: Unit, input: RecommendationInput, breakdown: RecommendationScoreBreakdown): string[] {
  const reasons: string[] = [];

  // Use Case
  if (breakdown.useCase >= 24) {
    if (input.useCase === "home_assistance") reasons.push("Strong match for home assistance environments.");
    else if (input.useCase === "industrial_logistics") reasons.push("Aligned heavily with heavy industrial logistics.");
    else if (input.useCase === "security") reasons.push("Built expressly for patrol and perimeter security.");
    else if (input.useCase === "education_dev") reasons.push("Ideal architecture for technical education / development.");
    else if (input.useCase === "research_prototype") reasons.push("Top pick for experimental and prototype deployment.");
    else if (input.useCase === "healthcare_lab") reasons.push("Excellent clinical capabilities for lab workflows.");
  } else if (breakdown.useCase >= 15) {
    reasons.push("Displays cross-functional capabilities serving your core use case.");
  }

  // Environment
  if (breakdown.environment >= 14) {
    reasons.push(`Highly optimized for continuous operations in ${input.environment.replace('_', ' ')} conditions.`);
  } else if (breakdown.environment >= 8) {
    reasons.push(`Adaptable enough to function inside your target deployment area.`);
  }

  // Purchase Preference
  if (input.purchasePreference === "buy_now" && unit.purchaseMode === "buy_now") {
    reasons.push("Available immediately for direct system checkout.");
  } else if (input.purchasePreference === "quote_ok" && (unit.purchaseMode === "partner_quote" || unit.purchaseMode === "inquiry_only")) {
    reasons.push("Enterprise pricing and specialized quoting available.");
  } else if (input.purchasePreference === "waitlist_ok" && unit.purchaseMode === "waitlist") {
    reasons.push("Waitlist allocation is open for production runs.");
  }

  // Budget
  if (breakdown.budget === 15) {
    reasons.push("Fits perfectly within your allocated system budget parameters.");
  } else if (breakdown.budget >= 10) {
    reasons.push("Falls near your budget threshold.");
  } else if (breakdown.budget < 5 && (unit.purchaseMode === "partner_quote" || unit.purchaseMode === "inquiry_only")) {
    reasons.push("Requires quoting but remains viable for enterprise evaluation.");
  }

  // Ensure minimum reasons
  if (reasons.length < 3) {
    if (unit.capabilities.length > 0) reasons.push(`Features: ${unit.capabilities[0]}`);
    if (breakdown.availability > 3) reasons.push("Strong supply chain availability.");
  }

  return reasons.slice(0, 4); // return top 4 max
}
