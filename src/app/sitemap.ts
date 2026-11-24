import type { MetadataRoute } from "next";

import { siteOrigin } from "@/lib/siteOrigin";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteOrigin) return [];

  return ["/", "/events"].map((path) => ({
    url: new URL(path, siteOrigin).href,
  }));
}
