// src/services/jwt.service.js

class JWTService {
    constructor() {
        this.tokenBlacklist = new Set();
        this.validationCache = new Map();
    }

    /**
     * Decode JWT payload.
     * NOTE: This decodes the payload only.
     * Cryptographic signature verification must be handled by the backend/auth server.
     */
    decode(token) {
        try {
            if (!token || typeof token !== 'string') {
                return null;
            }

            // Check if token is blacklisted
            if (this.isTokenBlacklisted(token)) {
                console.warn('Attempted to decode blacklisted token');
                return null;
            }

            const parts = token.split('.');

            if (parts.length !== 3) {
                return null;
            }

            // JWT uses base64url encoding.
            const base64 = parts[1]
                .replace(/-/g, '+')
                .replace(/_/g, '/');

            // Restore missing base64 padding.
            const padded = base64.padEnd(
                base64.length + ((4 - (base64.length % 4)) % 4),
                '='
            );

            const decoded = JSON.parse(atob(padded));

            if (!decoded || typeof decoded !== 'object') {
                return null;
            }

            return decoded;
        } catch {
            // Never log token contents or sensitive authentication data.
            return null;
        }
    }

    /**
     * Check whether token is expired or invalid.
     */
    isTokenExpired(token) {
        const decoded = this.decode(token);

        if (!decoded || typeof decoded.exp !== 'number') {
            return true;
        }

        const currentTime = Math.floor(Date.now() / 1000);

        // 30-second safety buffer.
        return decoded.exp <= currentTime + 30;
    }

    /**
     * Get token expiration date.
     */
    getTokenExpiration(token) {
        const decoded = this.decode(token);

        if (!decoded || typeof decoded.exp !== 'number') {
            return null;
        }

        return new Date(decoded.exp * 1000);
    }

    /**
     * Get remaining token lifetime in seconds.
     */
    getTimeUntilExpiration(token) {
        const decoded = this.decode(token);

        if (!decoded || typeof decoded.exp !== 'number') {
            return 0;
        }

        const currentTime = Math.floor(Date.now() / 1000);

        return Math.max(0, decoded.exp - currentTime);
    }

    /**
     * Get user ID from JWT.
     */
    getUserId(token) {
        const decoded = this.decode(token);

        if (!decoded) {
            return null;
        }

        return (
            decoded.userId ??
            decoded.user_id ??
            decoded.id ??
            decoded.sub ??
            null
        );
    }

    /**
     * Get user role from JWT.
     */
    getUserRole(token) {
        const decoded = this.decode(token);

        if (!decoded) {
            return null;
        }

        return (
            decoded.role ??
            decoded.roles?.[0] ??
            null
        );
    }

    /**
     * Validate JWT structure and required authentication claims with caching.
     *
     * This performs client-side structural/claim/expiration validation.
     * It does NOT cryptographically verify the JWT signature.
     */
    validateToken(token) {
        // Check cache first
        const cacheKey = this.getTokenCacheKey(token);
        if (this.validationCache.has(cacheKey)) {
            return this.validationCache.get(cacheKey);
        }

        const decoded = this.decode(token);

        if (!decoded) {
            const result = {
                valid: false,
                reason: 'Invalid token format'
            };
            this.validationCache.set(cacheKey, result);
            return result;
        }

        if (this.isTokenExpired(token)) {
            const result = {
                valid: false,
                reason: 'Token expired'
            };
            this.validationCache.set(cacheKey, result);
            return result;
        }

        const userId = this.getUserId(token);
        const role = this.getUserRole(token);

        if (!userId || !role) {
            const result = {
                valid: false,
                reason: 'Missing required claims'
            };
            this.validationCache.set(cacheKey, result);
            return result;
        }

        // Validate issuer when supplied by the backend.
        if (decoded.iss && decoded.iss !== 'quiz-app') {
            const result = {
                valid: false,
                reason: 'Invalid issuer'
            };
            this.validationCache.set(cacheKey, result);
            return result;
        }

        // Validate audience when supplied by the backend.
        if (decoded.aud && decoded.aud !== 'quiz-app-users') {
            const result = {
                valid: false,
                reason: 'Invalid audience'
            };
            this.validationCache.set(cacheKey, result);
            return result;
        }

        // Validate token issued time (not issued in the future)
        if (decoded.iat && decoded.iat > Math.floor(Date.now() / 1000)) {
            const result = {
                valid: false,
                reason: 'Token issued in the future'
            };
            this.validationCache.set(cacheKey, result);
            return result;
        }

        const result = {
            valid: true
        };
        this.validationCache.set(cacheKey, result);
        return result;
    }

    /**
     * Extract safe user information from JWT.
     *
     * Only non-sensitive identity/authorization claims are exposed.
     */
    getUserInfo(token) {
        const validation = this.validateToken(token);

        if (!validation.valid) {
            return null;
        }

        const decoded = this.decode(token);

        return {
            userId: this.getUserId(token),
            email: decoded.email ?? decoded.emailAddress ?? null,
            name:
                decoded.name ??
                decoded.fullName ??
                decoded.username ??
                null,
            role: this.getUserRole(token),
            permissions: decoded.permissions ?? [],
            exp: decoded.exp,
            iat: decoded.iat ?? null
        };
    }

    /**
     * Blacklist a token (for logout or security incidents)
     */
    blacklistToken(token) {
        const tokenHash = this.getTokenCacheKey(token);
        this.tokenBlacklist.add(tokenHash);
        this.validationCache.delete(tokenHash);
    }

    /**
     * Check if token is blacklisted
     */
    isTokenBlacklisted(token) {
        const tokenHash = this.getTokenCacheKey(token);
        return this.tokenBlacklist.has(tokenHash);
    }

    /**
     * Clear token blacklist
     */
    clearBlacklist() {
        this.tokenBlacklist.clear();
        this.validationCache.clear();
    }

    /**
     * Generate cache key for token
     */
    getTokenCacheKey(token) {
        // Use first 10 and last 10 characters as a simple hash
        if (!token || token.length < 20) {
            return token;
        }
        return token.substring(0, 10) + token.substring(token.length - 10);
    }

    /**
     * Clear validation cache
     */
    clearValidationCache() {
        this.validationCache.clear();
    }

    /**
     * Get token validation statistics
     */
    getValidationStats() {
        return {
            blacklistedTokens: this.tokenBlacklist.size,
            cachedValidations: this.validationCache.size,
        };
    }
}

export const jwtService = new JWTService();
