// src/api/enrollment.api.js
import axiosInstance from './axios';

export const enrollmentAPI = {
    // ============================================
    // GET STUDENTS
    // ============================================

    // Get all available students with filters
    getAvailableStudents: async (params = {}) => {
        const response = await axiosInstance.get('/enrollments/available-students', {
            params
        });
        return response.data;
    },

    // Get enrolled students for a quiz
    getEnrolledStudents: async (quizId, params = {}) => {
        const response = await axiosInstance.get(
            `/enrollments/quiz/${quizId}/enrolled`,
            { params }
        );
        return response.data;
    },

    // Get students NOT enrolled in a quiz
    getNotEnrolledStudents: async (quizId, params = {}) => {
        const response = await axiosInstance.get(
            `/enrollments/quiz/${quizId}/not-enrolled`,
            { params }
        );
        return response.data;
    },

    // ============================================
    // ENROLLMENT ACTIONS
    // ============================================

    // Enroll single student
    enrollSingle: async (quizId, studentId) => {
        const response = await axiosInstance.post(
            `/enrollments/quiz/${quizId}/enroll-single`,
            { studentId }
        );
        return response.data;
    },

    // Enroll multiple students
    enrollMultiple: async (quizId, studentIds) => {
        const response = await axiosInstance.post(
            `/enrollments/quiz/${quizId}/enroll-multiple`,
            { studentIds }
        );
        return response.data;
    },

    // Enroll by criteria
    enrollByCriteria: async (quizId, criteria) => {
        const response = await axiosInstance.post(
            `/enrollments/quiz/${quizId}/enroll-by-criteria`,
            criteria
        );
        return response.data;
    },

    // Unenroll single student
    unenrollSingle: async (quizId, studentId) => {
        const response = await axiosInstance.delete(
            `/enrollments/quiz/${quizId}/unenroll-single`,
            { data: { studentId } }
        );
        return response.data;
    },

    // Unenroll multiple students
    unenrollMultiple: async (quizId, studentIds) => {
        const response = await axiosInstance.delete(
            `/enrollments/quiz/${quizId}/unenroll-multiple`,
            { data: { studentIds } }
        );
        return response.data;
    },

    // ============================================
    // STATISTICS
    // ============================================

    // Get enrollment statistics
    getStatistics: async (quizId) => {
        const response = await axiosInstance.get(
            `/enrollments/quiz/${quizId}/statistics`
        );
        return response.data;
    }
};