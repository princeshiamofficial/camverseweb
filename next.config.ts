import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.10.115",
    "192.168.10.115:3000",
    "localhost:3000",
    "localhost",
  ],
};

export default nextConfig;
