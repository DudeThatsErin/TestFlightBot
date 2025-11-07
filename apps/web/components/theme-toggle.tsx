"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    
    console.log("Current theme:", theme);
    console.log("New theme:", newTheme);
    
    // Direct DOM manipulation as fallback
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
    
    // Update localStorage directly
    localStorage.setItem("theme", newTheme);
    
    // Update theme using the provider
    setTheme(newTheme);
    
    console.log("HTML classes after toggle:", document.documentElement.className);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-9 h-9 p-0 dark:border-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all text-black dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 text-white scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
