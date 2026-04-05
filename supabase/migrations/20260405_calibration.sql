-- supabase/migrations/20260405_calibration.sql
-- 
-- Final Calibration Dashboard Views
-- Standardizes raw jsonb properties into snake_case normalized views.
-- 

-- 1. Performance Indexes
create index if not exists idx_analytics_events_name_created
  on analytics_events (event, created_at desc);

create index if not exists idx_analytics_events_session
  on analytics_events (session_id);

create index if not exists idx_analytics_events_props_gin
  on analytics_events using gin (properties);

-- 2. Base View: session-level exposure
create or replace view v_calibration_sessions as
with base as (
  select
    session_id,
    min(created_at) as first_seen_at,
    max(created_at) as last_seen_at,
    max(properties->>'useCase') as use_case,
    max(properties->>'confidenceLevel') as confidence_level,
    max((properties->>'confidenceGap')::numeric) as confidence_gap,
    max(properties->>'uiMode') as ui_mode,
    max(properties->>'primaryAction') as primary_action,
    max(properties->>'fulfillmentType') as fulfillment_type
  from analytics_events
  where event in (
    'results_exposed',
    'ui_mode_exposed',
    'cta_variant_exposed',
    'persuasive_reason_exposed',
    'cta_clicked',
    'cta_completed',
    'checkout_redirected',
    'refinement_applied'
  )
  group by session_id
)
select * from base;

-- 3. Base View: session outcomes
create or replace view v_calibration_session_outcomes as
with flags as (
  select
    session_id,
    bool_or(event = 'cta_clicked') as clicked,
    bool_or(event = 'checkout_redirected') as checkout_redirected,
    bool_or(event in ('cta_completed','quote_submitted','waitlist_locked')) as completed,
    bool_or(event = 'refinement_applied') as refinement_applied,
    bool_or(event = 'results_expanded') as results_expanded,
    max(case
      when properties ? 'selectedRank' then (properties->>'selectedRank')::int
      else null
    end) as selected_rank,
    max(properties->>'selectedSlug') as selected_slug
  from analytics_events
  group by session_id
)
select
  session_id,
  clicked,
  checkout_redirected,
  completed,
  refinement_applied,
  results_expanded,
  selected_rank,
  selected_slug,
  case when selected_rank > 1 then true else false end as overridden
from flags;

-- 4. Derived View: Confidence Calibration Matrix
create or replace view v_confidence_calibration as
select
  s.confidence_level,
  count(*) as sessions,
  avg(case when o.clicked then 1 else 0 end)::numeric(10,4) as click_rate,
  avg(case when o.completed then 1 else 0 end)::numeric(10,4) as completion_rate,
  avg(case when o.overridden then 1 else 0 end)::numeric(10,4) as override_rate,
  avg(case when s.primary_action = 'compare' and o.clicked then 1 else 0 end)::numeric(10,4) as compare_rate,
  avg(case when o.refinement_applied then 1 else 0 end)::numeric(10,4) as refinement_rate
from v_calibration_sessions s
join v_calibration_session_outcomes o using (session_id)
group by s.confidence_level;

-- 5. Derived View: Confidence Gap Distribution
create or replace view v_confidence_gap_distribution as
select
  case
    when confidence_gap < 3 then '<3'
    when confidence_gap < 5 then '3-4.99'
    when confidence_gap < 7 then '5-6.99'
    when confidence_gap < 10 then '7-9.99'
    when confidence_gap < 15 then '10-14.99'
    else '15+'
  end as gap_bucket,
  count(*) as sessions
from v_calibration_sessions
where confidence_gap is not null
group by 1;

-- 6. Derived View: Reason Effectiveness
create or replace view v_reason_exposures as
select
  session_id,
  created_at,
  properties->>'dominantDimension' as dominant_dimension,
  properties->>'reasonType' as reason_type,
  properties->>'useCase' as use_case,
  properties->>'confidenceLevel' as confidence_level
from analytics_events
where event = 'persuasive_reason_exposed';

create or replace view v_reason_performance as
select
  r.dominant_dimension,
  r.reason_type,
  count(*) as exposures,
  avg(case when o.clicked then 1 else 0 end)::numeric(10,4) as click_rate,
  avg(case when o.completed then 1 else 0 end)::numeric(10,4) as completion_rate,
  avg(case when o.overridden then 1 else 0 end)::numeric(10,4) as override_rate
from v_reason_exposures r
join v_calibration_session_outcomes o using (session_id)
group by r.dominant_dimension, r.reason_type;

-- 7. Derived View: CTA variant performance
create or replace view v_cta_exposures as
select
  session_id,
  created_at,
  properties->>'ctaVariant' as cta_variant,
  properties->>'useCase' as use_case,
  properties->>'confidenceLevel' as confidence_level,
  properties->>'primaryAction' as primary_action,
  properties->>'fulfillmentType' as fulfillment_type
from analytics_events
where event = 'cta_variant_exposed';

create or replace view v_cta_variant_performance as
select
  c.use_case,
  c.confidence_level,
  c.cta_variant,
  c.primary_action,
  count(*) as exposures,
  avg(case when o.clicked then 1 else 0 end)::numeric(10,4) as click_rate,
  avg(case when o.completed then 1 else 0 end)::numeric(10,4) as completion_rate
from v_cta_exposures c
join v_calibration_session_outcomes o using (session_id)
group by c.use_case, c.confidence_level, c.cta_variant, c.primary_action;

-- 8. Derived View: Fulfillment friction
create or replace view v_fulfillment_friction as
select
  c.fulfillment_type,
  c.primary_action,
  count(*) as exposures,
  avg(case when o.clicked then 1 else 0 end)::numeric(10,4) as click_rate,
  avg(case when o.completed or o.checkout_redirected then 1 else 0 end)::numeric(10,4) as completion_rate,
  (
    avg(case when o.clicked then 1 else 0 end)::numeric
    - avg(case when o.completed or o.checkout_redirected then 1 else 0 end)::numeric
  )::numeric(10,4) as dropoff_after_click
from v_cta_exposures c
join v_calibration_session_outcomes o using (session_id)
group by c.fulfillment_type, c.primary_action;

-- 9. Derived View: Override pressure
create or replace view v_override_pressure as
select
  s.use_case,
  s.confidence_level,
  r.dominant_dimension,
  count(*) as sessions,
  avg(case when o.overridden then 1 else 0 end)::numeric(10,4) as override_rate,
  avg(o.selected_rank)::numeric(10,2) as avg_selected_rank
from v_calibration_sessions s
join v_calibration_session_outcomes o using (session_id)
left join v_reason_exposures r using (session_id)
where o.selected_rank is not null
group by s.use_case, s.confidence_level, r.dominant_dimension;

-- 10. Derived View: Daily funnel trend
create or replace view v_daily_funnel_trend as
select
  date_trunc('day', created_at) as day,
  count(distinct case when event = 'results_exposed' then session_id end) as sessions,
  count(distinct case when event = 'cta_clicked' then session_id end) as clicks,
  count(distinct case when event in ('cta_completed','quote_submitted','waitlist_locked') then session_id end) as completions
from analytics_events
group by 1
order by 1;

-- 11. Slug-level override pressure
create or replace view v_slug_override_pressure as
select
  o.selected_slug,
  s.use_case,
  count(*) as sessions,
  avg(case when o.overridden then 1 else 0 end)::numeric(10,4) as override_rate
from v_calibration_session_outcomes o
join v_calibration_sessions s using (session_id)
where o.selected_slug is not null
group by o.selected_slug, s.use_case;
