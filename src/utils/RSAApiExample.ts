/**
 * RSA API Encryption Usage Examples
 *
 * This file demonstrates how to use RSA encryption in API routes and client code.
 */

/**
 * ============================================
 * SERVER-SIDE: API Route Handler Example
 * ============================================
 *
 * File: src/app/api/secure/route.ts
 *
 * ```typescript
 * import { NextRequest } from 'next/server';
 * import {
 *   getRSADecryptedBody,
 *   createRSAEncryptedResponse,
 *   createRSAErrorResponse,
 *   withRSASecurity,
 * } from '@/utils/RSAApiSecurity';
 *
 * // Option 1: Manual encryption handling
 * export async function POST(request: NextRequest) {
 *   try {
 *     // Decrypt the request body
 *     const body = await getRSADecryptedBody<{ userId: string; action: string }>(request);
 *
 *     // Process the decrypted data
 *     const result = await processSecureAction(body.userId, body.action);
 *
 *     // Return encrypted response
 *     return createRSAEncryptedResponse({
 *       success: true,
 *       data: result,
 *     });
 *   } catch (error) {
 *     return createRSAErrorResponse(
 *       error instanceof Error ? error.message : 'Request failed',
 *       400
 *     );
 *   }
 * }
 *
 * // Option 2: Using wrapper for automatic handling
 * const handler = async (request: NextRequest, decryptedBody?: any) => {
 *   // decryptedBody is already decrypted if x-encryption: rsa header was present
 *   const result = await processData(decryptedBody);
 *   return createRSAEncryptedResponse(result);
 * };
 *
 * export const POST = withRSASecurity(handler, {
 *   requireEncryption: true,
 *   maxRequestAge: 5 * 60 * 1000, // 5 minutes
 *   allowedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
 * });
 * ```
 */

/**
 * ============================================
 * CLIENT-SIDE: React Component Example
 * ============================================
 *
 * ```tsx
 * 'use client';
 *
 * import { useState } from 'react';
 * import { useRSAEncryption } from '@/hooks/useRSAEncryption';
 *
 * export function SecureForm() {
 *   const { securePost, loading, error, isEncryptionAvailable } = useRSAEncryption();
 *   const [result, setResult] = useState<any>(null);
 *
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault();
 *
 *     try {
 *       const response = await securePost('/api/secure', {
 *         userId: 'user123',
 *         action: 'update_profile',
 *         sensitiveData: {
 *           email: 'user@example.com',
 *           phone: '+1234567890',
 *         },
 *       });
 *
 *       setResult(response);
 *     } catch (err) {
 *       console.error('Request failed:', err);
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {!isEncryptionAvailable && (
 *         <div className="warning">
 *           RSA encryption is not available. Check configuration.
 *         </div>
 *       )}
 *
 *       <button type="submit" disabled={loading}>
 *         {loading ? 'Submitting...' : 'Submit Securely'}
 *       </button>
 *
 *       {error && <div className="error">{error}</div>}
 *       {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
 *     </form>
 *   );
 * }
 * ```
 */

/**
 * ============================================
 * CLIENT-SIDE: Standalone Function Example
 * ============================================
 *
 * ```typescript
 * import { rsaFetch } from '@/hooks/useRSAEncryption';
 *
 * // In a service or utility file
 * export async function submitSecureData(data: any) {
 *   return rsaFetch('/api/secure', data, {
 *     method: 'POST',
 *     encrypt: true,
 *   });
 * }
 *
 * // Usage
 * const result = await submitSecureData({
 *   userId: 'user123',
 *   sensitiveInfo: 'secret data',
 * });
 * ```
 */

/**
 * ============================================
 * SENSITIVE ROUTES THAT SHOULD USE RSA ENCRYPTION
 * ============================================
 *
 * - /api/user/profile - User profile updates
 * - /api/user/settings - User settings changes
 * - /api/admin/* - All admin operations
 * - /api/payment/* - Payment processing
 * - /api/auth/* - Authentication operations
 * - Any route handling PII (Personally Identifiable Information)
 *
 * Note: Public data endpoints (like campaign listings) don't need encryption.
 */

/**
 * ============================================
 * ENVIRONMENT VARIABLES REQUIRED
 * ============================================
 *
 * Server-side (.env.local):
 *   RSA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
 *
 * Client-side (.env.local):
 *   NEXT_PUBLIC_RSA_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
 *
 * Generate keys using:
 *   node scripts/generate-rsa-keys.js
 */

export {};
