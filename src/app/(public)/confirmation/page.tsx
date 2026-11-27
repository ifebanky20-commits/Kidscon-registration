"use client";

import dynamic from "next/dynamic";

const ConfirmationPage = dynamic(() => import("@/components/pages/registration/ConfirmationPage"), {
  ssr: false,
});

export default function Page() {
  return <ConfirmationPage />;
}
