import { getRecommendations } from "../src/lib/recommend/engine";
import { goldenUnits } from "../src/lib/recommend/__fixtures__/golden-units";
import { RecommendationInput } from "../src/types/recommend";

const SCENARIOS = 1000;

const USE_CASES: RecommendationInput["useCase"][] = [
  "home_assistance", "industrial_logistics", "security", 
  "education_dev", "research_prototype", "healthcare_lab"
];
const ENVIRONMENTS: RecommendationInput["environment"][] = [
  "home", "office", "warehouse", "outdoors", "lab_clinic", "mixed"
];
const BUDGET_BANDS: RecommendationInput["budgetBand"][] = [
  "under_1000", "1000_5000", "5000_20000", "20000_plus", "flexible"
];
const PREFERENCES: RecommendationInput["purchasePreference"][] = [
  "buy_now", "quote_ok", "waitlist_ok", "any"
];
const SCALES: RecommendationInput["deploymentScale"][] = [
  "single", "small_fleet", "enterprise"
];

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function runSimulation() {
  console.log(`\n🚀 STARTING OPERATOR PRESSURE TEST (${SCENARIOS} scenarios)\n`);

  const metrics = {
    totalScenarios: SCENARIOS,
    deadZones: 0,
    ties: 0,
    classDistribution: {} as Record<string, number>,
    modeDistribution: {} as Record<string, number>,
    confidenceGaps: [] as number[],
    lowConfidence: 0,
  };

  for (let i = 0; i < SCENARIOS; i++) {
    const input: RecommendationInput = {
      useCase: getRandom(USE_CASES),
      environment: getRandom(ENVIRONMENTS),
      budgetBand: getRandom(BUDGET_BANDS),
      purchasePreference: getRandom(PREFERENCES),
      deploymentScale: getRandom(SCALES)
    };

    const { results, metadata } = getRecommendations(goldenUnits, input);

    if (results.length === 0) {
      metrics.deadZones++;
      continue;
    }

    const top = results[0];
    const second = results[1];

    // Class Distribution
    metrics.classDistribution[top.slug] = (metrics.classDistribution[top.slug] || 0) + 1;
    
    // Purchase Mode Distribution
    const unitObj = goldenUnits.find(u => u.slug === top.slug);
    if (unitObj) {
      const mode = unitObj.purchaseMode;
      metrics.modeDistribution[mode] = (metrics.modeDistribution[mode] || 0) + 1;
    }

    // Confidence
    metrics.confidenceGaps.push(metadata.confidenceGap);
    if (metadata.confidenceLevel === "LOW") metrics.lowConfidence++;

    // Ties
    if (second && top.score === second.score) {
      metrics.ties++;
    }
  }

  // Reporting
  const avgGap = metrics.confidenceGaps.reduce((a, b) => a + b, 0) / metrics.confidenceGaps.length;

  console.table({
    "Total Scenarios": metrics.totalScenarios,
    "Dead Zones (0 matches)": metrics.deadZones,
    "Ties at Rank 1": metrics.ties,
    "Avg Confidence Gap": avgGap.toFixed(2),
    "Low Confidence %": ((metrics.lowConfidence / SCENARIOS) * 100).toFixed(1) + "%"
  });

  console.log("\n📊 TOP-CLASS DISTRIBUTION:");
  console.table(Object.entries(metrics.classDistribution)
    .sort((a, b) => b[1] - a[1])
    .reduce((obj, [slug, count]) => ({ ...obj, [slug]: count }), {}));

  console.log("\n💳 PURCHASE-MODE DOMINANCE:");
  console.table(Object.entries(metrics.modeDistribution)
    .sort((a, b) => b[1] - a[1])
    .reduce((obj, [mode, count]) => ({ ...obj, [mode]: count }), {}));

  console.log("\n🏁 PRESSURE TEST COMPLETE\n");
}

runSimulation();
