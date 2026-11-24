import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

import { AppProviders } from "@/providers/AppProviders";
import { AppToaster } from "@/components/ui/AppToaster";
import { siteOrigin } from "@/lib/siteOrigin";
import "./global.css";

export const metadata: Metadata = {
  metadataBase: siteOrigin ? new URL(siteOrigin) : undefined,
  title: { default: "KIDSCON", template: "%s | KIDSCON" },
  description:
    "Explore KIDSCON school events and register students and teachers for educational experiences in Nigeria.",
  openGraph: {
    type: "website",
    siteName: "KIDSCON",
    locale: "en_NG",
    images: siteOrigin ? [{
      url: "/kidscon-social.jpg",
      width: 1200,
      height: 630,
      alt: "Students and teachers at a KIDSCON event",
    }] : undefined,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html
      lang="en"
      className="font-roboto bg-md-background text-md-on-background [color-scheme:light] dark:[color-scheme:dark] motion-reduce:[&_*]:animate-none! motion-reduce:[&_*]:transition-none! motion-reduce:[&_*]:scroll-auto!"
    >
      <body className="antialiased tracking-normal print:bg-white! print:[-webkit-print-color-adjust:exact] print:[print-color-adjust:exact]">
        <AppProviders>
          {children}
          <AppToaster />
        </AppProviders>
      </body>
    </html>
  );
}
