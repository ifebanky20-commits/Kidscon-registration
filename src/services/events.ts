import { supabase } from "@/lib/supabase";

export async function getPublicEvents() {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase.from("events")
    .select("id, name, location, date, is_open, created_at")
    .eq("is_open", true).gte("date", today).order("date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getPublicEvent(id: string) {
  const { data, error } = await supabase.from("events")
    .select("id, name, location, date, is_open, created_at").eq("id", id).maybeSingle();
  if (error?.code === "22P02") return null;
  if (error) throw error;
  return data;
}
