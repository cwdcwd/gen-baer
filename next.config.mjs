/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Turbopack due to memory leaks
  turbopack: false,
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
