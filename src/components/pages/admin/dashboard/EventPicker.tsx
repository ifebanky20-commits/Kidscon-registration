import { ChevronDown } from 'lucide-react';

import type { EventRow } from "@/types/database";

interface EventPickerProps {
  events: Pick<EventRow, 'id' | 'name'>[];
  selectedId: string | null;
  onChange: (id: string | null) => void;
}

export function EventPicker({
  events,
  selectedId,
  onChange,
}: EventPickerProps) {
  return (
    <div className="relative inline-block max-w-full">
      <select
        aria-label="Filter by event"
        value={selectedId || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="appearance-none h-10 pl-4 pr-10 max-w-full rounded-xl border border-brand-line bg-brand-surface text-brand-ink text-sm font-medium focus:outline-none focus:ring-2 focus:ring-md-primary/40 transition cursor-pointer"
      >
        <option value="">All Events</option>
        {events.map((ev) => (
          <option key={ev.id} value={ev.id}>{ev.name}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-md-on-surface-variant pointer-events-none" />
    </div>
  );
}
