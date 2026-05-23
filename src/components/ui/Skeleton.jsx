import React from 'react';
import { cn } from '../../utils/cn';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-md-surface-container-low/60 dark:bg-md-surface-container/60",
        className
      )}
      {...props}
    />
  );
}
