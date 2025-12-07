// Setup file for browser tests
// Polyfill process.env for browser environment
if (typeof process === 'undefined') {
  (globalThis as any).process = {
    env: {
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    },
  };
}
