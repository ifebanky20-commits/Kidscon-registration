import { CalendarDays, MapPin, Ticket, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

import { MAX_STUDENTS } from "@/schemas/registration";
import type { EventRow } from "@/shared/types/database";

interface EventRegistrationPanelProps {
  event: EventRow;
  registrationOpen: boolean;
}

export function EventRegistrationPanel({ event, registrationOpen }: EventRegistrationPanelProps) {
  const date = new Date(`${event.date}T00:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return (
    <aside aria-labelledby="registration-heading" className="self-start rounded-2xl border border-brand-line bg-brand-surface p-6 sm:p-8 lg:sticky lg:top-28">
      <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-brand-tint px-3 py-2 text-[10px] font-medium text-brand-primary"><span className="size-1.5 rounded-full bg-brand-primary" />{registrationOpen ? "Registration open" : "Registration closed"}</p>
      <h2 id="registration-heading" className="text-2xl font-medium tracking-tight">Bring your school along.</h2>
      <p className="mt-3 text-sm leading-7 text-brand-muted">An event for students and the teachers who help them grow.</p>
      <dl className="my-6 space-y-5 border-y border-brand-line py-6">
        <div className="flex gap-3"><CalendarDays size={18} className="mt-0.5 shrink-0 text-brand-primary" aria-hidden="true" /><div><dt className="text-[10px] uppercase tracking-wider text-brand-muted">Date</dt><dd className="mt-1 text-sm leading-6">{date}</dd></div></div>
        <div className="flex gap-3"><MapPin size={18} className="mt-0.5 shrink-0 text-brand-primary" aria-hidden="true" /><div><dt className="text-[10px] uppercase tracking-wider text-brand-muted">Location</dt><dd className="mt-1 text-sm leading-6">{event.location}</dd></div></div>
        <div className="flex gap-3"><UsersRound size={18} className="mt-0.5 shrink-0 text-brand-primary" aria-hidden="true" /><div><dt className="text-[10px] uppercase tracking-wider text-brand-muted">School group</dt><dd className="mt-1 text-sm leading-6">Up to {MAX_STUDENTS} students, plus accompanying teachers</dd></div></div>
      </dl>
      {registrationOpen ? <Link to={`/register?event=${event.id}`} className="flex min-h-12 items-center justify-center gap-3 rounded-xl bg-brand-action px-5 text-sm font-medium text-white hover:bg-brand-action-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"><Ticket size={18} aria-hidden="true" />Register your school</Link> : <button type="button" disabled className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-brand-action/65 px-5 text-sm font-medium text-white"><Ticket size={18} aria-hidden="true" />Registration closed</button>}
      <p className="mt-4 text-xs leading-6 text-brand-muted">{registrationOpen ? "Have your school, student, and teacher details ready before you begin." : "This event is no longer accepting registrations. Explore other upcoming events."}</p>
    </aside>
  );
}
