import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { EventProvider } from './context/EventContext';
import PageLoader from './components/ui/PageLoader';

// Lazy load all pages for optimal code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const RegistrationPage = lazy(() => import('./pages/RegistrationPage'));
const ConfirmationPage = lazy(() => import('./pages/ConfirmationPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const SchoolDetailPage = lazy(() => import('./pages/SchoolDetailPage'));
const AdminSchoolsPage = lazy(() => import('./pages/AdminSchoolsPage'));
const AdminStudentsPage = lazy(() => import('./pages/AdminStudentsPage'));
const AdminExportPage = lazy(() => import('./pages/AdminExportPage'));
const AdminEventsPage = lazy(() => import('./pages/AdminEventsPage'));
const AdminAnalysisPage = lazy(() => import('./pages/AdminAnalysisPage'));
const AdminVerifiedSchoolsPage = lazy(() => import('./pages/AdminVerifiedSchoolsPage'));
const PrintLayoutPage = lazy(() => import('./pages/PrintLayoutPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
      {/* Public Pages */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
      </Route>

      {/* Admin Login */}
      <Route path="/login" element={<AdminLoginPage />} />

      {/* Protected Admin Pages */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <EventProvider>
            <AdminLayout />
          </EventProvider>
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="school/:id" element={<SchoolDetailPage />} />
        <Route path="schools" element={<AdminSchoolsPage />} />
        <Route path="students" element={<AdminStudentsPage />} />
        <Route path="export" element={<AdminExportPage />} />
        <Route path="events" element={<AdminEventsPage />} />
        <Route path="analysis" element={<AdminAnalysisPage />} />
        <Route path="verified" element={<AdminVerifiedSchoolsPage />} />
      </Route>

      {/* Standalone Prints */}
      <Route path="/print/:id" element={<PrintLayoutPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
