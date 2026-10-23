import { Route, Routes } from "react-router-dom";

import { lazy, Suspense } from "react";

import AdminLayout from "@/layouts/AdminLayout";
import MainLayout from "@/layouts/MainLayout";
import { EventProvider } from "@/contexts/EventProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminLoginPage from "@/pages/auth/AdminLoginPage";
import EventDetailPage from "@/pages/public/EventDetailPage";
import EventsPage from "@/pages/public/EventsPage";
import LandingPage from "@/pages/public/LandingPage";
import PageLoader from "@/components/ui/PageLoader";

// Public pages loaded on demand
const RegistrationPage = lazy(
  () => import("@/pages/registration/RegistrationPage"),
);
const ConfirmationPage = lazy(
  () => import("@/pages/registration/ConfirmationPage"),
);

// Admin pages loaded on demand
const AdminDashboard = lazy(
  () => import("@/pages/admin/AdminDashboard"),
);
const SchoolDetailPage = lazy(
  () => import("@/pages/admin/SchoolDetailPage"),
);
const AdminSchoolsPage = lazy(
  () => import("@/pages/admin/AdminSchoolsPage"),
);
const AdminStudentsPage = lazy(
  () => import("@/pages/admin/AdminStudentsPage"),
);
const AdminExportPage = lazy(
  () => import("@/pages/admin/AdminExportPage"),
);
const AdminEventsPage = lazy(
  () => import("@/pages/admin/AdminEventsPage"),
);
const AdminAnalysisPage = lazy(
  () => import("@/pages/admin/AdminAnalysisPage"),
);
const AdminVerifiedSchoolsPage = lazy(
  () => import("@/pages/admin/AdminVerifiedSchoolsPage"),
);

// Standalone print page
const PrintLayoutPage = lazy(
  () => import("@/pages/registration/PrintLayoutPage"),
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
