/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: true, // For static assets
  },
  // CSP headers moved to middleware.ts for better control
  // async headers() {
  //   return [
  //     {
  //       source: '/:path*',
  //       headers: [
  //         {
  //           key: 'Content-Security-Policy',
  //           value: [
  //             "default-src 'self'",
  //             "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.supabase.co",
  //             "style-src 'self' 'unsafe-inline'",
  //             "img-src 'self' data: blob: https:",
  //             "font-src 'self' data:",
  //             "connect-src 'self' https://*.supabase.co https://api.groq.com wss://*.supabase.co",
  //             "frame-src 'self'",
  //             "object-src 'none'",
  //             "base-uri 'self'",
  //             "form-action 'self'",
  //           ].join('; '),
  //         },
  //       ],
  //     },
  //   ]
  // },
}

module.exports = nextConfig

