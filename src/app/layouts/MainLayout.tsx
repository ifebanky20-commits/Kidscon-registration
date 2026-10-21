import { Outlet, useLocation } from "react-router-dom";

import { Suspense, useEffect } from "react";

import { LandingFooter } from "@/shared/components/layout/LandingFooter";
import { PublicNavbar } from "@/shared/components/layout/PublicNavbar";
import PageLoader from "@/shared/components/ui/PageLoader";

export default function MainLayout() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <div className="flex min-h-screen flex-col bg-brand-canvas text-brand-ink">
      <PublicNavbar />
      <main id="main-content" className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <LandingFooter />
    </div>
  );
}
