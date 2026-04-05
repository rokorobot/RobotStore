/**
 * src/lib/analytics/calibration-queries.ts
 *
 * Server-side data fetchers for the Calibration Dashboard.
 * These query the normalized Postgres views created in Phase 1.
 * Uses the Service Role client to bypass RLS for admin-only metrics.
 */

import { createClient } from "@/lib/supabase/server";

export interface CalibrationKPIs {
  result_sessions: number;
  cta_click_rate: number;
  completion_rate: number;
  override_rate: number;
  high_completion_rate: number;
  medium_compare_rate: number;
  low_refinement_rate: number;
  checkout_redirect_rate: number;
}

/** Fetches executive health metrics specifically for cards. */
export async function getExecutiveHealth(days = 30): Promise<CalibrationKPIs> {
  const supabase = await createClient();
  
  // SELECT from base views to avoid giant multi-joins if session sets are high
  const threshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // Parallel fetch: Matrix data and total session counts
  const [
    { count: sessionsCount },
    { data: matrix },
    { data: outcomes }
  ] = await Promise.all([
    supabase.from('v_calibration_sessions').select('*', { count: 'exact', head: true }).gte('first_seen_at', threshold),
    supabase.from('v_confidence_calibration').select('*'), // This matrix view already handles rates per slice
    supabase.from('v_calibration_session_outcomes').select('*') // For total override and completion rates
  ]);

  const totalSessions = sessionsCount || 0;
  
  // Global aggregate rates from outcomes
  const completedSessions = outcomes?.filter(o => o.completed).length || 0;
  const clickedSessions = outcomes?.filter(o => o.clicked).length || 0;
  const overriddenSessions = outcomes?.filter(o => o.selected_rank > 1).length || 0;
  const redirectedSessions = outcomes?.filter(o => o.checkout_redirected).length || 0;

  // Confidence specific rates from matrix
  const highComp = matrix?.find(m => m.confidence_level === 'HIGH')?.completion_rate || 0;
  const medComp = matrix?.find(m => m.confidence_level === 'MEDIUM')?.compare_rate || 0;
  const lowRef = matrix?.find(m => m.confidence_level === 'LOW')?.refinement_rate || 0;

  return {
    result_sessions: totalSessions,
    cta_click_rate: totalSessions > 0 ? (clickedSessions / totalSessions) : 0,
    completion_rate: totalSessions > 0 ? (completedSessions / totalSessions) : 0,
    override_rate: outcomes?.length ? (overriddenSessions / outcomes.length) : 0,
    high_completion_rate: highComp,
    medium_compare_rate: medComp,
    low_refinement_rate: lowRef,
    checkout_redirect_rate: totalSessions > 0 ? (redirectedSessions / totalSessions) : 0
  };
}

export async function getConfidenceMatrix() {
  const supabase = await createClient();
  return supabase.from('v_confidence_calibration').select('*').order('confidence_level');
}

export async function getReasonPerformance() {
  const supabase = await createClient();
  return supabase.from('v_reason_performance').select('*').order('exposures', { ascending: false });
}

export async function getFulfillmentFriction() {
  const supabase = await createClient();
  return supabase.from('v_fulfillment_friction').select('*').order('dropoff_after_click', { ascending: false });
}

export async function getOverridePressure() {
  const supabase = await createClient();
  return supabase.from('v_override_pressure').select('*').order('override_rate', { ascending: false });
}

export async function getDailyTrend(days = 30) {
  const supabase = await createClient();
  const threshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  return supabase.from('v_daily_funnel_trend')
    .select('*')
    .gte('day', threshold)
    .order('day');
}

export async function getSlugOverride() {
  const supabase = await createClient();
  return supabase.from('v_slug_override_pressure').select('*').limit(20).order('override_rate', { ascending: false });
}

export async function getLowFunnel() {
  const supabase = await createClient();
  return supabase.from('v_low_confidence_funnel').select('*');
}
