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

            // Store tokens
            if (response.accessToken) {
                storageService.setAccessToken(response.accessToken);
            }

            if (response.refreshToken) {
                storageService.setRefreshToken(response.refreshToken);
            }

            // Prefer backend user data.
            // If unavailable, extract user information from the access token.
            const tokenUser = response.accessToken
                ? jwtService.getUserInfo(response.accessToken)
                : null;

            const currentUser = response.user || tokenUser;

            if (currentUser) {
                storageService.setUserData(currentUser);
            }

            return {
                success: true,
                data: {
                    ...response,
                    user: currentUser,
                },
                message: response.message || 'Registration successful',
            };
        } catch (error) {
            return {
                success: false,
                error:
                    error.response?.data?.error ||
                    error.response?.data?.message ||
                    'Registration failed',
                message: error.response?.data?.message,
            };
        }
    }

    /**
     * Login user
     */
    async login(credentials) {
        try {
            const response = await authAPI.login(credentials);

            // Store tokens
            if (response.accessToken) {
                storageService.setAccessToken(response.accessToken);
            }

            if (response.refreshToken) {
                storageService.setRefreshToken(response.refreshToken);
            }

            // Prefer backend user data.
            // If unavailable, extract user information from the access token.
            const tokenUser = response.accessToken
                ? jwtService.getUserInfo(response.accessToken)
                : null;

            const currentUser = response.user || tokenUser;

            if (currentUser) {
                storageService.setUserData(currentUser);
            }

            return {
                success: true,
                data: {
                    ...response,
                    user: currentUser,
                },
                message: response.message || 'Login successful',
            };
        } catch (error) {
            return {
                success: false,
                error:
                    error.response?.data?.error ||
                    error.response?.data?.message ||
                    'Login failed',
                message: error.response?.data?.message,
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
            // Clear all authentication data regardless of API response.
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

            // Refresh user information from the new access token.
            if (response.accessToken) {
                const tokenUser = jwtService.getUserInfo(response.accessToken);

                if (tokenUser) {
                    storageService.setUserData(tokenUser);
                }
            }

            return {
                success: true,
                accessToken: response.accessToken,
            };
        } catch (error) {
            // If refresh fails, logout user.
            await this.logout();

            return {
                success: false,
                error:
                    error.response?.data?.message ||
                    'Token refresh failed',
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
                error:
                    error.response?.data?.message ||
                    'Failed to send reset email',
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
                error:
                    error.response?.data?.message ||
                    'Password reset failed',
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
                error:
                    error.response?.data?.message ||
                    'Email verification failed',
            };
        }
    }

    /**
     * Check if user is authenticated.
     *
     * Token must be structurally valid, contain required claims,
     * and not be expired.
     */
    isAuthenticated() {
        const token = storageService.getAccessToken();

        if (!token) {
            return false;
        }

        const validation = jwtService.validateToken(token);

        return validation.valid;
    }

    /**
     * Get current user data from the authenticated access token.
     *
     * The JWT is decoded and validated before user information is returned.
     * Cryptographic signature verification must be handled by the backend.
     */
    getCurrentUser() {
        const token = storageService.getAccessToken();

        if (!token) {
            return null;
        }

        return jwtService.getUserInfo(token);
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