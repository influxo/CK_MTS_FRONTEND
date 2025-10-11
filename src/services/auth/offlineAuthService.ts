/**
 * Offline Authentication Service
 * 
 * Handles authentication when offline by using cached credentials
 */

import { db } from '../../db/db';
import type { AuthCache } from '../../db/db';

/**
 * Simple hash function for password verification
 * In production, use a proper crypto library like bcryptjs
 */
async function hashPassword(password: string): Promise<string> {
    // Use SubtleCrypto API for secure hashing
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

/**
 * Cache user credentials after successful online login
 */
export async function cacheAuthCredentials(
    email: string,
    password: string,
    token: string,
    userData: any
): Promise<void> {
    const passwordHash = await hashPassword(password);
    
    const authCache: AuthCache = {
        email,
        passwordHash,
        token,
        userData,
        lastLoginAt: new Date().toISOString(),
    };

    await db.authCache.put(authCache);
    console.log('✅ Auth credentials cached for offline login');
}

/**
 * Verify credentials against cached data (offline login)
 */
export async function verifyOfflineLogin(
    email: string,
    password: string
): Promise<{ success: boolean; token?: string; userData?: any; message?: string }> {
    try {
        // Get cached auth data
        const cached = await db.authCache.get(email);
        
        if (!cached) {
            return {
                success: false,
                message: 'No offline credentials found. Please login online first.',
            };
        }

        // Verify password
        const passwordHash = await hashPassword(password);
        
        if (passwordHash !== cached.passwordHash) {
            return {
                success: false,
                message: 'Invalid credentials',
            };
        }

        console.log('✅ Offline login successful');
        
        // Return cached token and user data
        return {
            success: true,
            token: cached.token,
            userData: cached.userData,
        };
    } catch (error) {
        console.error('❌ Offline login error:', error);
        return {
            success: false,
            message: 'Offline login failed',
        };
    }
}

/**
 * Check if offline login is available for an email
 */
export async function isOfflineLoginAvailable(email: string): Promise<boolean> {
    try {
        const cached = await db.authCache.get(email);
        return !!cached;
    } catch (error) {
        return false;
    }
}

/**
 * Clear cached auth data (on logout)
 */
export async function clearAuthCache(email?: string): Promise<void> {
    if (email) {
        await db.authCache.delete(email);
    } else {
        await db.authCache.clear();
    }
    console.log('🗑️ Auth cache cleared');
}

/**
 * Update cached token (after token refresh)
 */
export async function updateCachedToken(email: string, newToken: string): Promise<void> {
    const cached = await db.authCache.get(email);
    if (cached) {
        cached.token = newToken;
        await db.authCache.put(cached);
        console.log('✅ Cached token updated');
    }
}
