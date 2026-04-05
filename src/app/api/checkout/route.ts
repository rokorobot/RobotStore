import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { assertCheckoutEligible, buildCheckoutLineItems, buildCheckoutMetadata } from "@/lib/stripe/checkout";
import { CheckoutRequestBody, CheckoutResponse } from "@/types/checkout";

export async function POST(req: NextRequest) {
  try {
    const body: CheckoutRequestBody = await req.json();
    
    // 1. Validate payload
    assertCheckoutEligible(body.items);

    // 2. Build Stripe payload
    const lineItems = buildCheckoutLineItems(body.items);
    const metadata = buildCheckoutMetadata(body.items);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // 3. Create Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      metadata,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
    });

    if (!session.url) {
      throw new Error("Stripe failed to return a checkout URL.");
    }

    return NextResponse.json<CheckoutResponse>({ url: session.url }, { status: 200 });

  } catch (err: any) {
    console.error("[Checkout POST Error]:", err.message);
    return NextResponse.json<CheckoutResponse>({ error: err.message || "Internal Error" }, { status: 400 });
  }
}
