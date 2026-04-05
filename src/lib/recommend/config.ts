/**
 * src/lib/recommend/config.ts
 *
 * ─────────────────────────────────────────────────────────────
 * SCORING ENGINE — SOURCE OF TRUTH
 * ─────────────────────────────────────────────────────────────
 *
 * TUNING LOG — record every change here before committing.
 * Format: [YYYY-MM-DD] dimension.key: old → new | signal | outcome
 *
 * Example:
 *   [2026-04-08] purchasePreference.buy_now.partner_quote: 2 → 5
 *     Signal:  industrial users overriding rank 1 (buy_now) for rank 2 (partner_quote) at 38%
 *     Outcome: override rate dropped to 18% after adjustment
 *
 * ──────────────────────────────────────────────────────────────
 * LOG START
 * ──────────────────────────────────────────────────────────────
 *
 * [2026-04-05] Initial config — pre-traffic baseline.
 *   All weights set from first-principles behavioral modeling.
 *   No real session data yet. First tuning pass expected at ~50 sessions.
 *
 * ──────────────────────────────────────────────────────────────
 * LOG END (append above this line)
 * ─────────────────────────────────────────────────────────────
 *
 * ══════════════════════════════════════════════════════════════
 * RULE ZERO — READ BEFORE EVERY CHANGE
 * ══════════════════════════════════════════════════════════════
 *
 *   DO NOT MIX SCORING FIXES WITH EXPLANATION FIXES.
 *
 *   They are separate problems with separate causes.
 *   Mixing them makes the system unstable and the cause untraceable.
 *
 *   BEFORE touching any number in this file, answer:
 *
 *     1. Are overrides CLUSTERED (same useCase / same purchaseMode)?
 *        → Scoring problem. Change a weight here. Then verify below.
 *
 *     2. Are overrides RANDOM (spread across all modes / classes)?
 *        → Explanation problem. Close this file.
 *          Fix the `reasons` templates in scoring.ts instead.
 *
 *     3. Is rank 1 winning but users not acting at all?
 *        → CTA or trust problem. Close this file.
 *          Fix the UI, not the engine.
 *
 *   TUNING PROTOCOL (enforce every time, no exceptions):
 *     a. Change ONE number
 *     b. Log it in the TUNING LOG above (date / old → new / signal)
 *     c. Re-run 3 canonical scenarios:
 *          home_assistance  / home      / buy_now
 *          industrial       / warehouse / quote_ok
 *          security         / office    / any
 *     d. Verify rank 1 shifts only where intended
 *     e. Commit if clean — revert if anything unexpected shifts
 *
 * ══════════════════════════════════════════════════════════════
 *
 * HOW TO TUNE (fast reference):
 *
 *   Max dimension scores (weights block):
 *     useCaseMax        — how much the declared job-to-be-done matters      [30]
 *     environmentMax    — how much physical context matters                  [20]
 *     purchasePreferenceMax — how hard buy/quote/waitlist preference filters [20]
 *     budgetMax         — how aggressively budget eliminates options         [15]
 *     deploymentScaleMax — single vs fleet vs enterprise signal              [10]
 *     availabilityMax   — stock status bonus                                 [ 5]
 *
 *   Total possible score: 100
 *   TARGET: PRIMARY MATCH should score ≥65 to be trusted.
 *           If top result is <55 → scoring has dead zones.
 *
 *   TUNING RULES:
 *   ┌──────────────────────────────────────────────┐
 *   │ Symptom                  → Adjustment        │
 *   │ Users pick rank 2 often  → check useCase     │
 *   │                            weights for that  │
 *   │                            useCase profile   │
 *   │                                              │
 *   │ Quote users see buy_now  → lower             │
 *   │ results dominating       → purchasePreference│
 *   │                            scores for buy_now│
 *   │                                              │
 *   │ Enterprise picks singles → increase          │
 *   │                            deploymentScale   │
 *   │                            enterprise weight │
 *   │                                              │
 *   │ Budget kills too many    → increase          │
 *   │ options before scoring   → budgetMax, or     │
 *   │                            relax budget range│
 *   │                            filter in scoring │
 *   └──────────────────────────────────────────────┘
 *
 *   ⚡ CHANGE ONE DIMENSION AT A TIME.
 *      Re-run 3 canonical scenarios (domestic / industrial / security).
 *      If PRIMARY MATCH shifts meaningfully on all three → commit.
 *
 * ─────────────────────────────────────────────────────────────
 */

