import { CalendarDays, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

import { useEffect, useState } from "react";

import { CountdownUnit } from "@/components/public/events/CountdownUnit";
import type { EventRow } from "@/types/database";
function getTimeLeft(dateStr: string) {
  const target = new Date(dateStr + "T00:00:00");
  const diff = target.getTime() - Date.now();
  if (diff <= 0)
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}
interface EventCardProps {
  event: Pick<EventRow, "id" | "name" | "location" | "date">;
  index?: number;
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(event.date));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(event.date)), 1000);
    return () => clearInterval(id);
  }, [event.date]);

  const formattedDate = new Date(event.date + "T00:00:00").toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );

  const date = new Date(event.date + "T00:00:00");
  
  return (
    <article
      className={`group flex flex-col rounded-[1.5rem] border border-brand-line p-6 transition-shadow duration-300 hover:shadow-[0_12px_40px_-24px_rgb(20_70_40/0.25)] sm:p-8 ${index % 2 === 0 ? "bg-brand-surface" : "bg-brand-soft"}`}
    >
      <div className="mb-7 flex items-start justify-between gap-4 border-b border-brand-line pb-6">
        <div className="flex items-center gap-3">
          <span className="text-5xl font-medium leading-none tracking-[-0.065em] text-brand-ink">
            {date.getDate().toString().padStart(2, "0")}
          </span>
          <span className="text-[10px] font-medium uppercase leading-5 tracking-wider text-brand-muted">
            {date.toLocaleDateString("en-US", { month: "short" })}
            <br />
            {date.getFullYear()}
          </span>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-brand-line px-2.5 py-1.5 text-[9px] font-medium text-brand-muted">
          <span className="size-1.5 rounded-full bg-brand-primary" />
          Registration open
        </span>
      </div>
      <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-primary">
        KIDSCON events
      </p>
      <h3 className="break-words text-2xl font-medium leading-tight tracking-[-0.04em] text-brand-ink sm:text-[1.75rem]">
        {event.name}
      </h3>
      <div className="mt-5 space-y-3 text-xs text-brand-muted">
        <p className="flex items-center gap-2.5">
          <MapPin
            size={15}
            strokeWidth={1.5}
            className="shrink-0"
            aria-hidden="true"
          />
          {event.location}
        </p>
        <p className="flex items-center gap-2.5">
          <CalendarDays
            size={15}
            strokeWidth={1.5}
            className="shrink-0"
            aria-hidden="true"
          />
          {formattedDate}
        </p>
      </div>
      {!timeLeft.expired && (
        <div className="mt-7 border-t border-brand-line pt-5">
          <p className="mb-3 text-[9px] font-medium uppercase tracking-[0.15em] text-brand-muted">
            Getting closer, every second
          </p>
          <div className="flex gap-3">
            <CountdownUnit value={timeLeft.days} label="Days" />
            <CountdownUnit value={timeLeft.hours} label="Hours" />
            <CountdownUnit value={timeLeft.minutes} label="Mins" />
            <CountdownUnit value={timeLeft.seconds} label="Secs" />
          </div>
        </div>
      )}
      <div className="mt-auto pt-7">
        <Link
          to={`/events/${event.id}`}
          aria-label={`View details for ${event.name}`}
          className="text-center py-3 block gap-4 rounded-full bg-brand-action py-2 pl-5 pr-2 text-xs font-medium text-white transition hover:bg-brand-action-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
        >
          View event details
        </Link>
      </div>
    </article>
  );
}
