// src/api/questions.api.js
import axiosInstance from './axios';

export const questionsAPI = {
    // Get all questions
    getAll: async (params = {}) => {
        const response = await axiosInstance.get('/questions', { params });
        return response.data;
    },

    // Get question by ID
    // Get question by ID
    getById: async (questionId) => {
        const response = await axiosInstance.get(`/questions/${questionId}`);
        return response.data.data;   // <-- THIS IS THE FIX
    },


    // Create question (Trainer/Admin)
    create: async (questionData) => {
        const response = await axiosInstance.post('/questions', questionData);
        return response.data;
    },

    // Update question (Trainer/Admin)
    update: async (questionId, questionData) => {
        const response = await axiosInstance.put(`/questions/${questionId}`, questionData);
        return response.data;
    },

    // Delete question (Admin only)
    delete: async (questionId) => {
        const response = await axiosInstance.delete(`/questions/${questionId}`);
        return response.data;
    },

    // Bulk create questions
    bulkCreate: async (questions) => {
        const response = await axiosInstance.post('/questions/bulk', { questions });
        return response.data;
    },

    // Get questions by subject
    getBySubject: async (subjectId, params = {}) => {
        const response = await axiosInstance.get('/questions', {
            params: { subjectId, ...params },
        });
        return response.data;
    },

    // Get questions by difficulty
    getByDifficulty: async (difficulty, params = {}) => {
        const response = await axiosInstance.get('/questions', {
            params: { difficulty, ...params },
        });
        return response.data;
    },
};