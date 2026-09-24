// src/api/questions.api.js
import axiosInstance from './axios';

export const questionsAPI = {
    // Get all questions with proper error handling
    getAll: async (params = {}) => {
        try {
            console.log('📡 API Call - Fetching questions with params:', params);

            const response = await axiosInstance.get('/questions', { params });
            const data = response.data;

            // console.log('📥 API Response - Raw data:', JSON.stringify(data, null, 2));

            // Handle different response structures
            let questions = [];
            let pagination = null;

            if (data.success) {
                // Structure 1: { success: true, data: [...], pagination: {...} }
                if (Array.isArray(data.data)) {
                    questions = data.data;
                    pagination = data.pagination;
                    console.log('📋 Structure 1 detected: Array in data property');
                }
                // Structure 2: { success: true, data: { questions: [...], pagination: {...} } }
                else if (data.data && Array.isArray(data.data.questions)) {
                    questions = data.data.questions;
                    pagination = data.data.pagination;
                    console.log('📋 Structure 2 detected: Nested questions array');
                }
                // Structure 3: { success: true, questions: [...], pagination: {...} }
                else if (Array.isArray(data.questions)) {
                    questions = data.questions;
                    pagination = data.pagination;
                    console.log('📋 Structure 3 detected: Direct questions array');
                }
                else {
                    console.warn('⚠️ Unknown response structure:', data);
                }
            } else {
                console.error('❌ API returned success: false');
            }

            console.log(`✅ API Success - Extracted ${questions.length} questions`);

            // Log sample question for debugging
            if (questions.length > 0) {
                console.log('📝 Sample question:', questions[0]);
            }

            return {
                success: true,
                data: questions,
                pagination: pagination || {
                    page: params.page || 1,
                    limit: params.limit || 100,
                    total: questions.length,
                    totalPages: Math.ceil(questions.length / (params.limit || 100))
                }
            };
        } catch (error) {
            console.error('❌ API Error:', error);
            console.error('❌ Error details:', error.response?.data);
            throw error;
        }
    },

    // Get question by ID
    getById: async (questionId) => {
        try {
            console.log('📡 Fetching question by ID:', questionId);
            const response = await axiosInstance.get(`/questions/${questionId}`);
            console.log('📥 Question response:', response.data);
            return response.data.data || response.data;
        } catch (error) {
            console.error('❌ Error fetching question:', error);
            throw error;
        }
    },

    // Create question
    create: async (questionData) => {
        try {
            const response = await axiosInstance.post('/questions', questionData);
            return response.data;
        } catch (error) {
            console.error('❌ Error creating question:', error);
            throw error;
        }
    },

    // Update question
    update: async (questionId, questionData) => {
        try {
            const response = await axiosInstance.put(`/questions/${questionId}`, questionData);
            return response.data;
        } catch (error) {
            console.error('❌ Error updating question:', error);
            throw error;
        }
    },

    // Delete question
    delete: async (questionId) => {
        try {
            const response = await axiosInstance.delete(`/questions/${questionId}`);
            return response.data;
        } catch (error) {
            console.error('❌ Error deleting question:', error);
            throw error;
        }
    },

    // Bulk create questions
    bulkCreate: async (questions) => {
        try {
            const response = await axiosInstance.post('/questions/bulk', { questions });
            return response.data;
        } catch (error) {
            console.error('❌ Error bulk creating questions:', error);
            throw error;
        }
    },

    // Get questions by subject
    getBySubject: async (subjectId, params = {}) => {
        return questionsAPI.getAll({ ...params, subject: subjectId });
    },

    // Get questions by difficulty
    getByDifficulty: async (difficulty, params = {}) => {
        return questionsAPI.getAll({ ...params, difficulty });
    },

    // AI Question Generation
    generateAIQuestions: async (questionData) => {
        try {
            console.log('📡 API Call - Generating AI questions with data:', questionData);
            // AI generation can take longer, so use extended timeout (2 minutes)
            const response = await axiosInstance.post('/questions/ai/generate', questionData, {
                timeout: 120000 // 2 minutes timeout for AI generation
            });
            console.log('📥 AI questions generated:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error generating AI questions:', error);
            throw error;
        }
    },

    // Get pending questions for review
    getPendingQuestions: async (params = {}) => {
        try {
            console.log('📡 API Call - Fetching pending questions with params:', params);
            // Use the correct endpoint - filter by review status instead of /pending
            const response = await axiosInstance.get('/questions', { 
                params: { 
                    ...params, 
                    isVerified: false,
                    source: 'ai'
                } 
            });
            console.log('📥 Pending questions response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching pending questions:', error);
            throw error;
        }
    },

    // Approve a question (update isVerified to true)
    approveQuestion: async (questionId) => {
        try {
            console.log('📡 API Call - Approving question:', questionId);
            const response = await axiosInstance.put(`/questions/${questionId}`, { 
                isVerified: true,
                isActive: true 
            });
            console.log('📥 Question approved:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error approving question:', error);
            throw error;
        }
    },

    // Reject a question (delete the question)
    rejectQuestion: async (questionId, rejectionReason) => {
        try {
            console.log('📡 API Call - Rejecting question:', questionId, 'with reason:', rejectionReason);
            // Delete the question to reject it
            const response = await axiosInstance.delete(`/questions/${questionId}`);
            console.log('📥 Question rejected (deleted):', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error rejecting question:', error);
            throw error;
        }
    },
};