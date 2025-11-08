"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TestFlightBuild {
  id: string;
  name: string;
  version: string;
  buildNumber: string;
  status: string;
  testflightUrl: string;
  lastCheckedAt: string | null;
  createdAt: string;
}

interface TestFlightTableProps {
  onStatsUpdate: () => void;
  refreshTrigger?: number;
}

export function TestFlightTable({ onStatsUpdate, refreshTrigger }: TestFlightTableProps) {
  const [builds, setBuilds] = useState<TestFlightBuild[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBuilds();
  }, []);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchBuilds();
    }
  }, [refreshTrigger]);

  const fetchBuilds = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/testflight/builds");
      if (response.ok) {
        const data = await response.json();
        setBuilds(data);
      }
    } catch (error) {
      console.error("Failed to fetch builds:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (buildId: string) => {
    if (!confirm("Are you sure you want to delete this build?")) return;

    try {
      const response = await fetch(`/api/testflight/builds/${buildId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchBuilds();
        onStatsUpdate();
      }
    } catch (error) {
      console.error("Failed to delete build:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      ACTIVE: "bg-green-100 text-green-800",
      EXPIRED: "bg-red-100 text-red-800",
      NOT_FOUND: "bg-gray-100 text-gray-800",
      ERROR: "bg-orange-100 text-orange-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusColors[status as keyof typeof statusColors] || statusColors.ERROR
        }`}
      >
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {builds.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No TestFlight builds found. Add one to get started.
        </div>
      ) : (
        <div className="grid gap-4">
          {builds.map((build) => (
            <Card key={build.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{build.name}</CardTitle>
                  {getStatusBadge(build.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Version:</span>
                    <div>{build.version}</div>
                  </div>
                  <div>
                    <span className="font-medium">Build:</span>
                    <div>{build.buildNumber}</div>
                  </div>
                  <div>
                    <span className="font-medium">Last Checked:</span>
                    <div>
                      {build.lastCheckedAt
                        ? new Date(build.lastCheckedAt).toLocaleString()
                        : "Never"}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(build.testflightUrl, "_blank")}
                    >
                      View
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(build.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
