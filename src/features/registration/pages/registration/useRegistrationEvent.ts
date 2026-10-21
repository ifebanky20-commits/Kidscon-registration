import { useQuery } from "@tanstack/react-query";

import { getPublicEvent } from "@/features/events/services/events";

export function useRegistrationEvent(eventId: string | null) {
  const {
    data: selectedEvent,
    isLoading: eventLoading,
    isError: fetchError,
  } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      if (!eventId) throw new Error("No event ID");
      const data = await getPublicEvent(eventId);
      if (!data || !data.is_open) throw new Error("Invalid event");
      return data;
    },
    retry: false,
  });

  const eventError = fetchError || !eventId;

  return { selectedEvent, eventLoading, eventError };
}
