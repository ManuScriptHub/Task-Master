/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api",
  },
  // If you need to handle images from external sources
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;