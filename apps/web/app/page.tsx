import { PublicTestFlightTable } from "@/components/public-testflight-table";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Github, CheckCircle, Clock, XCircle, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  TestFlight Checker
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Track TestFlight build status in real-time
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" size="sm" asChild className="border-slate-600 dark:border-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">
                <a
                  href="https://github.com/DudeThatsErin/TestFlightBot"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border-0 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg mr-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Builds</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">-</p>
              </div>
            </div>
          </div>
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border-0 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg mr-4">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">-</p>
              </div>
            </div>
          </div>
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border-0 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg mr-4">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Expired</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">-</p>
              </div>
            </div>
          </div>
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border-0 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg mr-4">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Builds</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">-</p>
              </div>
            </div>
          </div>
        </div>

        {/* TestFlight Table */}
        <PublicTestFlightTable />

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
