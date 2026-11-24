import { currentEventDate } from "@/components/pages/public/events/eventDates";
import { useQuery } from "@tanstack/react-query";

import { getPublicEvent } from "@/components/pages/public/events/events";

export function useRegistrationEvent(eventId: string | null) {
  const {
    data: selectedEvent,
    isLoading: eventLoading,
    isError: fetchError,
  } = useQuery({
    queryKey: ["event", eventId],
    enabled: Boolean(eventId),
    queryFn: async ({ signal }) => {
      if (!eventId) throw new Error("No event ID");
      const data = await getPublicEvent(eventId, signal);
      if (!data || !data.is_open || data.date < currentEventDate()) throw new Error("Invalid event");
      return data;
    },
    retry: false,
  });

  const eventError = fetchError || !eventId;

  return { selectedEvent, eventLoading, eventError };
}
