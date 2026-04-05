# ROBOT_STORE // Scoring Engine (First-Class Spec)

> The deterministic decision logic behind RobotStore.app.  
> Optimized for auditability, operational tuning, and explainable recommendations.

For product overview, see [`README.md`](../README.md).  
For data structures, see [`data-model.md`](./data-model.md).  
For integration, see [`api.md`](./api.md).

---

## 🧠 Core Philosophy

The RobotStore Scoring Engine is **deterministic, config-driven, and non-probabilistic**.

1.  **Zero Hallucination:** No LLMs or "AI" are used for ranking. Every position is the result of a weighted sum.
2.  **Auditability:** Every rank can be explained by pointing to a specific weight in `config.ts`.
3.  **Stability:** Identical inputs always produce identical outputs for a given catalog state.
4.  **Operationality:** The engine is tuned by humans through parameter adjustments, not by "retraining."

---

## ⚙️ Scoring Pipeline (Pseudocode)

The recommendation process follows a strict 4-stage pipeline:

```typescript
// 1. INPUT VALIDATION
// Reject malformed dimensions (useCase, environment, budget, etc.)

// 2. SOFT FILTERING
// Internal: filter units where is_archived = true
// Internal: filter units where availability_status = 'sold_out' (optional per config)

// 3. MULTI-DIMENSIONAL SCORING
for each unit in catalog {
  score_use_case           = calculateUseCase(unit, input)        // max 30
  score_environment       = calculateEnvironment(unit, input)    // max 20
  score_purchase_prefs    = calculatePurchaseMode(unit, input)   // max 20
  score_budget            = calculateBudgetMatch(unit, input)    // max 15
  score_deployment_scale  = calculateScaleFit(unit, input)       // max 10
  score_availability_bonus = calculateAvailability(unit)         // max 5

  total_score = sum(all_dimensions) // 0 - 100
}

// 4. DETERMINISTIC RANKING
// Primary sort: total_score DESC
// Tie-breaker 1: useCase score DESC
// Tie-breaker 2: purchasePreference score DESC
// Tie-breaker 3: availability bonus DESC
// Final stability: slug ASC (alphabetical)
```

---

## 🚫 Exclusion & Filtering Rules

Before any scoring occurs, units are filtered based on existence and state.

| Rule | Location | Action |
|---|---|---|
| **Archival** | DB Query | Units with `availability_status = 'archived'` are never loaded into the engine. |
| **Visibility** | DB Query | Units must be `is_public` (if implemented) or have a valid `class_id`. |
| **Dead Zones** | `scoring.ts` | If a `useCase` profile is missing from `config.ts`, the unit receives `0` for that dimension. |

---

## 📊 Dimension Definition & Base Scores

### 1. Use Case (Primary Signal - Max 30)
Matches the physical "Job to be Done."

*   **Base Match:** Points awarded if `unit.classSlug` matches the `useCase` mapping.
*   **Bonus Rules:** Term-matching within `capabilities`, `behaviors`, or `deploymentFit`.

### 2. Physical Environment (Secondary Signal - Max 20)
Matches the deployment context.

*   **Logic:** Units designed for a specific environment (e.g., `warehouse`) receive a significant base score, supplemented by bonus matching for "ruggedness," "terrain," or "indoor/outdoor" terms.

### 3. Purchase Preference (Gating Signal - Max 20)
Matches the operator's commercial intent.

*   **Matrix Logic:** Points are mapped from `userPreference` to `unit.purchaseMode`.
*   *Example:* If user wants `buy_now`, a `partner_quote` unit receives a low score (e.g., 2/20) while a `buy_now` unit receives 20/20.

### 4. Budget Match (Filter Signal - Max 15)
Matches the operator's financial ceiling.

*   **Logic:**
    *   **Direct match:** Unit price is within the requested band → 15 pts.
    *   **Near match:** Unit price is slightly above/below band → 8-10 pts.
    *   **Quote-only:** If unit has no price (quote mode), it receives a "baseline viability" score (5-12 pts) depending on the requested band.

### 5. Deployment Scale (Modifier - Max 10)
Matches single-unit vs. fleet-scale needs.

*   **Logic:** Extra points for units with "fleet management" capabilities when `enterprise` scale is requested.

