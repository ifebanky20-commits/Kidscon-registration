"use client";

import dynamic from "next/dynamic";
import RegistrationSkeleton from "@/components/pages/registration/RegistrationSkeleton";

const RegistrationPage = dynamic(() => import("@/components/pages/registration/RegistrationPage"), {
  ssr: false,
  loading: () => <RegistrationSkeleton />,
});

export default function Page() {
  return <RegistrationPage />;
}
