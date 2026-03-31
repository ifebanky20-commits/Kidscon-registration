import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import LandingPage from './pages/LandingPage';
import RegistrationPage from './pages/RegistrationPage';
import ConfirmationPage from './pages/ConfirmationPage';
import AdminDashboard from './pages/AdminDashboard';
import SchoolDetailPage from './pages/SchoolDetailPage';
import PrintLayoutPage from './pages/PrintLayoutPage';

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
      </Route>

      {/* Admin Pages */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="school/:id" element={<SchoolDetailPage />} />
        {/* Placeholder routes for sidebar links */}
        <Route path="schools" element={<div className="p-8 text-center font-medium">Schools List placeholder</div>} />
        <Route path="students" element={<div className="p-8 text-center font-medium">Students List placeholder</div>} />
        <Route path="export" element={<div className="p-8 text-center font-medium">Export view placeholder</div>} />
      </Route>

      {/* Standalone Prints */}
      <Route path="/print/:id" element={<PrintLayoutPage />} />
    </Routes>
  );
}

export default App;
