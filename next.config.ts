import type { NextConfig } from "next";

const nextConfig = {
  images: {
    domains: [
      "firebasestorage.googleapis.com", // Add this line
      "sokrati-9e6dc.appspot.com",
    ],
  },
};
export default nextConfig;
