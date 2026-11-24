import { currentEventDate } from "@/components/pages/public/events/eventDates";
import { supabase } from "@/lib/supabase";

export async function getPublicEvents() {
  const today = currentEventDate();
  const { data, error } = await supabase.from("events")
    .select("id, name, location, date, is_open, created_at")
    .eq("is_open", true).gte("date", today).order("date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getPublicEvent(id: string, signal?: AbortSignal) {
  const query = supabase.from("events")
    .select("id, name, location, date, is_open, created_at").eq("id", id);
  const { data, error } = await (signal ? query.abortSignal(signal) : query).maybeSingle();
  if (error?.code === "22P02") return null;
  if (error) throw error;
  return data;
}
