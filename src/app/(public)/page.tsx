import type { Metadata } from "next";

import LandingPage from "@/components/pages/public/landing/LandingPage";
import { siteOrigin } from "@/lib/siteOrigin";

export const metadata: Metadata = {
  title: "School Trips and Educational Events",
  description:
    "Find educational outings for schools in Nigeria. Explore upcoming KIDSCON events and register your students and teachers online.",
  alternates: siteOrigin ? { canonical: "/" } : undefined,
};

export default function Page() {
  return <LandingPage />;
}
