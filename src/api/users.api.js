// src/api/users.api.js
import axiosInstance from './axios';

export const usersAPI = {
    // Get current user profile
    getMe: async () => {
        const response = await axiosInstance.get('/users/me');
        return response.data;
    },

    // Update current user profile
    updateMe: async (userData) => {
        const response = await axiosInstance.put('/users/me', userData);
        return response.data;
    },

    // Get all users (Admin only)
    getAll: async (params = {}) => {
        const response = await axiosInstance.get('/users', { params });
        return response.data;
    },

    // Get user by ID (Admin/Trainer)
    getById: async (userId) => {
        const response = await axiosInstance.get(`/users/${userId}`);
        return response.data;
    },

    // Update user (Admin only)
    update: async (userId, userData) => {
        const response = await axiosInstance.put(`/users/${userId}`, userData);
        return response.data;
    },

    // Delete user (Admin only)
    delete: async (userId) => {
        const response = await axiosInstance.delete(`/users/${userId}`);
        return response.data;
    },

    // Upload profile picture
    uploadProfilePicture: async (file) => {
        const formData = new FormData();
        formData.append('profilePicture', file);

        const response = await axiosInstance.post('/users/me/profile-picture', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};