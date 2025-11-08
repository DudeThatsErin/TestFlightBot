# DataTable Component

A reusable, feature-rich data table component built on top of TanStack Table with consistent theming and functionality.

## Features

- **Sorting** - Click column headers to sort data
- **Searching** - Global search across all columns
- **Pagination** - Built-in pagination with page controls
- **Loading States** - Proper loading indicators
- **Responsive Design** - Mobile-friendly layout
- **Theme Support** - Consistent with app theme
- **Customizable Columns** - Flexible column definitions
- **Actions Support** - Custom action buttons
- **Empty States** - Configurable empty messages

## Basic Usage

```tsx
import { DataTable, DataTableColumn } from '@/components/ui';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const columns: DataTableColumn<User>[] = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
  },
  {
    id: "email", 
    header: "Email",
    accessorKey: "email",
  },
  {
    id: "role",
    header: "Role", 
    accessorKey: "role",
    cell: (user) => <Badge>{user.role}</Badge>,
  },
];

function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  
  return (
    <DataTable
      data={users}
      columns={columns}
      title="Users"
      description="Manage system users"
    />
  );
}
```

## Column Definition

```tsx
interface DataTableColumn<T> {
  id: string;                    // Unique column identifier
  header: string;                // Column header text
  accessorKey?: keyof T;         // Object property to access
  cell?: (row: T) => ReactNode;  // Custom cell renderer
  sortable?: boolean;            // Enable sorting (default: true)
  filterable?: boolean;          // Enable filtering (default: true)
  width?: string;                // Column width
}
```

## Props

```tsx
interface DataTableProps<T> {
  data: T[];                     // Array of data objects
  columns: DataTableColumn<T>[]; // Column definitions
  title?: string;                // Table title
  description?: string;          // Table description
  isLoading?: boolean;           // Loading state
  searchPlaceholder?: string;    // Search input placeholder
  showSearch?: boolean;          // Show search bar (default: true)
  showPagination?: boolean;      // Show pagination (default: true)
  showRefresh?: boolean;         // Show refresh button
  onRefresh?: () => void;        // Refresh callback
  actions?: ReactNode;           // Custom header actions
  emptyMessage?: string;         // Empty state message
  className?: string;            // Additional CSS classes
}
```

## Advanced Examples

### Custom Cell Rendering

```tsx
const columns: DataTableColumn<User>[] = [
  {
    id: "avatar",
    header: "Avatar",
    cell: (user) => (
      <img 
        src={user.avatarUrl} 
        alt={user.name}
        className="w-8 h-8 rounded-full"
      />
    ),
    sortable: false,
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "isActive",
    cell: (user) => (
      <Badge variant={user.isActive ? "default" : "secondary"}>
        {user.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
];
```

### Action Buttons

```tsx
const columns: DataTableColumn<User>[] = [
  // ... other columns
  {
    id: "actions",
    header: "Actions",
    sortable: false,
    filterable: false,
    cell: (user) => (
      <div className="flex space-x-2">
        <Button size="sm" onClick={() => editUser(user.id)}>
          Edit
        </Button>
        <Button 
          size="sm" 
          variant="destructive"
          onClick={() => deleteUser(user.id)}
        >
          Delete
        </Button>
      </div>
    ),
  },
];
```

### With Loading and Refresh

```tsx
function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <DataTable
      data={users}
      columns={columns}
      title="Users"
      isLoading={isLoading}
      showRefresh={true}
      onRefresh={fetchUsers}
      actions={
        <Button onClick={() => setShowCreateDialog(true)}>
          Add User
        </Button>
      }
    />
  );
}
```

## Styling

The DataTable uses the app's theme system and is fully responsive:

- **Dark/Light Mode** - Automatically adapts to theme
- **Mobile Responsive** - Horizontal scroll on small screens
- **Consistent Spacing** - Uses theme spacing variables
- **Hover Effects** - Row hover states
- **Focus States** - Keyboard navigation support

## Integration Examples

### Discord Commands Table
```tsx
// Used in /app/dashboard/commands/page.tsx
<DataTable
  data={commands}
  columns={commandColumns}
  title="Command List"
  description="All Discord commands registered in your bot"
  searchPlaceholder="Search commands..."
/>
```

### TestFlight Builds Table
```tsx
// Used in components/testflight-data-table.tsx
<DataTable
  data={builds}
  columns={buildColumns}
  title="TestFlight Builds"
  showRefresh={true}
  onRefresh={fetchBuilds}
/>
```

## Benefits

1. **Consistency** - Same table experience across the app
2. **Maintainability** - Single component to update
3. **Feature Rich** - Built-in sorting, searching, pagination
4. **Type Safe** - Full TypeScript support
5. **Accessible** - Proper ARIA attributes and keyboard navigation
6. **Performant** - Efficient rendering with TanStack Table
7. **Flexible** - Highly customizable for different use cases
