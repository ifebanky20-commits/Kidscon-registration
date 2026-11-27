import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { supabase } from "@/lib/supabase";

export const dashboardQueryKey = ["adminDashboard"] as const;

async function getDashboard(eventId: string | null, signal: AbortSignal) {
  let schools = supabase.from("schools").select("id", { count: "exact", head: true });
  let recent = supabase
    .from("schools")
    .select("id, name, created_at, students(count)")
    .order("created_at", { ascending: false })
    .limit(5);

  if (eventId) {
    schools = schools.eq("event_id", eventId);
    recent = recent.eq("event_id", eventId);
  }

  const students = eventId
    ? supabase
        .from("students")
        .select("id, schools!inner(event_id)", { count: "exact", head: true })
        .eq("schools.event_id", eventId)
    : supabase.from("students").select("id", { count: "exact", head: true });

  const [schoolResult, studentResult, recentResult] = await Promise.all([
    schools.abortSignal(signal),
    students.abortSignal(signal),
    recent.abortSignal(signal),
  ]);

  const error = schoolResult.error ?? studentResult.error ?? recentResult.error;
  if (error) throw error;

  return {
    totalSchools: schoolResult.count ?? 0,
    totalStudents: studentResult.count ?? 0,
    recent: recentResult.data ?? [],
  };
}

export function useDashboard(eventId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const refresh = () => void queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    const channel = supabase
      .channel("dashboard-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "schools" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "students" }, refresh)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: [...dashboardQueryKey, eventId],
    queryFn: ({ signal }) => getDashboard(eventId, signal),
  });
}
