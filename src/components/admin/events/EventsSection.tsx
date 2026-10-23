import { LoaderCircle } from "lucide-react";
import { AdminPageHeading } from "@/components/admin/ui/AdminPageHeading";
import {
  CalendarDays,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";

import { daysUntil, formatDate } from "@/utils/eventDates";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Toast } from "@/components/ui/InlineToast";
import type { EventWithCounts, ToastMessage } from "@/types/database";

interface EventsSectionProps {
  eventsToast: ToastMessage | null;
  setCreateOpen: (value: boolean) => void;
  eventsLoading: boolean;
  events: EventWithCounts[];
  busyId: string | null;
  handleToggle: (event: EventWithCounts) => Promise<void>;
  handleDelete: (event: EventWithCounts) => Promise<void>;
  setEditTarget: (event: EventWithCounts | null) => void;
  setEditForm: (
    form: Pick<EventWithCounts, "name" | "location" | "date">,
  ) => void;
  setEditOpen: (value: boolean) => void;
}

export function EventsSection({
  eventsToast,
  setCreateOpen,
  eventsLoading,
  events,
  busyId,
  handleToggle,
  handleDelete,
  setEditTarget,
  setEditForm,
  setEditOpen,
}: EventsSectionProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <AdminPageHeading title="Events" description={<> Create and manage KIDSCON programs. Each event has its own
            registration pool. </>} />
        <div className="flex items-center gap-3 flex-wrap">
          <Toast toast={eventsToast} />
          <Button
            onClick={() => setCreateOpen(true)}
            className="gap-2 h-11 px-6 shrink-0"
          >
            <Plus size={18} /> New Event
          </Button>
        </div>
      </div>

      {!eventsLoading && <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Event summary">
        {[{ label: "Total events", value: events.length }, { label: "Accepting registrations", value: events.filter(event => event.is_open && daysUntil(event.date) >= 0).length }, { label: "School registrations", value: events.reduce((total, event) => total + (event.schools?.[0]?.count ?? 0), 0) }].map(({ label, value }) => <div key={label} className="rounded-2xl border border-brand-line bg-brand-surface p-5"><p className="text-sm text-brand-muted">{label}</p><p className="mt-4 text-3xl font-medium tracking-[-0.045em] text-brand-ink">{value.toLocaleString()}</p></div>)}
      </div>}

      {eventsLoading ? (
        <div className="flex justify-center py-16">
          <span role="status" className="inline-flex items-center gap-2 text-sm"><LoaderCircle size={20} strokeWidth={1.6} className="motion-safe:animate-spin" aria-hidden="true" /><span className="sr-only">Loading</span></span>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-brand-line rounded-2xl bg-brand-surface">
          <CalendarDays
            size={40}
            className="mx-auto text-brand-muted/40 mb-4"
          />
          <p className="text-brand-muted font-semibold text-lg">
            No events yet
          </p>
          <p className="text-sm text-brand-muted/70 mt-1">
            Create your first program to get started.
          </p>
          <Button
            onClick={() => setCreateOpen(true)}
            variant="secondary"
            className="mt-6 gap-2"
          >
            <Plus size={16} /> Create Event
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {events.map((event) => {
            const days = daysUntil(event.date);
            const isPast = days < 0;
            const schoolCount = event.schools?.[0]?.count ?? 0;
            const busy = busyId === event.id;

            return (
              <Card
                key={event.id}
                className="rounded-2xl border border-brand-line bg-brand-surface shadow-none hover:shadow-none transition-shadow duration-300"
              >
                <CardContent className="p-6 flex flex-col gap-5">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-medium text-xl text-brand-ink tracking-tight truncate">
                          {event.name}
                        </h2>
                        <span
                          className={`shrink-0 text-[10px] font-medium uppercase tracking-widest px-2.5 py-1 rounded-full ${
                            event.is_open && !isPast
                              ? "bg-brand-tint text-brand-primary"
                              : isPast
                                ? "bg-brand-wash text-brand-muted/60"
                                : "bg-md-error/10 text-md-error"
                          }`}
                        >
                          {isPast ? "Ended" : event.is_open ? "Open" : "Closed"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-2 text-sm text-brand-muted font-medium">
                        <MapPin size={13} className="shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 text-sm text-brand-muted font-medium">
                        <CalendarDays size={13} className="shrink-0" />
                        <span>{formatDate(event.date)}</span>
                        {!isPast && (
                          <span className="ml-1 text-xs text-brand-primary font-semibold">
                            ({days === 0 ? "Today!" : `${days}d away`})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* School count badge */}
                    <div className="shrink-0 text-center bg-brand-tint text-brand-primary rounded-2xl px-4 py-3 min-w-[60px]">
                      <p className="text-2xl font-medium leading-none">
                        {schoolCount}
                      </p>
                      <p className="text-[10px] font-medium uppercase tracking-wide mt-1 opacity-75">
                        Schools
                      </p>
                    </div>
                  </div>

                  {/* Shareable registration link */}
                  <div className="bg-brand-wash rounded-2xl px-4 py-3">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-brand-muted/60 mb-1">
                      Registration Link
                    </p>
                    <p className="text-xs font-mono text-brand-primary break-all select-all">
                      {window.location.origin}/register?event={event.id}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-brand-line">
                    {/* Edit */}
                    <button
                      onClick={() => {
                        setEditTarget(event);
                        setEditForm({
                          name: event.name,
                          location: event.location,
                          date: event.date,
                        });
                        setEditOpen(true);
                      }}
                      className="h-10 w-10 flex items-center justify-center rounded-xl text-brand-muted hover:text-brand-primary hover:bg-brand-tint transition-colors"
                      title="Edit event"
                    >
                      <Pencil size={15} />
                    </button>
                    <Button
                      variant="ghost"
                      className={`flex-1 gap-2 h-10 text-sm font-semibold ${
                        event.is_open
                          ? "text-md-error hover:bg-md-error/10"
                          : "text-brand-primary hover:bg-brand-wash"
                      }`}
                      onClick={() => handleToggle(event)}
                      disabled={busy || isPast}
                    >
                      {busy ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : event.is_open ? (
                        <ToggleRight size={18} />
                      ) : (
                        <ToggleLeft size={18} />
                      )}
                      {event.is_open
                        ? "Close Registration"
                        : "Open Registration"}
                    </Button>

                    <button
                      onClick={() => handleDelete(event)}
                      disabled={busy}
                      className="h-10 w-10 flex items-center justify-center rounded-xl text-brand-muted hover:text-md-error hover:bg-md-error/10 transition-colors"
                      title="Delete event"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
