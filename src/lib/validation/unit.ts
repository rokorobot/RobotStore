import { z } from "zod";

export const unitValidationSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Name is required"),
  subtitle: z.string().min(1, "Subtitle is required"),
  class_id: z.string().min(1, "Class is required"),
  brand_id: z.string().optional().nullable(),
  description: z.string().min(1, "Description is required"),
  short_description: z.string().min(1, "Short description is required"),
  currency: z.string().default("USD"),
  purchase_mode: z.enum(["buy_now", "partner_quote", "waitlist", "inquiry_only", "affiliate"]),
  price_cents: z.number().nullable().optional(),
  stripe_price_id: z.string().nullable().optional(),
  status: z.string().min(1, "Status is required"),
  featured: z.boolean().default(false),
  images: z.array(z.string()).default([]),
  specs: z.record(z.string(), z.string()).default({}),
  capabilities: z.array(z.string()).default([]),
  behavioral_profile: z.array(z.string()).default([]),
  deployment_fit: z.array(z.string()).default([]),
  is_archived: z.boolean().default(false),
});

// Enforce conditional validation: if buy_now, price and stripe required.
export const validateUnitServerMode = (data: z.infer<typeof unitValidationSchema>) => {
  if (data.purchase_mode === "buy_now") {
    if (data.price_cents === null || data.price_cents === undefined) {
      throw new Error("Price is required for 'Buy Now' units.");
    }
    if (!data.stripe_price_id) {
      throw new Error("Stripe Price ID is required for 'Buy Now' units.");
    }
  }
  return true;
};
