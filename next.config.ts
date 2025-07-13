// next.config.js
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly type nextConfig
  images: {
    remotePatterns: [
      {
        protocol: "https", // Specify the protocol (e.g., 'https', 'http')
        hostname: "firebasestorage.googleapis.com", // Your primary Firebase Storage domain
        port: "", // Leave empty unless a specific port is used
        pathname: "/**", // Allow any path under this hostname
      },
      {
        protocol: "https",
        hostname: "sokrati-9e6dc.appspot.com", // Firebase also uses appspot.com for storage
        port: "",
        pathname: "/**",
      },
      // If you have other external image sources (e.g., Google user avatars from lh3.googleusercontent.com),
      // you would add them here as well:
      // {
      //   protocol: 'https',
      //   hostname: 'lh3.googleusercontent.com',
      //   port: '',
      //   pathname: '/**',
      // },
    ],
  },
  // Ensure your ESLint configuration is also compatible with this file (e.g., for 'import type')
  eslint: {
    // Warning: Dangerously allow production builds to successfully complete even if
    // your project has ESLint errors.
    // This is generally not recommended as it can hide issues.
    // Instead, configure specific ESLint rules to 'warn' in .eslintrc.json.
    // For build, ensure this is true or all ESLint issues are warnings/off.
    ignoreDuringBuilds: true, // Keep this if you want to bypass ESLint errors during build
  },
  // Other Next.js configurations...
};

export default nextConfig;
