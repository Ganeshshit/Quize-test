// src/services/auth.service.js
import { authAPI } from '../api/auth.api';
import { storageService } from './storage.service';
import { jwtService } from './jwt.service';

class AuthService {
    /**
     * Register new user
     */
    async register(userData) {
        try {
            const response = await authAPI.register(userData);

            // Store tokens and user data
            if (response.accessToken) {
                storageService.setAccessToken(response.accessToken);
            }
            if (response.refreshToken) {
                storageService.setRefreshToken(response.refreshToken);
            }
            if (response.user) {
                storageService.setUserData(response.user);
            }

            return {
                success: true,
                data: response,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Registration failed',
            };
        }
    }

    /**
     * Login user
     */
    async login(credentials) {
        try {
            const response = await authAPI.login(credentials);

            // Store tokens and user data
            if (response.accessToken) {
                storageService.setAccessToken(response.accessToken);
            }
            if (response.refreshToken) {
                storageService.setRefreshToken(response.refreshToken);
            }
            if (response.user) {
                storageService.setUserData(response.user);
            }

            return {
                success: true,
                data: response,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed',
            };
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear all auth data regardless of API response
            storageService.clearAuth();
        }
    }

    /**
     * Refresh access token
     */
    async refreshToken() {
        try {
            const refreshToken = storageService.getRefreshToken();

            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await authAPI.refresh(refreshToken);

            // Update tokens
            if (response.accessToken) {
                storageService.setAccessToken(response.accessToken);
            }
            if (response.refreshToken) {
                storageService.setRefreshToken(response.refreshToken);
            }

            return {
                success: true,
                accessToken: response.accessToken,
            };
        } catch (error) {
            // If refresh fails, logout user
            this.logout();

            return {
                success: false,
                error: error.response?.data?.message || 'Token refresh failed',
            };
        }
    }

    /**
     * Forgot password
     */
    async forgotPassword(email) {
        try {
            const response = await authAPI.forgotPassword(email);

            return {
                success: true,
                data: response,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to send reset email',
            };
        }
    }

    /**
     * Reset password
     */
    async resetPassword(token, newPassword) {
        try {
            const response = await authAPI.resetPassword(token, newPassword);

            return {
                success: true,
                data: response,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Password reset failed',
            };
        }
    }

    /**
     * Verify email
     */
    async verifyEmail(token) {
        try {
            const response = await authAPI.verifyEmail(token);

            return {
                success: true,
                data: response,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Email verification failed',
            };
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const token = storageService.getAccessToken();

        if (!token) return false;

        return !jwtService.isTokenExpired(token);
    }

    /**
     * Get current user data
     */
    getCurrentUser() {
        return storageService.getUserData();
    }

    /**
     * Get current user role
     */
    getCurrentUserRole() {
        const token = storageService.getAccessToken();
        return token ? jwtService.getUserRole(token) : null;
    }

    /**
     * Get current user ID
     */
    getCurrentUserId() {
        const token = storageService.getAccessToken();
        return token ? jwtService.getUserId(token) : null;
    }

    /**
     * Check if user has specific role
     */
    hasRole(role) {
        const userRole = this.getCurrentUserRole();
        return userRole === role;
    }

    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole(roles) {
        const userRole = this.getCurrentUserRole();
        return roles.includes(userRole);
    }

    /**
     * Update stored user data
     */
    updateUserData(userData) {
        storageService.setUserData(userData);
    }
}

export const authService = new AuthService(); 