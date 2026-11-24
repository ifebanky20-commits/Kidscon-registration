import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { fetchAllPages } from "@/lib/fetchAllPages";
import { supabase } from "@/lib/supabase";

const queryKey = ["adminAnalytics"] as const;

export function useAnalyticsData() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const refresh = () => void queryClient.invalidateQueries({ queryKey });
    const channel = supabase.channel("analysis-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "schools" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "students" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "teachers" }, refresh)
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [queryClient]);

  return useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      const [schools, students] = await Promise.all([
        fetchAllPages((from, to) => supabase
          .from("schools")
          .select("id, name, created_at, category, event_id, students(count), teachers(count)", { count: "exact" })
          .order("id").range(from, to).abortSignal(signal), signal),
        fetchAllPages((from, to) => supabase
          .from("registration_student_monthly")
          .select("school_id, month, gender, student_count", { count: "exact" })
          .order("school_id").order("month").order("gender").range(from, to).abortSignal(signal), signal),
      ]);
      return { schools, students };
    },
  });
}
