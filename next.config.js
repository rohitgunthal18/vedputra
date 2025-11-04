/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all HTTPS images
      },
    ],
  },
  // Add proper CSP headers to allow Supabase and canvas operations
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://zaqzyfiiapihjiexplqs.supabase.co https://sdk.cashfree.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://zaqzyfiiapihjiexplqs.supabase.co https://*.supabase.co https://api.cashfree.com https://sandbox.cashfree.com https://api.postalpincode.in; worker-src 'self' blob:; frame-src 'self' https://sdk.cashfree.com https://cashfree.com;",
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig

