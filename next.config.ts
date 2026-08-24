import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Foto produk dikirim sebagai data-URI base64 lewat server action (default 1mb).
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
