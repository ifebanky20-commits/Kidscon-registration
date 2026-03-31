import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import LandingPage from './pages/LandingPage';
import RegistrationPage from './pages/RegistrationPage';
import ConfirmationPage from './pages/ConfirmationPage';
import AdminDashboard from './pages/AdminDashboard';
import SchoolDetailPage from './pages/SchoolDetailPage';
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
        <Route path="schools" element={<div className="p-8 text-center font-medium">Schools List coming soon</div>} />
        <Route path="students" element={<div className="p-8 text-center font-medium">Students List coming soon</div>} />
        <Route path="export" element={<div className="p-8 text-center font-medium">Export coming soon</div>} />
      </Route>

      {/* Standalone Prints */}
      <Route path="/print/:id" element={<PrintLayoutPage />} />
    </Routes>
  );
}

export default App;
