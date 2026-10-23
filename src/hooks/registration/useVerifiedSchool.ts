import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export function useVerifiedSchool(schoolName: string) {
  // Verified schools mapping (cached efficiently by query)
  const { data: verifiedSchoolsData } = useQuery({
    queryKey: ["verifiedSchoolsList"],
    queryFn: async () => {
      const { data } = await supabase.from("available_schools").select("name");
      return data ? data.map((s) => s.name.toLowerCase()) : [];
    },
  });
  const verifiedSchools = verifiedSchoolsData || [];
  const isVerified = verifiedSchools.includes(schoolName.trim().toLowerCase());

  return isVerified;
}
