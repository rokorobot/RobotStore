export type CheckoutCartItem = {
  unitId: string;
  quantity: number;
};

export type CheckoutRequestBody = {
  items: CheckoutCartItem[];
};

export type CheckoutResponse =
  | { url: string }
  | { error: string };

export type ShadowOrderRecord = {
  stripeSessionId: string;
  email: string | null;
  amountTotal: number | null;
  currency: string | null;
  paymentStatus: string | null;
  metadata: Record<string, string>;
};
