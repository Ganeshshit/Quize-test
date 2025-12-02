// src/services/jwt.service.js

class JWTService {
    /**
     * Decode JWT token without verification
     */
    decode(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid token format');
            }

            const payload = parts[1];
            const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));

            return decoded;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    /**
     * Check if token is expired
     */
    isTokenExpired(token) {
        try {
            const decoded = this.decode(token);
            if (!decoded || !decoded.exp) {
                return true;
            }

            const currentTime = Math.floor(Date.now() / 1000);

            // Add 30 second buffer to prevent edge cases
            return decoded.exp < (currentTime + 30);
        } catch (error) {
            console.error('Error checking token expiration:', error);
            return true;
        }
    }

    /**
     * Get token expiration time
     */
    getTokenExpiration(token) {
        const decoded = this.decode(token);
        return decoded?.exp ? new Date(decoded.exp * 1000) : null;
    }

    /**
     * Get time until token expires (in seconds)
     */
    getTimeUntilExpiration(token) {
        try {
            const decoded = this.decode(token);
            if (!decoded || !decoded.exp) {
                return 0;
            }

            const currentTime = Math.floor(Date.now() / 1000);
            return Math.max(0, decoded.exp - currentTime);
        } catch (error) {
            return 0;
        }
    }

    /**
     * Get user ID from token
     */
    getUserId(token) {
        const decoded = this.decode(token);
        return decoded?.userId || null;
    }

    /**
     * Get user role from token
     */
    getUserRole(token) {
        const decoded = this.decode(token);
        return decoded?.role || null;
    }

    /**
     * Validate token structure and basic claims
     */
    validateToken(token) {
        try {
            const decoded = this.decode(token);

            if (!decoded) {
                return { valid: false, reason: 'Invalid token format' };
            }

            // Check required claims
            if (!decoded.userId || !decoded.role) {
                return { valid: false, reason: 'Missing required claims' };
            }

            // Check expiration
            if (this.isTokenExpired(token)) {
                return { valid: false, reason: 'Token expired' };
            }

            // Check issuer and audience if present
            if (decoded.iss && decoded.iss !== 'quiz-app') {
                return { valid: false, reason: 'Invalid issuer' };
            }

            if (decoded.aud && decoded.aud !== 'quiz-app-users') {
                return { valid: false, reason: 'Invalid audience' };
            }

            return { valid: true };
        } catch (error) {
            return { valid: false, reason: error.message };
        }
    }

    /**
     * Extract all user info from token
     */
    getUserInfo(token) {
        const decoded = this.decode(token);
        if (!decoded) return null;

        return {
            userId: decoded.userId,
            role: decoded.role,
            exp: decoded.exp,
            iat: decoded.iat,
        };
    }
}

export const jwtService = new JWTService();