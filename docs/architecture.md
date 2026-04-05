# ROBOT_STORE // System Architecture

> Deterministic procurement engine for autonomous systems.  
> Fully auditable. Config-driven. Behavior-calibrated.

This document describes the internal architecture of RobotStore at the engineering level — data flows, system boundaries, invariants, and design rationale. For a product overview, see [`README.md`](../README.md).

---

## Table of Contents

1. [System Philosophy](#system-philosophy)
2. [High-Level Architecture](#high-level-architecture)
3. [End-to-End Data Flows](#end-to-end-data-flows)
4. [Decision Engine](#decision-engine)
5. [Commerce Layer](#commerce-layer)
6. [Identity & RBAC](#identity--rbac)
7. [State Management](#state-management)
8. [Database Schema](#database-schema)
9. [Telemetry Architecture](#telemetry-architecture)
10. [Calibration Loop](#calibration-loop)
11. [System Invariants](#system-invariants)
12. [Failure Modes](#failure-modes)
13. [Scaling Considerations](#scaling-considerations)

---

## System Philosophy

RobotStore is architected around a strict separation of concerns enforced at every layer:

| Layer | Responsibility | Key files |
|---|---|---|
| UI Layer | Interaction, state visualization, CTA hierarchy | `src/components/`, `src/app/` |
| Decision Engine | Deterministic scoring, explanation generation | `src/lib/recommend/` |
| Commerce Layer | Payments, order logging, webhook verification | `src/app/api/checkout/`, `src/app/api/webhooks/` |
| Identity Layer | Auth, session management, RBAC | `src/lib/supabase/`, `middleware.ts` |
| Data Layer | Source of truth — all persistent state | Supabase (Postgres + Auth) |
| Telemetry Layer | Behavior capture → calibration feedback | `src/lib/analytics/track.ts` |

### Design Constraints

The system must remain:

1. **Deterministic** — identical inputs produce identical outputs, always
2. **Auditable** — every recommendation rank can be explained by pointing to a specific config value
3. **Tunable without code changes** — behavioral adjustment happens in `config.ts`, not in engine logic

Violating any of these constraints degrades the system's core value. They are enforced architecturally, not by convention.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser)                         │
│                                                             │
│  ┌─────────────────┐    ┌──────────────────────────────┐   │
│  │  React (RSC +   │    │     Zustand Stores           │   │
│  │  Client Comps)  │    │  cart-store / compare-store  │   │
│  └────────┬────────┘    └──────────────────────────────┘   │
└───────────┼─────────────────────────────────────────────────┘
            │ HTTP / Server Actions
┌───────────▼─────────────────────────────────────────────────┐
│                 Next.js App Router (Server)                  │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │                  Middleware                         │    │
│  │  - session refresh (Supabase PKCE)                 │    │
│  │  - auth guard on /admin/* and /account/*           │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │              API Route Handlers (/api/*)            │    │
│  │                                                     │    │
│  │  POST /api/recommend      → scoring engine          │    │
│  │  POST /api/checkout       → Stripe session          │    │
│  │  POST /api/webhooks/stripe → order logging          │    │
│  │  POST /api/quotes         → RFQ insertion           │    │
│  │  POST /api/waitlist       → queue insertion         │    │
│  │  GET/POST /api/admin/*    → catalog CRUD (RBAC)     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │             Server Components (RSC)                 │    │
│  │  - catalog pages (SSR, no client bundle weight)    │    │
│  │  - admin pages (SSR, server-side RBAC check)       │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────┬─────────────────────────┬────────────────────┘
               │                         │
    ┌──────────▼──────────┐    ┌─────────▼──────────┐
    │   Supabase (Postgres │    │       Stripe        │
    │   + Auth + RLS)      │    │  Checkout + Webhooks│
    │                      │    └────────────────────┘
    │  auth.users          │
    │  public.profiles     │
    │  units               │
    │  classes             │
    │  brands              │
    │  orders_shadow       │
    │  quote_requests      │
    │  saved_loadouts      │
    │  analytics_events    │
    └──────────────────────┘
```

---

## End-to-End Data Flows

### 1. Diagnostic → Recommendation

```
User arrives at /recommend
  │
  ├─ RecommendationWizard renders (client component)
  │   5 steps: useCase → environment → budgetBand → purchasePreference → deploymentScale
  │
  ├─ User completes step 5 → submitToEngine()
  │   track("diagnostic_complete", { useCase, environment, budgetBand,
  │                                  purchasePreference, deploymentScale })
  │
  ├─ POST /api/recommend
  │   body: RecommendationInput
  │
  ├─ API route
  │   ├─ fetch all active units from Supabase (availability_status != 'archived')
  │   └─ pass to scoring engine
  │
  ├─ scoring.ts (engine execution)
  │   ├─ for each unit:
  │   │   ├─ scoreUseCase(unit, input, config)
  │   │   ├─ scoreEnvironment(unit, input, config)
  │   │   ├─ scorePurchasePreference(unit, input, config)
  │   │   ├─ scoreBudget(unit, input)
  │   │   ├─ scoreDeploymentScale(unit, input, config)
  │   │   ├─ scoreAvailability(unit, config)
  │   │   └─ aggregate → total score + reasons[]
  │   └─ sort descending, return top N
  │
  └─ RecommendationCard renders per result
      ├─ rank 1 → PRIMARY MATCH strip
      ├─ CTA determined by unit.purchaseMode:
      │   buy_now       → [ ADD TO LOADOUT ]  (track: result_add_to_loadout)
      │   partner_quote → [ INITIATE TRANSMISSION ]
      │   waitlist      → [ LOCK QUEUE POSITION ]
      └─ secondary: [ ADD TO MATRIX ] / [ SPECS ]
```

### 2. Loadout → Checkout

```
User at /loadout
  │
  ├─ CheckoutButton.onClick()
  │   ├─ getCartStore().getBuyNowItems()
  │   └─ POST /api/checkout
  │       body: { items: [{ unitId, quantity }] }
  │
  ├─ /api/checkout/route.ts
  │   ├─ validate: re-fetch each unit from Supabase by slug
  │   ├─ verify: purchaseMode === 'buy_now' (anti-tampering)
  │   ├─ verify: price from DB, not from client payload
  │   ├─ create Stripe Checkout session
  │   │   mode: 'payment'
  │   │   success_url: /checkout/success
  │   │   cancel_url: /checkout/cancel
  │   └─ return { url: stripe_checkout_url }
  │
  ├─ Client: window.location.href = url
  │   track("checkout_initiated", { itemCount })
  │
  ├─ User completes Stripe payment
  │
  ├─ Stripe → POST /api/webhooks/stripe
  │   ├─ verify signature (STRIPE_WEBHOOK_SECRET)
  │   ├─ event.type === 'checkout.session.completed'
  │   └─ INSERT into orders_shadow (Supabase, service role)
  │       { stripe_session_id, amount_total, currency,
  │         customer_email, payment_status, metadata }
  │
  └─ User redirected to /checkout/success
      track("checkout_completed")
```

### 3. Quote / Waitlist Submission

```
PDP or /recommend result
  │
  ├─ QuoteRequestForm / WaitlistForm
  │
  ├─ POST /api/quotes OR /api/waitlist
  │   body: { unitId, email, message? }
  │   user_id: from Supabase session (null if anonymous)
  │
  ├─ INSERT into quote_requests / waitlist_entries
  │   (Supabase, service role — bypasses RLS)
  │
  └─ Success state renders
      ├─ authenticated → link to /account/quotes
      └─ anonymous    → link to /auth/sign-up
```

### 4. Telemetry Flow

```
Any instrumented component
  │
  └─ track(event, properties)
      src/lib/analytics/track.ts

      ├─ getSessionId()          → sessionStorage (anonymous, per-tab)
      ├─ supabase.auth.getUser() → attach user_id if authenticated
      └─ INSERT into analytics_events
          { event, session_id, user_id, properties: JSONB, created_at }

          Best-effort: errors are caught and swallowed.
          User flow is never blocked by telemetry failure.

  └─ Supabase stores row
      RLS: anon + authenticated can INSERT
           only service role can SELECT
```

---

## Decision Engine

The recommendation engine is the system's primary differentiator.

### File Structure

```
src/lib/recommend/
├── config.ts      ← SOURCE OF TRUTH — weights, rules, all tunable parameters
├── scoring.ts     ← Engine logic — reads config, never owns parameters
└── (types in src/types/recommend.ts)
```

### Input Contract

```ts
// src/types/recommend.ts
interface RecommendationInput {
  useCase:            'home_assistance' | 'industrial_logistics' | 'security'
                    | 'education_dev' | 'research_prototype' | 'healthcare_lab';
  environment:        'home' | 'office' | 'warehouse' | 'outdoors'
                    | 'lab_clinic' | 'mixed';
  budgetBand:         'under_5k' | '5k_to_20k' | '20k_to_100k' | 'over_100k' | 'flexible';
  purchasePreference: 'buy_now' | 'quote_ok' | 'waitlist_ok' | 'any';
  deploymentScale:    'single' | 'small_fleet' | 'enterprise';
}
```

### Output Contract

```ts
interface RecommendationResult {
  unit:    Unit;
  score:   number;       // 0–100 aggregate weighted score
  rank:    number;       // 1 = PRIMARY MATCH
  reasons: string[];     // human-readable scoring justifications
}
```

### Scoring Execution

For each unit in the active catalog:

```
score = 0
reasons = []

// 1. USE CASE (max 30)
useCaseProfile = config.useCase[input.useCase]
if unit.classSlug in useCaseProfile.baseMatch:
  score += useCaseProfile.baseMatch[unit.classSlug]
for each bonusRule in useCaseProfile.bonusRules:
  if unit matches rule.term in rule.type field:
    score += rule.score
    reasons.push(explanation)

// 2. ENVIRONMENT (max 20)
envProfile = config.environment[input.environment]
score += envProfile.baseMatch[unit.classSlug] ?? 0
for each bonusRule in envProfile.bonusRules:
  if unit matches: score += rule.score

// 3. PURCHASE PREFERENCE (max 20)
score += config.purchasePreference[input.purchasePreference][unit.purchaseMode]

// 4. BUDGET (max 15)
if unit.priceCents within input.budgetBand range: score += weight
// "flexible" band always scores full budget weight

// 5. DEPLOYMENT SCALE (max 10)
scaleProfile = config.deploymentScale[input.deploymentScale]
score += scaleProfile.baseMatch[unit.classSlug] ?? 0
for each bonusRule: if matches score += rule.score
if unit.purchaseMode in scaleProfile.purchaseBonus:
  score += purchaseBonus (enterprise quote preference)

// 6. AVAILABILITY (max 5)
score += config.availabilityStatus[unit.availabilityStatus]

// Sort all units descending by score
// Assign rank 1..N
// Return top results
```

### Bonus Rule Types

| Type | Matching logic |
|---|---|
| `behavior` | Checks `unit.behaviors[]` array for term |
| `capability` | Checks `unit.capabilities[]` array for term |
| `fit` | Checks `unit.deploymentFit[]` array for term |
| `spec_exists` | Checks if `unit.specs[term]` is defined |
| `spec_match` | Checks if `unit.specs[term] === match` value |
| `array_length` | Checks if `unit[property].length >= min` |

### Determinism Guarantee

The engine contains:
- No randomness (no `Math.random()`)
- No async calls (all unit data is pre-fetched before scoring begins)
- No LLM calls
- No external state

**Same `RecommendationInput` + same catalog state = identical ranked output, every time.**

---

## Commerce Layer

### Price Integrity

Client payloads are **never trusted for pricing**. The checkout route re-fetches every unit by slug from Supabase and re-validates:

1. Unit exists and is `buy_now` mode
2. Price is read from database, not from client
3. `purchaseMode !== 'buy_now'` → request rejected

This prevents client-side price tampering regardless of what the browser sends.

### Webhook Verification

```ts
// /api/webhooks/stripe/route.ts
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
// throws if signature invalid → 400 returned, no DB write
```

The `orders_shadow` table is written to exclusively by the webhook handler using the service role key. No client-side code can write to it.

### Order Schema

```sql
orders_shadow (
  id                uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  amount_total      integer,          -- cents
  currency          text,
  customer_email    text,
  payment_status    text,
  metadata          jsonb,
  created_at        timestamptz default now()
)
```

`stripe_session_id` has a unique constraint — duplicate webhook deliveries are idempotent.

---

## Identity & RBAC

### Auth Flow

```
User submits credentials
  → Supabase Auth (PKCE)
  → access_token + refresh_token set as HTTP-only cookies
  → middleware.ts refreshes session on every request
  → server components read session via createServerClient()
```

### Middleware

`middleware.ts` runs on every request. It:
1. Creates a Supabase server client with cookie access
2. Calls `supabase.auth.getUser()` to refresh the session
3. Does not block unauthenticated requests (auth is handled per-route)

### Admin Protection

```ts
// src/lib/auth/require-admin.ts
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

if (profile?.role !== 'admin') {
  redirect('/'); // or return 403
}
```

All `/admin/*` routes call `requireAdmin()` at the top of every page and handler. There is no client-side RBAC — all checks are server-side.

### Profile Schema

```sql
profiles (
  id      uuid primary key references auth.users(id),
  email   text,
  role    text default 'user'   -- 'user' | 'admin'
)
```

The first admin is promoted manually via Supabase Studio. No auto-promotion logic exists (deliberate — avoids accidental escalation).

---

## State Management

### cart-store (Zustand)

Manages the active deployment queue:

```ts
interface CartStore {
  items:          CartItem[];           // { unit: Unit, quantity: number }
  addItem:        (unit: Unit) => void;
  removeItem:     (unitId: string) => void;
  getBuyNowItems: () => CartItem[];     // filtered for checkout
  getQuoteItems:  () => CartItem[];     // filtered for RFQ
  clearBuyNow:    () => void;           // called on checkout success
}
```

Persisted to `localStorage` via Zustand's `persist` middleware. Survives page refresh.

### compare-store (Zustand)

Manages the comparison matrix state:

```ts
interface CompareStore {
  units:          Unit[];
  addUnit:        (unit: Unit) => void;
  removeUnit:     (unitId: string) => void;
  clearCompare:   () => void;
  isInCompare:    (unitId: string) => boolean;
  isFull:         () => boolean;        // max 4 units enforced here
}
```

**Hard limit: 4 units.** `addUnit()` is a no-op if `units.length >= 4`. Enforced in the store, not in the UI.

---

## Database Schema

### Core Entities

```sql
-- Unit catalog (admin-managed via /admin/units)
units (
  id                  uuid primary key,
  name                text not null,
  slug                text unique not null,
  sku                 text unique,
  class_id            uuid references classes(id),
  brand_id            uuid references brands(id),
  short_description   text,
  description         text,
  images              text[],           -- URL array
  price_cents         integer,          -- null for quote-only
  purchase_mode       text,             -- buy_now | partner_quote | inquiry_only | waitlist | affiliate
  availability_status text,             -- available | low_stock | waitlist_open | partner_only | archived | sold_out
  specs               jsonb,            -- key: value pairs
  capabilities        text[],
  behaviors           text[],
  deployment_fit      text[],
  is_featured         boolean default false,
  created_at          timestamptz default now()
)

classes (
  id          uuid primary key,
  name        text not null,
  slug        text unique not null,
  description text
)

brands (
  id      uuid primary key,
  name    text not null,
  slug    text unique not null,
  website text
)
```

### Operator Records

```sql
-- Immutable order log. Written by webhook only.
orders_shadow (
  id                uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  amount_total      integer,
  currency          text,
  customer_email    text,
  payment_status    text,
  metadata          jsonb,
  created_at        timestamptz default now()
)

-- RFQ submissions (anonymous or authenticated)
quote_requests (
  id         uuid primary key default gen_random_uuid(),
  unit_id    uuid references units(id),
  user_id    uuid references auth.users(id),   -- nullable
  email      text not null,
  message    text,
  status     text default 'pending',
  created_at timestamptz default now()
)

-- Waitlist entries
waitlist_entries (
  id         uuid primary key default gen_random_uuid(),
  unit_id    uuid references units(id),
  user_id    uuid references auth.users(id),   -- nullable
  email      text not null,
  created_at timestamptz default now()
)

-- Operator-saved configurations
saved_loadouts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) not null,
  name       text not null,
  items_json jsonb not null,     -- serialized CartItem[]
  created_at timestamptz default now()
)
```

### Telemetry

```sql
analytics_events (
  id         uuid primary key default gen_random_uuid(),
  event      text not null,
  session_id text,
  user_id    uuid references auth.users(id) on delete set null,
  properties jsonb default '{}'::jsonb,
  created_at timestamptz default now()
)

-- Indexes
create index on analytics_events (event);
create index on analytics_events (session_id);
create index on analytics_events (created_at);

-- RLS
-- INSERT: anon + authenticated allowed
-- SELECT: service role only
```

### RLS Policy Matrix

| Table | anon INSERT | auth INSERT | anon SELECT | auth SELECT | Service Role |
|---|---|---|---|---|---|
| `units` | ✗ | ✗ | ✓ | ✓ | ✓ |
| `orders_shadow` | ✗ | ✗ | ✗ | own rows | ✓ |
| `quote_requests` | ✓ | ✓ | ✗ | own rows | ✓ |
| `waitlist_entries` | ✓ | ✓ | ✗ | own rows | ✓ |
| `saved_loadouts` | ✗ | own rows | ✗ | own rows | ✓ |
| `analytics_events` | ✓ | ✓ | ✗ | ✗ | ✓ |

---

## Telemetry Architecture

### Design Principles

| Principle | Implementation |
|---|---|
| **Best-effort** | All errors caught and swallowed — never blocks user flow |
| **No external SDK** | Direct Supabase insert — zero third-party dependency |
| **Session-scoped anonymity** | `sessionStorage` UUID — not `localStorage`, not cross-session |
| **Structured properties** | JSONB — all properties queryable by Postgres operators |
| **Append-only** | No updates, no deletes |

### Critical Event Payloads

The decision power of the telemetry system comes from the `properties` shape. These two events carry the most analytical weight:

```ts
// diagnostic_complete — captures ALL input dimensions
track("diagnostic_complete", {
  useCase,            // 'industrial_logistics'
  environment,        // 'warehouse'
  budgetBand,         // '20k_to_100k'
  purchasePreference, // 'quote_ok'
  deploymentScale,    // 'small_fleet'
});

// result_add_to_loadout — enables override detection
track("result_add_to_loadout", {
  rank,         // 1 = engine recommended, 2+ = override
  score,        // engine confidence for this unit
  unitId,       // UUID
  unitSlug,     // human-readable
  purchaseMode, // 'buy_now' | 'partner_quote' | etc.
  classSlug,    // unit class — identifies systematic class bias
});
```

The `rank` field is the key signal. When `rank > 1`, the engine's recommendation was overridden. Clustering of override patterns reveals which scoring dimensions are miscalibrated.

---

## Calibration Loop

The telemetry system feeds directly into config tuning. This is the system's long-term improvement mechanism.

```
Session events accumulate in analytics_events
          │
          ▼
SQL analysis (queries 4–7 in post_launch_roadmap.md)
          │
          ├─ Query 4: scoring dead zones (useCase action rate)
          ├─ Query 5: average score of override selections
          ├─ Query 6: rank distribution (how often rank 1 wins)
          └─ Query 7: override pressure by purchase mode
          │
          ▼
Pattern classification (via interpretation table)
          │
          ├─ Clustered overrides → scoring mismatch → adjust config.ts weight
          ├─ Random overrides   → explanation mismatch → fix reasons[] in scoring.ts
          └─ Rank 1 wins, no action → CTA/trust problem → fix UI
          │
          ▼
Single-lever config.ts adjustment
  + TUNING LOG entry (date / old → new / signal)
          │
          ▼
Canonical scenario validation (3 scenarios)
  home_assistance / home / buy_now
  industrial_logistics / warehouse / quote_ok
  security / office / any
          │
          ├─ Rank 1 shifts only where intended → COMMIT
          └─ Unexpected shifts → REVERT, isolate, try different lever
```

**Rule Zero (enforced by comment block at top of `config.ts`):**

> Do not mix scoring fixes with explanation fixes.  
> They are separate problems. Mixing them makes the system untraceable.

---

## System Invariants

These must not be broken regardless of feature additions or refactoring:

| Invariant | Enforcement |
|---|---|
| **Determinism** | No randomness, no async calls inside scoring execution |
| **Config/logic separation** | `scoring.ts` reads `config.ts` — logic never owns parameters |
| **Server-side price validation** | `/api/checkout` always re-fetches prices from DB |
| **Webhook as payment truth** | `orders_shadow` written only by verified webhook |
| **Server-side RBAC** | `require-admin.ts` called on every admin route — no client-side gates |
| **Telemetry non-blocking** | `track()` errors never propagate to calling code |
| **Compare hard limit** | `compare-store.addUnit()` enforces max 4 — UI reflects, not enforces |
| **One tuning lever at a time** | Enforced by TUNING LOG discipline in `config.ts` |

---

## Failure Modes

| Failure | Root Cause | Detection | Resolution |
|---|---|---|---|
| Wrong unit ranked | Scoring weight miscalibrated | Override rate > 30% in query 6 | Adjust single dimension in `config.ts` |
| User hesitates on result | Explanation doesn't justify score | Random overrides in query 7 | Rewrite `reasons[]` templates in `scoring.ts` |
| Dead zone for useCase | No units match profile | Query 4 shows low action rate | Add units to catalog or adjust baseMatch weights |
| Engine ranks quote units over buy_now | purchasePreference weight too low for buy_now operators | Query 7 shows buy_now users picking partner_quote | Increase `purchasePreference.buy_now.buy_now` |
| Missing order row | Webhook signature failure | Stripe dashboard shows undelivered events | Check `STRIPE_WEBHOOK_SECRET` matches live endpoint |
| Wrong price charged | Not possible — prices re-fetched server-side | N/A | Invariant: client price payload is ignored |
| Admin access without role | RBAC check not called | N/A | `require-admin.ts` is always first call |
| Telemetry gap | Network failure | Missing events in query sequence | Expected — telemetry is best-effort, not guaranteed |

---

## Scaling Considerations

### Safe to scale without architectural changes

- **Catalog size** — scoring is O(n) over units; up to ~10k units with negligible latency
- **Concurrent users** — stateless API routes, Supabase connection pooling handles concurrency
- **Telemetry volume** — `analytics_events` is append-only; partition by `created_at` when rows exceed ~1M

### Requires deliberate care

| Area | Risk | Mitigation |
|---|---|---|
| Scoring complexity | Adding many bonus rules increases O(n×m) | Keep rule sets per useCase to < 10 |
| Explanation generation | String interpolation in reasons[] can drift from scoring truth | Always generate reasons inside scoring.ts, never in UI |
| DB query performance | Full unit scan per recommendation request | Add index on `availability_status`; consider caching active units |
| Config drift | Multiple concurrent tuning passes conflict | TUNING LOG + one-lever-at-a-time protocol |

### Future Architectural Extensions

| Extension | Approach | Notes |
|---|---|---|
| Operator Favorites badge | SQL `GROUP BY useCase, unitSlug` against `analytics_events` | No ML required |
| Inline loadout drawer | New Zustand signal + drawer component | Does not touch engine |
| Vendor placement weighting | New dimension in `config.ts`: `vendorBoost[unitId]` | Pure config addition |
| Multi-objective scoring | Add Pareto front calculation after aggregate sort | Breaks determinism if randomized — avoid |
| Enterprise operator profiles | Persist `RecommendationInput` to Supabase per user | Session memory, no engine changes |
| Behavioral weight tuning | Automated config suggestion from override SQL | Keep human in loop — do not automate commits |

---

## Appendix: Key File Index

| File | Purpose |
|---|---|
| `src/lib/recommend/config.ts` | Scoring source of truth — all behavioral parameters |
| `src/lib/recommend/scoring.ts` | Engine logic — deterministic, reads config |
| `src/lib/analytics/track.ts` | Telemetry client — best-effort, typed events |
| `src/lib/auth/require-admin.ts` | RBAC enforcement — called on every admin route |
| `src/store/cart-store.ts` | Loadout state — Zustand with localStorage persistence |
| `src/store/compare-store.ts` | Compare state — Zustand, max 4 enforced here |
| `middleware.ts` | Session refresh — runs on every request |
| `src/app/api/checkout/route.ts` | Stripe session creation — server-side price validation |
| `src/app/api/webhooks/stripe/route.ts` | Webhook handler — signature verification + order logging |
| `supabase/migrations/` | All schema changes — version controlled |
| `docs/post_launch_roadmap.md` | Operational reference — SQL queries, tuning protocol |

---

*Architecture status: STABLE*  
*Engine mode: DETERMINISTIC*  
*Calibration: READY*
