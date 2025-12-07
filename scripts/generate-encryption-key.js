#!/usr/bin/env node

/**
 * Generate Encryption Key Script
 *
 * This script generates a secure 64-character hexadecimal encryption key
 * for use with the API encryption feature (Requirement 18.2-18.5)
 *
 * Usage:
 *   node scripts/generate-encryption-key.js
 *
 * The generated key should be added to your environment variables as:
 *   ENCRYPTION_KEY=<generated_key>
 */

const crypto = require('node:crypto');

function generateEncryptionKey() {
  // Generate 32 random bytes (256 bits)
  const key = crypto.randomBytes(32);

  // Convert to hexadecimal string (64 characters)
  const hexKey = key.toString('hex');

  return hexKey;
}

function main() {
  console.log('='.repeat(70));
  console.log('AI Free Pool - Encryption Key Generator');
  console.log('='.repeat(70));
  console.log('');

  const key = generateEncryptionKey();

  console.log('Generated Encryption Key:');
  console.log('');
  console.log(`  ${key}`);
  console.log('');
  console.log('Add this to your environment variables:');
  console.log('');
  console.log(`  ENCRYPTION_KEY=${key}`);
  console.log('');
  console.log('IMPORTANT:');
  console.log('  - Use different keys for development and production');
  console.log('  - Never commit this key to version control');
  console.log('  - Store securely in Vercel Environment Variables');
  console.log('  - Keep a backup in a secure password manager');
  console.log('');
  console.log('='.repeat(70));
}

main();
