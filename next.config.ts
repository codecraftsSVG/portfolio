import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: process.env.GITHUB_PAGES === "true" ? "/portfolio" : "",
  images: { unoptimized: true },
  devIndicators: false,
};

export default nextConfig;
