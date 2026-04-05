# ROBOT_STORE // API Reference

> Full API surface for RobotStore.app  
> Includes route handlers, payload contracts, auth boundaries, and operational behavior.

For product overview, see [`README.md`](../README.md).  
For internal mechanics, see [`architecture.md`](./architecture.md).  
For schema and ERD, see [`data-model.md`](./data-model.md).

---

## Table of Contents

1. [API Philosophy](#api-philosophy)
2. [Conventions](#conventions)
3. [Auth & Authorization Model](#auth--authorization-model)
4. [Public API Routes](#public-api-routes)
5. [Commerce API Routes](#commerce-api-routes)
6. [Operator Workflow API Routes](#operator-workflow-api-routes)
7. [Recommendation API Routes](#recommendation-api-routes)
8. [Admin API Routes](#admin-api-routes)
9. [Telemetry API Surface](#telemetry-api-surface)
10. [Error Model](#error-model)
11. [Operational Notes](#operational-notes)

---

## API Philosophy

RobotStore's API is designed around five principles:

**1. Deterministic behavior**
- Same payload + same catalog state = same result
- No probabilistic branching in route handlers

**2. Server-side truth**
- Client payloads are never trusted for prices, permissions, or protected state
- Prices are re-fetched from the database on every checkout request

**3. Hybrid commerce support**
- `buy_now`, `quote`, `inquiry`, `waitlist`, and saved loadouts each have explicit pathways
- No single generic "purchase" endpoint

**4. Auth is additive, not blocking**
- High-friction actions (quotes, waitlists) allow anonymous users to reduce drop-off
- Privileged actions always require server-side role validation

**5. Operational failure must be explainable**
- APIs return structured error codes
- Webhook truth is distinct from UI success states

---

## Conventions

### Base URL

All route handlers are Next.js App Router routes under `src/app/api/`:

```
/api/recommend
/api/checkout
/api/quotes
/api/waitlist
/api/webhooks/stripe
/api/admin/units
/api/admin/units/[id]
/api/admin/classes
/api/admin/brands
/api/admin/quotes
/api/admin/waitlist
/api/admin/orders
/api/admin/loadouts
```

### Format

| Convention | Value |
|---|---|
| Request body | JSON (unless raw webhook payload) |
| Response body | JSON |
| Auth | Supabase SSR cookies |
| IDs | UUID (unless explicitly slug-based) |
| Monetary values | Integer cents (`price_cents`, `amount_total`) |

### Response Envelope

**Success:**
```json
{
  "ok": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable explanation"
  }
}
```

> Some existing handlers return simpler payloads. This document describes the target contract shape.

---

## Auth & Authorization Model

| Route type | Anonymous | Authenticated User | Admin |
|---|---|---|---|
| Public catalog reads | ✓ | ✓ | ✓ |
| Recommendation | ✓ | ✓ | ✓ |
| Checkout | ✓ | ✓ | ✓ |
| Quote / waitlist submit | ✓ | ✓ | ✓ |
| Saved loadouts | ✗ | ✓ (own) | ✓ |
| Account-only data | ✗ | ✓ (own) | ✓ |
| Admin catalog CRUD | ✗ | ✗ | ✓ |
| Admin ops views | ✗ | ✗ | ✓ |
| Stripe webhook | ✗ | ✗ | service role only |

**Server-side enforcement:**
- User session resolved via Supabase server client (`createServerClient`)
- Admin gating enforced through `require-admin.ts` on every protected route
- No client-side role checks are considered authoritative

---

## Public API Routes

### `GET /api/compare`

Fetch a normalized, compare-ready unit set by slugs.

**Purpose:** Support query-driven compare URLs and server-rendered compare views.

**Query parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `units` | comma-separated slugs | yes | Up to 4 unit slugs |

**Example:**
```
GET /api/compare?units=rmx-400,rs-patrol-sentinel,agr-22
```

**Success response:**
```json
{
  "ok": true,
  "data": {
    "units": [
      {
        "id": "uuid",
        "slug": "rmx-400",
        "name": "RMX-400",
        "shortDescription": "Autonomous cleaning system",
        "purchaseMode": "buy_now",
        "availabilityStatus": "available",
        "priceCents": 129500,
        "specs": { "autonomy": "Level 4", "runtime": "180 min" },
        "capabilities": ["Autonomous navigation", "Obstacle avoidance"],
        "behaviors": ["Low-noise", "Companion-safe"],
        "deploymentFit": ["Large residential areas", "Commercial spaces"]
      }
    ]
  }
}
```

**Failure modes:**

| Condition | Status | Code |
|---|---|---|
| Missing `units` param | 400 | `INVALID_REQUEST` |
| More than 4 units | 400 | `COMPARE_LIMIT_EXCEEDED` |
| No matching units found | 404 | `UNITS_NOT_FOUND` |

---

## Commerce API Routes

### `POST /api/checkout`

Creates a Stripe Checkout session for `buy_now` units.

**Purpose:** Validate checkout items against DB truth, then create and return a hosted Stripe session URL.

**Auth:** Anonymous and authenticated — both allowed.

**Request body:**
```json
{
  "items": [
    {
      "unitId": "uuid",
      "quantity": 1
    }
  ]
}
```

**Validation rules:**
- `items` must be non-empty
- Each item must reference a real, existing unit
- Unit must have `purchase_mode = "buy_now"`
- Server re-fetches `price_cents` from DB — client-submitted prices are ignored
- `quantity` must be a positive integer

**Success response:**
```json
{
  "ok": true,
  "data": {
    "url": "https://checkout.stripe.com/c/pay/cs_live_..."
  }
}
```

**Failure modes:**

| Condition | Status | Code |
|---|---|---|
| Empty items array | 400 | `EMPTY_CART` |
| Invalid payload shape | 400 | `INVALID_REQUEST` |
| Unit not found | 404 | `UNIT_NOT_FOUND` |
| Unit not purchasable (`purchase_mode != buy_now`) | 400 | `INVALID_PURCHASE_MODE` |
| Stripe session creation failure | 500 | `CHECKOUT_SESSION_FAILED` |

**Operational notes:**
- This is the only authorized entry point into Stripe Checkout
- `/checkout/success` is a UX confirmation screen only — not payment truth
- Payment truth comes from the webhook handler

---

### `POST /api/webhooks/stripe`

Stripe webhook endpoint. The sole writer of `orders_shadow`.

**Purpose:** Verify Stripe signature, receive `checkout.session.completed`, write verified payment record to `orders_shadow`.

**Auth:** Not user-authenticated. Protected by Stripe signature verification only.

**Request:** Raw Stripe webhook payload.

**Required header:**

| Header | Required |
|---|---|
| `stripe-signature` | yes |

**Handled event types:**

| Event | Action |
|---|---|
| `checkout.session.completed` | Insert row into `orders_shadow` |
| All others | Acknowledged, no action |

**Success response:**
```json
{ "received": true }
```

**Failure modes:**

| Condition | Status | Code |
|---|---|---|
| Missing `stripe-signature` header | 400 | `MISSING_SIGNATURE` |
| Invalid signature | 400 | `INVALID_SIGNATURE` |
| DB write failure | 500 | `ORDER_LOG_FAILED` |

**Operational notes:**
- Idempotency enforced by `UNIQUE` constraint on `stripe_session_id`
- Duplicate webhook deliveries do not create duplicate rows
- If signature fails, the event is discarded — no partial writes

---

## Operator Workflow API Routes

### `POST /api/quotes`

Submit a Request for Quote.

**Purpose:** Log quote requests for `partner_quote` and `inquiry_only` unit flows. Supports both anonymous and authenticated operators.

**Auth:** Anonymous and authenticated — both allowed.

**Request body:**
```json
{
  "unitId": "uuid",
  "email": "operator@example.com",
  "name": "Jane Operator",
  "company": "Acme Logistics",
  "message": "Need fleet pricing for 3 warehouse units."
}
```

| Field | Required | Notes |
|---|---|---|
| `unitId` | yes | UUID of the requested unit |
| `email` | yes for anonymous | Auto-resolved from session if authenticated |
| `name` | no | Stored for admin context |
| `company` | no | Stored for admin context |
| `message` | no | Free-text intent |

**Behavior:**
- If authenticated, `user_id` is attached automatically from the session
- If anonymous, `user_id = null` — `email` is the contact anchor
- Row inserted into `quote_requests` with `status = 'pending'`

**Success response:**
```json
{
  "ok": true,
  "data": {
    "status": "logged",
    "message": "REQUEST LOGGED"
  }
}
```

**Failure modes:**

| Condition | Status | Code |
|---|---|---|
| Missing `unitId` | 400 | `INVALID_REQUEST` |
| Missing `email` (anonymous) | 400 | `EMAIL_REQUIRED` |
| Unit not found | 404 | `UNIT_NOT_FOUND` |
| Insert failure | 500 | `QUOTE_SUBMISSION_FAILED` |

---

### `POST /api/waitlist`

Lock queue position for a unit in `waitlist` mode.

**Purpose:** Capture allocation intent for scarce or queue-managed units.

**Auth:** Anonymous and authenticated — both allowed.

**Request body:**
```json
{
  "unitId": "uuid",
  "email": "operator@example.com",
  "name": "Jane Operator"
}
```

| Field | Required | Notes |
|---|---|---|
| `unitId` | yes | UUID of the waitlisted unit |
| `email` | yes for anonymous | Auto-resolved from session if authenticated |
| `name` | no | Stored for admin context |

**Behavior:**
- If authenticated, `user_id` attached automatically
- Row inserted into `waitlist_entries` with `status = 'queued'`

**Success response:**
```json
{
  "ok": true,
  "data": {
    "status": "queued",
    "message": "QUEUE POSITION LOCKED"
  }
}
```

**Failure modes:**

| Condition | Status | Code |
|---|---|---|
| Missing `unitId` | 400 | `INVALID_REQUEST` |
| Missing `email` (anonymous) | 400 | `EMAIL_REQUIRED` |
| Unit not found | 404 | `UNIT_NOT_FOUND` |
| Insert failure | 500 | `WAITLIST_SUBMISSION_FAILED` |

---

### `POST /api/loadouts`

Persist the current authenticated operator's loadout configuration.

**Purpose:** Save a named deployment configuration to Supabase for later restore.

**Auth:** Authenticated only. Anonymous users cannot save loadouts.

**Request body:**
```json
{
  "name": "Warehouse Security Stack",
  "items": [
    { "unitId": "uuid", "quantity": 2 },
    { "unitId": "uuid", "quantity": 1 }
  ]
}
```

**Success response:**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "status": "logged"
  }
}
```

**Failure modes:**

| Condition | Status | Code |
|---|---|---|
| No auth session | 401 | `UNAUTHORIZED` |
| Missing `name` | 400 | `INVALID_REQUEST` |
| Empty or invalid `items` | 400 | `INVALID_REQUEST` |
| Insert failure | 500 | `LOADOUT_SAVE_FAILED` |

---

### `GET /api/loadouts`

Fetch saved loadouts for the authenticated operator.

**Auth:** Authenticated only.

**Success response:**
```json
{
  "ok": true,
  "data": {
    "loadouts": [
      {
        "id": "uuid",
        "name": "Warehouse Security Stack",
        "itemsJson": [ ... ],
        "createdAt": "2026-04-05T10:00:00Z",
        "updatedAt": "2026-04-05T10:00:00Z"
      }
    ]
  }
}
```

**Failure modes:**

| Condition | Status | Code |
|---|---|---|
| No auth session | 401 | `UNAUTHORIZED` |
| DB query failure | 500 | `LOADOUT_FETCH_FAILED` |

---

## Recommendation API Routes

### `POST /api/recommend`

Run the deterministic recommendation engine against the active catalog.

**Purpose:** Score all active units against the operator's declared constraints. Return a ranked list with scores and human-readable explanations.

**Auth:** Anonymous and authenticated — both allowed.

**Request body:**
```json
{
  "useCase": "industrial_logistics",
  "environment": "warehouse",
  "budgetBand": "20k_to_100k",
  "purchasePreference": "quote_ok",
  "deploymentScale": "small_fleet"
}
```

**Valid enum values:**

| Field | Valid values |
|---|---|
| `useCase` | `home_assistance`, `industrial_logistics`, `security`, `education_dev`, `research_prototype`, `healthcare_lab` |
| `environment` | `home`, `office`, `warehouse`, `outdoors`, `lab_clinic`, `mixed` |
| `budgetBand` | `under_5k`, `5k_to_20k`, `20k_to_100k`, `over_100k`, `flexible` |
| `purchasePreference` | `buy_now`, `quote_ok`, `waitlist_ok`, `any` |
| `deploymentScale` | `single`, `small_fleet`, `enterprise` |

**Success response:**
```json
{
  "ok": true,
  "data": {
    "results": [
      {
        "unit": {
          "id": "uuid",
          "slug": "rs-patrol-sentinel",
          "name": "RS Patrol Sentinel",
          "shortDescription": "Enterprise-grade perimeter control",
          "purchaseMode": "partner_quote",
          "availabilityStatus": "available",
          "priceCents": null,
          "classSlug": "security-nodes"
        },
        "score": 74,
        "rank": 1,
        "reasons": [
          "Optimal for office security deployment under your declared constraints",
          "Validated for partner-quote acquisition — no direct purchase required",
          "Matches perimeter and surveillance capability profile"
        ]
      },
      {
        "unit": { ... },
        "score": 61,
        "rank": 2,
        "reasons": [ ... ]
      }
    ]
  }
}
```

**Failure modes:**

| Condition | Status | Code |
|---|---|---|
| Invalid enum value in any field | 400 | `INVALID_REQUEST` |
| No eligible units in catalog | 200 | `NO_MATCHES` (empty `results` array) |
| Engine/DB failure | 500 | `RECOMMENDATION_FAILED` |

**Operational notes:**
- **Deterministic** — identical input + identical catalog state = identical output, every time
- **No AI dependency** — scoring is a weighted sum across dimensions defined in `config.ts`
- `archived` units are excluded from scoring regardless of input
- Tuning the engine means editing `config.ts` values — not this route handler

---

## Admin API Routes

All admin routes require server-side admin validation via `require-admin.ts`. Non-admin requests receive a `403 FORBIDDEN` response or redirect.

---

### `GET /api/admin/units`

List all units for the admin catalog interface.

**Auth:** Admin only.

**Success response:**
```json
{
  "ok": true,
  "data": {
    "units": [
      {
        "id": "uuid",
        "slug": "rmx-400",
        "name": "RMX-400",
        "purchaseMode": "buy_now",
        "availabilityStatus": "available",
        "priceCents": 129500,
        "classSlug": "domestic-assistance",
        "isFeature": true
      }
    ]
  }
}
```

---

### `POST /api/admin/units`

Create a new catalog unit.

**Auth:** Admin only.

**Request body:**
```json
{
  "name": "RS Patrol Sentinel",
  "slug": "rs-patrol-sentinel",
  "sku": "RS-PS-001",
  "classId": "uuid",
  "brandId": "uuid",
  "shortDescription": "Enterprise-grade perimeter control system",
  "description": "Full markdown description...",
  "images": ["/images/units/rs-patrol-sentinel.jpg"],
  "priceCents": null,
  "purchaseMode": "partner_quote",
  "availabilityStatus": "available",
  "specs": {
    "runtime": "12h",
    "payload": "15kg",
    "mobility": "wheeled"
  },
  "capabilities": ["Surveillance", "Intrusion detection", "Patrol routing"],
  "behaviors": ["Predictable", "Silent"],
  "deploymentFit": ["Corporate campus", "Warehouse", "Perimeter"],
  "isFeatured": false
}
```

**Failure modes:**

| Condition | Status | Code |
|---|---|---|
| Not admin | 403 | `FORBIDDEN` |
| Invalid `purchaseMode` | 400 | `INVALID_REQUEST` |
| Invalid `availabilityStatus` | 400 | `INVALID_REQUEST` |
| Missing required field (`name`, `slug`, `purchaseMode`, `availabilityStatus`) | 400 | `INVALID_REQUEST` |
| Slug or SKU collision | 409 | `CONFLICT` |
| Insert failure | 500 | `UNIT_CREATE_FAILED` |

---

### `GET /api/admin/units/[id]`

Fetch a single unit for editing.

**Auth:** Admin only.

---

### `PATCH /api/admin/units/[id]`

Partially update an existing unit.

**Auth:** Admin only.

**Request body:** Partial unit payload — any subset of the `POST` body fields.

**Operational notes:**
- `buy_now` units must maintain a valid `price_cents`
- Archival should always be done through `availabilityStatus = 'archived'`, not hard delete
- Changing `classId` affects recommendation scoring on the next API call immediately

---

### `DELETE /api/admin/units/[id]`

Archive a unit (soft delete).

**Auth:** Admin only.

**Behavior:** Sets `availability_status = 'archived'`. Unit is excluded from recommendations and catalog reads but remains in DB for historical reference.

**Success response:**
```json
{
  "ok": true,
  "data": { "status": "archived" }
}
```

---

### Classes CRUD

**`GET /api/admin/classes`** — List class taxonomy.

**`POST /api/admin/classes`** — Create class.

**Example create body:**
```json
{
  "name": "Security Nodes",
  "slug": "security-nodes",
  "description": "Autonomous patrol, perimeter, and surveillance systems",
  "sortOrder": 20
}
```

> ⚠️ **Critical:** The `slug` value must match the corresponding key in `config.ts` `baseMatch` objects. If a class slug changes, `config.ts` must be updated in the same deployment.

**`GET /api/admin/classes/[id]`** — Fetch class.

**`PATCH /api/admin/classes/[id]`** — Update class.

---

### Brands CRUD

**`GET /api/admin/brands`** — List brands.

**`POST /api/admin/brands`** — Create brand.

**Example create body:**
```json
{
  "name": "Aegis Robotics",
  "slug": "aegis-robotics",
  "website": "https://aegisrobotics.example.com",
  "description": "Industrial security hardware manufacturer"
}
```

**`GET /api/admin/brands/[id]`** — Fetch brand.

**`PATCH /api/admin/brands/[id]`** — Update brand.

---

### Admin Operations Views

**`GET /api/admin/quotes`** — Admin view of all quote requests.

```json
{
  "ok": true,
  "data": {
    "quotes": [
      {
        "id": "uuid",
        "unitId": "uuid",
        "unitSlug": "rs-patrol-sentinel",
        "email": "operator@example.com",
        "company": "Acme Logistics",
        "status": "pending",
        "createdAt": "2026-04-05T10:00:00Z"
      }
    ]
  }
}
```

**`GET /api/admin/waitlist`** — Admin view of all waitlist entries.

**`GET /api/admin/orders`** — Admin view of `orders_shadow`.

```json
{
  "ok": true,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "stripeSessionId": "cs_live_...",
        "amountTotal": 129500,
        "currency": "usd",
        "customerEmail": "operator@example.com",
        "paymentStatus": "paid",
        "createdAt": "2026-04-05T10:00:00Z"
      }
    ]
  }
}
```

**`GET /api/admin/loadouts`** — Admin view of saved loadouts.

---

## Telemetry API Surface

Telemetry does not use an HTTP route. It is a client-side helper that writes directly to Supabase via the anon key.

### `track(event, properties)`

**Location:** `src/lib/analytics/track.ts`

**Purpose:**
- Best-effort event insert into `analytics_events`
- Never throws into the calling user flow
- Attaches `session_id` (anonymous sessionStorage UUID)
- Attaches `user_id` if an active session exists

**Typed event set:**
```ts
type FunnelEvent =
  | 'enter_home'
  | 'click_diagnostic'
  | 'diagnostic_complete'
  | 'result_add_to_loadout'
  | 'result_add_to_compare'
  | 'compare_proceed_to_loadout'
  | 'checkout_initiated'
  | 'checkout_completed'
  | 'quote_submitted'
  | 'waitlist_locked';
```

**Critical payload shapes:**

`diagnostic_complete` — all 5 input dimensions explicit:
```json
{
  "useCase": "security",
  "environment": "office",
  "budgetBand": "10k_to_20k",
  "purchasePreference": "quote_ok",
  "deploymentScale": "small_fleet"
}
```

`result_add_to_loadout` — enables override detection:
```json
{
  "rank": 2,
  "score": 61,
  "unitId": "uuid",
  "unitSlug": "rs-patrol-sentinel",
  "purchaseMode": "partner_quote",
  "classSlug": "security-nodes"
}
```

> **`rank > 1` is the primary calibration signal.** When users consistently select rank 2 or 3, it indicates that a scoring dimension is miscalibrated. The `classSlug` and `purchaseMode` fields identify which dimension to inspect first.

---

## Error Model

### Standard error shape

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Missing required field: unitId"
  }
}
```

### Error code reference

| Code | HTTP Status | Meaning |
|---|---|---|
| `INVALID_REQUEST` | 400 | Malformed or missing required fields |
| `UNAUTHORIZED` | 401 | Auth session required but not present |
| `FORBIDDEN` | 403 | Admin role required, or action not permitted |
| `UNIT_NOT_FOUND` | 404 | Referenced unit does not exist |
| `UNITS_NOT_FOUND` | 404 | None of the referenced units exist |
| `CONFLICT` | 409 | Unique constraint collision (slug, SKU, session ID) |
| `EMPTY_CART` | 400 | Checkout attempted with no items |
| `INVALID_PURCHASE_MODE` | 400 | Non-`buy_now` item attempted in checkout |
| `COMPARE_LIMIT_EXCEEDED` | 400 | More than 4 units in compare request |
| `EMAIL_REQUIRED` | 400 | Anonymous submission missing email field |
| `CHECKOUT_SESSION_FAILED` | 500 | Stripe session creation failed |
| `MISSING_SIGNATURE` | 400 | Stripe webhook missing `stripe-signature` header |
| `INVALID_SIGNATURE` | 400 | Stripe webhook signature verification failed |
| `ORDER_LOG_FAILED` | 500 | Verified payment could not be persisted |
| `QUOTE_SUBMISSION_FAILED` | 500 | Quote insert failed |
| `WAITLIST_SUBMISSION_FAILED` | 500 | Waitlist insert failed |
| `LOADOUT_SAVE_FAILED` | 500 | Loadout insert failed |
| `LOADOUT_FETCH_FAILED` | 500 | Loadout query failed |
| `RECOMMENDATION_FAILED` | 500 | Scoring engine failed unexpectedly |
| `NO_MATCHES` | 200 | Engine ran successfully but no units matched — empty `results` array |

---

## Operational Notes

### Price truth
- Never trust client-submitted price payloads
- `/api/checkout` always re-fetches `price_cents` from the database before creating a Stripe session
- A client that sends a modified price will have it silently replaced by the server value

### Payment truth
- `/checkout/success` is a UX screen only — it fires telemetry and clears the cart
- The `orders_shadow` row, written by the webhook handler, is the definitive payment record
- If a row does not appear in `orders_shadow` within 30 seconds of a successful Stripe payment: check the Stripe webhook dashboard for delivery failures, then verify `STRIPE_WEBHOOK_SECRET` matches the live endpoint secret

### Recommendation tuning truth

| Signal | Cause | Fix location |
|---|---|---|
| Overrides cluster by `useCase` or `purchaseMode` | Scoring mismatch | `config.ts` — adjust one weight |
| Overrides spread randomly across all dimensions | Explanation mismatch | `scoring.ts` — rewrite `reasons[]` templates |
| Rank 1 wins consistently but no actions follow | CTA or trust problem | UI components — not the engine |

### Admin truth
- The admin console UI is not the authorization layer
- `require-admin.ts` called on every admin route handler is the authorization layer
- A user who reaches an admin page through a client-side navigation shortcut will be rejected at the API level

### Telemetry truth
- Telemetry is best-effort — missing events do not indicate broken user flow
- An event gap in a session is expected during network failures or rapid navigation
- Trends over 50+ sessions matter — individual missing rows do not
- Never treat a single telemetry event as ground truth for a config change

---

## Final Notes

RobotStore's API is not a generic ecommerce API.

It is an API surface designed to support:

- **Deterministic recommendation** — one engine, one config, auditable outputs
- **Hybrid procurement pathways** — buy, quote, waitlist, and save all have first-class routes
- **Admin-governed catalog control** — every unit is an explicit admin decision
- **Observable behavioral calibration** — telemetry surface exists specifically to feed the tuning loop

Every endpoint exists to move an operator from **uncertainty → action** with traceable, explainable logic.

---

*API status: STABLE*  
*Auth model: Supabase PKCE + SSR*  
*Commerce truth: Stripe webhook → `orders_shadow`*
