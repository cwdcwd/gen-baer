/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.hardcover.app",
      },
      {
        protocol: "https",
        hostname: "assets.hardcover.app",
      },
      {
        protocol: "https",
        hostname: "s.gravatar.com",
      },
    ],
  },
}

export default nextConfig
