"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
}

interface SelectContentProps {
  className?: string;
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  onSelect?: () => void;
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

const Select = ({ value, onValueChange, disabled, children }: SelectProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(SelectContext);
    
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          className
        )}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = ({ className, children }: SelectContentProps) => {
  const { open } = React.useContext(SelectContext);
  
  if (!open) return null;
  
  return (
    <div className={cn(
      "absolute top-full z-50 w-full rounded-md border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-1 text-slate-900 dark:text-white shadow-lg",
      className
    )}>
      {children}
    </div>
  );
};

const SelectItem = ({ value, className, children, onSelect }: SelectItemProps) => {
  const { onValueChange, setOpen } = React.useContext(SelectContext);
  
  return (
    <div
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-100 dark:focus:bg-slate-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors",
        className
      )}
      onClick={() => {
        onValueChange?.(value);
        setOpen(false);
        onSelect?.();
      }}
    >
      {children}
    </div>
  );
};

const SelectValue = ({ placeholder, className }: SelectValueProps) => {
  const { value } = React.useContext(SelectContext);
  
  return (
    <span className={cn("block truncate", className)}>
      {value || placeholder}
    </span>
  );
};

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
