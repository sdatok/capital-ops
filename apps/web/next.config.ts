import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Matches the deployment path at sonamdatok.com/capital-ops.
  // All internal links and asset paths will automatically be prefixed.
  // Remove this line only if deploying to a dedicated domain (e.g. capital-ops.sonamdatok.com).
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
};

export default nextConfig;
