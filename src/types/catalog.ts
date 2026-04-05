export interface CatalogBrandRow {
  id: string;
  slug: string;
  name: string;
  website_url?: string | null;
  logo_url?: string | null;
  short_description?: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CatalogClassRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  hero_text?: string | null;
  sort_order: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CatalogUnitRow {
  id: string;
  slug: string;
  sku: string;
  name: string;
  subtitle: string;
  brand_id?: string | null;
  class_id?: string | null;
  description: string;
  short_description: string;
  currency: string;
  price_cents?: number | null;
  purchase_mode: string;
  status: string;
  featured: boolean;
  stripe_price_id?: string | null;
  images: string[];
  specs: Record<string, string>;
  capabilities: string[];
  behavioral_profile: string[];
  deployment_fit: string[];
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}
