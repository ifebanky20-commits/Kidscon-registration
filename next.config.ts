import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{
      source: "/admin/school/:id",
      destination: "/admin/schools/:id",
      permanent: true,
    }];
  },
  async headers() {
    return ["/admin/:path*", "/login", "/print/:path*", "/register", "/confirmation"].map(
      (source) => ({
        source,
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      }),
    );
  },
};

export default nextConfig;
