# UI Components System

This directory contains a comprehensive set of reusable UI components with consistent theming throughout the entire application.

## 🎨 Theme System

The components use CSS variables for theming, supporting both light and dark modes:

- **Background colors**: `bg-background`, `bg-card`, `bg-muted`
- **Text colors**: `text-foreground`, `text-muted-foreground`
- **Border colors**: `border-border`, `border-input`
- **Interactive colors**: `bg-primary`, `bg-secondary`, `bg-destructive`

## 📦 Available Components

### Core Components
- **Button** - Primary action buttons with variants (default, outline, ghost, etc.)
- **Input** - Text input fields with proper theming
- **Label** - Form labels with consistent styling
- **Textarea** - Multi-line text input
- **PasswordInput** - Password input with show/hide toggle

### Form Components
- **Form** - Form wrapper with consistent spacing
- **FormField** - Individual form field with error handling
- **FormSection** - Grouped form fields with title/description
- **FormGrid** - Responsive grid layout for forms

### Layout Components
- **PageContainer** - Main page wrapper
- **PageHeader** - Page title and actions
- **PageContent** - Main content area
- **PageSection** - Content sections with titles

### Data Display
- **Card** - Content containers with header/footer
- **Badge** - Status indicators and labels
- **Table** - Data tables with proper theming

### Navigation
- **Tabs** - Tab navigation with content panels

### Overlays
- **Dialog** - Modal dialogs and popups

### Form Controls
- **Switch** - Toggle switches
- **Select** - Dropdown selectors

## 🚀 Usage

Import components from the main index file:

```typescript
import {
  Button,
  Input,
  Label,
  Form,
  FormField,
  FormSection,
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui';
```

### Example Form

```tsx
<Card>
  <CardHeader>
    <CardTitle>Settings</CardTitle>
  </CardHeader>
  <CardContent>
    <Form>
      <FormSection
        title="Configuration"
        description="Configure your application settings"
      >
        <FormField>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormField>
        
        <FormField>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>
        
        <Button type="submit">Save Settings</Button>
      </FormSection>
    </Form>
  </CardContent>
</Card>
```

## 🎯 Benefits

1. **Consistent Theming** - All components use the same CSS variables
2. **Dark Mode Support** - Automatic light/dark mode switching
3. **Responsive Design** - Mobile-first responsive components
4. **Accessibility** - Proper ARIA attributes and keyboard navigation
5. **Type Safety** - Full TypeScript support with proper interfaces
6. **Easy Maintenance** - Centralized styling and behavior

## 🔧 Customization

Components can be customized using the `className` prop:

```tsx
<Button className="w-full bg-green-600 hover:bg-green-700">
  Custom Button
</Button>
```

## 📱 Responsive Design

Components are built mobile-first and include responsive breakpoints:

- **sm**: 640px and up
- **md**: 768px and up  
- **lg**: 1024px and up
- **xl**: 1280px and up

Use responsive utilities in className:

```tsx
<FormGrid cols={1} className="md:grid-cols-2 lg:grid-cols-3">
  {/* Content */}
</FormGrid>
```
