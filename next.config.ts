import type { NextConfig } from "next";

/**
 * Two build targets share one config:
 *  - default (`next build` / `next start`): a normal server build, used for
 *    hosting the installable PWA.
 *  - static (`BUILD_STATIC=1 next build`): a fully static export to `out/`,
 *    used to package the app natively with Capacitor (see docs/PACKAGING.md).
 *    Export has no Node server, so image optimization is disabled and routes
 *    are emitted as folders with trailing slashes for file-based serving.
 */
const isStatic = process.env.BUILD_STATIC === "1";

const nextConfig: NextConfig = isStatic
  ? {
      output: "export",
      trailingSlash: true,
      images: { unoptimized: true },
    }
  : {};

export default nextConfig;
