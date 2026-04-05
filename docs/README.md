# ROBOT_STORE // Documentation Index

> Central documentation hub for RobotStore.app  
> Deterministic procurement engine for autonomous systems.

This `/docs` directory is organized around one principle:

> **Separate what the system is, how it works, how it is operated, and how it evolves.**

If you are new to the project, start with the overview docs first, then move into architecture and operations.

---

## 🗺️ Documentation Map

| Document | Audience | Purpose |
|---|---|---|
| [`../README.md`](../README.md) | Anyone | Product overview, positioning, setup, operating model |
| [`whitepaper-deterministic-engine.md`](./whitepaper-deterministic-engine.md) | Investors, Founders | Strategic positioning, the "decision over search" philosophy |
| [`technical-whitepaper-v1.md`](./technical-whitepaper-v1.md) | Technical Evaluators | **Full System Spec.** Rigorous design, invariants, and failure modes |
| [`architecture.md`](./architecture.md) | Engineers, reviewers, investors | Internal mechanics, execution flows, guarantees, invariants |
| [`data-model.md`](./data-model.md) | Engineers, DB operators | Full schema, ERD, SQL, RLS intent, indexes, lifecycle rules |
| [`api.md`](./api.md) | Engineers, integrators | All route handlers, payload contracts, auth boundaries, failure modes |
| [`scoring-engine.md`](./scoring-engine.md) | Engineers, operators | **Authoritative Spec.** Scoring logic, bonus rules, pipeline pseudocode |
| [`../post_launch_roadmap.md`](../post_launch_roadmap.md) | Operator / founder | Telemetry queries, tuning protocol, calibration loop, 0–100 sessions |

---

## 🚦 Recommended Reading Paths

### 1. Product / Investor Path
*Focus: Value proposition, differentiation, and long-term moat.*

1.  [`whitepaper-deterministic-engine.md`](./whitepaper-deterministic-engine.md) — Strategic positioning and philosophy
2.  [`../README.md`](../README.md) — Category creation and positioning
3.  [`architecture.md`](./architecture.md) — Why "deterministic" is a technical advantage
4.  [`scoring-engine.md`](./scoring-engine.md) — The "human-in-the-loop" calibration strategy

---

### 2. Engineering Onboarding Path
*Focus: Technical implementation, boundaries, and codebase navigation.*

1.  [`technical-whitepaper-v1.md`](./technical-whitepaper-v1.md) — System layering and request flows
2.  [`architecture.md`](./architecture.md) — System architecture details
3.  [`data-model.md`](./data-model.md) — Relational truth and RLS guardrails
4.  [`api.md`](./api.md) — Payload contracts and error handling
5.  [`scoring-engine.md`](./scoring-engine.md) — The decision logic spec

---

### 3. Post-Launch Operations Path
*Focus: Analyzing session data and tuning behavior.*

1.  [`../post_launch_roadmap.md`](../post_launch_roadmap.md) — Tuning protocol and SQL queries
2.  [`scoring-engine.md`](./scoring-engine.md) — Failure patterns and interpretation matrix
3.  [`data-model.md`](./data-model.md) — Telemetry schema and override tracking

---

## 🧠 System at a Glance

RobotStore is a **guided industrial procurement interface** built around a **config-driven deterministic scoring engine**.

### Core Layers:

-   **Commerce Spine** — Stripe Checkout + webhook-verified `orders_shadow`
-   **Identity Layer** — Supabase Auth + SSR sessions + RBAC
-   **Operator Workflows** — Quotes, waitlists, saved loadouts
-   **Catalog Authority** — DB-governed units, classes, brands
-   **Decision Engine** — Deterministic recommendation + comparison matrix
-   **Telemetry Loop** — Event capture → SQL analysis → `config.ts` tuning

---

## 📍 Core Source-of-Truth Files

| File | Role |
|---|---|
| `src/lib/recommend/config.ts` | **SCORING SOURCE OF TRUTH** — all tunable weights |
| `src/lib/recommend/scoring.ts` | Deterministic engine logic implementation |
| `src/lib/analytics/track.ts` | Behavioral telemetry client |
| `src/lib/auth/require-admin.ts` | Admin authorization boundary |
| `src/app/api/checkout/route.ts` | Stripe session creation (price re-validation) |
| `src/app/api/webhooks/stripe/route.ts` | Payment truth ingestion (orders log) |

---

## 🛡️ Guardrails

### ✅ DO
-   Tune recommendation behavior in `config.ts`.
-   Validate changes with the 3 canonical "Golden Scenarios."
-   Use telemetry + SQL to identify real misalignment before touching weights.
-   Preserve server-side validation for price, state, and permissions.

### ❌ DO NOT
-   Move scoring logic into the database.
-   Trust client-submitted pricing payloads.
-   Rely on client-side role checks for authorization.
-   Mix explanation fixes with scoring fixes (Rule Zero).
-   Introduce probabilistic or LLM-based ranking into the engine.

---

## 📅 Status

```text
DOCUMENTATION STATUS : AUTHORITATIVE / COMPLETE
SYSTEM STATUS        : OPERATIONAL
CALIBRATION STATUS   : READY FOR TRAFFIC
```

---

*Built with deterministic logic, operational aesthetics, and calibrated intent.*  
*Status: DEPLOYMENT CONFIRMED.*
