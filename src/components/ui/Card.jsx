import React from 'react';
import { cn } from '../../utils/cn';

export function Card({ className, ...props }) {
  return (
    <div 
      className={cn(
        "bg-md-surface-container rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-md group overflow-hidden border border-transparent hover:border-md-outline/10", 
        className
      )} 
      {...props} 
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div className={cn("px-6 py-5 border-b border-md-outline/10", className)} {...props} />
  );
}

export function CardTitle({ className, ...props }) {
  return (
    <h3 className={cn("text-xl font-medium text-md-on-background", className)} {...props} />
  );
}

export function CardContent({ className, ...props }) {
  return (
    <div className={cn("p-6", className)} {...props} />
  );
}

export function CardFooter({ className, ...props }) {
  return (
    <div className={cn("px-6 py-4 bg-md-surface-container-low/50 border-t border-md-outline/10 flex items-center", className)} {...props} />
  );
}
