import { createClient } from "@/lib/supabase/server";

export async function createUnit(input: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("units").insert([input]).select().single();
  if (error) throw error;
  return data;
}

export async function updateUnit(id: string, input: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("units").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function archiveUnit(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("units").update({ is_archived: true }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function createClass(input: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("classes").insert([input]).select().single();
  if (error) throw error;
  return data;
}

export async function updateClass(id: string, input: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("classes").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function createBrand(input: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("brands").insert([input]).select().single();
  if (error) throw error;
  return data;
}

export async function updateBrand(id: string, input: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("brands").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data;
}
