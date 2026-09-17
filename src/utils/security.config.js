// src/utils/security.config.js

/**
 * Security Configuration
 * Centralized security settings and utilities
 */

export const SECURITY_CONFIG = {
    // Token Security
    TOKEN: {
        // Access token lifetime (minutes)
        ACCESS_TOKEN_LIFETIME: 15,
        // Refresh token lifetime (days)
        REFRESH_TOKEN_LIFETIME: 7,
        // Token refresh buffer (seconds before expiry)
        REFRESH_BUFFER: 300, // 5 minutes
        // Maximum refresh attempts
        MAX_REFRESH_ATTEMPTS: 3,
    },

    // Storage Security
    STORAGE: {
        // Use sessionStorage instead of localStorage for tokens
        USE_SESSION_STORAGE: true,
        // Enable token encryption
        ENCRYPT_TOKENS: true,
        // Token rotation interval (milliseconds)
        ROTATION_INTERVAL: 3600000, // 1 hour
    },

    // Session Security
    SESSION: {
        // Session timeout (milliseconds)
        TIMEOUT: 3600000, // 1 hour
        // Warning before timeout (milliseconds)
        WARNING_THRESHOLD: 300000, // 5 minutes
        // Enable activity tracking
        TRACK_ACTIVITY: true,
        // Idle timeout (milliseconds)
        IDLE_TIMEOUT: 1800000, // 30 minutes
    },

    // Request Security
    REQUEST: {
        // Request timeout (milliseconds)
        TIMEOUT: 15000,
        // Retry attempts
        RETRY_ATTEMPTS: 3,
        // Retry delay (milliseconds)
        RETRY_DELAY: 1000,
        // Enable request signing
        SIGN_REQUESTS: true,
    },

    // CSRF Protection
    CSRF: {
        // Enable CSRF protection
        ENABLED: true,
        // Token header name
        HEADER_NAME: 'X-CSRF-Token',
        // Token rotation on each request
        ROTATE_TOKEN: true,
    },

    // Content Security
    CSP: {
        // Enable CSP headers
        ENABLED: true,
        // Default source
        DEFAULT_SRC: "'self'",
        // Script sources
        SCRIPT_SRC: "'self' 'unsafe-inline' 'unsafe-eval'",
        // Style sources
        STYLE_SRC: "'self' 'unsafe-inline'",
        // Image sources
        IMG_SRC: "'self' data: https:",
        // Connect sources
        CONNECT_SRC: "'self' https://mediniquizeapplicationbackend.onrender.com",
        // Font sources
        FONT_SRC: "'self' data:",
    },

    // Rate Limiting
    RATE_LIMITING: {
        // Enable rate limiting
        ENABLED: true,
        // Requests per minute
        REQUESTS_PER_MINUTE: 60,
        // Requests per hour
        REQUESTS_PER_HOUR: 1000,
        // Burst limit
        BURST_LIMIT: 10,
    },

    // Audit Logging
    AUDIT: {
        // Enable audit logging
        ENABLED: true,
        // Log level (error, warn, info, debug)
        LOG_LEVEL: 'info',
        // Log sensitive data
        LOG_SENSITIVE_DATA: false,
        // Remote logging
        REMOTE_LOGGING: false,
    },
};

/**
 * Security Utilities
 */
export const securityUtils = {
    /**
     * Generate a cryptographically secure random string
     */
    generateSecureToken: (length = 32) => {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    },

    /**
     * Validate URL to prevent open redirects
     */
    isValidUrl: (url) => {
        try {
            const parsed = new URL(url);
            const allowedProtocols = ['https:', 'http:'];
            return allowedProtocols.includes(parsed.protocol);
        } catch {
            return false;
        }
    },

    /**
     * Sanitize user input to prevent XSS
     */
    sanitizeInput: (input) => {
        if (typeof input !== 'string') return input;
        return input
            .replace(/[&<>"']/g, (match) => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;'
            }[match]))
            .trim();
    },

    /**
     * Validate email format
     */
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate password strength
     */
    validatePasswordStrength: (password) => {
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            numbers: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };

        const strength = Object.values(checks).filter(Boolean).length;
        
        return {
            checks,
            strength,
            score: strength / 5, // 0 to 1
            isStrong: strength >= 4,
        };
    },

    /**
     * Detect suspicious activity patterns
     */
    detectSuspiciousActivity: (activities) => {
        const suspiciousPatterns = [
            // Multiple failed login attempts
            {
                pattern: 'multiple_failed_logins',
                check: (acts) => acts.filter(a => a.type === 'login_failed').length >= 5,
                severity: 'high',
            },
            // Rapid successive requests
            {
                pattern: 'rapid_requests',
                check: (acts) => {
                    const recent = acts.filter(a => 
                        Date.now() - a.timestamp < 1000
                    );
                    return recent.length >= 10;
                },
                severity: 'medium',
            },
            // Unusual access patterns
            {
                pattern: 'unusual_access',
                check: (acts) => {
                    const uniqueIPs = new Set(acts.map(a => a.ip));
                    return uniqueIPs.size >= 3;
                },
                severity: 'high',
            },
        ];

        const detected = [];
        for (const { pattern, check, severity } of suspiciousPatterns) {
            if (check(activities)) {
                detected.push({ pattern, severity });
            }
        }

        return detected;
    },

    /**
     * Generate CSRF token
     */
    generateCSRFToken: () => {
        return securityUtils.generateSecureToken(32);
    },

    /**
     * Validate CSRF token
     */
    validateCSRFToken: (token, storedToken) => {
        return token && storedToken && token === storedToken;
    },

    /**
     * Rate limiter implementation
     */
    createRateLimiter: (maxRequests, windowMs) => {
        const requests = [];
        
        return {
            check: () => {
                const now = Date.now();
                // Remove old requests outside the window
                const validRequests = requests.filter(r => now - r.timestamp < windowMs);
                
                if (validRequests.length >= maxRequests) {
                    return false;
                }
                
                requests.push({ timestamp: now });
                return true;
            },
            reset: () => {
                requests.length = 0;
            },
        };
    },
};

