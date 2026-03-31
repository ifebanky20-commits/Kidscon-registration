import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-md-background">
      
      {/* Global Ambient Glows */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-md-secondary-container/30 blur-[100px] -z-10 mix-blend-multiply pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-md-primary/10 blur-[120px] -z-10 mix-blend-multiply pointer-events-none" />

      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10 relative">
        <Outlet />
      </main>
      <footer className="bg-md-surface-container py-8 text-center text-md-on-surface-variant text-sm mt-auto relative z-10 rounded-t-[32px] mx-2 md:mx-6 mb-2">
        <p>&copy; {new Date().getFullYear()} KIDSCON Register. All rights reserved.</p>
      </footer>
    </div>
  );
}
