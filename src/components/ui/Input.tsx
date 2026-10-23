import React from "react";

import { cn } from "@/utils/cn";

type InputProps = React.ComponentPropsWithoutRef<"input"> & {
  variant?: "default" | "brand";
  label?: string;
  error?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, variant = "default", id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    return (
      <div className="w-full flex-1 group">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium mb-2 transition-colors group-focus-within:text-md-primary",
              variant === "brand"
                ? "text-brand-ink"
                : "text-md-on-surface-variant pl-4",
            )}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            "flex h-14 w-full rounded-t-lg rounded-b-none border-b-2 border-md-outline bg-md-surface-container-low px-4 py-2 text-base text-md-on-background transition-all duration-200 ease-md",
            "placeholder:text-md-on-background/50 disabled:cursor-not-allowed disabled:opacity-50",
            "focus:outline-none focus:border-md-primary focus:bg-md-surface-container-low/80",
            variant === "brand" &&
              "rounded-xl border border-brand-line bg-brand-surface text-brand-ink placeholder:text-brand-muted/60 focus:border-brand-primary focus:bg-brand-surface focus:ring-2 focus:ring-brand-primary/15",
            error && "border-md-error focus:border-md-error",
            className,
          )}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-2 text-xs font-medium text-md-error"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
