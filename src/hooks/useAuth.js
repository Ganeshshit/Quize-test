// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';
import { usersAPI } from '../api/users.api';
import { storageService } from '../services/storage.service';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize auth state
    useEffect(() => {
        const initAuth = async () => {
            try {
                console.log('useAuth - Starting initialization...');
                
                // Perform data migration if needed
                storageService.performMigration();

                // Check if we have tokens in storage
                const hasToken = storageService.getAccessToken();
                const hasUserData = storageService.getUserData();
                
                console.log('useAuth - Storage check:', {
                    hasToken: !!hasToken,
                    hasUserData: !!hasUserData,
                    userData: hasUserData ? {
                        name: hasUserData.name,
                        email: hasUserData.email,
                        role: hasUserData.role
                    } : null
                });

                // Try to get user data from storage first (more reliable)
                if (hasUserData) {
                    console.log('useAuth - Using stored user data');
                    setUser(hasUserData);
                    setIsAuthenticated(true);
                } 
                // Fallback to auth service
                else if (authService.isAuthenticated()) {
                    console.log('useAuth - Using auth service');
                    const userData = authService.getCurrentUser();
                    if (userData) {
                        setUser(userData);
                        setIsAuthenticated(true);
                    }
                }

                // Skip API call since /users/me endpoint returns 404
                // We'll rely on stored user data from login response
            } catch (err) {
                console.error('useAuth - Auth initialization error:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
                console.log('useAuth - Initialization complete:', {
                    user: !!user,
                    isAuthenticated,
                    isLoading: false
                });
            }
        };

        initAuth();
    }, []); // Empty dependency array is correct - we want this to run once on mount

    // Login
    const login = useCallback(async (credentials) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await authService.login(credentials);

            if (result.success) {
                setUser(result.data.user);
                setIsAuthenticated(true);
                return { 
                    success: true, 
                    user: result.data.user,
                    message: result.data?.message || result.message || 'Login successful'
                };
            } else {
                setError(result.error);
                return { 
                    success: false, 
                    error: result.error,
                    message: result.message 
                };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Login failed';
            setError(errorMessage);
            return { 
                success: false, 
                error: errorMessage,
                message: err.response?.data?.message 
            };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Register
    const register = useCallback(async (userData) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await authService.register(userData);

            if (result.success) {
                setUser(result.data.user);
                setIsAuthenticated(true);
                return { 
                    success: true, 
                    user: result.data.user,
                    message: result.data?.message || result.message || 'Registration successful'
                };
            } else {
                setError(result.error);
                return { 
                    success: false, 
                    error: result.error,
                    message: result.message 
                };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Registration failed';
            setError(errorMessage);
            return { 
                success: false, 
                error: errorMessage,
                message: err.response?.data?.message 
            };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Logout
    const logout = useCallback(async () => {
        setIsLoading(true);

        try {
            await authService.logout();
            setUser(null);
            setIsAuthenticated(false);
            setError(null);
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Update user profile
    const updateProfile = useCallback(async (userData) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await usersAPI.updateMe(userData);
            setUser(response.user);
            authService.updateUserData(response.user);
            return { success: true, user: response.user };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Update failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Refresh user data
    const refreshUser = useCallback(async () => {
        try {
            const response = await usersAPI.getMe();
            setUser(response.user);
            authService.updateUserData(response.user);
            return response.user;
        } catch (err) {
            console.error('Failed to refresh user:', err);
            return null;
        }
    }, []);

    // Change password
    const changePassword = useCallback(async (currentPassword, newPassword) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await authService.changePassword(currentPassword, newPassword);

            if (result.success) {
                // Clear local auth state since token is invalidated
                setUser(null);
                setIsAuthenticated(false);
                return {
                    success: true,
                    message: result.message || 'Password changed successfully. Please log in again.'
                };
            } else {
                setError(result.error);
                return {
                    success: false,
                    error: result.error,
                    message: result.message
                };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Password change failed';
            setError(errorMessage);
            return {
                success: false,
                error: errorMessage,
                message: err.response?.data?.message
            };
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        changePassword,
    };
};