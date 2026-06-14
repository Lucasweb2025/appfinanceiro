import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? "/appfinanceiro" : "";

const nextConfig: NextConfig = {
  ...(isGithubPages ? { output: "export" as const } : {}),
  ...(basePath
    ? {
        basePath,
        assetPrefix: `${basePath}/`,
        trailingSlash: true,
      }
    : {}),
  /** Painel de desenvolvimento do Next.js (só com npm run dev) */
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;
