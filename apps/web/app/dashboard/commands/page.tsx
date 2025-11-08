"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Upload, Trash2, Eye, EyeOff } from "lucide-react";
import type { DataTableColumn } from "@/components/ui/data-table";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

interface DiscordCommand {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  cooldown: number;
}

export default function CommandsPage() {
  const { data: session, status } = useSession({
    required: true,
  });

  const [commands, setCommands] = useState<DiscordCommand[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      redirect("/auth/signin");
    }
  }, [session, status]);

  useEffect(() => {
    fetchCommands();
    fetchCategories();
  }, []);

  const fetchCommands = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/commands');
      if (response.ok) {
        const data = await response.json();
        setCommands(data);
      }
    } catch (error) {
      console.error('Error fetching commands:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/commands/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.map((cat: any) => cat.name));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };



  const handleDeleteCommand = async (commandId: string) => {
    if (!confirm('Are you sure you want to delete this command?')) return;

    try {
      const response = await fetch(`/api/commands/${commandId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCommands();
      }
    } catch (error) {
      console.error('Error deleting command:', error);
    }
  };

  const handleToggleEnabled = async (command: DiscordCommand) => {
    try {
      const response = await fetch(`/api/commands/${command.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...command, enabled: !command.enabled }),
      });

      if (response.ok) {
        await fetchCommands();
      }
    } catch (error) {
      console.error('Error toggling command:', error);
    }
  };


  const handleRefreshCommands = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/commands/refresh', {
        method: 'POST',
      });

      if (response.ok) {
        await fetchCommands();
        alert('Commands refreshed successfully from filesystem!');
      } else {
        alert('Failed to refresh commands');
      }
    } catch (error) {
      console.error('Error refreshing commands:', error);
      alert('Error refreshing commands');
    } finally {
      setLoading(false);
    }
  };

  const handleDeployCommands = async () => {
    try {
      const response = await fetch('/api/commands/deploy', {
        method: 'POST',
      });

      if (response.ok) {
        alert('Commands deployed successfully!');
      }
    } catch (error) {
      console.error('Error deploying commands:', error);
    }
  };

  const commandColumns: DataTableColumn<DiscordCommand>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      sortable: true,
    },
    {
      id: "description",
      header: "Description",
      accessorKey: "description",
      sortable: true,
    },
    {
      id: "category",
      header: "Category",
      accessorKey: "category",
      sortable: true,
      cell: (command) => (
        <Badge variant="secondary">{command.category}</Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (command) => (
        <Badge variant={command.enabled ? "default" : "secondary"}>
          {command.enabled ? "Enabled" : "Disabled"}
        </Badge>
      ),
    },
    {
      id: "cooldown",
      header: "Cooldown",
      accessorKey: "cooldown",
      sortable: true,
      cell: (command) => `${command.cooldown}s`,
    },
    {
      id: "actions",
      header: "Actions",
      cell: (command) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleEnabled(command)}
          >
            {command.enabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteCommand(command.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Discord Commands</h1>
            <p className="text-muted-foreground">
              View and manage Discord commands loaded from your codebase
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleRefreshCommands} className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 dark:text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Commands
            </Button>
            <Button onClick={handleDeployCommands} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Deploy to Discord
            </Button>
          </div>
        </div>

        <DataTable
          data={commands}
          columns={commandColumns}
          title="Command List"
          description="Discord commands loaded from your filesystem"
          isLoading={loading}
          searchPlaceholder="Search commands..."
          showSearch={true}
          showPagination={true}
          emptyMessage="No commands found. Click 'Refresh Commands' to scan your filesystem."
        />

      </div>
    </div>
  );
}

