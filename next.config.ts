import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The standard name is /llms.txt; /llm.txt is a common misspelling, so serve it too.
  async rewrites() {
    return [{ source: "/llm.txt", destination: "/llms.txt" }];
  },
};

export default nextConfig;
