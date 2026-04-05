# RobotStore.app — Post-Launch Operational Reference

> The "Day 3" tuning manual for the RobotStore recommendation engine.  
> Use this document to analyze session data, detect mismatches, and calibrate `config.ts`.

---

## 🚦 Infra Checklist (before first real session)

- [ ] **Prod env vars confirmed:** `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`.
- [ ] **Stripe live endpoint registered:** Destination points to `/api/webhooks/stripe`.
- [ ] **Supabase RLS verified:** `orders_shadow`, `quotes`, `waitlist`, `saved_loadouts`.
- [ ] **Admin role manually assigned:** Ensure at least one profile has `role = 'admin'` in Supabase Studio.
- [ ] **Smoke Checkout:** 1 checkout → order row appears in `orders_shadow`.
- [ ] **Smoke Leads:** 1 anon quote + 1 auth quote → visible in `/admin/quotes`.
- [ ] **Admin Guard:** `/admin/*` gated correctly (non-admin receives 403/redirect).

---

## 📊 Day 1 Telemetry Schema

Log these events only. No noise.

```ts
type TelemetryEvent =
  | 'enter_home'
  | 'click_diagnostic'           // [ INITIATE SYSTEM DIAGNOSTIC ] clicked
  | 'diagnostic_complete'        // wizard step 5 submitted
  | 'result_add_to_loadout'      // [ ADD TO LOADOUT ] on RecommendationCard
  | 'result_add_to_compare'      // [ ADD TO MATRIX ] on RecommendationCard
  | 'compare_proceed_to_loadout' // [ PROCEED TO LOADOUT ] on /compare
  | 'checkout_initiated'         // Stripe redirect fires
  | 'checkout_completed'         // /checkout/success rendered
  | 'quote_submitted'            // /api/quotes 200
  | 'waitlist_locked';           // /api/waitlist 200
```

### Funnels to Watch

| Funnel | Target |
|---|---|
| Home → Diagnostic complete | >30% |
| Diagnostic → Any result action | >50% |
| Loadout → Checkout initiated | >40% |
| Quote submissions / sessions | Baseline to beat |

---

## 🕒 48–72h Optimization Targets

### 1. Primary path dominance
**Signal:** Are users going `Recommend → Loadout` or `Recommend → Compare → Loadout`?
- If `Recommend → Loadout` dominates → Surface the diagnostic more prominently.
- If `Compare → Loadout` dominates → Add a "COMPARE TOP MATCHES" shortcut on results.

### 2. Weight tuning (`src/lib/recommend/config.ts`)
**Signal:** Users frequently choose rank 2 or 3 instead of the Primary Match (Rank 1).
- **Action:** Run the Override Detection queries below. Adjust weights in `config.ts`.

### 3. Results → Action drop-off
**Signal:** `diagnostic_complete` fires but no further clicks happen.
- **Action:** Increase visual weight of Primary CTA. Shorten descriptions for Rank 1 to show more specs at a glance.

---

## 🔍 Day 3: Tuning Queries (Supabase SQL Editor)

### 1. Primary Match Override Rate
```sql
-- What units are actually being selected?
-- Compare against your engine's PRIMARY MATCH output to find overrides.
select
  (properties->>'unitSlug') as unit_slug,
  count(*)                   as selections
from public.analytics_events
where event = 'result_add_to_loadout'
group by unit_slug
order by selections desc
limit 20;
```

### 2. Full Funnel Completion Rates
```sql
select
  event,
  count(*) as fires,
  round(
    count(*) * 100.0 / nullif(
      (select count(*) from public.analytics_events where event = 'enter_home'), 0
    ), 1
  ) as pct_of_home_visitors
from public.analytics_events
where event in (
  'enter_home','click_diagnostic','diagnostic_complete',
  'result_add_to_loadout','checkout_initiated','checkout_completed',
  'quote_submitted','waitlist_locked'
)
group by event
order by fires desc;
```

### 3. Override Heatmap — where is the engine wrong?
```sql
-- Average rank selected per class slug.
-- Healthy: close to 1.0. Drifting toward 2.0+ = systematic mismatch.
select
  properties->>'classSlug' as class_slug,
  round(avg((properties->>'rank')::numeric), 2) as avg_rank_selected,
  count(*) as total_selections
from public.analytics_events
where event = 'result_add_to_loadout'
group by class_slug
order by avg_rank_selected desc;
```

### 4. Scoring Dead Zones
```sql
-- Lowest action_rate_pct = worst useCase scoring alignment.
-- Measures: "Diagnostic completed, then action happened in same session."
select
  (d.properties->>'useCase')                       as use_case,
  count(distinct d.session_id)                      as completed_diagnostic,
  count(distinct a.session_id)                      as took_action,
  round(
    count(distinct a.session_id) * 100.0
      / nullif(count(distinct d.session_id), 0), 1
  ) as action_rate_pct
from public.analytics_events d
left join public.analytics_events a
  on  a.session_id = d.session_id
  and a.event in ('result_add_to_loadout', 'quote_submitted', 'waitlist_locked')
where d.event = 'diagnostic_complete'
group by 1
order by action_rate_pct asc;
```

---

## 🛠️ Canonical Tuning Protocol (Rule Zero)

**One lever. Three verifications. Commit or revert.**

1.  **Identify Pattern:** Use queries 1–4 to confirm a systematic mismatch.
2.  **Pick ONE lever:** Modify exactly one weight in `src/lib/recommend/config.ts`.
3.  **Log the Change:** Record in the `TUNING LOG` at the top of `config.ts`.
4.  **Golden Scenario Verification:** Re-run 3 standardized scenarios manually:
    *   Domestic Assistance / Home / Buy Now
    *   Industrial Logistics / Warehouse / Quote OK
    *   Security Patrol / Office / Any
5.  **Confirm Rank 1:** Ensure the Primary Match only shifts where intended.
6.  **Deploy:** Commit if clean. Revert immediately if any "Golden Scenario" rank 1 shifts unexpectedly.

---

## ⚡ Override Interpretation Guide

| Pattern | Cause | Config Lever |
|---|---|---|
| `partner_quote` dominates overrides | Mode bias | Increase `purchasePreference.quote_ok.partner_quote` |
| One `classSlug` wins as Rank 2 | Base weight bias | Increase class score in `useCase[profile].baseMatch` |
| Avg selected score ≈ Rank 1 score | Narrow gaps | Add a targeted `bonusRule` to Rank 1's anchor class |
| Overrides cluster in one `useCase` | Profile bias | Rebalance all 3 dimensions for that specific useCase |
| Overrides are random | Reason mismatch | **Don't touch weights.** Rewrite `reasons` in `scoring.ts`. |

---

*Operational Status: READY*  
*Calibration Window: SESSION 1 – 100*
