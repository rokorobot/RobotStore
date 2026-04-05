import { RecommendationInput } from "@/types/recommend";

export type CTAResolution = {
  primaryLabel: string;
  secondaryLabel?: string;
  microcopy?: string;
  semanticIntent: "closure" | "comparison" | "refinement";
  primaryAction: "checkout" | "quote" | "compare" | "waitlist" | "refine";
};

export type FulfillmentType = "buy_now" | "partner_quote" | "inquiry_only" | "waitlist";
export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

const REGISTRY: Record<string, Record<ConfidenceLevel, Record<string, CTAResolution>>> = {
  home_assistance: {
    HIGH: {
      buy_now: {
        primaryLabel: "[ DEPLOY THIS SYSTEM ]",
        microcopy: "Optimized for your home environment — no configuration compromise required.",
        semanticIntent: "closure",
        primaryAction: "checkout"
      },
      waitlist: {
        primaryLabel: "[ JOIN HOME DEPLOYMENT WAITLIST ]",
        microcopy: "High-certainty match. Secure your position for the next production batch.",
        semanticIntent: "closure",
        primaryAction: "waitlist"
      },
      partner_quote: {
        primaryLabel: "[ REQUEST HOME DEPLOYMENT PLAN ]",
        microcopy: "Highest diagnostic confidence. Request a tailored installation quote.",
        semanticIntent: "closure",
        primaryAction: "quote"
      }
    },
    MEDIUM: {
      default: {
        primaryLabel: "[ COMPARE TOP MATCHES ]",
        microcopy: "Two strong configurations match your requirements.",
        semanticIntent: "comparison",
        primaryAction: "compare"
      }
    },
    LOW: {
      default: {
        primaryLabel: "[ REFINE YOUR REQUIREMENTS ]",
        microcopy: "Your inputs allow multiple valid configurations. Narrow your preferences.",
        semanticIntent: "refinement",
        primaryAction: "refine"
      }
    }
  },
  security: {
    HIGH: {
      buy_now: {
        primaryLabel: "[ ACTIVATE SECURITY DEPLOYMENT ]",
        microcopy: "Highest diagnostic confidence for continuous perimeter coverage.",
        semanticIntent: "closure",
        primaryAction: "checkout"
      },
      partner_quote: {
        primaryLabel: "[ REQUEST SECURITY DEPLOYMENT PLAN ]",
        microcopy: "Validated for coverage. Initiate professional site assessment.",
        semanticIntent: "closure",
        primaryAction: "quote"
      }
    },
    MEDIUM: {
      default: {
        primaryLabel: "[ COMPARE SECURITY CONFIGS ]",
        microcopy: "Multiple options optimize for different coverage strategies.",
        semanticIntent: "comparison",
        primaryAction: "compare"
      }
    },
    LOW: {
       default: {
        primaryLabel: "[ TUNE SECURITY SPECS ]",
        microcopy: "Coverage strategy and deployment scale require further clarification.",
        semanticIntent: "refinement",
        primaryAction: "refine"
      }
    }
  }
};

/** Explicit Fallback Node */
const FALLBACK: CTAResolution = {
  primaryLabel: "[ VIEW MATCH ]",
  microcopy: "System configuration complete.",
  semanticIntent: "comparison",
  primaryAction: "compare"
};

export function resolveCTA(
  useCase: RecommendationInput["useCase"], 
  confidence: ConfidenceLevel,
  fulfillment: FulfillmentType = "buy_now"
): CTAResolution {
  const caseNode = REGISTRY[useCase] || REGISTRY["home_assistance"]; // Fallback to home if missing
  const confNode = caseNode[confidence];
  
  // Fulfillment-aware branch
  const res = confNode[fulfillment] || confNode["default"] || FALLBACK;

  if (process.env.NODE_ENV !== "production" && res === FALLBACK) {
     console.warn(`[CTA Registry] Fallback triggered for: ${useCase}/${confidence}/${fulfillment}`);
  }

  return res;
}
