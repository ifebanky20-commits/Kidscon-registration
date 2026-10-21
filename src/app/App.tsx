import { Route, Routes } from "react-router-dom";

import { lazy, Suspense } from "react";

import AdminLayout from "@/app/layouts/AdminLayout";
import MainLayout from "@/app/layouts/MainLayout";
import { EventProvider } from "@/features/admin/context/EventContext";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import AdminLoginPage from "@/features/auth/pages/AdminLoginPage";
import EventDetailPage from "@/features/events/pages/EventDetailPage";
import EventsPage from "@/features/events/pages/EventsPage";
import LandingPage from "@/features/landing/pages/LandingPage";
import PageLoader from "@/shared/components/ui/PageLoader";

// Public pages loaded on demand
const RegistrationPage = lazy(
  () => import("@/features/registration/pages/registration/RegistrationPage"),
);
const ConfirmationPage = lazy(
  () => import("@/features/registration/pages/ConfirmationPage"),
);

// Admin pages loaded on demand
const AdminDashboard = lazy(
  () => import("@/features/admin/pages/AdminDashboard"),
);
const SchoolDetailPage = lazy(
  () => import("@/features/admin/pages/SchoolDetailPage"),
);
const AdminSchoolsPage = lazy(
  () => import("@/features/admin/pages/AdminSchoolsPage"),
);
const AdminStudentsPage = lazy(
  () => import("@/features/admin/pages/AdminStudentsPage"),
);
const AdminExportPage = lazy(
  () => import("@/features/admin/pages/AdminExportPage"),
);
const AdminEventsPage = lazy(
  () => import("@/features/admin/pages/AdminEventsPage"),
);
const AdminAnalysisPage = lazy(
  () => import("@/features/admin/pages/AdminAnalysisPage"),
);
const AdminVerifiedSchoolsPage = lazy(
  () => import("@/features/admin/pages/AdminVerifiedSchoolsPage"),
);

// Standalone print page
const PrintLayoutPage = lazy(
  () => import("@/features/registration/pages/PrintLayoutPage"),
);

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
      </Route>

      {/* Authentication */}
      <Route path="/login" element={<AdminLoginPage />} />

      {/* Protected admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <EventProvider>
              <AdminLayout />
            </EventProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="school/:id" element={<SchoolDetailPage />} />
        <Route path="schools" element={<AdminSchoolsPage />} />
        <Route path="students" element={<AdminStudentsPage />} />
        <Route path="export" element={<AdminExportPage />} />
        <Route path="events" element={<AdminEventsPage />} />
        <Route path="analysis" element={<AdminAnalysisPage />} />
        <Route path="verified" element={<AdminVerifiedSchoolsPage />} />
      </Route>

      {/* Standalone print route */}
      <Route
        path="/print/:id"
        element={
          <Suspense fallback={<PageLoader />}>
            <PrintLayoutPage />
          </Suspense>
        }
      />
    </Routes>
  );
}

export default App;
