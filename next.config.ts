import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'eekcnnnfhyjanmjvvbop.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // @ts-ignore - Disable the Next.js Dev Toolbar
  devIndicators: false,
};

export default nextConfig;
