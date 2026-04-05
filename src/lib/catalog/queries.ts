import { createClient } from "@/lib/supabase/server";
import { CatalogUnitRow, CatalogClassRow, CatalogBrandRow } from "@/types/catalog";

export async function getAdminUnits(): Promise<CatalogUnitRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("units").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as CatalogUnitRow[];
}

export async function getAdminUnitById(id: string): Promise<CatalogUnitRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("units").select("*").eq("id", id).single();
  if (error) return null;
  return data as CatalogUnitRow;
}

export async function getAdminClasses(): Promise<CatalogClassRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("classes").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return data as CatalogClassRow[];
}

export async function getAdminClassById(id: string): Promise<CatalogClassRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("classes").select("*").eq("id", id).single();
  if (error) return null;
  return data as CatalogClassRow;
}

export async function getAdminBrands(): Promise<CatalogBrandRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("brands").select("*").order("name", { ascending: true });
  if (error) throw error;
  return data as CatalogBrandRow[];
}

export async function getAdminBrandById(id: string): Promise<CatalogBrandRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("brands").select("*").eq("id", id).single();
  if (error) return null;
  return data as CatalogBrandRow;
}

import { mapDbUnitToPublicUnit } from "./mapping";
import { units as fallbackUnits } from "@/content/units";
import { Unit } from "@/types/unit";

export async function getPublicUnits(): Promise<Unit[]> {
  try {
    const supabase = await createClient();
    const { data: rawUnits, error } = await supabase.from("units").select("*, classes(*), brands(*)").eq("is_archived", false);
    
    if (error || !rawUnits || rawUnits.length === 0) {
      console.warn("Falling back to static units.ts catalog");
      return fallbackUnits;
    }

    return rawUnits.map(row => mapDbUnitToPublicUnit(row, row.classes, row.brands));
  } catch (err) {
    return fallbackUnits;
  }
}

export async function getPublicUnitBySlug(slug: string): Promise<Unit | null> {
  try {
    const supabase = await createClient();
    const { data: row, error } = await supabase.from("units").select("*, classes(*), brands(*)").eq("slug", slug).eq("is_archived", false).single();
    
    if (error || !row) {
      const fallback = fallbackUnits.find(u => u.slug === slug);
      return fallback || null;
    }

    return mapDbUnitToPublicUnit(row, row.classes, row.brands);
  } catch (err) {
    return fallbackUnits.find(u => u.slug === slug) || null;
  }
}
