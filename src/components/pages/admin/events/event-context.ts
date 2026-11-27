import type { Dispatch, SetStateAction } from "react";
import { createContext, useContext } from "react";

type EventSummary = { id: string; name: string; date: string };

interface EventContextValue {
  events: EventSummary[];
  selectedEventId: string | null;
  setSelectedEventId: Dispatch<SetStateAction<string | null>>;
}

export const EventContext = createContext<EventContextValue | null>(null);

export function useEvent() {
  const context = useContext(EventContext);
  if (!context)
    throw new Error("useEvent must be used within an EventProvider");
  return context;
}
