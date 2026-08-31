// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';
import { usersAPI } from '../api/users.api';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize auth state
    useEffect(() => {
        const initAuth = async () => {
            try {
                if (authService.isAuthenticated()) {
                    const userData = authService.getCurrentUser();
                    setUser(userData);
                    setIsAuthenticated(true);

                    // Optionally fetch fresh user data
                    try {
                        const response = await usersAPI.getMe();
                        setUser(response.user);
                        authService.updateUserData(response.user);
                    } catch (err) {
                        console.error('Failed to fetch user data:', err);
                    }
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

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
    };
};