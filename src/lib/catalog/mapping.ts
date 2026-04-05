import { CatalogUnitRow, CatalogClassRow, CatalogBrandRow } from "@/types/catalog";
import { Unit } from "@/types/unit";

export function mapDbUnitToPublicUnit(
  row: CatalogUnitRow, 
  classRow?: CatalogClassRow | null, 
  brandRow?: CatalogBrandRow | null
): Unit {
  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    subtitle: row.subtitle,
    brand: brandRow?.name || row.brand_id || "SYSTEM_CORE",
    classSlug: classRow?.slug || row.class_id || "general",
    description: row.description,
    shortDescription: row.short_description,
    priceCents: row.price_cents ?? null,
    currency: row.currency as any,
    purchaseMode: row.purchase_mode as any,
    status: row.status as any,
    featured: row.featured,
    stripePriceId: row.stripe_price_id || undefined,
    images: row.images,
    specs: row.specs,
    capabilities: row.capabilities,
    behavioralProfile: row.behavioral_profile,
    deploymentFit: row.deployment_fit,
  };
}
