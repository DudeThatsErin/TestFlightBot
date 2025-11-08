"use client";

import { useState, useEffect } from "react";
import { DataTable, DataTableColumn } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Eye, Trash2 } from "lucide-react";

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

interface TestFlightDataTableProps {
  apiEndpoint: string;
  title?: string;
  description?: string;
  showAdminActions?: boolean;
  onStatsUpdate?: () => void;
  refreshTrigger?: number;
}

export function TestFlightDataTable({ 
  apiEndpoint, 
  title = "TestFlight Builds",
  description = "Monitor your TestFlight build status",
  showAdminActions = false,
  onStatsUpdate,
  refreshTrigger 
}: TestFlightDataTableProps) {
  const [data, setData] = useState<TestFlightBuild[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(apiEndpoint);
      if (response.ok) {
        const builds = await response.json();
        setData(builds);
        if (onStatsUpdate) {
          onStatsUpdate();
        }
      }
    } catch (error) {
      console.error('Error fetching TestFlight builds:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiEndpoint, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this build?')) return;
    
    try {
      const response = await fetch(`/api/testflight/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error deleting build:', error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'expired':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  // Define table columns
  const columns: DataTableColumn<TestFlightBuild>[] = [
    {
      id: "name",
      header: "App Name",
      accessorKey: "name",
      cell: (build) => (
        <div>
          <div className="font-medium">{build.name}</div>
          <div className="text-sm text-muted-foreground">
            v{build.version} ({build.buildNumber})
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: (build) => (
        <Badge variant={getStatusBadgeVariant(build.status)}>
          {build.status}
        </Badge>
      ),
    },
    {
      id: "lastChecked",
      header: "Last Checked",
      accessorKey: "lastCheckedAt",
      cell: (build) => (
        <span className="text-sm">{formatDate(build.lastCheckedAt)}</span>
      ),
    },
    {
      id: "created",
      header: "Added",
      accessorKey: "createdAt",
      cell: (build) => (
        <span className="text-sm">{formatDate(build.createdAt)}</span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      sortable: false,
      filterable: false,
      cell: (build) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(build.testflightUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          {showAdminActions && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDelete(build.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      title={title}
      description={description}
      isLoading={isLoading}
      searchPlaceholder="Search builds..."
      showSearch={true}
      showPagination={true}
      showRefresh={true}
      onRefresh={fetchData}
      emptyMessage="No TestFlight builds found. Add your first build to get started."
    />
  );
}
