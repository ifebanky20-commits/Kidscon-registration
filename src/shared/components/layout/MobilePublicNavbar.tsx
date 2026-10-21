import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

import { useId, useRef, useState } from "react";

import { KidsconLogo } from "@/shared/components/layout/KidsconLogo";
import { publicNavigationLinks } from "@/shared/lib/publicNavigation";
import ThemeToggle from "@/shared/theme/components/ThemeToggle";

export function MobilePublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      className="lg:hidden"
      onKeyDown={(event) => {
        if (event.key === "Escape" && menuOpen) {
          setMenuOpen(false);
          toggleRef.current?.focus();
        }
      }}
    >
      <div className="flex min-h-20 items-center justify-between gap-3 sm:min-h-24">
        <Link
          to="/"
          aria-label="KIDSCON home"
          onClick={() => setMenuOpen(false)}
          className="flex shrink-0 items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
        >
          <KidsconLogo />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle className="bg-transparent text-brand-muted ring-brand-line hover:bg-brand-surface focus:ring-brand-primary" />
          <button
            ref={toggleRef}
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex size-10 items-center justify-center rounded-full border border-brand-line transition hover:bg-brand-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            {menuOpen ? (
              <X size={18} aria-hidden="true" />
            ) : (
              <Menu size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
      <div
        id={menuId}
        hidden={!menuOpen}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-5rem)] overflow-y-auto border-y border-brand-line bg-brand-wash px-5 pb-4 pt-2 shadow-lg sm:max-h-[calc(100dvh-6rem)] sm:px-8"
      >
        {publicNavigationLinks.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            onClick={() => setMenuOpen(false)}
            className="block rounded-lg px-2 py-3 text-sm text-brand-muted hover:bg-brand-surface hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-brand-primary"
          >
            {link.label}
          </Link>
        ))}
        <Link
          to="/events"
          onClick={() => setMenuOpen(false)}
          className="mt-3 flex min-h-11 items-center justify-center rounded-xl bg-brand-action px-5 text-sm font-semibold text-white transition hover:bg-brand-action-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
        >
          Find an event
        </Link>
      </div>
    </div>
  );
}
