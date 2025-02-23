/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_KRATOS_URL: "http://localhost:4433",
  },
  async rewrites() {
    return [
      {
        source: '/api/kratos/:path*',
        destination: 'http://localhost:4433/:path*',
      },
    ]
  },
};

module.exports = nextConfig;