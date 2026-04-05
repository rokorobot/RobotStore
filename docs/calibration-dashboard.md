ROBOT_STORE // Calibration Dashboard Spec

Operational playbook for tuning the Deterministic Procurement Engine via behavioral telemetry

1. Purpose

The Calibration Dashboard (/admin/calibration) is the primary operator interface for aligning:

Deterministic Scoring → User Behavior → Commercial Outcomes

It enables continuous improvement of the system without modifying core logic.

Core Objectives
Validate confidence calibration
Measure persuasion effectiveness (reason + CTA)
Detect ranking mismatches (override pressure)
Identify fulfillment friction (buy vs quote vs waitlist)
Optimize refinement pathways (LOW confidence recovery)

2. System Role

The dashboard sits in the feedback loop:

Telemetry → Dashboard → Operator Insight → Config Adjustment → Re-test

It does not:
change scoring logic directly
mutate data
introduce probabilistic behavior

It is strictly an observation and decision layer.

3. Event Dependencies

The dashboard relies on the following telemetry events:

Core Exposure Events
- results_exposed
- ui_mode_exposed
- cta_variant_exposed
- persuasive_reason_exposed

Interaction Events
- cta_clicked
- results_expanded
- refinement_applied

Completion Events
- checkout_redirected
- cta_completed
- quote_submitted
- waitlist_locked

4. Required Event Properties

Each event must include normalized properties:

| Property | Description |
| --- | --- |
| session_id | Unique session identifier |
| use_case | Selected use case |
| confidence_level | HIGH / MEDIUM / LOW |
| confidence_gap | Numeric score gap |
| ui_mode | UI behavior mode |
| primary_action | checkout / quote / compare / waitlist |
| fulfillment_type | buy / quote / waitlist |
| cta_variant | Exact CTA wording |
| dominant_dimension | useCase / budget / environment / etc. |
| reason_type | dominant_match / differentiator |
| selected_rank | Rank of chosen result |
| selected_slug | Identifier of chosen unit |
| result_count | Number of results shown |

5. SQL View Architecture

All dashboard metrics are computed via Postgres Views.

Base Views (Required)
- v_calibration_sessions: Session-level normalized context
- v_calibration_session_outcomes: Session-level outcomes (clicked, completed, overridden, refinement_applied)

Derived Views
- v_confidence_calibration: Confidence-level performance matrix
- v_confidence_gap_distribution: Distribution of decision certainty
- v_reason_performance: Persuasion effectiveness by dimension and type
- v_cta_variant_performance: CTA language performance
- v_fulfillment_friction: Commercial flow drop-off analysis
- v_override_pressure: Ranking mismatch detection
- v_low_confidence_funnel: Recovery effectiveness for LOW confidence

6. Dashboard Structure

Section A — Executive Health
High-level KPIs: Sessions, Click Rate, Completion Rate, Override Rate, Confidence-specific performance.

Section B — Confidence Calibration
Confidence Matrix (core diagnostic), Gap Distribution Histogram, Calibration Alerts.

Section C — Reason & CTA Performance
Reason effectiveness table, CTA variant performance, Dimension-level persuasion analysis.

Section D — Fulfillment Friction
Click vs completion by action type, Drop-off diagnostics.

Section E — Override Pressure
Override rate by use case / dimension, Slug-level override analysis.

Section F — LOW Confidence Recovery
Refinement funnel, Signal effectiveness.

7. Interpretation Rules

Confidence Calibration
| Condition | Interpretation |
| --- | --- |
| HIGH completion < MEDIUM | Overconfidence |
| HIGH override > 20% | Ranking mismatch |
| LOW completion > MEDIUM | Underconfidence |
| LOW refinement < 15% | Weak guidance |

Reason Effectiveness
| Pattern | Interpretation |
| --- | --- |
| High CTR, low completion | Over-promising reason |
| Low CTR, high completion | Under-expressive reason |
| One dimension dominates | Overweight in scoring or persuasion |

CTA Performance
| Pattern | Interpretation |
| --- | --- |
| High click, low completion | Misleading CTA |
| Low click, high completion | Weak CTA language |
| Performance varies by use case | Need segmentation |

Fulfillment Friction
| Pattern | Interpretation |
| --- | --- |
| Waitlist high drop-off | Value unclear |
| Quote low completion | Friction or expectation mismatch |
| Checkout strong | Healthy conversion baseline |

Override Pressure
| Pattern | Interpretation |
| --- | --- |
| HIGH confidence overrides | Core scoring issue |
| Clustered by use case | Config mismatch |
| Clustered by dimension | Wrong dominant signal |

LOW Confidence Recovery
| Pattern | Interpretation |
| --- | --- |
| Low refinement rate | Guidance unclear |
| High refinement, low conversion | Wrong signals |
| High refinement, high conversion | Strong coaching system |

8. Operator Playbook

Step 1 — Check Confidence Matrix
Identify miscalibration (HIGH vs MEDIUM vs LOW)

Step 2 — Inspect Override Pressure
Locate where ranking fails behaviorally

Step 3 — Evaluate Reason Performance
Identify which dimensions persuade effectively

Step 4 — Analyze CTA Performance
Compare variants across use cases and confidence levels

Step 5 — Review Fulfillment Friction
Diagnose drop-offs in quote/waitlist/checkout flows

Step 6 — Optimize LOW Confidence Flow
Improve refinement signals and clarity

Step 7 — Apply Config Changes
Modify config.ts weights, bonus rules, CTA registry language.

Step 8 — Re-test
Validate against Golden Scenarios, Monitor post-change metrics.

9. Tuning Principles

- Change one variable at a time
- Never break determinism
- Prefer calibration over complexity
- Trust behavior over intuition
- Do not optimize for clicks—optimize for completion

10. System Invariants

These must never be violated:
- Scoring remains deterministic
- Total score = 100
- No hallucinated reasoning
- UI reflects actual system certainty
- CTA reflects real fulfillment capability

11. Future Extensions

- Materialized views for scale
- Real-time streaming dashboard
- Automated calibration suggestions
- Multi-profile decision modes

12. Summary

The Calibration Dashboard transforms RobotStore from a deterministic engine into a continuously improving decision system. It is the core mechanism by which performance is measured, trust is maintained, and advantage compounds.

Spec Status: AUTHORITATIVE
Layer: Calibration / Operator Interface
