import { queryOptions, type QueryFunctionContext } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export const verifiedSchoolsKey = ["verifiedSchools"] as const;

export const verifiedSchoolsQuery = queryOptions({
  queryKey: [...verifiedSchoolsKey, "admin"],
  queryFn: async ({ signal }: QueryFunctionContext) => {
    const { data } = await supabase
      .from("available_schools")
      .select("id, name, created_at")
      .order("name")
      .abortSignal(signal)
      .throwOnError();
    return data;
  },
});

export const publicVerifiedSchoolNamesQuery = queryOptions({
  queryKey: [...verifiedSchoolsKey, "public"],
  queryFn: async ({ signal }: QueryFunctionContext) => {
    const { data } = await supabase
      .from("available_schools")
      .select("name")
      .abortSignal(signal)
      .throwOnError();
    return data;
  },
});

export function normalizeSchoolName(name: string) {
  return name.trim().toLowerCase();
}

export async function addVerifiedSchool(name: string) {
  const { error } = await supabase.from("available_schools").insert({ name });
  if (error) throw error;
}

export async function removeVerifiedSchool(id: string) {
  const { error } = await supabase
    .from("available_schools")
    .delete()
    .eq("id", id)
    .select("id")
    .single();
  if (error) throw error;
}
