import { describe, it, expect } from "vitest";
import { getRecommendations } from "@/lib/recommend/engine";
import { goldenUnits } from "@/lib/recommend/__fixtures__/golden-units";
import { RecommendationInput } from "@/types/recommend";

describe("Scoring Engine Golden Scenarios", () => {
  
  it("Scenario 1: Domestic Assistance (RS Vacuum Pro match)", () => {
    const input: RecommendationInput = {
      useCase: "home_assistance",
      environment: "home",
      budgetBand: "under_1000",
      purchasePreference: "buy_now",
      deploymentScale: "single"
    };

    const { results, metadata } = getRecommendations(goldenUnits, input);
    const top = results[0];

    // Assertions for identity and ranking
    expect(top.slug).toBe("rs-vaccum-pro");
    
    // Assertions for engine authority (Score >= 70)
    expect(top.score).toBeGreaterThanOrEqual(70);

    // Assertions for confidence from metadata
    expect(metadata.confidenceGap).toBeGreaterThanOrEqual(5);

    // Assertions for stability (No ties at Rank 1)
    if (results.length > 1) {
      expect(top.score).not.toBe(results[1].score);
    }
  });

  it("Scenario 2: Industrial Logistics (RS Heavy Lift X match)", () => {
    const input: RecommendationInput = {
      useCase: "industrial_logistics",
      environment: "warehouse",
      budgetBand: "20000_plus",
      purchasePreference: "quote_ok",
      deploymentScale: "enterprise"
    };

    const { results, metadata } = getRecommendations(goldenUnits, input);
    const top = results[0];

    expect(top.slug).toBe("rs-heavy-lift-x");
    expect(top.score).toBeGreaterThanOrEqual(70);
    expect(metadata.confidenceGap).toBeGreaterThanOrEqual(5);

    if (results.length > 1) {
      expect(top.score).not.toBe(results[1].score);
    }
  });

  it("Scenario 3: Security Patrol (RS Sentinel v2 match)", () => {
    const input: RecommendationInput = {
      useCase: "security",
      environment: "office",
      budgetBand: "5000_20000",
      purchasePreference: "buy_now",
      deploymentScale: "small_fleet"
    };

    const { results, metadata } = getRecommendations(goldenUnits, input);
    const top = results[0];

    expect(top.slug).toBe("rs-sentinel-v2");
    expect(top.score).toBeGreaterThanOrEqual(70);
    expect(metadata.confidenceGap).toBeGreaterThanOrEqual(5);

    if (results.length > 1) {
      expect(top.score).not.toBe(results[1].score);
    }
  });

});
