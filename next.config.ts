import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 사용자 홈의 package-lock.json이 루트로 잡히지 않게 이 저장소로 고정
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.simpleicons.org",
      },
    ],
  },
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
