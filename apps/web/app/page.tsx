import { PublicTestFlightTable } from "@/components/public-testflight-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Shield, Github } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📱</div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  TestFlight Monitor
                </h1>
                <p className="text-sm text-gray-500">
                  Track TestFlight build status in real-time
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/signin">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Login
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Public TestFlight Status Dashboard
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Monitor the status of TestFlight builds in real-time. Search, filter, and sort
            through available builds to find what you&apos;re looking for.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">✅</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Builds</p>
                <p className="text-2xl font-semibold text-green-600">-</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">⏳</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-yellow-600">-</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">❌</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-semibold text-red-600">-</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📊</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Builds</p>
                <p className="text-2xl font-semibold text-blue-600">-</p>
              </div>
            </div>
          </div>
        </div>

        {/* TestFlight Table */}
        <PublicTestFlightTable />

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500">
          <p className="text-sm">
            Built with Next.js, TanStack Table, and Discord.js •{" "}
            <a
              href="https://github.com/DudeThatsErin/TestFlightBot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              View Source
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
