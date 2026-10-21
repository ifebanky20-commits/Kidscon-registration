import { Link } from "react-router-dom";

import { KidsconLogo } from "@/shared/components/layout/KidsconLogo";
import { publicNavigationLinks } from "@/shared/lib/publicNavigation";
import ThemeToggle from "@/shared/theme/components/ThemeToggle";

export function DesktopPublicNavbar() {
  return (
    <div className="hidden min-h-24 items-center justify-between gap-3 lg:flex">
      <Link
        to="/"
        aria-label="KIDSCON home"
        className="flex shrink-0 items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
      >
        <KidsconLogo />
      </Link>
      <div className="flex items-center gap-6 text-[11px] text-brand-muted">
        {publicNavigationLinks.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className="py-3 transition hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle className="bg-transparent text-brand-muted ring-brand-line hover:bg-brand-surface focus:ring-brand-primary" />
        <Link
          to="/events"
          className="inline-flex min-h-10 items-center rounded-xl bg-brand-action px-5 text-[11px] font-semibold text-white transition hover:bg-brand-action-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
        >
          Find an event
        </Link>
      </div>
    </div>
  );
}
