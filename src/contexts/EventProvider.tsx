import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";

import { EventContext } from "@/contexts/event-context";
import { supabase } from "@/lib/supabase";
import type { EventRow } from "@/types/database";

export function EventProvider({ children }: PropsWithChildren) {
  const [events, setEvents] = useState<
    Pick<EventRow, "id" | "name" | "date">[]
  >([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("events")
      .select("id, name, date")
      .order("date", { ascending: false })
      .then(({ data }) => {
        const evts = data || [];
        setEvents(evts);
        // Default to the most recent event
        if (evts.length > 0) setSelectedEventId(evts[0].id);
      });
  }, []);

  return (
    <EventContext.Provider
      value={{ events, selectedEventId, setSelectedEventId }}
    >
      {children}
    </EventContext.Provider>
  );
}
