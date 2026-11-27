import React from "react";

import { cn } from "@/utils/cn";

type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "fab";
  size?: "sm" | "default" | "lg" | "fab";
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "default",
      asChild = false,
      children,
      ...props
    },
    ref,
  ) => {
    const variants = {
      primary:
        "bg-md-primary text-md-on-primary hover:bg-md-primary/90 active:bg-md-primary/80",
      secondary:
        "bg-md-secondary-container text-md-on-secondary-container hover:bg-md-secondary-container/90 active:bg-md-secondary-container/80",
      outline:
        "border border-md-outline text-md-primary hover:bg-md-primary/5 active:bg-md-primary/10",
      ghost: "text-md-primary hover:bg-md-primary/10 active:bg-md-primary/20",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm font-medium",
      default: "h-10 px-6 text-sm font-medium",
      lg: "h-12 px-8 text-base font-medium",
      fab: "h-14 w-14 rounded-2xl p-0 flex items-center justify-center bg-md-tertiary text-md-on-tertiary hover:bg-md-tertiary/90 shadow-md hover:shadow-lg",
    };

    const buttonClassName = cn(
      "inline-flex items-center justify-center cursor-pointer transition-all duration-300 ease-md focus:outline-none focus-visible:ring-2 focus-visible:ring-md-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95",
      variant !== "fab" ? "rounded-full" : "", // Regular buttons use full pill shape
      variants[variant === "fab" ? "primary" : variant],
      sizes[size],
      variant !== "ghost" &&
      variant !== "outline" &&
      variant !== "fab" &&
      "shadow-sm hover:shadow-md",
      className,
    );

    if (
      asChild &&
      React.isValidElement<React.HTMLAttributes<HTMLElement>>(children)
    ) {
      return React.cloneElement(children, {
        ...props,
        className: cn(buttonClassName, children.props.className),
      });
    }

    return (
      <button ref={ref} className={buttonClassName} {...props}>
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
