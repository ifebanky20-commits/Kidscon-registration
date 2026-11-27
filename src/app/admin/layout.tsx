"use client";

import type { PropsWithChildren } from "react";

import AdminLayout from "@/components/pages/admin/layout/AdminLayout";
import ProtectedRoute from "@/components/pages/auth/ProtectedRoute";
import { EventProvider } from "@/components/pages/admin/events/EventProvider";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <ProtectedRoute>
      <EventProvider>
        <AdminLayout>{children}</AdminLayout>
      </EventProvider>
    </ProtectedRoute>
  );
}
