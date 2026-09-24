// src/api/axios.js
import axios from 'axios';
import { jwtService } from '../services/jwt.service';
import { storageService } from '../services/storage.service';
import { performanceMonitor } from '../utils/performanceMonitor';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
    enabled: import.meta.env.VITE_RATE_LIMIT_ENABLED !== 'false',
    maxRequestsPerMinute: parseInt(import.meta.env.VITE_MAX_REQUESTS_PER_MINUTE) || 60,
    maxRequestsPerHour: parseInt(import.meta.env.VITE_MAX_REQUESTS_PER_HOUR) || 1000,
    burstLimit: parseInt(import.meta.env.VITE_BURST_LIMIT) || 10,
    burstWindowMs: 1000, // 1 second burst window
};

// Rate limiter implementation
class RateLimiter {
    constructor(config) {
        this.config = config;
        this.requests = [];
        this.burstRequests = [];
    }

    check() {
        if (!this.config.enabled) return { allowed: true };

        const now = Date.now();
        
        // Clean old requests
        this.requests = this.requests.filter(r => now - r.timestamp < 60000); // 1 minute
        this.burstRequests = this.burstRequests.filter(r => now - r.timestamp < this.config.burstWindowMs);

        // Check burst limit
        if (this.burstRequests.length >= this.config.burstLimit) {
            return {
                allowed: false,
                reason: 'burst_limit_exceeded',
                retryAfter: Math.ceil((this.burstRequests[0].timestamp + this.config.burstWindowMs - now) / 1000),
            };
        }

        // Check per-minute limit
        if (this.requests.length >= this.config.maxRequestsPerMinute) {
            return {
                allowed: false,
                reason: 'rate_limit_exceeded',
                retryAfter: Math.ceil((this.requests[0].timestamp + 60000 - now) / 1000),
            };
        }

        // Record request
        this.requests.push({ timestamp: now });
        this.burstRequests.push({ timestamp: now });

        return { allowed: true };
    }

    reset() {
        this.requests = [];
        this.burstRequests = [];
    }
}

const rateLimiter = new RateLimiter(RATE_LIMIT_CONFIG);

// Create axios instance
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', // CSRF protection
    },
    // withCredentials: true, // Disabled to avoid CORS issues - enable if backend supports it
});

// Track refresh attempts to prevent infinite loops
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;

// Request interceptor - Add auth token and security headers
axiosInstance.interceptors.request.use(
    (config) => {
        // Start performance timing
        config.metadata = { startTime: performance.now() };

        // Check rate limit
        const rateLimitCheck = rateLimiter.check();
        if (!rateLimitCheck.allowed) {
            const error = new Error('Rate limit exceeded');
            error.response = {
                status: 429,
                data: {
                    message: `Rate limit exceeded: ${rateLimitCheck.reason}`,
                    retryAfter: rateLimitCheck.retryAfter,
                },
            };
            return Promise.reject(error);
        }

        const token = storageService.getAccessToken();

        if (token && !jwtService.isTokenExpired(token)) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add security headers
        config.headers['X-Request-ID'] = generateRequestId();
        config.headers['X-Client-Version'] = '1.0.0';
        config.headers['X-Client-Time'] = new Date().toISOString();

        // Add CSRF token if available
        const csrfToken = storageService.getItem('quiz_csrf_token');
        if (csrfToken) {
            config.headers['X-CSRF-Token'] = csrfToken;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token refresh with security improvements
axiosInstance.interceptors.response.use(
    (response) => {
        // Calculate and record request duration
        if (response.config.metadata?.startTime) {
            const duration = performance.now() - response.config.metadata.startTime;
            performanceMonitor.recordMetric('api_request', {
                url: response.config.url,
                method: response.config.method,
                duration,
                status: response.status,
                success: true,
            });
        }

        // Reset refresh attempts on successful response
        refreshAttempts = 0;
        
        // Store CSRF token from response headers if present
        const csrfToken = response.headers['x-csrf-token'];
        if (csrfToken) {
            storageService.setItem('quiz_csrf_token', csrfToken);
        }
        
        return response;
    },
    async (error) => {
        // Calculate and record request duration for failed requests
        if (error.config?.metadata?.startTime) {
            const duration = performance.now() - error.config.metadata.startTime;
            performanceMonitor.recordMetric('api_request', {
                url: error.config.url,
                method: error.config.method,
                duration,
                status: error.response?.status,
                success: false,
                error: error.message,
            });
        }

        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry && refreshAttempts < MAX_REFRESH_ATTEMPTS) {
            originalRequest._retry = true;
            refreshAttempts++;

            try {
                const refreshToken = storageService.getRefreshToken();

                if (!refreshToken || jwtService.isTokenExpired(refreshToken)) {
                    // Refresh token expired, logout user
                    storageService.clearAuth();
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                // Attempt to refresh the access token
                const response = await axios.post(`${BASE_URL}/auth/refresh`, {
                    refreshToken,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    }
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                // Store new tokens
                storageService.setAccessToken(accessToken);
                if (newRefreshToken) {
                    storageService.setRefreshToken(newRefreshToken);
                }

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // Refresh failed, logout user
                console.error('Token refresh failed:', refreshError);
                storageService.clearAuth();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Handle other security-related errors
        if (error.response?.status === 403) {
            console.error('Access forbidden:', error.response.data);
            // Could redirect to a specific forbidden page
        }

        if (error.response?.status === 429) {
            console.error('Rate limit exceeded:', error.response.data);
            const retryAfter = error.response.data?.retryAfter || 60;
            console.log(`Please wait ${retryAfter} seconds before retrying`);
            // Implement retry with exponential backoff if needed
        }

        return Promise.reject(error);
    }
);

// Helper function to generate unique request ID
function generateRequestId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Security utility functions
export const securityUtils = {
    // Generate a secure random string
    generateSecureToken: (length = 32) => {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    },

    // Validate URL to prevent open redirects
    isValidUrl: (url) => {
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'https:' || parsed.protocol === 'http:';
        } catch {
            return false;
        }
    },

    // Sanitize user input to prevent XSS
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
    }
};

export default axiosInstance;