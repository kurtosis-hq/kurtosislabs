import type { NextConfig } from "next";

// Static export: the Ratings pages are built as plain HTML under /ratings so they can sit inside
// the Kurtosis Labs landing site on any static host.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // scripts, styles and fonts are served from /ratings-static/_next (some hosts reserve top-level names starting with "_")
  assetPrefix: "/ratings-static",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
