import { supabase } from "@/lib/supabase";
import { fetchAllPages } from "@/lib/fetchAllPages";

export const registeredSchoolsKey = ["registeredSchools"] as const;
export const schoolsPageSize = 10;

type SchoolFilters = {
  eventId: string | null;
  category: string;
  search?: string;
};

function selectRegisteredSchools({ eventId, category, search }: SchoolFilters) {
  let query = supabase
    .from("schools")
    .select(
      "id, name, category, address, contact_person, phone, created_at, students(count), teachers(count)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .order("id");

  if (eventId) query = query.eq("event_id", eventId);
  if (category && category !== "All") query = query.ilike("category", `%${category}%`);
  if (search) query = query.ilike("name", `%${search}%`);
  return query;
}

export async function getRegisteredSchoolsPage(
  filters: SchoolFilters,
  page: number,
  signal: AbortSignal,
) {
  const offset = page * schoolsPageSize;
  const { data, count, error } = await selectRegisteredSchools(filters)
    .range(offset, offset + schoolsPageSize - 1)
    .abortSignal(signal);
  if (error) throw error;
  return { schools: data, totalCount: count ?? 0 };
}

export async function getRegisteredSchoolsForExport(filters: SchoolFilters) {
  return fetchAllPages((from, to) => selectRegisteredSchools(filters).range(from, to));
}
