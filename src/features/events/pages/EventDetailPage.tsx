import { ClipboardList, GraduationCap, Ticket } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { useState } from "react";

import eventPhoto from "@/assets/event.jpg";
import { EventPageState } from "@/features/events/components/EventPageState";
import { EventRegistrationPanel } from "@/features/events/components/EventRegistrationPanel";
import { usePublicEvent } from "@/features/events/hooks/usePublicEvents";

const preparation = [
  {
    icon: GraduationCap,
    title: "Your school details",
    description:
      "School name, category, address, and a contact person we can reach.",
  },
  {
    icon: ClipboardList,
    title: "Your students and teachers",
    description:
      "Student names, genders, and classes, plus the names of accompanying teachers. You can upload a student list during registration.",
  },
  {
    icon: Ticket,
    title: "Your entry ticket",
    description:
      "After submitting your registration, download your school's PDF ticket and keep it ready for arrival.",
  },
];

export default function EventDetailPage() {
  const { id } = useParams();
  const { data: event, isPending, isError, refetch } = usePublicEvent(id);
  const [today] = useState(() => new Date().toISOString().slice(0, 10));

  if (isPending) return <EventPageState loading />;

  if (isError)
    return (
      <EventPageState
        title="We couldn't load this event."
        message="Please check your connection and try again."
        onRetry={() => {
          void refetch();
        }}
      />
    );

  if (!event)
    return (
      <EventPageState
        title="Event not found."
        message="This link may be out of date. Browse upcoming events to find your school's next outing."
      />
    );
  const registrationOpen = event.is_open && event.date >= today;

  return (
    <div className="font-display text-brand-ink">
      <header className="bg-brand-wash">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16 lg:px-12">
          <p className="mb-4 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-brand-primary">
            <span className="size-1.5 rounded-full bg-brand-primary" />
            KIDSCON events
          </p>
          <h1 className="max-w-4xl break-words text-4xl font-medium leading-[1.12] tracking-[-0.055em] sm:text-6xl">
            {event.name}
          </h1>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[1.4fr_1fr] lg:gap-14 lg:px-12">
        <div>
          <figure>
            <img
              src={eventPhoto}
              width={1024}
              height={681}
              alt="Students, teachers, and families gathered at a KIDSCON event"
              className="aspect-[1.6] w-full rounded-2xl object-cover"
            />
            <figcaption className="mt-3 text-[10px] text-brand-muted">
              A glimpse of a KIDSCON event.
            </figcaption>
          </figure>
          <section aria-labelledby="about-event" className="py-9">
            <h2
              id="about-event"
              className="text-2xl font-medium tracking-tight"
            >
              A day beyond the classroom.
            </h2>
            <p className="mt-4 text-sm leading-8 text-brand-muted">
              Join your school community for {event.name} in {event.location}.
              Register your students and accompanying teachers together, and get
              ready for your next KIDSCON event.
            </p>
          </section>
          <section
            aria-labelledby="prepare-heading"
            className="border-t border-brand-line pt-8"
          >
            <h2
              id="prepare-heading"
              className="text-xl font-medium tracking-tight"
            >
              Before you register
            </h2>
            <div className="mt-6 space-y-6">
              {preparation.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand-primary">
                    <Icon size={19} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-sm font-medium">{title}</h3>
                    <p className="mt-2 text-sm leading-7 text-brand-muted">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        <EventRegistrationPanel
          event={event}

registrationOpen={registrationOpen}
        />
      </div>
    </div>
  );
}
