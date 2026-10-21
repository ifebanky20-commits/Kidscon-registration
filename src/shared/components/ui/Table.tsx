import React from "react";

import { cn } from "@/shared/utils/cn";

export function Table({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"table">) {
  return (
    <div className="w-full overflow-auto rounded-xl bg-md-surface-container">
      <table
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"thead">) {
  return (
    <thead
      className={cn(
        "[&_tr]:border-b border-md-outline/10 bg-md-surface-container-low/50",
        className,
      )}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"tbody">) {
  return (
    <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  );
}

export function TableRow({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"tr">) {
  return (
    <tr
      className={cn(
        "border-b border-md-outline/10 transition-colors hover:bg-md-on-surface-variant/5 data-[state=selected]:bg-md-surface-container-low",
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"th">) {
  return (
    <th
      className={cn(
        "h-14 px-6 text-left align-middle font-medium text-md-on-surface-variant [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"td">) {
  return (
    <td
      className={cn(
        "p-6 align-middle text-md-on-background [&:has([role=checkbox])]:pr-0 py-4",
        className,
      )}
      {...props}
    />
  );
}
