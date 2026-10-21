import { useQuery } from "@tanstack/react-query";

import { getPublicEvent, getPublicEvents } from "@/features/events/services/events";

export function usePublicEvents() {
  return useQuery({ queryKey: ["public-events"], queryFn: getPublicEvents });
}

export function usePublicEvent(id: string | undefined) {
  return useQuery({
    queryKey: ["public-event", id],
    queryFn: () => getPublicEvent(id!),
    enabled: Boolean(id),
  });
}
