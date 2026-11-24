import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/providers/theme-context";
import { cn } from "@/utils/cn";

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn("p-2.5 rounded-full bg-md-surface-container hover:bg-md-surface-container-low text-md-on-surface-variant transition-colors ring-1 ring-md-outline/10 focus:outline-none focus:ring-2 focus:ring-md-primary", className)}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
