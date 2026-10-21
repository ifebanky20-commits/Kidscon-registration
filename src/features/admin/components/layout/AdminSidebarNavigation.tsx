import { BarChart3, CalendarDays, Download, LayoutDashboard, LogOut, School, ShieldCheck, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

import ThemeToggle from "@/shared/theme/components/ThemeToggle";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin", exact: true },
  { label: "Schools", icon: School, path: "/admin/schools" },
  { label: "Verified Schools", icon: ShieldCheck, path: "/admin/verified" },
  { label: "Students", icon: Users, path: "/admin/students" },
  { label: "Export Data", icon: Download, path: "/admin/export" },
  { label: "Analytics", icon: BarChart3, path: "/admin/analysis" },
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
    <div className="flex-1 py-6 px-4 space-y-2">
      {navItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.path}
          end={item.exact}
          onClick={onClickItem}
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-3.5 rounded-full transition-all duration-300 ease-md group font-medium ${isActive
              ? "bg-md-secondary-container text-md-on-secondary-container shadow-[0_1px_2px_0_rgb(0_0_0/0.05)]"
              : "text-md-on-surface-variant hover:bg-md-on-surface-variant/10 active:bg-md-on-surface-variant/20 hover:text-md-on-background"
            }`
          }
        >
          <item.icon
            size={20}
            className="transition-transform group-hover:scale-110 duration-300 ease-md"
            strokeWidth={2}
          />
          {item.label}
        </NavLink>
      ))}
    </div>

    <div className="p-4 border-t border-md-outline/5 flex flex-col gap-2">
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-sm font-medium text-md-on-surface-variant">
          Theme
        </span>
        <ThemeToggle />
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-4 px-4 py-3.5 rounded-full text-md-on-surface-variant hover:bg-md-on-surface-variant/10 active:bg-md-on-surface-variant/20 transition-all font-medium w-full text-left cursor-pointer"
      >
        <LogOut size={20} strokeWidth={2} />
        Sign Out
      </button>
    </div>
  </>
);

