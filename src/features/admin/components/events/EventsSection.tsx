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

import { daysUntil, formatDate } from "@/features/events/utils/eventDates";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Toast } from "@/shared/components/ui/InlineToast";
import type { EventWithCounts, ToastMessage } from "@/shared/types/database";

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
        <div>
          <h1 className="text-3xl font-bold text-md-on-background tracking-tight">
            Events
          </h1>
          <p className="text-md-on-surface-variant font-medium mt-1">
            Create and manage KIDSCON programs. Each event has its own
            registration pool.
          </p>
        </div>
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

      {eventsLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 rounded-full border-4 border-md-secondary-container border-t-md-primary animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-md-outline/20 rounded-[32px] bg-md-surface-container-low">
          <CalendarDays
            size={40}
            className="mx-auto text-md-on-surface-variant/40 mb-4"
          />
          <p className="text-md-on-surface-variant font-semibold text-lg">
            No events yet
          </p>
          <p className="text-sm text-md-on-surface-variant/70 mt-1">
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
                className="rounded-[28px] border border-md-outline/5 bg-md-surface-container-low shadow-none hover:shadow-md transition-shadow duration-300"
              >
                <CardContent className="p-6 flex flex-col gap-5">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-bold text-xl text-md-on-background tracking-tight truncate">
                          {event.name}
                        </h2>
                        <span
                          className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                            event.is_open && !isPast
                              ? "bg-emerald-100 text-emerald-700"
                              : isPast
                                ? "bg-md-surface-container text-md-on-surface-variant/60"
                                : "bg-md-error/10 text-md-error"
                          }`}
                        >
                          {isPast ? "Ended" : event.is_open ? "Open" : "Closed"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-2 text-sm text-md-on-surface-variant font-medium">
                        <MapPin size={13} className="shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 text-sm text-md-on-surface-variant font-medium">
                        <CalendarDays size={13} className="shrink-0" />
                        <span>{formatDate(event.date)}</span>
                        {!isPast && (
                          <span className="ml-1 text-xs text-md-primary font-semibold">
                            ({days === 0 ? "Today!" : `${days}d away`})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* School count badge */}
                    <div className="shrink-0 text-center bg-md-secondary-container text-md-on-secondary-container rounded-2xl px-4 py-3 min-w-[60px]">
                      <p className="text-2xl font-extrabold leading-none">
                        {schoolCount}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-wide mt-1 opacity-75">
                        Schools
                      </p>
                    </div>
                  </div>

                  {/* Shareable registration link */}
                  <div className="bg-md-surface-container rounded-2xl px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant/60 mb-1">
                      Registration Link
                    </p>
                    <p className="text-xs font-mono text-md-primary break-all select-all">
                      {window.location.origin}/register?event={event.id}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-md-outline/10">
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
                      className="h-10 w-10 flex items-center justify-center rounded-full text-md-on-surface-variant hover:text-md-primary hover:bg-md-primary/10 transition-colors"
                      title="Edit event"
                    >
                      <Pencil size={15} />
                    </button>
                    <Button
                      variant="ghost"
                      className={`flex-1 gap-2 h-10 text-sm font-semibold ${
                        event.is_open
                          ? "text-md-error hover:bg-md-error/10"
                          : "text-emerald-600 hover:bg-emerald-50"
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
                      className="h-10 w-10 flex items-center justify-center rounded-full text-md-on-surface-variant hover:text-md-error hover:bg-md-error/10 transition-colors"
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
