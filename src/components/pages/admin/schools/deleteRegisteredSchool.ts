import { supabase } from "@/lib/supabase";

export async function deleteRegisteredSchool(id: string) {
  const { error } = await supabase.rpc("delete_registered_school", { p_school_id: id });
  if (error) throw error;
}
