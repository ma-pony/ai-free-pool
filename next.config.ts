import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';
// import { withSentryConfig } from '@sentry/nextjs'; // Sentry disabled
import createNextIntlPlugin from 'next-intl/plugin';
import './src/libs/Env';

// Conditionally import WebpackObfuscator only if it's available
let WebpackObfuscator: any;
try {
  WebpackObfuscator = require('webpack-obfuscator');
} catch {
  // WebpackObfuscator not available, will skip obfuscation
}

// Define the base Next.js configuration
const baseConfig: NextConfig = {
  devIndicators: {
    position: 'bottom-right',
  },
  poweredByHeader: false,
  reactStrictMode: true,
  reactCompiler: true,
  outputFileTracingIncludes: {
    '/': ['./migrations/**/*'],
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  /**
   * Image optimization configuration
   * Validates: Requirements 19.1, 19.3
   *
   * Optimizes images for better performance:
   * - Converts images to WebP format automatically
   * - Enables lazy loading by default
   * - Configures remote image domains
   * - Sets quality and device sizes for responsive images
   */
  images: {
    formats: ['image/webp', 'image/avif'], // Modern formats for better compression
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Responsive breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Icon and thumbnail sizes
    minimumCacheTTL: 60 * 60 * 24 * 30, // Cache images for 30 days
    dangerouslyAllowSVG: true, // Allow SVG images (for logos)
    contentDispositionType: 'attachment', // Security: force download for unknown types
    contentSecurityPolicy: 'default-src \'self\'; script-src \'none\'; sandbox;', // Security for SVGs
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Cloudinary CDN
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com', // AWS S3
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Unsplash (for demo/placeholder images)
      },
    ],
  },
  /**
   * Webpack configuration with code obfuscation for production
   * Validates: Requirements 18.1
   *
   * Obfuscation is only applied in production builds to:
   * - Protect intellectual property
   * - Make reverse engineering more difficult
   * - Prevent easy code analysis by malicious actors
   *
   * Note: Obfuscation adds to build time and slightly increases bundle size.
   * It's disabled in development for faster builds and easier debugging.
   *
   * To enable obfuscation, set ENABLE_CODE_OBFUSCATION=true in your environment.
   */
  webpack: (config: any, { isServer, dev }) => {
    // Only apply obfuscation in production client-side builds
    if (!isServer && !dev && process.env.ENABLE_CODE_OBFUSCATION === 'true' && WebpackObfuscator) {
      try {
        config.plugins = config.plugins || [];
        config.plugins.push(
          new WebpackObfuscator(
            {
              // Obfuscation options - balanced between security and performance
              rotateStringArray: true, // Rotate string array to make it harder to understand
              stringArray: true, // Move strings to a special array
              stringArrayThreshold: 0.75, // 75% of strings will be moved to array
              stringArrayEncoding: ['base64'], // Encode strings in base64
              stringArrayWrappersCount: 2, // Add wrappers around string array calls
              stringArrayWrappersChainedCalls: true, // Chain wrapper calls

              // Control flow flattening - makes code flow harder to follow
              controlFlowFlattening: true,
              controlFlowFlatteningThreshold: 0.5, // Apply to 50% of nodes (balance)

              // Dead code injection - adds fake code paths
              deadCodeInjection: true,
              deadCodeInjectionThreshold: 0.2, // Inject in 20% of nodes (don't overdo it)

              // Identifier obfuscation
              identifierNamesGenerator: 'hexadecimal', // Use hex names for identifiers
              renameGlobals: false, // Don't rename globals (can break things)

              // Self-defending - makes debugging harder
              selfDefending: true, // Protect against formatting and debugging

              // Compact code
              compact: true, // Remove whitespace

              // Performance options
              simplify: true, // Simplify code structure

              // Disable some features that can cause issues
              transformObjectKeys: false, // Don't transform object keys (can break things)
              unicodeEscapeSequence: false, // Don't use unicode escapes (increases size)
            },
            [
              // Exclude certain files from obfuscation
              'node_modules/**',
              'webpack/**',
              '**/*.json',
            ],
          ),
        );
      } catch {
        console.warn('Code obfuscation is enabled but webpack-obfuscator is not available. Skipping obfuscation.');
        console.warn('To enable obfuscation, install: npm install --save-dev webpack-obfuscator javascript-obfuscator');
      }
    }

    return config;
  },
};

// Initialize the Next-Intl plugin
let configWithPlugins = createNextIntlPlugin('./src/libs/I18n.ts')(baseConfig);

// Conditionally enable bundle analysis
if (process.env.ANALYZE === 'true') {
  configWithPlugins = withBundleAnalyzer()(configWithPlugins);
}

// Sentry is disabled
const nextConfig = configWithPlugins;
export default nextConfig;
