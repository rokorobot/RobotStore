import { Unit } from "@/types/unit";
import { RecommendationInput } from "@/types/recommend";
import { RECOMMENDATION_CONFIG } from "./config";

function evaluateBonusRules(unit: Unit, rules: any[]): number {
  let score = 0;
  const capsLower = unit.capabilities.map(c => c.toLowerCase());
  const fitLower = unit.deploymentFit.map(f => f.toLowerCase());
  const behaviorsLower = unit.behavioralProfile?.map(b => b.toLowerCase()) || [];

  for (const rule of rules) {
    if (rule.type === "capability" && capsLower.some(c => c.includes(rule.term))) score += rule.score;
    if (rule.type === "fit" && fitLower.some(f => f.includes(rule.term))) score += rule.score;
    if (rule.type === "behavior" && behaviorsLower.some(b => b.includes(rule.term))) score += rule.score;
    
    if (rule.type === "spec_exists" && (unit.specs as any)[rule.term]) score += rule.score;
    if (rule.type === "spec_match" && (unit.specs as any)[rule.term] && (unit.specs as any)[rule.term].toLowerCase().includes(rule.match)) {
      score += rule.score;
    }
    if (rule.type === "array_length") {
      const arr = (unit as any)[rule.property];
      if (Array.isArray(arr) && arr.length >= rule.min) score += rule.score;
    }
  }
  return score;
}

export function scoreUseCase(unit: Unit, input: RecommendationInput): number {
  const cfg = (RECOMMENDATION_CONFIG.useCase as any)[input.useCase];
  if (!cfg) return 0;
  let base = cfg.baseMatch[unit.classSlug] || 0;
  let bonus = evaluateBonusRules(unit, cfg.bonusRules || []);
  return Math.min(RECOMMENDATION_CONFIG.weights.useCaseMax, base + bonus);
}

export function scoreEnvironment(unit: Unit, input: RecommendationInput): number {
  const cfg = (RECOMMENDATION_CONFIG.environment as any)[input.environment];
  if (!cfg) return 0;
  let base = cfg.baseMatch[unit.classSlug] || 0;
  let bonus = evaluateBonusRules(unit, cfg.bonusRules || []);
  return Math.min(RECOMMENDATION_CONFIG.weights.environmentMax, base + bonus);
}

export function scorePurchasePreference(unit: Unit, input: RecommendationInput): number {
  const mapping = (RECOMMENDATION_CONFIG.purchasePreference as any)[input.purchasePreference];
  if (!mapping) return 0;
  return mapping[unit.purchaseMode] || 0;
}

export function scoreBudget(unit: Unit, input: RecommendationInput): number {
  const price = unit.priceCents ? unit.priceCents / 100 : null;

  if (input.budgetBand === "under_1000") {
    if (price !== null) {
      if (price <= 1000) return 15;
      if (price <= 1500) return 10;
      if (price <= 5000) return 4;
      return 0;
    } else {
      return (unit.purchaseMode === "partner_quote" || unit.purchaseMode === "inquiry_only") ? 2 : 0;
    }
  }

  if (input.budgetBand === "1000_5000") {
    if (price !== null) {
      if (price >= 1000 && price <= 5000) return 15;
      if (price < 1000) return 10;
      if (price <= 7000) return 8;
      return 2;
    } else return 5;
  }

  if (input.budgetBand === "5000_20000") {
    if (price !== null) {
      if (price >= 5000 && price <= 20000) return 15;
      if (price < 5000) return 8;
      if (price <= 25000) return 10;
      return 4;
    } else return 8;
  }

  if (input.budgetBand === "20000_plus") {
    if (price !== null) {
      if (price >= 20000) return 15;
      if (price >= 10000) return 10;
      return 6;
    } else return 12;
  }

  if (input.budgetBand === "flexible") {
    if (price !== null) return 12;
    return 15;
  }
  return 0;
}

export function scoreDeploymentScale(unit: Unit, input: RecommendationInput): number {
  const cfg = (RECOMMENDATION_CONFIG.deploymentScale as any)[input.deploymentScale];
  if (!cfg) return 0;
  let base = cfg.baseMatch[unit.classSlug] || 0;
  let purchaseBonus = (cfg.purchaseBonus && cfg.purchaseBonus[unit.purchaseMode]) || 0;
  let bonus = evaluateBonusRules(unit, cfg.bonusRules || []);
  return Math.min(RECOMMENDATION_CONFIG.weights.deploymentScaleMax, base + purchaseBonus + bonus);
}

export function scoreAvailability(unit: Unit): number {
  // Use config map
  const score = (RECOMMENDATION_CONFIG.availabilityStatus as any)[unit.status] ?? 0;
  return Math.min(RECOMMENDATION_CONFIG.weights.availabilityMax, score);
}
