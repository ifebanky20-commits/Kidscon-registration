import { useQuery } from "@tanstack/react-query";

import { fetchAllPages } from "@/lib/fetchAllPages";
import { supabase } from "@/lib/supabase";
import type { StudentRow } from "@/types/database";

async function getExportData(eventId: string | null, signal: AbortSignal) {
  const [schools, students] = await Promise.all([
    fetchAllPages((from, to) => {
      let query = supabase
        .from("schools")
        .select("id, name, category, address, contact_person, phone, created_at", { count: "exact" })
        .order("name")
        .order("id");
      if (eventId) query = query.eq("event_id", eventId);
      return query.range(from, to).abortSignal(signal);
    }, signal),
    fetchAllPages((from, to) => {
      let query = supabase
        .from("students")
        .select("id, school_id, name, gender, class, created_at, schools!inner(event_id)", { count: "exact" })
        .order("created_at")
        .order("id");
      if (eventId) query = query.eq("schools.event_id", eventId);
      return query.range(from, to).abortSignal(signal);
    }, signal),
  ]);

  const bySchool = new Map<string, Omit<StudentRow, "school_id">[]>();
  for (const { school_id, schools: _school, ...student } of students) {
    const roster = bySchool.get(school_id) ?? [];
    roster.push(student);
    bySchool.set(school_id, roster);
  }

  const reportSchools = schools.map((school) => ({ ...school, students: bySchool.get(school.id) ?? [] }));
  return {
    schools: reportSchools,
    students: reportSchools.flatMap((school) =>
      school.students.map((student) => ({ ...student, school_name: school.name, school_category: school.category })),
    ),
  };
}

export function useExportData(eventId: string | null) {
  return useQuery({
    queryKey: ["adminExport", eventId],
    queryFn: ({ signal }) => getExportData(eventId, signal),
  });
}
