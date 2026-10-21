import { Menu } from "lucide-react";
import { Link } from "react-router-dom";

import logo from "@/assets/logo.jpeg";
import ThemeToggle from "@/shared/theme/components/ThemeToggle";

interface AdminNavbarProps {
  onOpenMenu: () => void;
  menuOpen: boolean;
}

export function AdminNavbar({ onOpenMenu, menuOpen }: AdminNavbarProps) {
  return (
    <header className="md:hidden h-16 border-b border-md-outline/10 flex items-center justify-between px-4 bg-md-surface-container/80 backdrop-blur-md sticky top-0 z-10">
      <Link to="/" className="flex items-center gap-2">
        <img
          src={logo}
          alt="KIDSCON Logo"
          className="h-9 w-auto mix-blend-multiply dark:mix-blend-normal dark:invert dark:opacity-90"
        />
        <span className="font-bold">Admin Portal</span>
      </Link>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <button
          onClick={onOpenMenu}
          className="p-2 rounded-full hover:bg-md-on-surface-variant/10 active:bg-md-on-surface-variant/20 transition-colors"
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          aria-controls="admin-mobile-navigation"
        >
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}
