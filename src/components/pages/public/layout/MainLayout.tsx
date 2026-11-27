import type { PropsWithChildren } from "react";

import { LandingFooter } from "@/components/pages/public/layout/LandingFooter";
import { PublicNavbar } from "@/components/pages/public/layout/PublicNavbar";

export default function MainLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col bg-brand-canvas text-brand-ink">
      <PublicNavbar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}
