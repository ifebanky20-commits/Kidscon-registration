import { useQuery } from "@tanstack/react-query";

import { normalizeSchoolName, publicVerifiedSchoolNamesQuery } from "@/lib/verifiedSchools";

export function useVerifiedSchool(schoolName: string) {
  const { data } = useQuery(publicVerifiedSchoolNamesQuery);
  const name = normalizeSchoolName(schoolName);
  return data?.some((school) => normalizeSchoolName(school.name) === name) ?? false;
}
