// src/api/attempts.api.js
import axiosInstance from './axios';

export const attemptsAPI = {
    // Start quiz attempt (Student)
    start: async (quizId) => {
        const response = await axiosInstance.post(`/quizzes/${quizId}/start`);
        return response.data;
    },

    // Save progress (Student)
    save: async (quizId, answers) => {
        const response = await axiosInstance.post(`/quizzes/${quizId}/save`, {
            answers,
            timestamp: new Date().toISOString(),
        });
        return response.data;
    },

    // Submit quiz (Student)
    submit: async (quizId, answers) => {
        const response = await axiosInstance.post(`/quizzes/${quizId}/submit`, {
            answers,
            submittedAt: new Date().toISOString(),
        });
        return response.data;
    },

    // Get specific attempt (Student)
    getAttempt: async (quizId, attemptId) => {
        const response = await axiosInstance.get(
            `/quizzes/${quizId}/attempts/${attemptId}`
        );
        return response.data;
    },

    // Get all attempts for a quiz (Trainer)
    getAllAttempts: async (quizId, params = {}) => {
        const response = await axiosInstance.get(`/quizzes/${quizId}/attempts`, {
            params,
        });
        return response.data;
    },

    // Get student's attempts
    getMyAttempts: async (quizId) => {
        const response = await axiosInstance.get(`/quizzes/${quizId}/my-attempts`);
        return response.data;
    },

    // Get attempt results
    getResults: async (quizId, attemptId) => {
        const response = await axiosInstance.get(
            `/quizzes/${quizId}/attempts/${attemptId}/results`
        );
        return response.data;
    },
};