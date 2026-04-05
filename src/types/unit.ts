export type PurchaseMode =
  | "buy_now"
  | "partner_quote"
  | "waitlist"
  | "inquiry_only"
  | "affiliate";

export type UnitStatus =
  | "available"
  | "low_stock"
  | "waitlist_open"
  | "partner_only"
  | "sold_out";

export interface Unit {
  id: string;
  slug: string;
  sku: string;
  name: string;
  subtitle: string;
  brand: string;
  classSlug: string;
  description: string;
  shortDescription: string;
  priceCents: number | null;
  currency: "USD" | "EUR";
  purchaseMode: PurchaseMode;
  status: UnitStatus;
  featured: boolean;
  images: string[];
  specs: {
    autonomy?: string;
    runtime?: string;
    payload?: string;
    sensors?: string;
    mobility?: string;
    power?: string;
  };
  capabilities: string[];
  behavioralProfile: string[];
  deploymentFit: string[];
  stripePriceId?: string;
}
