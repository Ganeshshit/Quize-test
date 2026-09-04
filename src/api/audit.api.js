// src/api/audit.api.js
import axiosInstance from './axios';

export const auditAPI = {
    // Log audit event (Student)
    logEvent: async (eventData) => {
        const response = await axiosInstance.post('/audit/event', {
            ...eventData,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
        });
        return response.data;
    },

    // Get audit logs for attempt (Trainer/Admin)
    getAttemptLogs: async (attemptId) => {
        const response = await axiosInstance.get(`/audit/${attemptId}`);
        return response.data;
    },

    // Get suspicious activities
    getSuspiciousActivities: async (params = {}) => {
        const response = await axiosInstance.get('/audit/suspicious', { params });
        return response.data;
    },

    // Batch log events
    batchLogEvents: async (events) => {
        const response = await axiosInstance.post('/audit/batch', {
            events: events.map(event => ({
                ...event,
                timestamp: event.timestamp || new Date().toISOString(),
            })),
        });
        return response.data;
    },
};