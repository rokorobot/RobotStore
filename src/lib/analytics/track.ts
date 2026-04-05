/**
 * src/lib/analytics/track.ts
 *
 * Lightweight, type-safe telemetry client.
 * Fires to Supabase `analytics_events`. No external SDK.
 * Zero PII — only event name + optional metadata.
 */

export type FunnelEvent =
  | "enter_home"
  | "click_diagnostic"           // [ INITIATE SYSTEM DIAGNOSTIC ] clicked
  | "diagnostic_complete"        // wizard step 5 → API submitted
  | "result_add_to_loadout"      // [ ADD TO LOADOUT ] on RecommendationCard
  | "result_add_to_compare"      // [ ADD TO MATRIX ] on RecommendationCard
  | "compare_proceed_to_loadout" // [ PROCEED TO LOADOUT ] on /compare
  | "checkout_initiated"         // Stripe redirect fires
  | "checkout_completed"         // /checkout/success rendered
  | "quote_submitted"            // /api/quotes 200
  | "waitlist_locked"            // /api/waitlist 200
  | "engine_no_results"          // 0 matches found for input
  | "engine_low_confidence"      // Rank 1/2 gap < 5 pts
  | "ui_mode_exposed"            // which confidence mode user saw
  | "ui_mode_action"             // click on primary CTA in that mode
  | "cta_variant_exposed"        // which language/microcopy user saw
  | "cta_clicked"                // click on specific CTA variant
  | "cta_completed"              // down-stream checkout/quote success
  | "persuasive_reason_exposed"  // dynamic explanation presented to user
  | "checkout_redirected"        // redirection to Stripe/External checkout
  | "refinement_applied";        // click on uncertainty-reduction guidance signal

/** Returns or creates an anonymous session ID (persisted in sessionStorage). */
function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  const key = "rs_session";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

/**
 * Fire a funnel event. Safe to call anywhere — client or server-side actions.
 *
 * @example
 * track("click_diagnostic");
 * track("result_add_to_loadout", { useCase: "security", unitId: "rs-unit-003" });
 */
export async function track(
  event: FunnelEvent,
  properties: {
    useCase?: string;
    confidenceLevel?: "HIGH" | "MEDIUM" | "LOW";
    uiMode?: string;
    primaryAction?: string;
    resultCount?: number;
    confidenceGap?: number;
    reasonText?: string;
    reasonType?: string;
    dominantDimension?: string;
    fulfillmentType?: string;
    [key: string]: unknown;
  } = {}
): Promise<void> {
  try {
    // Lazy import to avoid adding supabase client to server bundles unnecessarily
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("analytics_events").insert({
      event,
      session_id: getSessionId(),
      user_id: user?.id ?? null,
      properties,
    });
  } catch {
    // Telemetry is best-effort — never break the user flow
  }
}
