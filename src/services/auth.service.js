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

            // Handle different response structures
            const responseData = response.data?.user || response.user;
            const accessToken = response.data?.accessToken || response.accessToken;
            const refreshToken = response.data?.refreshToken || response.refreshToken;
            const message = response.data?.message || response.message || 'Registration successful';

            // Store tokens
            if (accessToken) {
                storageService.setAccessToken(accessToken);
            }

            if (refreshToken) {
                storageService.setRefreshToken(refreshToken);
            }

            // Prefer backend user data.
            // If unavailable, extract user information from the access token.
            const tokenUser = accessToken
                ? jwtService.getUserInfo(accessToken)
                : null;

            const currentUser = responseData || tokenUser;

            if (currentUser) {
                storageService.setUserData(currentUser);
            }

            return {
                success: true,
                data: {
                    user: currentUser,
                    accessToken,
                    refreshToken,
                },
                message,
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

            // Handle different response structures
            const userData = response.data?.user || response.user;
            const accessToken = response.data?.accessToken || response.accessToken;
            const refreshToken = response.data?.refreshToken || response.refreshToken;
            const message = response.data?.message || response.message || 'Login successful';

            console.log('Auth Service - Login Response:', {
                hasUserData: !!userData,
                hasAccessToken: !!accessToken,
                hasRefreshToken: !!refreshToken,
                userRole: userData?.role,
                message
            });

            // Store tokens
            if (accessToken) {
                storageService.setAccessToken(accessToken);
            }

            if (refreshToken) {
                storageService.setRefreshToken(refreshToken);
            }

            // Prefer backend user data.
            // If unavailable, extract user information from the access token.
            const tokenUser = accessToken
                ? jwtService.getUserInfo(accessToken)
                : null;

            const currentUser = userData || tokenUser;

            if (currentUser) {
                storageService.setUserData(currentUser);
                console.log('Auth Service - User data stored:', {
                    name: currentUser.name,
                    email: currentUser.email,
                    role: currentUser.role
                });
            }

            return {
                success: true,
                data: {
                    user: currentUser,
                    accessToken,
                    refreshToken,
                },
                message,
            };
        } catch (error) {
            console.error('Auth Service - Login Error:', error);
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

            // Handle different response structures
            const accessToken = response.data?.accessToken || response.accessToken;
            const newRefreshToken = response.data?.refreshToken || response.refreshToken;

            // Update tokens
            if (accessToken) {
                storageService.setAccessToken(accessToken);
            }

            if (newRefreshToken) {
                storageService.setRefreshToken(newRefreshToken);
            }

            // Refresh user information from the new access token.
            if (accessToken) {
                const tokenUser = jwtService.getUserInfo(accessToken);

                if (tokenUser) {
                    storageService.setUserData(tokenUser);
                }
            }

            return {
                success: true,
                accessToken,
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
     * Change password (authenticated)
     */
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await authAPI.changePassword(currentPassword, newPassword);

            // Clear auth data to force re-login since token is invalidated
            storageService.clearAuth();

            return {
                success: true,
                data: response,
                message: response.message || 'Password changed successfully. Please log in again.',
            };
        } catch (error) {
            return {
                success: false,
                error:
                    error.response?.data?.error ||
                    error.response?.data?.message ||
                    'Password change failed',
                message: error.response?.data?.message,
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