# RobotStore: Calibration Dashboard Operating Spec

### Technical Specification (v1.0)

---

## 1. Overview
The Calibration Dashboard at `/admin/calibration` is the primary operating surface for tuning the **RobotStore Deterministic Decision Engine**. It transforms behavioral telemetry into actionable tuning directives, ensuring the system remains aligned with human intent and commercial reality.

> [!IMPORTANT]
> **Operator Goal:** Use this dashboard to detect "Miscalibration"—where the engine's logical scores diverge from user engagement.

---

## 2. Dashboard Information Architecture

The dashboard is organized into five tactical sections:

| Section | Focus | Critical Metric |
|---|---|---|
| **Executive Health** | System Pulse | Overall Completion Rate |
| **Calibration Matrix** | Precision vs. Recall | HIGH vs. MEDIUM Yield |
| **Reason Performance** | Persuasion Quality | Reason CTR by Dimension |
| **Commercial Truth** | Fulfillment Friction | Click-to-Checkout Dropoff |
| **Override Pressure** | Engine Resistance | Rank Selection override_rate |

---

## 3. The Calibration Matrix (Confidence Calibration)

The engine classifies results into three confidence bands:

| Band | Strategy | Success Indicator |
|---|---|---|
| **HIGH** | Decisive Closure | Highest Completion Rate |
| **MEDIUM** | Utility/Comparison | Highest Comparison Rate |
| **LOW** | Guided Refinement | Highest Refinement Rate |

### Miscalibration Triggers
- **Inversion**: If `HIGH_completion < MEDIUM_completion`, the engine is exhibiting "False Certainty."
- **Over-suppression**: If `MEDIUM` sessions have massive `override_rate`, the Top-2 limit is likely hiding the true best match.
- **Recovery Failure**: If `LOW` sessions have `<15%` refinement rate, the coaching logic is too vague.

---

## 4. Persuasion Layer (Reason & CTA)

### Reason Effectiveness Matrix
Tracks which grounded dimensions (UseCase, Environment, Budget) drive the most conversion.
- **Action**: If `budget-led` reasons consistently underperform `use-case-led` reasons, adjust the `PersuasiveReason` mapping in `reasons.ts`.

### CTA & Fulfillment Friction
Tracks engagement with the "Buy," "Quote," and "Waitlist" flows.
- **High Friction**: A high `dropoff_after_click` on "Waitlist" indicate that the commercial copy is over-promising availability.

---

## 5. Override Pressure (Behavioral Resistance)

Override pressure is measured when `selected_rank > 1`.

| Context | Interpretation |
|---|---|
| **HIGH Mode Override** | Critical scoring failure. Unit at Rank 2/3 is significantly better than Rank 1. |
| **MEDIUM Mode Override** | Healthy exploration. Comparison is working. |
| **Slug-level Override** | Specific unit is consistently "winning" despite engine ranking. Check `config.ts` bonus rules. |

---

## 6. Implementation Architecture

### Data Layer
The dashboard is powered by **normalized snake_case Postgres views**:
- `v_calibration_sessions`: The base session truth.
- `v_calibration_session_outcomes`: Flags for clicks, completions, and overrides.
- `v_confidence_calibration`: The primary performance matrix.

### Logic Layer
Miscalibration flags are computed at the **App Layer** in `OperatorAlerts.tsx`, allowing for rapid threshold adjustment (e.g., changing the 20% override warning) without database migrations.

---

## 7. Tuning Playbook

| Observed Signal | Recommended Tuning |
|---|---|
| High HIGH Override | Audit `baseMatch` and `bonus` rules in `scoring.ts`. |
| Weak LOW Recovery | Update `RefinementSignal` descriptions in `reasons.ts`. |
| Fulfillment Dropoff | Adjust `CTAResolution` microcopy for that specific type. |
| Budget-led Failure | Lower the weight of the `budget` dimension in `engine.ts`. |

---

## 8. Development Guards (Regression)
All tuning actions *must* be followed by a run of the golden scenario test suite:
```bash
npm run test:golden
```
This ensures that "fixing" behavior for one use case (e.g., Warehouse Security) does not degrade performance for others (e.g., Home Lab).
