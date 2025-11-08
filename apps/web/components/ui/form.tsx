import * as React from "react";
import { cn } from "@/lib/utils";

// Form wrapper component
export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, ...props }, ref) => {
    return (
      <form
        className={cn("space-y-6", className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Form.displayName = "Form";

// Form field wrapper
export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: string;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div
        className={cn("space-y-2", className)}
        ref={ref}
        {...props}
      >
        {children}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
FormField.displayName = "FormField";

// Form section for grouping related fields
export interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div
        className={cn("space-y-4", className)}
        ref={ref}
        {...props}
      >
        {(title || description) && (
          <div className="space-y-1">
            {title && (
              <h3 className="text-lg font-medium text-foreground">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    );
  }
);
FormSection.displayName = "FormSection";

// Form grid for responsive layouts
export interface FormGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4;
}

const FormGrid = React.forwardRef<HTMLDivElement, FormGridProps>(
  ({ className, cols = 2, children, ...props }, ref) => {
    const gridCols = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    };

    return (
      <div
        className={cn("grid gap-4", gridCols[cols], className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);
FormGrid.displayName = "FormGrid";

export { Form, FormField, FormSection, FormGrid };
