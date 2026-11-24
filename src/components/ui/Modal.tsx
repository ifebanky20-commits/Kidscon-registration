import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/utils/cn";

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  busy = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  busy?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const backdropStart = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    const initialFocus = dialog.querySelector<HTMLElement>(
      "input:not([disabled]), select:not([disabled]), textarea:not([disabled])",
    );
    initialFocus?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      onPointerDown={(event) => {
        backdropStart.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (
          backdropStart.current &&
          event.target === event.currentTarget &&
          !busy
        )
          onClose();
        backdropStart.current = false;
      }}
      className={cn(
        "fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-hidden rounded-2xl border border-brand-line bg-brand-surface p-0 font-display text-brand-ink shadow-2xl backdrop:bg-black/45 backdrop:backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-brand-line bg-brand-wash px-5 py-5 sm:px-7">
          <div>
            <h2
              id={titleId}
              className="text-xl font-medium tracking-[-0.035em] sm:text-2xl"
            >
              {title}
            </h2>
            {description && (
              <p
                id={descriptionId}
                className="mt-2 text-sm leading-6 text-brand-muted"
              >
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close dialog"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl text-brand-muted transition hover:bg-brand-tint focus-visible:outline-2 focus-visible:outline-brand-primary disabled:opacity-40"
          >
            <X size={20} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </header>
        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">
          {children}
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
