import { createContext, useContext } from "react";

export const ThemeContext = createContext<{
  theme: "light" | "dark";
  toggleTheme: () => void;
}>({
  theme: "light",
  toggleTheme: () => null,
});

export const useTheme = () => useContext(ThemeContext);
