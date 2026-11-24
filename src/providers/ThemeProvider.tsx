import { useEffect, useState, useSyncExternalStore, type PropsWithChildren } from "react";

import { ThemeContext } from "@/providers/theme-context";

type Theme = "light" | "dark";

const themeKey = "kidscon_theme";
const subscribe = () => () => {};
const getServerTheme = (): Theme => "light";

function getStoredTheme(): Theme {
  try {
    return localStorage.getItem(themeKey) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const storedTheme = useSyncExternalStore(subscribe, getStoredTheme, getServerTheme);
  const [selectedTheme, setSelectedTheme] = useState<Theme>();
  const theme = selectedTheme ?? storedTheme;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setSelectedTheme(nextTheme);
    try {
      localStorage.setItem(themeKey, nextTheme);
    } catch {
      // The selection still applies for this visit if storage is disabled.
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
