import { ArrowUpRight, ChevronRight, Menu, UserRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import ThemeToggle from "@/components/ui/ThemeToggle";

interface AdminNavbarProps {
  onOpenMenu: () => void;
  menuOpen: boolean;
}

const titles: Record<string, string> = {
  schools: "Schools",
  students: "Students",
  verified: "Verified schools",
  analysis: "Analytics",
  events: "Events",
  export: "Export data",
  school: "School details",
};

export function AdminNavbar({ onOpenMenu, menuOpen }: AdminNavbarProps) {
  const { pathname } = useLocation();
  const title = titles[pathname.split("/")[2]] || "Dashboard";

  return (
    <header className="sticky top-0 z-10 flex min-h-20 items-center justify-between gap-4 border-b border-brand-line bg-brand-canvas/95 px-4 text-brand-ink backdrop-blur-md sm:px-8 lg:px-10">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onOpenMenu}
          className="rounded-xl border border-brand-line p-2 transition hover:bg-brand-soft lg:hidden"
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          aria-controls="admin-mobile-navigation"
        >
          <Menu size={20} />
        </button>
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-2 text-sm"
        >
          <Link
            to="/admin"
            className="hidden text-brand-muted hover:text-brand-primary sm:inline"
          >
            Workspace
          </Link>
          <ChevronRight
            size={14}
            className="hidden text-brand-muted sm:block"
          />
          <span aria-current="page" className="truncate font-medium">
            {title}
          </span>
        </nav>
      </div>
      <div className="flex shrink-0 items-center gap-3 sm:gap-5">
        <ThemeToggle className="bg-transparent text-brand-muted ring-brand-line cursor-pointer hover:bg-brand-surface focus:ring-brand-primary" />
        <div className="flex items-center gap-3 border-l border-brand-line pl-3 sm:pl-5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-tint text-xs font-bold text-brand-primary"
            aria-hidden="true"
          >
            <UserRound size={18} strokeWidth={1.6} />
          </span>
          <div className="hidden lg:block">
            <p className="text-sm font-medium">KIDSCON Admin</p>
            <p className="text-xs text-brand-muted">Registration workspace</p>
          </div>
        </div>
      </div>
    </header>
  );
}
