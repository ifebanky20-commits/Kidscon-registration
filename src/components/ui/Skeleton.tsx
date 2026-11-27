import React from "react";

import { cn } from "@/utils/cn";

export function Skeleton({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "motion-safe:animate-pulse rounded-md bg-brand-line/70",
        className,
      )}
      {...props}
    />
  );
}
