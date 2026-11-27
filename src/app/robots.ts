import type { MetadataRoute } from "next";

import { siteOrigin } from "@/lib/siteOrigin";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: siteOrigin ? new URL("/sitemap.xml", siteOrigin).href : undefined,
  };
}
