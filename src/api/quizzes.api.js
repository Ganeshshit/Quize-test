// src/api/quizzes.api.js
import axiosInstance from './axios';

export const quizzesAPI = {
    // -----------------------------------------
    // QUIZ CRUD
    // -----------------------------------------

    // Get all quizzes with optional params
    getAll: async (params = {}) => {
        const response = await axiosInstance.get('/quizzes', { params });
        return response.data;
    },

    // Get quiz details
    getById: async (quizId) => {
        const response = await axiosInstance.get(`/quizzes/${quizId}`);
        return response.data;
    },

    // Create quiz (Trainer/Admin)
    create: async (quizData) => {
        const response = await axiosInstance.post('/quizzes', quizData);
        return response.data;
    },

    // Update quiz
    update: async (quizId, quizData) => {
        const response = await axiosInstance.put(`/quizzes/${quizId}`, quizData);
        return response.data;
    },

    // Delete quiz
    delete: async (quizId) => {
        const response = await axiosInstance.delete(`/quizzes/${quizId}`);
        return response.data;
    },

    // -----------------------------------------
    // PUBLISH / UNPUBLISH
    // -----------------------------------------

    // Publish quiz
    publish: async (quizId) => {
        const response = await axiosInstance.patch(
            `/quizzes/${quizId}/publish`,
            { isPublished: true }
        );
        return response.data;
    },

    // Unpublish quiz
    unpublish: async (quizId) => {
        const response = await axiosInstance.patch(
            `/quizzes/${quizId}/publish`,
            { isPublished: false }
        );
        return response.data;
    },

    // -----------------------------------------
    // QUIZ STATISTICS
    // -----------------------------------------

    getStats: async (quizId) => {
        const response = await axiosInstance.get(`/quizzes/${quizId}/statistics`);
        return response.data;
    },

    // -----------------------------------------
    // QUIZ → QUESTION MANAGEMENT (NEW)
    // -----------------------------------------

    // Get all questions attached to a quiz
    getQuestions: async (quizId) => {
        const response = await axiosInstance.get(`/quizzes/${quizId}/questions`);
        return response.data;
    },

    // Add existing question from question bank → quiz
    addQuestion: async (quizId, questionId) => {
        const response = await axiosInstance.post(
            `/quizzes/${quizId}/questions`,
            { questionId }
        );
        return response.data;
    },

    // Remove a question from quiz
    removeQuestion: async (quizId, questionId) => {
        const response = await axiosInstance.delete(
            `/quizzes/${quizId}/questions/${questionId}`
        );
        return response.data;
    },

    // Bulk upload XLS/XLSX/CSV → create + attach questions
    bulkUploadQuestions: async (quizId, file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axiosInstance.post(
            `/quizzes/${quizId}/questions/bulk-upload`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data;
    },
    manualAddQuestion: async (quizId, questionData) => {
        const response = await axiosInstance.post(
            `/quizzes/${quizId}/questions/manual`,
            questionData
        );
        return response.data;
    },
};
