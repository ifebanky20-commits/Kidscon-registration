import {
  CalendarDays,
  GraduationCap,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

import heroClassroom from "@/assets/hero-classroom.jpg";
import type { EventRow } from "@/shared/types/database";

interface HeroExperienceVisualProps {
  featuredEvent?: Pick<EventRow, "id" | "name" | "location" | "date">;
}

export function HeroExperienceVisual({
  featuredEvent,
}: HeroExperienceVisualProps) {
  const eventDate = featuredEvent
    ? new Date(`${featuredEvent.date}T00:00:00`).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;
  const actionClassName =
    "mt-5 flex min-h-11 items-center justify-between gap-4 border-t border-white/15 pt-4 text-xs font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-highlight";

  return (
    <div className="relative mx-auto w-full max-w-xl pb-36 pl-6 pt-8 sm:pb-32 sm:pl-10 lg:pb-36">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-brand-tint shadow-[0_24px_70px_-35px_rgb(20_70_40/0.3)]">
        <img
          src={heroClassroom}
          alt="Schoolchildren in uniform seated at desks in a classroom in Lagos, Nigeria"
          fetchPriority="high"
          width={1400}
          height={788}
          className="aspect-[1.12] w-full object-cover object-[48%_center] sm:aspect-[1.2] lg:aspect-[1.06]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/15 via-transparent to-transparent" />
      </div>

      <div className="absolute -right-3 sm:-right-6 top-2 z-10 flex items-center gap-3 rounded-2xl border border-brand-line bg-brand-surface/95 px-4 py-3 shadow-[0_8px_30px_-15px_rgb(20_70_40/0.2)] backdrop-blur-sm ">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-tint text-brand-primary">
          <GraduationCap size={21} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-semibold text-brand-ink">
            Made for schools
          </p>
          <p className="mt-1 text-[10px] text-brand-muted">
            Students. Teachers. Together.
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-6 z-10 rounded-[1.5rem] bg-brand-charcoal p-6 text-white shadow-[0_20px_55px_-25px_rgb(25_40_25/0.45)] sm:right-14 sm:p-7">
        <p className="mb-3 flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-[#FFDEB6]">
          <span className="size-1.5 rounded-full bg-[#F6871F]" />
          {featuredEvent ? "Your next event" : "Beyond the classroom"}
        </p>
        <h2 className="max-w-sm text-xl font-medium leading-tight tracking-[-0.035em] sm:text-2xl">
          {featuredEvent?.name ?? "Their next adventure starts here."}
        </h2>
        {featuredEvent ? (
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-white/70">
            <p className="flex items-center gap-1.5">
              <CalendarDays size={13} aria-hidden="true" />
              {eventDate}
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin size={13} aria-hidden="true" />
              {featuredEvent.location}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-xs leading-6 text-white/65">
            Find an event that brings your whole school together.
          </p>
        )}
        {featuredEvent ? (
          <Link
            to={`/events/${featuredEvent.id}`}
            className={actionClassName}
          >
            View this event <CalendarDays size={17} aria-hidden="true" />
          </Link>
        ) : (
          <a href="#events" className={actionClassName}>
            Explore KIDSCON events{" "}
            <CalendarDays size={17} aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}