export const RECOMMENDATION_CONFIG = {

  // ── DIMENSION WEIGHTS ──────────────────────────────────────
  // These are the MAX scores each dimension can contribute.
  // Raise a weight to make that dimension more dominant.
  // Lower it to make it a softer signal.
  weights: {
    useCaseMax:             30,  // PRIMARY signal — what the operator is actually doing
    environmentMax:         20,  // SECONDARY — physical context (home / warehouse / outdoor)
    purchasePreferenceMax:  20,  // GATING — how operator wants to transact
    budgetMax:              15,  // FILTERING — budget ceiling match
    deploymentScaleMax:     10,  // MODIFIER — single unit vs enterprise fleet
    availabilityMax:         5   // AVAILABILITY BONUS — in-stock preference
  },

  // ── USE CASE PROFILES ──────────────────────────────────────
  // baseMatch: { classSlug: score } — points awarded if unit is in that class
  // bonusRules: additional points for specific spec/behavior/fit terms
  //
  // TUNING:
  //   If a useCase returns wrong class → check baseMatch scores
  //   If explanations feel weak → add a bonusRule with a stronger term
  useCase: {
    home_assistance: {
      baseMatch: { "domestic-assistance": 24, "educational-dev-kits": 8, "humanoid-interfaces": 6 },
      bonusRules: [
        { type: "behavior", term: "low-noise",  score: 2 },
        { type: "behavior", term: "quiet",      score: 2 }
      ]
    },
    industrial_logistics: {
      baseMatch: { "industrial-systems": 24, "humanoid-interfaces": 8, "security-nodes": 3 },
      bonusRules: [
        { type: "fit", term: "fulfillment", score: 3 },
        { type: "fit", term: "warehouse",   score: 3 }
      ]
    },
    security: {
      baseMatch: { "security-nodes": 24, "industrial-systems": 6, "humanoid-interfaces": 4 },
      bonusRules: [
        { type: "capability", term: "intrusion",    score: 3 },
        { type: "capability", term: "surveillance", score: 3 }
      ]
    },
    education_dev: {
      baseMatch: { "educational-dev-kits": 24, "humanoid-interfaces": 8, "experimental-units": 6 },
      bonusRules: []
    },
    research_prototype: {
      baseMatch: { "experimental-units": 24, "humanoid-interfaces": 18, "educational-dev-kits": 8 },
      bonusRules: []
    },
    healthcare_lab: {
      baseMatch: { "industrial-systems": 18, "educational-dev-kits": 6 },
      bonusRules: [
        { type: "fit", term: "hospital", score: 4 },
        { type: "fit", term: "clinic",   score: 4 }
      ]
    }
  },

  // ── ENVIRONMENT PROFILES ───────────────────────────────────
  // TUNING:
  //   If environment feels under-weighted, raise bonusRule scores.
  //   "outdoors" intentionally relies entirely on bonus terms
  //   since no class has a hard outdoor anchor in the current catalog.
  environment: {
    home: {
      baseMatch: { "domestic-assistance": 14 },
      bonusRules: [
        { type: "fit",      term: "residential", score: 4 },
        { type: "fit",      term: "home",        score: 4 },
        { type: "behavior", term: "low-noise",   score: 2 },
        { type: "behavior", term: "companion",   score: 2 }
      ]
    },
    office: {
      baseMatch: { "domestic-assistance": 8, "security-nodes": 8 },
      bonusRules: [
        { type: "fit", term: "commercial", score: 4 },
        { type: "fit", term: "corporate",  score: 4 },
        { type: "fit", term: "office",     score: 4 }
      ]
    },
    warehouse: {
      baseMatch: { "industrial-systems": 14 },
      bonusRules: [
        { type: "fit",        term: "warehouse",   score: 4 },
        { type: "fit",        term: "fulfillment", score: 4 },
        { type: "spec_exists", term: "payload",    score: 2 }  // bonus if unit has payload spec
      ]
    },
    outdoors: {
      baseMatch: {},  // ← no class anchor; relies entirely on spec terms
      bonusRules: [
        { type: "fit",        term: "outdoor",  score: 10 },
        { type: "fit",        term: "yard",     score: 10 },
        { type: "fit",        term: "garden",   score: 10 },
        { type: "fit",        term: "terrain",  score: 10 },
        { type: "spec_match", term: "mobility", match: "terrain", score: 6 },
        { type: "behavior",   term: "weather",  score: 4 },
        { type: "behavior",   term: "rugged",   score: 4 }
      ]
    },
    lab_clinic: {
      baseMatch: {},
      bonusRules: [
        { type: "fit",        term: "hospital",    score: 14 },
        { type: "fit",        term: "clinic",      score: 14 },
        { type: "fit",        term: "lab",         score: 14 },
        { type: "behavior",   term: "predictable", score: 3 },
        { type: "behavior",   term: "silent",      score: 3 },
        { type: "capability", term: "secure",      score: 3 },
        { type: "capability", term: "sterile",     score: 3 }
      ]
    },
    mixed: {
      baseMatch: { "humanoid-interfaces": 10 },  // humanoids = most versatile
      bonusRules: [
        { type: "array_length", property: "deploymentFit",  min: 3, score: 6 },  // wide fit range
        { type: "array_length", property: "capabilities",   min: 4, score: 4 }   // many capabilities
      ]
    }
  },

  // ── PURCHASE MODE ALIGNMENT ────────────────────────────────
  // purchasePreference[userPreference][unitMode] = points
  //
  // TUNING:
  //   If quote-preference users keep seeing buy_now-dominant results →
  //     lower purchasePreference.buy_now["buy_now"] by 2–4 pts
  //   If waitlist-ok users seem underserved →
  //     raise waitlist_ok["waitlist"] to 22–24
  //
  //   KEY: this is the most likely first-week tuning target.
  //   Users almost always care more about HOW they buy than the model expects.
  purchasePreference: {
    buy_now:    { "buy_now": 20, "affiliate": 8,  "partner_quote": 2,  "inquiry_only": 1,  "waitlist": 0  },
    quote_ok:   { "partner_quote": 20, "inquiry_only": 18, "buy_now": 14, "affiliate": 8, "waitlist": 6  },
    waitlist_ok:{ "waitlist": 20, "partner_quote": 12, "inquiry_only": 10, "buy_now": 10, "affiliate": 6 },
    any:        { "buy_now": 16, "partner_quote": 14, "inquiry_only": 12, "waitlist": 10, "affiliate": 8 }
  },

  // ── DEPLOYMENT SCALE ───────────────────────────────────────
  // TUNING:
  //   If enterprise buyers don't see quote-mode units rising →
  //     add purchaseBonus: { "partner_quote": 4 } to enterprise block
  deploymentScale: {
    single: {
      baseMatch: { "domestic-assistance": 8, "educational-dev-kits": 8, "humanoid-interfaces": 5 },
      bonusRules: [
        { type: "fit", term: "specialist", score: 2 },
        { type: "fit", term: "one-off",    score: 2 }
      ]
    },
    small_fleet: {
      baseMatch: { "industrial-systems": 8, "security-nodes": 8, "domestic-assistance": 4 },
      bonusRules: [
        { type: "capability", term: "fleet", score: 2 },
        { type: "capability", term: "swarm", score: 2 }
      ]
    },
    enterprise: {
      baseMatch: { "industrial-systems": 8, "security-nodes": 8 },
      purchaseBonus: { "partner_quote": 2, "inquiry_only": 2 },  // enterprise prefers negotiated
      bonusRules: [
        { type: "fit", term: "manufacturing", score: 2 },
        { type: "fit", term: "campus",        score: 2 },
        { type: "fit", term: "hospital",      score: 2 }
      ]
    }
  },

  // ── AVAILABILITY BONUS ─────────────────────────────────────
  // Small nudge toward in-stock units. Don't over-weight.
  // TUNING: if waitlisted items should surface more → raise waitlist_open to 4+
  availabilityStatus: {
    "available":      5,
    "low_stock":      4,
    "waitlist_open":  2,
    "partner_only":   2,
    "archived":       0,
    "sold_out":       0
  }

};
