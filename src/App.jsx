import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import LandingPage from './pages/LandingPage';
import RegistrationPage from './pages/RegistrationPage';
import ConfirmationPage from './pages/ConfirmationPage';
import AdminDashboard from './pages/AdminDashboard';
import SchoolDetailPage from './pages/SchoolDetailPage';
import AdminSchoolsPage from './pages/AdminSchoolsPage';
import AdminStudentsPage from './pages/AdminStudentsPage';
import AdminExportPage from './pages/AdminExportPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import PrintLayoutPage from './pages/PrintLayoutPage';
import AdminLoginPage from './pages/AdminLoginPage';
import ProtectedRoute from './components/layout/ProtectedRoute';

function App() {
  return (
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
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="school/:id" element={<SchoolDetailPage />} />
        <Route path="schools" element={<AdminSchoolsPage />} />
        <Route path="students" element={<AdminStudentsPage />} />
        <Route path="export" element={<AdminExportPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Standalone Prints */}
      <Route path="/print/:id" element={<PrintLayoutPage />} />
    </Routes>
  );
}

export default App;
