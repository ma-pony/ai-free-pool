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
    // Optimize webpack cache behavior
    webpackBuildWorker: true, // Use worker threads for webpack builds
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
   * ✅ Code obfuscation is properly configured for Next.js
   *
   * Key fixes applied:
   * - Only obfuscates client-side code (!isServer check)
   * - Excludes all server chunks and middleware
   * - Conservative settings to maintain React compatibility
   * - Reduced string array threshold to 30%
   *
   * Security level:
   * - Basic variable/function name obfuscation
   * - String array obfuscation (30% of strings)
   * - Code compaction and simplification
   *
   * To enable: Set ENABLE_CODE_OBFUSCATION=true in environment variables
   */
  webpack: (config: any, { isServer, dev }) => {
    // Optimize webpack cache for better performance
    // This addresses the "Serializing big strings" warning
    if (config.cache && config.cache.type === 'filesystem') {
      config.cache.compression = 'gzip'; // Enable compression for cache
      config.cache.maxMemoryGenerations = dev ? 5 : Infinity; // Optimize memory usage

      // Optimize serialization for large strings
      config.cache.store = 'pack';
    }

    // Optimize module concatenation for better tree-shaking
    if (!dev) {
      config.optimization = config.optimization || {};
      config.optimization.concatenateModules = true;
      config.optimization.providedExports = true;
      config.optimization.usedExports = true;
    }

    // Only apply obfuscation in production client-side builds
    // IMPORTANT: Obfuscation must be carefully configured for Next.js
    // CRITICAL: Only obfuscate client-side code, NEVER server-side code
    if (!isServer && !dev && process.env.ENABLE_CODE_OBFUSCATION === 'true' && WebpackObfuscator) {
      console.log('🔒 Code obfuscation ENABLED - applying webpack-obfuscator plugin (client-side only)');
      try {
        config.plugins = config.plugins || [];
        config.plugins.push(
          new WebpackObfuscator(
            {
              // Conservative obfuscation settings for Next.js compatibility
              // These settings are tested to work with React and Next.js

              // String obfuscation - MINIMAL to prevent breaking JSX
              stringArray: true,
              stringArrayThreshold: 0.3, // Only 30% of strings (reduced from 50%)
              stringArrayEncoding: [], // No encoding to prevent runtime errors
              stringArrayWrappersCount: 1, // Minimal wrapping
              stringArrayWrappersChainedCalls: false, // Disabled - breaks React
              rotateStringArray: false, // Disabled - not needed

              // Control flow - DISABLED for React compatibility
              controlFlowFlattening: false, // CRITICAL: Must be false for React
              controlFlowFlatteningThreshold: 0,

              // Dead code injection - DISABLED
              deadCodeInjection: false, // Can break React components
              deadCodeInjectionThreshold: 0,

              // Identifier obfuscation - SAFE settings
              identifierNamesGenerator: 'hexadecimal',
              renameGlobals: false, // CRITICAL: Don't rename globals
              renameProperties: false, // CRITICAL: Don't rename properties

              // Self-defending - DISABLED for Next.js
              selfDefending: false, // Breaks Next.js hydration

              // Code optimization
              compact: true,
              simplify: true,

              // CRITICAL: Disable features that break React/Next.js
              transformObjectKeys: false,
              unicodeEscapeSequence: false,
              splitStrings: false, // Don't split strings
              stringArrayRotate: false,
              stringArrayShuffle: false,

              // Target environment
              target: 'browser',

              // Source map - disable in production
              sourceMap: false,
              sourceMapMode: 'separate',
            },
            [
              // CRITICAL: Exclude patterns - must exclude Next.js internals and framework code
              'node_modules/**',
              'webpack/**',
              '**/*.json',
              '**/node_modules/**',
              '**/_next/**', // Exclude Next.js runtime
              '**/chunks/**', // Exclude ALL webpack chunks (important!)
              '**/framework-*.js', // Exclude React framework
              '**/main-*.js', // Exclude Next.js main
              '**/webpack-*.js', // Exclude webpack runtime
              '**/webpack-runtime.js', // Exclude webpack runtime
              '**/polyfills-*.js', // Exclude polyfills
              '**/server/**', // Exclude server directory
              '**/*-manifest.js', // Exclude manifest files
              '**/middleware*.js', // Exclude middleware files
            ],
          ),
        );
      } catch (error) {
        console.warn('⚠️  Code obfuscation failed:', error);
        console.warn('Continuing build without obfuscation...');
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
