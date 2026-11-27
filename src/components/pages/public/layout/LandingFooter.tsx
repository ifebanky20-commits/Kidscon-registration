import Link from "next/link";

import { KidsconLogo } from "@/components/KidsconLogo";

export function LandingFooter() {
  return (
    <footer className="font-display">
      <div className="bg-brand-wash">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
          <div>
            <p className="mb-5 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-brand-muted">
              <span
                className="size-1.5 shrink-0 rounded-full bg-brand-primary"
                aria-hidden="true"
              />{" "}
              Their next chapter
            </p>
            <h2 className="text-3xl font-medium leading-[1.15] tracking-[-0.055em] text-brand-ink sm:text-5xl">
              Big memories.
              <br />
              <span className="bg-linear-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
                One simple beginning.
              </span>
            </h2>
          </div>
          <Link
            href="/events"
            className="inline-flex min-h-13 items-center gap-6 rounded-xl bg-brand-action px-6 py-3.5 text-sm font-medium text-white transition hover:bg-brand-action-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
          >
            Find your event
          </Link>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-5 py-9 lg:flex-row lg:items-center sm:px-8 lg:px-12">
        <Link
          href="/"
          aria-label="KIDSCON home"
          className="self-start lg:self-auto"
        >
          <KidsconLogo />
        </Link>
        <div className="flex flex-wrap gap-x-5 gap-y-3 text-[11px] text-brand-muted">
          <Link href="/events" className="hover:text-brand-primary">
            Events
          </Link>
          <Link href="/#our-story" className="hover:text-brand-primary">
            Our story
          </Link>
          <Link href="/#questions" className="hover:text-brand-primary">
            FAQs
          </Link>
          <Link href="/login" className="hover:text-brand-primary">
            Administration
          </Link>
        </div>
        <p className="text-[10px] leading-5 text-brand-muted">
          &copy; {new Date().getFullYear()} KIDSCON
          <br />
          Multicreation International.
        </p>
      </div>
    </footer>
  );
}
