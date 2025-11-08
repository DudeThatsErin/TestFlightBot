'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Label,
  Textarea,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DataTable,
  Form,
  FormField,
  FormSection,
  FormGrid,
  PageContainer,
  PageHeader,
  PageContent,
  PageSection
} from '@/components/ui';
import type { DataTableColumn } from '@/components/ui';
import { Plus, Edit, Trash2, Power, PowerOff, Copy, Download, Upload } from 'lucide-react';

interface DiscordCommand {
  id: string;
  name: string;
  description: string;
  category?: string;
  enabled: boolean;
  permissions: string[];
  cooldown: number;
  guildOnly: boolean;
  ownerOnly: boolean;
  nsfw: boolean;
  aliases: string[];
  usage?: string;
  examples: string[];
  createdAt: string;
  updatedAt: string;
  options: DiscordCommandOption[];
  responses: DiscordCommandResponse[];
}

interface DiscordCommandOption {
  id: string;
  name: string;
  description: string;
  type: string;
  required: boolean;
  choices: DiscordCommandChoice[];
}

interface DiscordCommandChoice {
  id: string;
  name: string;
  value: string;
}

interface DiscordCommandResponse {
  id: string;
  trigger: string;
  content?: string;
  embeds?: any;
  ephemeral: boolean;
}

