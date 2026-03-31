import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({ className, label, error, ...props }, ref) => {
  return (
    <div className="w-full flex-1 group">
      {label && <label className="block text-sm text-md-on-surface-variant font-medium mb-1 pl-4 transition-colors group-focus-within:text-md-primary">{label}</label>}
      <input
        ref={ref}
        className={cn(
          "flex h-14 w-full rounded-t-lg rounded-b-none border-b-2 border-md-outline bg-md-surface-container-low px-4 py-2 text-base text-md-on-background transition-all duration-200 ease-md",
          "placeholder:text-md-on-background/50 disabled:cursor-not-allowed disabled:opacity-50",
          "focus:outline-none focus:border-md-primary focus:bg-md-surface-container-low/80",
          error && "border-md-error focus:border-md-error",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 pl-4 text-xs font-medium text-md-error">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
