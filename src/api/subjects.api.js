// src/api/subjects.api.js
import axiosInstance from './axios';

export const subjectsAPI = {
    // Get all subjects
    getAll: async (params = {}) => {
        const response = await axiosInstance.get('/subjects', { params });
        return response.data;
    },

    // Get subject by ID
    getById: async (subjectId) => {
        const response = await axiosInstance.get(`/subjects/${subjectId}`);
        return response.data;
    },

    // Create subject (Trainer/Admin)
    create: async (subjectData) => {
        const response = await axiosInstance.post('/subjects', subjectData);
        return response.data;
    },

    // Update subject (Trainer/Admin)
    update: async (subjectId, subjectData) => {
        const response = await axiosInstance.put(`/subjects/${subjectId}`, subjectData);
        return response.data;
    },

    // Delete subject (Admin only)
    delete: async (subjectId) => {
        const response = await axiosInstance.delete(`/subjects/${subjectId}`);
        return response.data;
    },

    // Get subjects by department
    getByDepartment: async (department) => {
        const response = await axiosInstance.get('/subjects', {
            params: { department },
        });
        return response.data;
    },

    // Get subjects by semester
    getBySemester: async (semester) => {
        const response = await axiosInstance.get('/subjects', {
            params: { semester },
        });
        return response.data;
    },
};