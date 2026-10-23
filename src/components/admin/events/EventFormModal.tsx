import { Loader2, Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { EventWithCounts } from "@/types/database";
type EventFormValues = Pick<EventWithCounts, "name" | "location" | "date">;

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: EventFormValues;
  onFormChange: (form: EventFormValues) => void;
  busy: boolean;
  onSubmit: () => Promise<void>;
  mode: "create" | "edit";
  error?: string;
}

export function EventFormModal({
  isOpen,
  onClose,
  form,
  onFormChange,
  busy,
  onSubmit,
  mode,
  error,
}: EventFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      busy={busy}
      description={mode === "edit" ? "Update the details shown to schools on the event page." : "Set the details for your next KIDSCON experience. Registration opens when you create the event."}
      title={mode === "edit" ? "Edit Event" : "Create New Event"}
    >
      <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); if (!busy && form.name.trim() && form.location.trim() && form.date) void onSubmit(); }}>
        {error && <p role="alert" className="rounded-xl bg-md-error/10 p-3 text-sm text-md-error">{error}</p>}
        <fieldset disabled={busy} className="space-y-5 disabled:opacity-60">
        <div className="flex flex-col gap-2">
          <label htmlFor="event-name" className="text-xs font-medium uppercase tracking-widest text-brand-muted">
            Event / Program Name
          </label>
          <input id="event-name" required
            type="text"
            value={form.name}
            onChange={(e) => onFormChange({ ...form, name: e.target.value })}
            placeholder="e.g. KIDSCON Lagos 2026"
            className="h-12 px-4 rounded-xl bg-brand-wash border border-brand-line text-brand-ink placeholder:text-brand-muted/40 focus:outline-none focus:ring-2 focus:ring-md-primary/40 text-sm font-medium transition"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="event-location" className="text-xs font-medium uppercase tracking-widest text-brand-muted">
            Location / Venue
          </label>
          <input id="event-location" required
            type="text"
            value={form.location}
            onChange={(e) =>
              onFormChange({ ...form, location: e.target.value })
            }
            placeholder="e.g. Eko Hotel, Lagos"
            className="h-12 px-4 rounded-xl bg-brand-wash border border-brand-line text-brand-ink placeholder:text-brand-muted/40 focus:outline-none focus:ring-2 focus:ring-md-primary/40 text-sm font-medium transition"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="event-date" className="text-xs font-medium uppercase tracking-widest text-brand-muted">
            Event Date
          </label>
          <input id="event-date" required
            type="date"
            value={form.date}
            onChange={(e) => onFormChange({ ...form, date: e.target.value })}
            className="h-12 px-4 rounded-xl bg-brand-wash border border-brand-line text-brand-ink focus:outline-none focus:ring-2 focus:ring-md-primary/40 text-sm font-medium transition"
          />
        </div>

        </fieldset>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-brand-line">
          <Button type="button" disabled={busy} className="rounded-xl" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              busy || !form.name.trim() || !form.location.trim() || !form.date
            }
            className="rounded-xl gap-2"
          >
            {busy ? (
              <Loader2 size={15} className="animate-spin" />
            ) : mode === "edit" ? (
              <Pencil size={15} />
            ) : (
              <Plus size={15} />
            )}
            {busy
              ? mode === "edit"
                ? "Saving…"
                : "Creating…"
              : mode === "edit"
                ? "Save Changes"
                : "Create Event"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
