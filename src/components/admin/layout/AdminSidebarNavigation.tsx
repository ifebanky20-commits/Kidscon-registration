import {
  BarChart3,
  Building,
  CalendarDays,
  ChartPie,
  Download,
  House,
  LayoutDashboard,
  LogOut,
  School,
  ShieldCheck,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import ThemeToggle from "@/components/ui/ThemeToggle";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin", exact: true },
  { label: "Schools", icon: House, path: "/admin/schools" },
  { label: "Verified Schools", icon: ShieldCheck, path: "/admin/verified" },
  { label: "Students", icon: Users, path: "/admin/students" },
  { label: "Export Data", icon: Download, path: "/admin/export" },
  { label: "Analytics", icon: ChartPie, path: "/admin/analysis" },
  { label: "Events", icon: CalendarDays, path: "/admin/events" },
];

export const AdminSidebarNavigation = ({
  onClickItem,
  handleLogout,
}: {
  onClickItem?: () => void;
  handleLogout: () => Promise<void>;
}) => (
  <>
    <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
      {navItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.path}
          end={item.exact}
          onClick={onClickItem}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-md group font-medium ${
              isActive
                ? "bg-brand-wash text-brand-primary ring-1 ring-brand-line"
                : "text-md-on-surface-variant hover:bg-md-on-surface-variant/10 active:bg-md-on-surface-variant/20 hover:text-md-on-background"
            }`
          }
        >
          <item.icon size={20} aria-hidden="true" strokeWidth={1.6} />
          {item.label}
        </NavLink>
      ))}
    </div>

    <div className="p-4 py-2 border-t border-brand-line flex flex-col gap-2">
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-md-on-surface-variant hover:bg-md-on-surface-variant/10 active:bg-md-on-surface-variant/20 transition-all font-medium w-full text-left cursor-pointer"
      >
        <LogOut size={20} strokeWidth={1.6} />
        Sign Out
      </button>
    </div>
  </>
);
