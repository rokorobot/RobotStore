import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { ShadowOrderRecord } from "@/types/checkout";

// Webhook must be Node.js, not Edge
// Exporting an empty specific configuration defaults to standard node handler in App Router

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature found" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("[Stripe Webhook Signature Error]:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const record: ShadowOrderRecord = {
          stripeSessionId: session.id,
          email: session.customer_details?.email || null,
          amountTotal: session.amount_total,
          currency: session.currency,
          paymentStatus: session.payment_status,
          metadata: (session.metadata as Record<string, string>) || {},
        };

        const { error } = await supabase
          .from("orders_shadow")
          .insert({
            stripe_session_id: record.stripeSessionId,
            email: record.email,
            amount_total: record.amountTotal,
            currency: record.currency,
            payment_status: record.paymentStatus,
            metadata: record.metadata
          });

        if (error) {
          console.error("[Supabase Write Error]:", error);
        } else {
          console.log(`[Shadow Order Created] Session: ${session.id}`);
        }
      } else {
        console.warn("[Webhook] Supabase env vars missing. Shadow order not recorded.");
      }
    } catch (dbErr) {
      console.error("[Webhook Handling Error]:", dbErr);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
