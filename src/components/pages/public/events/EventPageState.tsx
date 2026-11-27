import { CalendarX, RefreshCw } from "lucide-react";
import Link from "next/link";

interface EventPageStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export function EventPageState({ title, message, onRetry }: EventPageStateProps) {
  return (
    <div role={onRetry ? "alert" : undefined} className="mx-auto max-w-7xl px-5 py-24 text-center font-display sm:px-8">
      <CalendarX size={34} strokeWidth={1.3} className="mx-auto mb-6 text-brand-primary" aria-hidden="true" />
      <h1 className="text-3xl font-medium tracking-tight text-brand-ink">{title}</h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-brand-muted">{message}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {onRetry && (
          <button type="button" onClick={onRetry} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-action px-5 text-sm text-white">
            <RefreshCw size={15} aria-hidden="true" /> Try again
          </button>
        )}
        <Link href="/events" className="inline-flex min-h-11 items-center rounded-xl border border-brand-line px-5 text-sm text-brand-ink">
          Browse events
        </Link>
      </div>
    </div>
  );
}
