"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Home, Settings, Command, LogOut, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Commands", href: "/dashboard/commands", icon: Command },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function GlobalHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  
  // Don't show navigation items on auth pages
  const isAuthPage = pathname?.startsWith('/auth');
  const isAuthenticated = status === "authenticated";
  
  return (
    <nav className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">TF</span>
              </div>
              <span className="font-semibold text-foreground">TestFlight</span>
            </Link>
            
            {/* Only show navigation on authenticated pages, not on auth pages */}
            {isAuthenticated && !isAuthPage && (
              <div className="hidden md:flex items-center space-x-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            
            {/* Show GitHub link when not authenticated */}
            {!isAuthenticated && (
              <Button variant="ghost" size="sm" asChild>
                <a
                  href="https://github.com/DudeThatsErin/TestFlightBot"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </a>
              </Button>
            )}
            
            {/* Only show sign out on authenticated pages */}
            {isAuthenticated && !isAuthPage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
