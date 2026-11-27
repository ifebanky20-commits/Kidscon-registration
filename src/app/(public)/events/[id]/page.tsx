import type { Metadata } from "next";
import { cache } from "react";

import EventDetailPage from "@/components/pages/public/events/EventDetailPage";
import { getPublicEvent } from "@/components/pages/public/events/events";
import { siteOrigin } from "@/lib/siteOrigin";

type Props = { params: Promise<{ id: string }> };

const readEvent = cache(async (id: string) => {
  if (!/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(id)) return null;

  try {
    return await getPublicEvent(id, AbortSignal.timeout(3_000));
  } catch {
    return undefined;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await readEvent(id);

  if (!event) {
    return {
      title: event === null ? "Event Not Found" : "School Event",
      robots: event === null ? { index: false, follow: true } : undefined,
    };
  }

  return {
    title: event.name,
    description: `Explore ${event.name} in ${event.location} on ${event.date}. Find event details and school registration information.`,
    alternates: siteOrigin ? { canonical: `/events/${event.id}` } : undefined,
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <EventDetailPage initialEvent={await readEvent(id)} />;
}
