// src/store/auth.store.js
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authService } from '../services/auth.service';
import { usersAPI } from '../api/users.api';

export const useAuthStore = create(
    devtools(
        persist(
            (set, get) => ({
                // State
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,

                // Actions
                setUser: (user) => set({ user, isAuthenticated: !!user }),

                setLoading: (isLoading) => set({ isLoading }),

                setError: (error) => set({ error }),

                // Initialize auth from storage
                initAuth: async () => {
                    set({ isLoading: true });

                    try {
                        if (authService.isAuthenticated()) {
                            const userData = authService.getCurrentUser();

                            if (userData) {
                                set({ user: userData, isAuthenticated: true });

                                // Fetch fresh user data
                                try {
                                    const response = await usersAPI.getMe();
                                    set({ user: response.user });
                                    authService.updateUserData(response.user);
                                } catch (err) {
                                    console.error('Failed to fetch user data:', err);
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Auth initialization error:', error);
                        set({ error: error.message });
                    } finally {
                        set({ isLoading: false });
                    }
                },

                // Login
                login: async (credentials) => {
                    set({ isLoading: true, error: null });

                    try {
                        const result = await authService.login(credentials);

                        if (result.success) {
                            set({
                                user: result.data.user,
                                isAuthenticated: true,
                                isLoading: false,
                            });
                            return { success: true };
                        } else {
                            set({ error: result.error, isLoading: false });
                            return { success: false, error: result.error };
                        }
                    } catch (error) {
                        const errorMessage = error.message || 'Login failed';
                        set({ error: errorMessage, isLoading: false });
                        return { success: false, error: errorMessage };
                    }
                },

                // Register
                register: async (userData) => {
                    set({ isLoading: true, error: null });

                    try {
                        const result = await authService.register(userData);

                        if (result.success) {
                            set({
                                user: result.data.user,
                                isAuthenticated: true,
                                isLoading: false,
                            });
                            return { success: true };
                        } else {
                            set({ error: result.error, isLoading: false });
                            return { success: false, error: result.error };
                        }
                    } catch (error) {
                        const errorMessage = error.message || 'Registration failed';
                        set({ error: errorMessage, isLoading: false });
                        return { success: false, error: errorMessage };
                    }
                },

                // Logout
                logout: async () => {
                    set({ isLoading: true });

                    try {
                        await authService.logout();
                        set({
                            user: null,
                            isAuthenticated: false,
                            error: null,
                            isLoading: false,
                        });
                    } catch (error) {
                        console.error('Logout error:', error);
                        set({ isLoading: false });
                    }
                },

                // Update profile
                updateProfile: async (userData) => {
                    set({ isLoading: true, error: null });

                    try {
                        const response = await usersAPI.updateMe(userData);
                        set({ user: response.user, isLoading: false });
                        authService.updateUserData(response.user);
                        return { success: true };
                    } catch (error) {
                        const errorMessage = error.response?.data?.message || 'Update failed';
                        set({ error: errorMessage, isLoading: false });
                        return { success: false, error: errorMessage };
                    }
                },

                // Refresh user data
                refreshUser: async () => {
                    try {
                        const response = await usersAPI.getMe();
                        set({ user: response.user });
                        authService.updateUserData(response.user);
                    } catch (error) {
                        console.error('Failed to refresh user:', error);
                    }
                },

                // Clear error
                clearError: () => set({ error: null }),
            }),
            {
                name: 'auth-storage',
                partialize: (state) => ({
                    user: state.user,
                    isAuthenticated: state.isAuthenticated,
                }),
            }
        ),
        { name: 'AuthStore' }
    )
);