/**
 * Session Manager
 */
export class SessionManager {
    constructor() {
        this.activityListeners = [];
        this.inactivityTimer = null;
        this.sessionTimer = null;
        this.lastActivity = Date.now();
    }

    /**
     * Initialize session monitoring
     */
    init() {
        if (!SECURITY_CONFIG.SESSION.TRACK_ACTIVITY) return;

        // Track user activity
        this.trackActivity();

        // Start inactivity timer
        this.startInactivityTimer();

        // Start session timer
        this.startSessionTimer();
    }

    /**
     * Track user activity
     */
    trackActivity() {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        
        const handleActivity = () => {
            this.lastActivity = Date.now();
            this.resetInactivityTimer();
        };

        events.forEach(event => {
            document.addEventListener(event, handleActivity);
        });

        this.cleanup = () => {
            events.forEach(event => {
                document.removeEventListener(event, handleActivity);
            });
        };
    }

    /**
     * Start inactivity timer
     */
    startInactivityTimer() {
        this.resetInactivityTimer();
    }

    /**
     * Reset inactivity timer
     */
    resetInactivityTimer() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }

        this.inactivityTimer = setTimeout(() => {
            this.handleInactivityTimeout();
        }, SECURITY_CONFIG.SESSION.IDLE_TIMEOUT);
    }

    /**
     * Handle inactivity timeout
     */
    handleInactivityTimeout() {
        const timeUntilSessionEnd = SECURITY_CONFIG.SESSION.TIMEOUT - (Date.now() - this.lastActivity);
        
        if (timeUntilSessionEnd <= SECURITY_CONFIG.SESSION.WARNING_THRESHOLD) {
            this.notifyActivityListeners('session_warning', {
                timeRemaining: timeUntilSessionEnd,
            });
        }

        if (Date.now() - this.lastActivity >= SECURITY_CONFIG.SESSION.TIMEOUT) {
            this.handleSessionTimeout();
        }
    }

    /**
     * Start session timer
     */
    startSessionTimer() {
        this.sessionTimer = setTimeout(() => {
            this.handleSessionTimeout();
        }, SECURITY_CONFIG.SESSION.TIMEOUT);
    }

    /**
     * Handle session timeout
     */
    handleSessionTimeout() {
        this.notifyActivityListeners('session_timeout');
        this.cleanup();
    }

    /**
     * Add activity listener
     */
    addActivityListener(callback) {
        this.activityListeners.push(callback);
    }

    /**
     * Notify activity listeners
     */
    notifyActivityListeners(event, data = {}) {
        this.activityListeners.forEach(callback => {
            callback(event, data);
        });
    }

    /**
     * Cleanup session monitoring
     */
    cleanup() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }
        if (this.cleanup) {
            this.cleanup();
        }
    }
}

/**
 * Security Audit Logger
 */
export class SecurityAuditLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000;
    }

    /**
     * Log security event
     */
    log(event, data = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event,
            data: SECURITY_CONFIG.AUDIT.LOG_SENSITIVE_DATA ? data : this.sanitizeData(data),
            userAgent: navigator.userAgent,
            url: window.location.href,
        };

        this.logs.push(logEntry);

        // Keep only recent logs
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Console log based on log level
        if (SECURITY_CONFIG.AUDIT.LOG_LEVEL === 'debug') {
            console.log('[Security Audit]', logEntry);
        } else if (SECURITY_CONFIG.AUDIT.LOG_LEVEL === 'info' && event !== 'debug') {
            console.log('[Security Audit]', logEntry);
        }
    }

    /**
     * Sanitize sensitive data
     */
    sanitizeData(data) {
        const sensitiveKeys = ['password', 'token', 'secret', 'key'];
        const sanitized = { ...data };

        for (const key of Object.keys(sanitized)) {
            if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
                sanitized[key] = '[REDACTED]';
            }
        }

        return sanitized;
    }

    /**
     * Get logs
     */
    getLogs() {
        return [...this.logs];
    }

    /**
     * Clear logs
     */
    clearLogs() {
        this.logs = [];
    }
}

// Export singleton instances
export const sessionManager = new SessionManager();
export const auditLogger = new SecurityAuditLogger();