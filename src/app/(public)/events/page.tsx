import type { Metadata } from "next";

import EventsPage from "@/components/pages/public/events/EventsPage";
import { siteOrigin } from "@/lib/siteOrigin";

export const metadata: Metadata = {
  title: "Upcoming School Events",
  description:
    "Browse upcoming KIDSCON events for schools, check dates and venues, and register your group.",
  alternates: siteOrigin ? { canonical: "/events" } : undefined,
};

export default function Page() {
  return <EventsPage />;
}
