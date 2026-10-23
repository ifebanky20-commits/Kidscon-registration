import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      closeButton
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-center gap-3 rounded-2xl border border-md-outline/20 bg-md-surface-container p-4 text-sm text-md-on-background shadow-lg",
          content: "flex flex-1 flex-col gap-1",
          title: "font-semibold",
          description: "text-md-on-surface-variant",
          closeButton:
            "absolute -left-2 -top-2 flex size-6 items-center justify-center rounded-full border border-md-outline/20 bg-md-surface-container text-md-on-background hover:bg-md-secondary-container",
          success: "border-green-600/30 [&_[data-icon]]:text-green-600",
          error: "border-md-error/30 [&_[data-icon]]:text-md-error",
          warning: "border-amber-600/30 [&_[data-icon]]:text-amber-600",
          actionButton:
            "rounded-full bg-md-primary px-3 py-1 font-medium text-md-on-primary",
          cancelButton:
            "rounded-full bg-md-secondary-container px-3 py-1 text-md-on-secondary-container",
        },
      }}
    />
  );
}
