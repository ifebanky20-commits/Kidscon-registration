import { X } from "lucide-react";
import { Link, Outlet, useNavigate } from "react-router-dom";

import { Suspense, useState } from "react";

import logo from "@/assets/logo.jpeg";
import { AdminNavbar } from "@/features/admin/components/layout/AdminNavbar";
import { AdminSidebarNavigation } from "@/features/admin/components/layout/AdminSidebarNavigation";
import { useAuth } from "@/features/auth/context/auth";
import PageLoader from "@/shared/components/ui/PageLoader";

export default function AdminLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-md-surface-container">
      {/* Sidebar - Desktop only */}
      <aside className="hidden md:flex flex-col w-72 bg-md-surface-container-low border-r border-md-outline/10 text-md-on-background relative z-20 shadow-sm transition-all">
        {/* Glow behind logo */}
        <div className="absolute top-0 left-0 w-full h-32 bg-md-primary/10 blur-xl pointer-events-none -z-10" />

        <div className="h-24 flex items-center px-8 border-b border-md-outline/5 relative">
          <Link
            to="/"
            className="flex items-center gap-3 active:scale-95 transition-transform"
          >
            <img
              src={logo}
              alt="KIDSCON Logo"
              className="h-12 w-auto mix-blend-multiply dark:mix-blend-normal dark:invert dark:opacity-90"
            />
            <span className="font-bold tracking-tight text-lg">
              KIDSCON Admin
            </span>
          </Link>
        </div>

        <AdminSidebarNavigation handleLogout={handleLogout} />
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        id="admin-mobile-navigation"
        inert={!mobileOpen}
        className={`fixed top-0 left-0 h-full w-72 bg-md-surface-container-low text-md-on-background z-40 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-md-outline/5">
          <Link
            to="/"
            className="flex items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <img
              src={logo}
              alt="KIDSCON Logo"
              className="h-10 w-auto mix-blend-multiply dark:mix-blend-normal dark:invert dark:opacity-90"
            />
            <span className="font-bold tracking-tight">KIDSCON Admin</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-full hover:bg-md-on-surface-variant/10 transition-colors"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <AdminSidebarNavigation
          handleLogout={handleLogout}
          onClickItem={() => setMobileOpen(false)}
        />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-md-background md:rounded-l-[32px] md:shadow-[-4px_0_24px_rgba(0,0,0,0.02)] relative overflow-hidden">
        {/* Top organic blur */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-md-primary/5 blur-[100px] -z-10 mix-blend-multiply pointer-events-none" />

        <AdminNavbar onOpenMenu={() => setMobileOpen(true)} menuOpen={mobileOpen} />

        <div className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto w-full max-w-7xl mx-auto [scrollbar-width:thin]">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
