import { Check } from "lucide-react";

import { HeroExperienceVisual } from "@/components/pages/public/landing/HeroExperienceVisual";
import type { EventRow } from "@/types/database";

interface LandingHeroProps {
  featuredEvent?: Pick<EventRow, "id" | "name" | "location" | "date">;
}

const FEATURES = [
  "Primary & secondary schools",
  "Simple online registration",
  "Digital entry tickets",
];

export function LandingHero({ featuredEvent }: LandingHeroProps) {
  return (
    <section aria-labelledby="hero-heading" className="bg-brand-wash">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:px-12 lg:pb-24 lg:pt-20">
        <div>
          <p className="mb-6 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.17em] text-brand-muted">
            <span
              className="size-1.5 shrink-0 rounded-full bg-brand-primary"
              aria-hidden="true"
            />{" "}
            A world beyond the classroom
          </p>
          <h1
            id="hero-heading"
            className="max-w-xl text-[clamp(2.8rem,5.7vw,5.25rem)] font-medium leading-[1.1] tracking-[-0.065em] text-brand-ink"
          >
            <span className="bg-linear-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
              Little minds.
            </span>
            <br />
            A world of
            <br />
            possibilities.
          </h1>
          <p className="mt-7 max-w-md text-sm leading-7 text-brand-muted sm:text-base sm:leading-8">
            Bring learning to life with KIDSCON. Discover events that spark
            curiosity, build confidence, and stay with your students long after
            the day is over.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#events"
              className="inline-flex min-h-13 items-center gap-4 rounded-xl bg-brand-action px-5 py-3.5 text-sm font-medium text-white shadow-[0_7px_20px_-10px_rgb(0_124_67/0.6)] transition hover:bg-brand-action-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
            >
              Find an event
            </a>
            <a
              href="#how-it-works"
              className="inline-flex min-h-13 items-center gap-3 rounded-xl border border-brand-line px-5 py-3.5 text-sm font-medium text-brand-ink transition hover:bg-brand-surface/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
            >
              How it works
            </a>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-[10px] text-brand-muted">
            {FEATURES.map((label) => (
              <p key={label} className="flex items-center gap-1.5">
                <Check
                  size={12}
                  className="text-brand-primary"
                  aria-hidden="true"
                />
                {label}
              </p>
            ))}
          </div>
        </div>
        <HeroExperienceVisual featuredEvent={featuredEvent} />
      </div>
    </section>
  );
}
