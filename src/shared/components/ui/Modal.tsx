import { X } from "lucide-react";

import React, { useEffect } from "react";

import { cn } from "@/shared/utils/cn";

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  // Close on Escape key
  useEffect(() => {
    const wasLocked = document.body.classList.contains("overflow-hidden");
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.classList.add("overflow-hidden");
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      if (!wasLocked) document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 motion-safe:animate-enter duration-300 ease-md">
      <div
        className={cn(
          "bg-md-surface-container rounded-[28px] shadow-[0_10px_15px_-3px_rgb(0_0_0/0.1),0_4px_6px_-2px_rgb(0_0_0/0.05)] w-full max-w-lg flex flex-col max-h-[90vh] motion-safe:animate-enter [--enter-scale:0.95] [--enter-y:1.0rem] duration-300 ease-md",
          className,
        )}
      >
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-2xl font-medium text-md-on-background tracking-tight">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-md-on-surface-variant hover:text-md-on-background hover:bg-md-on-surface-variant/10 active:bg-md-on-surface-variant/20 rounded-full transition-colors active:scale-95"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 pt-2 overflow-y-auto [scrollbar-width:thin]">
          {children}
        </div>
      </div>
    </div>
  );
}
