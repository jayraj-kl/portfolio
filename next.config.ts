import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AVIF first: the footer's picture is the one large image, and it comes out about a third
  // smaller than WebP. Browsers without AVIF are sent WebP.
  images: { formats: ["image/avif", "image/webp"] },
  // The standard name is /llms.txt; /llm.txt is a common misspelling, so serve it too.
  async rewrites() {
    return [{ source: "/llm.txt", destination: "/llms.txt" }];
  },
};

export default nextConfig;
