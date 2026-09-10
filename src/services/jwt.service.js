// src/services/jwt.service.js

class JWTService {
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
     * Validate JWT structure and required authentication claims.
     *
     * This performs client-side structural/claim/expiration validation.
     * It does NOT cryptographically verify the JWT signature.
     */
    validateToken(token) {
        const decoded = this.decode(token);

        if (!decoded) {
            return {
                valid: false,
                reason: 'Invalid token format'
            };
        }

        if (this.isTokenExpired(token)) {
            return {
                valid: false,
                reason: 'Token expired'
            };
        }

        const userId = this.getUserId(token);
        const role = this.getUserRole(token);

        if (!userId || !role) {
            return {
                valid: false,
                reason: 'Missing required claims'
            };
        }

        // Validate issuer when supplied by the backend.
        if (decoded.iss && decoded.iss !== 'quiz-app') {
            return {
                valid: false,
                reason: 'Invalid issuer'
            };
        }

        // Validate audience when supplied by the backend.
        if (decoded.aud && decoded.aud !== 'quiz-app-users') {
            return {
                valid: false,
                reason: 'Invalid audience'
            };
        }

        return {
            valid: true
        };
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
}

export const jwtService = new JWTService();
