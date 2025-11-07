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
import { ChevronUp, ChevronDown, ExternalLink, Search, Filter } from "lucide-react";

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


export function PublicTestFlightTable() {
  const [data, setData] = useState<TestFlightBuild[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/public/testflight");
      if (response.ok) {
        const builds = await response.json();
        setData(builds);
      }
    } catch (error) {
      console.error("Failed to fetch TestFlight builds:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", emoji: "⏳" },
      ACTIVE: { color: "bg-green-100 text-green-800 border-green-200", emoji: "✅" },
      EXPIRED: { color: "bg-red-100 text-red-800 border-red-200", emoji: "❌" },
      NOT_FOUND: { color: "bg-gray-100 text-gray-800 border-gray-200", emoji: "🚫" },
      ERROR: { color: "bg-orange-100 text-orange-800 border-orange-200", emoji: "⚠️" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ERROR;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.emoji} {status}
      </span>
    );
  };

  const columns = useMemo<ColumnDef<TestFlightBuild, any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "App Name",
        cell: (info) => (
          <div className="font-medium text-gray-900">{info.getValue() as string}</div>
        ),
      },
      {
        accessorKey: "version",
        header: "Version",
        cell: (info) => (
          <div className="text-sm text-gray-600">
            v{info.getValue() as string} ({info.row.original.buildNumber})
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => getStatusBadge(info.getValue() as string),
        filterFn: "equals",
      },
      {
        accessorKey: "testflightUrl",
        header: "TestFlight",
        cell: (info) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(info.getValue() as string, "_blank")}
            className="flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Open
          </Button>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "lastCheckedAt",
        header: "Last Checked",
        cell: (info) => {
          const date = info.getValue() as string | null;
          return (
            <div className="text-sm text-gray-600">
              {date ? new Date(date).toLocaleString() : "Never"}
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Added",
        cell: (info) => (
          <div className="text-sm text-gray-600">
            {new Date(info.getValue() as string).toLocaleDateString()}
          </div>
        ),
      },
    ],
    []
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
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading TestFlight builds...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📱 TestFlight Builds</span>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="ml-auto"
          >
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search builds..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
              onChange={(e) =>
                table.getColumn("status")?.setFilterValue(e.target.value || undefined)
              }
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <div className="rounded-md border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-4 whitespace-nowrap">
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
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700">
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
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {table.getFilteredRowModel().rows.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No TestFlight builds found matching your criteria.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
