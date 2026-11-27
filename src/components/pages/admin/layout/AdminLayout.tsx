import { X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useState, type PropsWithChildren } from "react";

import { KidsconLogo } from "@/components/KidsconLogo";
import { AdminNavbar } from "@/components/pages/admin/layout/AdminNavbar";
import { AdminSidebarNavigation } from "@/components/pages/admin/layout/AdminSidebarNavigation";
import { useAuth } from "@/components/pages/auth/auth-context";

export default function AdminLayout({ children }: PropsWithChildren) {
  const { signOut } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="lg:h-screen flex bg-brand-canvas font-display text-brand-ink">
      {/* Sidebar - Desktop only */}
      <aside className="hidden lg:flex flex-col w-64 bg-brand-surface border-r border-brand-line text-md-on-background relative z-20 transition-all">
        <div className="h-20 flex items-center px-6 border-b border-brand-line relative">
          <Link
            href="/"
            className="flex items-center gap-3 active:scale-95 transition-transform"
          >
            <KidsconLogo />
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
        className={`fixed top-0 left-0 h-full w-72 bg-brand-surface text-brand-ink z-40 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-brand-line">
          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <KidsconLogo />
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
      <main className="flex-1 flex flex-col min-w-0 bg-brand-canvas relative overflow-hidden">
        <AdminNavbar
          onOpenMenu={() => setMobileOpen(true)}
          menuOpen={mobileOpen}
        />

        <div className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto w-full max-w-7xl mx-auto [scrollbar-width:thin]">
          {children}
        </div>
      </main>
    </div>
  );
}