export default function CommandsPage() {
  const [commands, setCommands] = useState<DiscordCommand[]>([]);
  const [selectedCommand, setSelectedCommand] = useState<DiscordCommand | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [discordConfig, setDiscordConfig] = useState({
    botToken: '',
    clientId: '',
    guildId: '',
    hasToken: false,
    hasClientId: false,
    hasGuildId: false
  });
  const [configLoading, setConfigLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Category management state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Define table columns
  const commandColumns: DataTableColumn<DiscordCommand>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      cell: (command) => (
        <div>
          <div className="font-medium">/{command.name}</div>
          {command.aliases.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Aliases: {command.aliases.join(', ')}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "description",
      header: "Description",
      accessorKey: "description",
      cell: (command) => (
        <div className="max-w-xs truncate">{command.description}</div>
      ),
    },
    {
      id: "category",
      header: "Category",
      accessorKey: "category",
      cell: (command) => {
        const categories = Array.from(new Set(commands.map(cmd => cmd.category).filter(Boolean)));
        return (
          <div className="flex items-center space-x-2">
            {command.category ? (
              <Badge variant="secondary">{command.category}</Badge>
            ) : (
              <Badge variant="outline">No Category</Badge>
            )}
            <Select
              value={command.category || ''}
              onValueChange={(newCategory) => handleMoveCommand(command.id, newCategory)}
            >
              <SelectTrigger className="w-8 h-8 p-0">
                <div className="w-4 h-4 flex items-center justify-center">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat!}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "enabled",
      cell: (command) => (
        <div className="flex items-center space-x-2">
          {command.enabled ? (
            <Power className="h-4 w-4 text-green-500" />
          ) : (
            <PowerOff className="h-4 w-4 text-red-500" />
          )}
          <span className={command.enabled ? 'text-green-600' : 'text-red-600'}>
            {command.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      ),
    },
    {
      id: "cooldown",
      header: "Cooldown",
      accessorKey: "cooldown",
      cell: (command) => (
        <span>{command.cooldown > 0 ? `${command.cooldown}s` : 'None'}</span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      sortable: false,
      filterable: false,
      cell: (command) => (
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={() => openEditDialog(command)}>
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleToggleCommand(command.id, !command.enabled)}
          >
            {command.enabled ? 'Disable' : 'Enable'}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleDeleteCommand(command.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  // Form state for creating/editing commands
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    enabled: true,
    permissions: [] as string[],
    cooldown: 0,
    guildOnly: false,
    ownerOnly: false,
    nsfw: false,
    aliases: [] as string[],
    usage: '',
    examples: [] as string[],
  });

  useEffect(() => {
    fetchCommands();
    fetchDiscordConfig();
  }, []);

  const fetchCommands = async () => {
    try {
      const response = await fetch('/api/commands');
      if (response.ok) {
        const data = await response.json();
        setCommands(data);
      }
    } catch (error) {
      console.error('Failed to fetch commands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommand = async () => {
    // Validate required fields
    if (!formData.name || !formData.description || !formData.category) {
      alert('Name, description, and category are required');
      return;
    }

    try {
      const response = await fetch('/api/commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Command created successfully');
        setIsCreateDialogOpen(false);
        resetForm();
        fetchCommands();
      } else {
        const errorData = await response.json();
        alert(`Failed to create command: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Failed to create command');
    }
  };

  const handleUpdateCommand = async () => {
    if (!selectedCommand) return;

    try {
      const response = await fetch(`/api/commands/${selectedCommand.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Command updated successfully');
        setIsEditDialogOpen(false);
        setSelectedCommand(null);
        resetForm();
        fetchCommands();
      } else {
        alert('Failed to update command');
      }
    } catch (error) {
      alert('Failed to update command');
    }
  };

  const handleDeleteCommand = async (commandId: string) => {
    if (!confirm('Are you sure you want to delete this command?')) return;

    try {
      const response = await fetch(`/api/commands/${commandId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Command deleted successfully');
        fetchCommands();
      } else {
        alert('Failed to delete command');
      }
    } catch (error) {
      alert('Failed to delete command');
    }
  };

  const handleToggleCommand = async (commandId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/commands/${commandId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });

      if (response.ok) {
        alert(`Command ${enabled ? 'enabled' : 'disabled'} successfully`);
        fetchCommands();
      } else {
        alert('Failed to toggle command');
      }
    } catch (error) {
      alert('Failed to toggle command');
    }
  };

  const handleDeployCommands = async () => {
    try {
      const response = await fetch('/api/commands/deploy', {
        method: 'POST',
      });

      if (response.ok) {
        alert('Commands deployed to Discord successfully');
      } else {
        const errorData = await response.json();
        alert(`Failed to deploy commands: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Failed to deploy commands');
    }
  };

  const fetchDiscordConfig = async () => {
    try {
      const response = await fetch('/api/discord/config');
      if (response.ok) {
        const data = await response.json();
        setDiscordConfig(data);
      }
    } catch (error) {
      console.error('Failed to fetch Discord config:', error);
    }
  };

  const handleSaveDiscordConfig = async () => {
    setConfigLoading(true);
    try {
      const response = await fetch('/api/discord/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: discordConfig.botToken,
          clientId: discordConfig.clientId,
          guildId: discordConfig.guildId,
        }),
      });

      if (response.ok) {
        alert('Discord configuration saved successfully');
        await fetchDiscordConfig(); // Refresh the config
      } else {
        alert('Failed to save Discord configuration');
      }
    } catch (error) {
      alert('Failed to save Discord configuration');
    } finally {
      setConfigLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      enabled: true,
      permissions: [],
      cooldown: 0,
      guildOnly: false,
      ownerOnly: false,
      nsfw: false,
      aliases: [],
      usage: '',
      examples: [],
    });
  };

  const openEditDialog = (command: DiscordCommand) => {
    setFormData({
      name: command.name,
      description: command.description,
      category: command.category || '',
      enabled: command.enabled,
      permissions: command.permissions,
      cooldown: command.cooldown,
      guildOnly: command.guildOnly,
      ownerOnly: command.ownerOnly,
      nsfw: command.nsfw || false,
      aliases: command.aliases,
      usage: command.usage || '',
      examples: command.examples,
    });
    setIsEditDialogOpen(true);
  };

  // Category management functions
  const openCategoryDialog = (category?: string) => {
    setEditingCategory(category || null);
    setNewCategoryName(category || '');
    setIsCategoryDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const response = await fetch('/api/commands/categories', {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldName: editingCategory,
          newName: newCategoryName.trim(),
        }),
      });

      if (response.ok) {
        await fetchCommands();
        setIsCategoryDialogOpen(false);
        setEditingCategory(null);
        setNewCategoryName('');
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const openDeleteCategoryDialog = (category: string) => {
    setCategoryToDelete(category);
    setIsDeleteCategoryDialogOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await fetch('/api/commands/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryName: categoryToDelete }),
      });

      if (response.ok) {
        await fetchCommands();
        setIsDeleteCategoryDialogOpen(false);
        setCategoryToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleMoveCommand = async (commandId: string, newCategory: string) => {
    try {
      const response = await fetch(`/api/commands/${commandId}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory }),
      });

      if (response.ok) {
        await fetchCommands();
      }
    } catch (error) {
      console.error('Error moving command:', error);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Discord Commands</h1>
            <p className="text-muted-foreground">
              Manage your bot's Discord slash commands
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleDeployCommands} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Deploy to Discord
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Command
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Command</DialogTitle>
                <DialogDescription>
                  Create a new Discord slash command for your bot
                </DialogDescription>
              </DialogHeader>
              <CommandForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleCreateCommand}
                submitLabel="Create Command"
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DataTable
        data={commands}
        columns={commandColumns}
        title="Command List"
        description="All Discord commands registered in your bot"
        isLoading={loading}
        searchPlaceholder="Search commands..."
        showSearch={true}
        showPagination={true}
        emptyMessage="No commands found. Create your first command to get started."
      />

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Command</DialogTitle>
            <DialogDescription>
              Modify the selected Discord command
            </DialogDescription>
          </DialogHeader>
          <CommandForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdateCommand}
            submitLabel="Update Command"
          />
        </DialogContent>
      </Dialog>

      {/* Category Management Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? 'Rename this category. All commands in this category will be moved to the new name.'
                : 'Create a new category to organize your commands.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="utility"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsCategoryDialogOpen(false)}
              >

interface CommandFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: () => void;
  submitLabel: string;
}

function CommandForm({ formData, setFormData, onSubmit, submitLabel }: CommandFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Command Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="ping"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="utility"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Check bot latency and status"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">Command Code</Label>
        <Textarea
          id="code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="const { SlashCommandBuilder } = require('discord.js');"
          className="min-h-[200px] font-mono text-sm"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="enabled"
          checked={formData.enabled}
          onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
        />
        <Label htmlFor="enabled">Enable this command</Label>
            id="guildOnly"
            checked={formData.guildOnly}
            onCheckedChange={(checked: boolean) => setFormData({ ...formData, guildOnly: checked })}
          />
          <Label htmlFor="guildOnly">Guild Only</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="ownerOnly"
            checked={formData.ownerOnly}
            onCheckedChange={(checked: boolean) => setFormData({ ...formData, ownerOnly: checked })}
          />
          <Label htmlFor="ownerOnly">Owner Only</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="nsfw"
            checked={formData.nsfw}
            onCheckedChange={(checked: boolean) => setFormData({ ...formData, nsfw: checked })}
          />
          <Label htmlFor="nsfw">NSFW</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => {}}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
