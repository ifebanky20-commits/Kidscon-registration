import { useRouter } from "next/navigation";
import { useEffect, type PropsWithChildren } from "react";

import { useAuth } from "@/components/pages/auth/auth-context";
import { hasAdminAccess } from "@/components/pages/auth/adminAccess";

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const authorized = hasAdminAccess(session?.user);

  useEffect(() => {
    if (!loading && !authorized) router.replace("/login");
  }, [loading, authorized, router]);

  if (loading || !authorized) return null;

  return children;
}
