/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";



/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: {
    // For remote images from external domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com', // Your external domain
        port: '',
        pathname: '/images/**', // Specific path pattern
      },
    ],

    // For local images (optional but recommended)
    domains: ['localhost'], // For development
    // If using a custom domain in production:
    // domains: ['your-production-domain.com'],

    // Optional: Configure device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

export default config;