---

## 🛠️ Bonus & Penalty Rule Types

The engine supports 6 rule primitives for fine-grained tuning:

| Rule Type | Logic | Purpose |
|---|---|---|
| `capability` | `unit.capabilities` contains `term` | Feature matching (e.g., "lidar") |
| `fit` | `unit.deploymentFit` contains `term` | Niche matching (e.g., "hospital") |
| `behavior` | `unit.behaviors` contains `term` | Profile matching (e.g., "silent") |
| `spec_exists` | `unit.specs[key]` is present | Requirements check (e.g., "payload") |
| `spec_match` | `unit.specs[key]` contains `value` | Specificity check (e.g., `mobility: terrain`) |
| `array_length` | `unit[prop].length >= min` | Multi-functionality bonus (e.g., `capabilities >= 4`) |

---

## 📝 Explanation & Reason Generation

Explanations are generated *after* scoring is finalized. They are mapped to the score breakdown to ensure consistency.

**Rule Zero of Explanations:** Never explain *why* a score is high if the score is actually low.

| Score Threshold | Logic | Typical Reason |
|---|---|---|
| `useCase >= 24` | Primary class match | "Strong match for [useCase] environments." |
| `environment >= 14`| Strong env match | "Optimized for continuous operations in [env] conditions." |
| `budget == 15` | Perfect price fit | "Fits perfectly within your budget parameters." |
| `rank == 2` | Strong alternative | "Alternative specialized configuration." |

---

## 🔄 Calibration Workflow

The system is designed to be calibrated by an Operator (Human) using the **Telemetry → Config → Re-test** loop.

### 1. Override Detection (Signal)
*   **Metric:** `rank_selected > 1`.
*   **Action:** run the SQL "Override Pressure" queries from `post_launch_roadmap.md`.

### 2. Parameter Tuning (Action)
*   **File:** `src/lib/recommend/config.ts`.
*   **Rule:** Modify **one** weight at a time.
*   **Log:** Record the date, change, and signal in the `TUNING LOG`.

### 3. Canonical Validation (Re-test)
Run three standardized "Golden Scenarios" to ensure no regressions:
1.  **Domestic Assist** (Domestic Unit should be Rank 1)
2.  **Industrial Logistics** (Warehouse Unit should be Rank 1)
3.  **Security Patrol** (Security Node should be Rank 1)

These scenarios are strictly asserted via `npm run test:golden` using the dedicated fixture set in `src/lib/recommend/__fixtures__/golden-units.ts`.

---

## 🧪 Decision Pressure & Simulation

The engine is stress-tested against 1,000+ randomized inputs via `npm run pressure-test` to monitor:
- **Scoring Dead Zones:** Inputs that result in 0 matches.
- **Tie Rate:** Frequency of identical scores at Rank 1/2.
- **Class/Mode Distribution:** Bias detection to ensure the catalog is accessible.
- **Confidence Distribution:** Average gap between top recommendations.

---

## ⚠️ Failure Patterns & Interpretation

| Symptom | Diagnosis | Correction Path |
|---|---|---|
| **Rank 2/3 overrides cluster around a specific Class** | Scoring Mismatch | Adjust `baseMatch` for that class/useCase combination. |
| **Overrides are random across all categories** | Explanation Mismatch | Descriptions are misleading. Rewrite `reasons` in `scoring.ts`. |
| **Score gaps are <5 pts between top 3 items** | Engine Indecision | Increase `useCaseMax` or add more specific `bonusRules` to differentiate niches. |
| **No matches returned** | Catalog Gap | You lack units matching that specific constraint set. Check `Dead Catalog` query. |

---

## 🛡️ System Invariants

These rules must **NEVER** be violated by future code changes:

1.  **Total score must equal 100.** All max weights combined in `config.ts` must sum to 100.
2.  **The Engine does not write.** Decisions should never mutate database state.
3.  **No user identity required.** Scoring must function for anonymous operators using only the provided constraint payload.
4.  **Availability is a Nudge, not a Filter.** High-fit units should still be shown even if low stock, with a minor score penalty.

---

*Spec Status: AUTHORITATIVE*  
*Logic version: 1.0.0 (Deterministic)*
