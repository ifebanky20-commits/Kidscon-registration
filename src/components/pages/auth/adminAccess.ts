import type { User } from "@supabase/supabase-js";

export function hasAdminAccess(user: User | null | undefined) {
  return user?.app_metadata.role === "admin";
}
