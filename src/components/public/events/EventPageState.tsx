import { CalendarX, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

interface EventPageStateProps {
  loading?: boolean;
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function EventPageState({ loading, title, message, onRetry }: EventPageStateProps) {
  return (
    <div role={loading ? "status" : onRetry ? "alert" : undefined} className="mx-auto max-w-7xl px-5 py-24 text-center font-display sm:px-8">
      {loading ? <><span className="mx-auto block size-9 animate-spin rounded-full border-2 border-brand-line border-t-brand-primary motion-reduce:animate-none" /><p className="mt-5 text-sm text-brand-muted">Loading event…</p></> : <>
        <CalendarX size={34} strokeWidth={1.3} className="mx-auto mb-6 text-brand-primary" aria-hidden="true" />
        <h1 className="text-3xl font-medium tracking-tight text-brand-ink">{title}</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-brand-muted">{message}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {onRetry && <button type="button" onClick={onRetry} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-action px-5 text-sm text-white"><RefreshCw size={15} aria-hidden="true" />Try again</button>}
          <Link to="/events" className="inline-flex min-h-11 items-center rounded-xl border border-brand-line px-5 text-sm text-brand-ink">Browse events</Link>
        </div>
      </>}
    </div>
  );
}
