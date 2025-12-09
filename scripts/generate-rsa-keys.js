#!/usr/bin/env node

/**
 * RSA Key Pair Generator Script
 *
 * Generates RSA-2048 key pair for API encryption
 * - Private key: Used by server to decrypt requests and sign responses
 * - Public key: Used by client to encrypt requests and verify responses
 *
 * Usage:
 *   node scripts/generate-rsa-keys.js
 *
 * Output:
 *   - RSA_PRIVATE_KEY: Add to server environment (never expose to client)
 *   - RSA_PUBLIC_KEY: Add to NEXT_PUBLIC_RSA_PUBLIC_KEY (safe for client)
 */

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

function generateRSAKeyPair() {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });
}

function formatKeyForEnv(key) {
  // Replace newlines with \n for environment variable storage
  return key.replace(/\n/g, '\\n');
}

function main() {
  console.log('='.repeat(70));
  console.log('AI Free Pool - RSA Key Pair Generator');
  console.log('='.repeat(70));
  console.log('');

  const { publicKey, privateKey } = generateRSAKeyPair();

  // Save keys to files (for reference)
  const keysDir = path.join(__dirname, '../.keys');
  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
  }

  fs.writeFileSync(path.join(keysDir, 'rsa_private.pem'), privateKey);
  fs.writeFileSync(path.join(keysDir, 'rsa_public.pem'), publicKey);

  console.log('Keys saved to .keys/ directory (add to .gitignore!)');
  console.log('');
  console.log('='.repeat(70));
  console.log('PRIVATE KEY (Server-side only - NEVER expose to client)');
  console.log('='.repeat(70));
  console.log('');
  console.log(`RSA_PRIVATE_KEY="${formatKeyForEnv(privateKey)}"`);
  console.log('');
  console.log('='.repeat(70));
  console.log('PUBLIC KEY (Safe for client-side)');
  console.log('='.repeat(70));
  console.log('');
  console.log(`NEXT_PUBLIC_RSA_PUBLIC_KEY="${formatKeyForEnv(publicKey)}"`);
  console.log('');
  console.log('='.repeat(70));
  console.log('IMPORTANT:');
  console.log('  1. Add RSA_PRIVATE_KEY to .env.local (server-side only)');
  console.log('  2. Add NEXT_PUBLIC_RSA_PUBLIC_KEY to .env.local (client-side)');
  console.log('  3. Add .keys/ to .gitignore');
  console.log('  4. Use different keys for development and production');
  console.log('  5. Store production keys securely in Vercel Environment Variables');
  console.log('='.repeat(70));
}

main();
