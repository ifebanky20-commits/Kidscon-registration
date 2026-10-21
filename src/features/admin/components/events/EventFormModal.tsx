import { Loader2, Pencil, Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { Modal } from "@/shared/components/ui/Modal";
import type { EventWithCounts } from "@/shared/types/database";
type EventFormValues = Pick<EventWithCounts, "name" | "location" | "date">;

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: EventFormValues;
  onFormChange: (form: EventFormValues) => void;
  busy: boolean;
  onSubmit: () => Promise<void>;
  mode: "create" | "edit";
}

export function EventFormModal({
  isOpen,
  onClose,
  form,
  onFormChange,
  busy,
  onSubmit,
  mode,
}: EventFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "edit" ? "Edit Event" : "Create New Event"}
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-md-on-surface-variant">
            Event / Program Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => onFormChange({ ...form, name: e.target.value })}
            placeholder="e.g. KIDSCON Lagos 2026"
            className="h-12 px-4 rounded-xl bg-md-surface-container border border-md-outline/20 text-md-on-background placeholder:text-md-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-md-primary/40 text-sm font-medium transition"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-md-on-surface-variant">
            Location / Venue
          </label>
          <input
            type="text"
            value={form.location}
            onChange={(e) =>
              onFormChange({ ...form, location: e.target.value })
            }
            placeholder="e.g. Eko Hotel, Lagos"
            className="h-12 px-4 rounded-xl bg-md-surface-container border border-md-outline/20 text-md-on-background placeholder:text-md-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-md-primary/40 text-sm font-medium transition"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-md-on-surface-variant">
            Event Date
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => onFormChange({ ...form, date: e.target.value })}
            className="h-12 px-4 rounded-xl bg-md-surface-container border border-md-outline/20 text-md-on-background focus:outline-none focus:ring-2 focus:ring-md-primary/40 text-sm font-medium transition"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-md-outline/10">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={
              busy || !form.name.trim() || !form.location.trim() || !form.date
            }
            className="gap-2"
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
      </div>
    </Modal>
  );
}
