export type RecommendationInput = {
  useCase:
    | "home_assistance"
    | "industrial_logistics"
    | "security"
    | "education_dev"
    | "research_prototype"
    | "healthcare_lab";
  environment:
    | "home"
    | "office"
    | "warehouse"
    | "outdoors"
    | "lab_clinic"
    | "mixed";
  budgetBand:
    | "under_1000"
    | "1000_5000"
    | "5000_20000"
    | "20000_plus"
    | "flexible";
  purchasePreference:
    | "buy_now"
    | "quote_ok"
    | "waitlist_ok"
    | "any";
  deploymentScale:
    | "single"
    | "small_fleet"
    | "enterprise";
};

export type RefinementSignal = {
  key: "budget" | "scale" | "environment" | "purchaseMode";
  title: string;
  description: string;
  actionLabel: string;
};

export type RecommendationScoreBreakdown = {
  useCase: number;
  environment: number;
  budget: number;
  purchasePreference: number;
  deploymentScale: number;
  availability: number;
  total: number;
};

export type PersuasiveReason = {
  text: string;
  dominantDimension:
    | "useCase"
    | "environment"
    | "budget"
    | "purchaseMode"
    | "scale"
    | "availability";
  evidenceKey?: string;
  reasonType:
    | "dominant_match"
    | "constraint_fit"
    | "differentiator"
    | "refinement_needed";
};

export type RecommendationResult = {
  unitId: string;
  slug: string;
  score: number;
  breakdown: RecommendationScoreBreakdown;
  reasons: string[];
  unitObj?: import("./unit").Unit;
  persuasiveReason?: PersuasiveReason;
  confidence?: {
    gap: number;
    level: "HIGH" | "MEDIUM" | "LOW";
  };
};
