"use client";

import ProtectedRoute from "@/components/pages/auth/ProtectedRoute";
import PrintLayoutPage from "@/components/pages/registration/PrintLayoutPage";

export default function Page() {
  return (
    <ProtectedRoute>
      <PrintLayoutPage />
    </ProtectedRoute>
  );
}
