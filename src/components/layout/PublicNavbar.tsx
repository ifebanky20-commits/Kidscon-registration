import { DesktopPublicNavbar } from "@/components/layout/DesktopPublicNavbar";
import { MobilePublicNavbar } from "@/components/layout/MobilePublicNavbar";

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 bg-brand-wash/95 font-display backdrop-blur-md">
      <nav
        aria-label="Main navigation"
        className="mx-auto max-w-7xl px-5 text-brand-ink sm:px-8 lg:px-12"
      >
        <DesktopPublicNavbar />
        <MobilePublicNavbar />
      </nav>
    </header>
  );
}
