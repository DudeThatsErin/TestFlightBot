"use client";

import { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronUp, ChevronDown, ExternalLink, Search, Filter, Eye, Trash2 } from "lucide-react";

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

interface SharedTestFlightTableProps {
  apiEndpoint: string;
  title?: string;
  showAdminActions?: boolean;
  onStatsUpdate?: () => void;
  refreshTrigger?: number;
}

export function SharedTestFlightTable({ 
  apiEndpoint, 
  title = "TestFlight Builds",
  showAdminActions = false,
  onStatsUpdate,
  refreshTrigger 
}: SharedTestFlightTableProps) {
  const [data, setData] = useState<TestFlightBuild[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchData();
    }
  }, [refreshTrigger]);

  // Auto-refresh every 30 seconds (silently)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(apiEndpoint);
      if (response.ok) {
        const builds = await response.json();
        setData(builds);
        onStatsUpdate?.(); // Trigger stats update if callback provided
      }
    } catch (error) {
      console.error("Failed to fetch TestFlight builds:", error);
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
        await fetchData();
        if (onStatsUpdate) onStatsUpdate();
      }
    } catch (error) {
      console.error("Failed to delete build:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700" },
      ACTIVE: { color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700" },
      EXPIRED: { color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700" },
      NOT_FOUND: { color: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700" },
      ERROR: { color: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ERROR;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        {status}
      </span>
    );
  };

  const columns = useMemo<ColumnDef<TestFlightBuild, any>[]>(
    () => {
      const baseColumns: ColumnDef<TestFlightBuild, any>[] = [
        {
          accessorKey: "name",
          header: "App Name",
          cell: (info) => (
            <div className="font-semibold text-slate-900 dark:text-slate-100">{info.getValue() as string}</div>
          ),
        },
        {
          accessorKey: "status",
          header: "Status",
          cell: (info) => getStatusBadge(info.getValue() as string),
          filterFn: "equals",
        },
        {
          accessorKey: "lastCheckedAt",
          header: "Last Checked",
          cell: (info) => {
            const date = info.getValue() as string | null;
            return (
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {date ? new Date(date).toLocaleString() : "Never"}
              </div>
            );
          },
        },
      ];

      // Add admin actions column if needed
      if (showAdminActions) {
        baseColumns.push({
          id: "actions",
          header: "Actions",
          cell: (info) => (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(info.row.original.testflightUrl, "_blank")}
                className="flex items-center gap-1"
              >
                <Eye className="h-3 w-3" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(info.row.original.id)}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </Button>
            </div>
          ),
          enableSorting: false,
        });
      }

      return baseColumns;
    },
    [showAdminActions]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const uniqueStatuses = useMemo(() => {
    const statuses = Array.from(new Set(data.map((item) => item.status)));
    return statuses.sort();
  }, [data]);

  if (isLoading) {
    return (
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="ml-2 text-slate-700 dark:text-slate-300">Loading TestFlight builds...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="border-b border-slate-200 dark:border-slate-700">
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
          <span>{title}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="ml-auto border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
              <Input
                placeholder="Search builds..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <select
              value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
              onChange={(e) =>
                table.getColumn("status")?.setFilterValue(e.target.value || undefined)
              }
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-2 ${
                            header.column.getCanSort() ? "cursor-pointer select-none" : ""
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="flex flex-col">
                              <ChevronUp
                                className={`h-3 w-3 ${
                                  header.column.getIsSorted() === "asc"
                                    ? "text-gray-900"
                                    : "text-gray-400"
                                }`}
                              />
                              <ChevronDown
                                className={`h-3 w-3 -mt-1 ${
                                  header.column.getIsSorted() === "desc"
                                    ? "text-gray-900"
                                    : "text-gray-400"
                                }`}
                              />
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white dark:bg-slate-800/30 divide-y divide-slate-200 dark:divide-slate-700">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-4 whitespace-nowrap text-slate-900 dark:text-slate-100">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{" "}
              of {table.getFilteredRowModel().rows.length} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Previous
              </Button>
              <span className="text-sm text-slate-600 dark:text-slate-400 px-2">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {table.getFilteredRowModel().rows.length === 0 && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-lg font-medium mb-2">No TestFlight builds found</p>
            <p className="text-sm">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
