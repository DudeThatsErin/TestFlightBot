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
      className="w-9 h-9 p-0"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all text-foreground dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all text-foreground dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
