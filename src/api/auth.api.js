// src/api/auth.api.js
import axiosInstance from './axios';

export const authAPI = {
    // Register new user
    register: async (userData) => {
        const response = await axiosInstance.post('/auth/register', userData);
        return response.data;
    },

    // Login user
    login: async (credentials) => {
        const response = await axiosInstance.post('/auth/login', credentials);
        return response.data;
    },

    // Refresh access token
    refresh: async (refreshToken) => {
        const response = await axiosInstance.post('/auth/refresh', {
            refreshToken,
        });
        return response.data;
    },

    // Logout user
    logout: async () => {
        const response = await axiosInstance.post('/auth/logout');
        return response.data;
    },

    // Forgot password
    forgotPassword: async (email) => {
        const response = await axiosInstance.post('/auth/forgot-password', {
            email,
        });
        return response.data;
    },

    // Reset password
    resetPassword: async (token, newPassword) => {
        const response = await axiosInstance.post('/auth/reset-password', {
            token,
            newPassword,
        });
        return response.data;
    },

    // Verify email
    verifyEmail: async (token) => {
        const response = await axiosInstance.post('/auth/verify-email', {
            token,
        });
        return response.data;
    },
};