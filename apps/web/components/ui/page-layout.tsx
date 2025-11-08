import * as React from "react";
import { cn } from "@/lib/utils";

// Main page container
export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn("min-h-screen bg-background", className)}
        ref={ref}
        {...props}
      />
    );
  }
);
PageContainer.displayName = "PageContainer";

// Page header
export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, description, actions, ...props }, ref) => {
    return (
      <div
        className={cn("flex flex-col gap-4 md:flex-row md:items-center md:justify-between", className)}
        ref={ref}
        {...props}
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    );
  }
);
PageHeader.displayName = "PageHeader";

// Page content wrapper
export interface PageContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const PageContent = React.forwardRef<HTMLDivElement, PageContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn("flex-1 space-y-6", className)}
        ref={ref}
        {...props}
      />
    );
  }
);
PageContent.displayName = "PageContent";

// Page section
export interface PageSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

const PageSection = React.forwardRef<HTMLDivElement, PageSectionProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <section
        className={cn("space-y-4", className)}
        ref={ref}
        {...props}
      >
        {(title || description) && (
          <div className="space-y-1">
            {title && (
              <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        {children}
      </section>
    );
  }
);
PageSection.displayName = "PageSection";

export { PageContainer, PageHeader, PageContent, PageSection };
