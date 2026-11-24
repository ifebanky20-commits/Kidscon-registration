import { useQuery } from "@tanstack/react-query";

import type { EventRow } from "@/types/database";

import { getPublicEvent, getPublicEvents } from "@/components/pages/public/events/events";

export function usePublicEvents() {
  return useQuery({ queryKey: ["public-events"], queryFn: getPublicEvents });
}

export function usePublicEvent(id: string | undefined, initialEvent?: EventRow | null) {
  return useQuery({
    queryKey: ["public-event", id],
    queryFn: ({ signal }) => getPublicEvent(id!, signal),
    initialData: initialEvent,
    staleTime: 30_000,
    enabled: Boolean(id),
  });
}
