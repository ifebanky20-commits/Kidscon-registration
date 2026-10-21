import { Search, X } from "lucide-react";
import { Link } from "react-router-dom";

import { useState } from "react";

import { EventCard } from "@/features/events/components/EventCard";
import { EventPageState } from "@/features/events/components/EventPageState";
import { usePublicEvents } from "@/features/events/hooks/usePublicEvents";

export default function EventsPage() {
  const { data: events = [], isPending, isError, refetch } = usePublicEvents();
  const [search, setSearch] = useState("");
  const results = events.filter((event) =>
    `${event.name} ${event.location}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  return (
    <div className="font-display text-brand-ink">
      <header className="bg-brand-wash">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-18 lg:px-12">
          <p className="mb-4 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-brand-muted">
            <span className="size-1.5 rounded-full bg-brand-primary" />A world
            to explore
          </p>
          <h1 className="max-w-2xl text-4xl font-medium leading-[1.1] tracking-[-0.055em] sm:text-6xl">
            Their next discovery.
            <br />
            <span className="text-brand-primary">Your next school outing.</span>
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-7 text-brand-muted">
            Discover upcoming KIDSCON programs, explore the details, and find
            the right event for your school.
          </p>
        </div>
      </header>
      <section
        aria-label="Upcoming events"
        className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12"
      >
        <div className="mb-8 flex flex-wrap items-center justify-between gap-5">
          <div>
            <h2 className="text-xl font-medium tracking-tight">
              Upcoming events
            </h2>
            <p aria-live="polite" className="mt-2 text-xs text-brand-muted">
              {!isPending && !isError
                ? `${results.length} ${results.length === 1 ? "event" : "events"}`
                : "Find a day worth looking forward to."}
            </p>
          </div>
          <div className="flex min-h-12 w-full max-w-sm items-center gap-3 rounded-xl border border-brand-line bg-brand-surface px-4 focus-within:ring-2 focus-within:ring-brand-primary">
            <Search
              size={17}
              className="shrink-0 text-brand-muted"
              aria-hidden="true"
            />
            <input
              aria-label="Search events or locations"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search events or locations"
              className="min-w-0 flex-1 bg-transparent py-3 text-sm text-brand-ink outline-none placeholder:text-brand-muted"
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
                className="p-1 text-brand-muted"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        {isPending ? (
          <EventPageState loading />
        ) : isError ? (
          <EventPageState
            title="We couldn't load the events."
            message="Please try again to see what's coming up."
            onRetry={() => {
              void refetch();
            }}
          />
        ) : results.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {results.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                index={index}

/>
            ))}
          </div>
        ) : (
          <div className="border-y border-brand-line py-16 text-center">
            <h3 className="text-xl font-medium">
              {search
                ? "No events match your search."
                : "The next adventure is on its way."}
            </h3>
            <p className="mt-3 text-sm text-brand-muted">
              {search
                ? "Try another event name or location."
                : "Check back soon for upcoming KIDSCON programs."}
            </p>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-5 text-sm font-medium text-brand-primary underline underline-offset-4"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
