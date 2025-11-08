"use client";

import { SharedTestFlightTable } from "@/components/shared-testflight-table";
import { Button } from "@/components/ui/button";
import { Github, CheckCircle, XCircle, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";

interface PublicStats {
  total: number;
  active: number;
  expired: number;
}

export default function Home() {
  const [stats, setStats] = useState<PublicStats>({
    total: 0,
    active: 0,
    expired: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/public/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Public TestFlight Status Dashboard
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 max-w-2xl mx-auto">
            Monitor the status of TestFlight builds in real-time. Search, filter, and sort
            through available builds to find what you&apos;re looking for.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border-0 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg mr-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Links</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border-0 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg mr-4">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Expired Links</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.expired}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border-0 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg mr-4">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Links</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* TestFlight Table */}
        <SharedTestFlightTable 
          apiEndpoint="/api/public/testflight"
          title="TestFlight Builds"
          showAdminActions={false}
        />

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-500 dark:text-slate-400">
          <p className="text-sm">
            Built with Next.js, TanStack Table, and Discord.js •{" "}
            <a
              href="https://github.com/DudeThatsErin/TestFlightBot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              View Source
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
