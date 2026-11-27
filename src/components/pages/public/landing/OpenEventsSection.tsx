import { CalendarX, RefreshCw } from "lucide-react";
import Link from "next/link";

import { EventCard } from "@/components/pages/public/events/EventCard";
import EventListSkeleton from "@/components/pages/public/events/EventListSkeleton";
import type { EventRow } from "@/types/database";

interface OpenEventsSectionProps {
  loadingEvents: boolean;
  openEvents: Pick<EventRow, "id" | "name" | "location" | "date">[];
  hasError?: boolean;
  onRetry?: () => void;
}

export function OpenEventsSection({
  loadingEvents,
  openEvents,
  hasError,
  onRetry,
}: OpenEventsSectionProps) {
  return (
    <section
      id="events"
      aria-labelledby="events-heading"
      aria-busy={loadingEvents}
      className="scroll-mt-32 border-b border-brand-line py-16 sm:py-24"
    >
      <div className="mb-9 flex flex-wrap items-end justify-between gap-5 sm:mb-12">
        <div>
          <p className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-muted">
            <span
              className="size-1.5 shrink-0 rounded-full bg-brand-primary"
              aria-hidden="true"
            />{" "}
            On the horizon
          </p>
          <h2
            id="events-heading"
            className="text-3xl font-medium leading-[1.13] tracking-[-0.055em] sm:text-5xl"
          >
            Something to
            <br />
            <span className="text-brand-muted">look forward to.</span>
          </h2>
        </div>
        <div className="max-w-xs text-sm leading-7 text-brand-muted">
          <p>
            Find your next KIDSCON event. A new place to learn, connect, and be
            inspired.
          </p>
          {!loadingEvents && !hasError && openEvents.length > 0 && (
            <p className="mt-3 text-xs font-medium text-brand-primary">
              {openEvents.length} upcoming{" "}
              {openEvents.length === 1 ? "event" : "events"}
            </p>
          )}
          <Link
            href="/events"
            className="mt-4 inline-flex min-h-10 items-center text-xs font-medium text-brand-primary underline underline-offset-4"
          >
            Browse all events
          </Link>
        </div>
      </div>
      {loadingEvents ? (
        <EventListSkeleton />
      ) : hasError ? (
        <div
          role="alert"
          className="rounded-3xl border border-brand-line bg-brand-surface px-10 py-16 text-center"
        >
          <CalendarX
            size={30}
            strokeWidth={1.3}
            className="mx-auto mb-4 text-brand-muted"
            aria-hidden="true"
          />
          <h3 className="text-xl font-medium tracking-tight">
            We couldn't load the events.
          </h3>
          <p className="mt-2 text-sm text-brand-muted">
            Please try again to see what's coming up.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mx-auto mt-5 flex min-h-11 items-center gap-2 rounded-full bg-brand-action px-5 text-xs font-medium text-white transition hover:bg-brand-action-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Try again
          </button>
        </div>
      ) : openEvents.length === 0 ? (
        <div className="rounded-3xl border border-brand-line bg-brand-soft px-6 py-14 text-center">
          <CalendarX
            size={32}
            strokeWidth={1.2}
            className="mx-auto mb-5 text-brand-primary"
            aria-hidden="true"
          />
          <h3 className="text-2xl font-medium tracking-[-0.04em]">
            Good things take a little planning.
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-brand-muted">
            There are no open registrations right now. Check back soon for your
            school's next KIDSCON event.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {openEvents.map((event, index) => (
            <EventCard key={event.id} event={event} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
