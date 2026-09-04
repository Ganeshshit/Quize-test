// src/api/proctor.api.js
import axiosInstance from './axios';
import crypto from 'crypto-js';

const EVENT_HMAC_SECRET = import.meta.env.REACT_APP_EVENT_HMAC_SECRET || 'EVENT_SECRET';

/**
 * Generate HMAC signature for proctor events
 */
const generateHMAC = (attemptId, type, timestamp) => {
    const payload = `${attemptId}|${type}|${timestamp}`;
    return crypto.HmacSHA256(payload, EVENT_HMAC_SECRET).toString();
};

/**
 * Generate unique nonce for replay protection
 */
const generateNonce = () => {
    return `${Date.now()}-${crypto.lib.WordArray.random(16).toString()}`;
};

export const proctorAPI = {
    /**
     * STEP 8: Generate WebRTC token for proctoring session
     * Called immediately after quiz attempt loads
     */
    generateToken: async (attemptId) => {
        try {
            const response = await axiosInstance.post('/proctor/student/token', {
                attemptId
            });
            return response.data;
        } catch (error) {
            console.error('Generate token error:', error);
            throw error;
        }
    },

    /**
     * STEP 12: Log proctoring event with tamper-proof signature
     * Called for all suspicious activities
     */
    logEvent: async (attemptId, type, meta = {}) => {
        try {
            const timestamp = Date.now();
            const signature = generateHMAC(attemptId, type, timestamp);
            const nonce = generateNonce();

            const response = await axiosInstance.post('/proctor/student/event', {
                attemptId,
                type,
                meta,
                timestamp,
                signature,
                nonce
            });

            return response.data;
        } catch (error) {
            console.error('Log event error:', error);
            throw error;
        }
    },

    /**
     * Log screen share end event
     */
    screenShareEnd: async (attemptId) => {
        try {
            const response = await axiosInstance.post('/proctor/student/screen-share/end', {
                attemptId
            });
            return response.data;
        } catch (error) {
            console.error('Screen share end error:', error);
            throw error;
        }
    },

    /**
     * Get proctor logs for an attempt (admin/trainer only)
     */
    getAttemptLogs: async (attemptId, params = {}) => {
        try {
            const response = await axiosInstance.get(`/proctor/admin/attempts/${attemptId}/logs`, {
                params
            });
            return response.data;
        } catch (error) {
            console.error('Get attempt logs error:', error);
            throw error;
        }
    },

    /**
     * Get flagged attempts (admin/trainer only)
     */
    getFlaggedAttempts: async (params = {}) => {
        try {
            const response = await axiosInstance.get('/proctor/admin/flagged', {
                params
            });
            return response.data;
        } catch (error) {
            console.error('Get flagged attempts error:', error);
            throw error;
        }
    },

    /**
     * Send admin command to student (terminate, warn, etc.)
     */
    sendCommand: async (attemptId, command, reason = '') => {
        try {
            const response = await axiosInstance.post('/proctor/admin/command', {
                attemptId,
                command,
                reason
            });
            return response.data;
        } catch (error) {
            console.error('Send command error:', error);
            throw error;
        }
    }
};

/**
 * Proctor Event Types
 */
export const PROCTOR_EVENTS = {
    // Camera events
    CAMERA_BLOCKED: 'camera-blocked',
    CAMERA_ENABLED: 'camera-enabled',
    CAMERA_ERROR: 'camera-error',
    FACE_NOT_DETECTED: 'face-not-detected',
    MULTIPLE_FACES_DETECTED: 'multiple-faces-detected',

    // Fullscreen events
    FULLSCREEN_EXIT: 'fullscreen-exit',
    FULLSCREEN_ENTER: 'fullscreen-enter',

    // Tab switch events
    TAB_SWITCH: 'tab-switch',
    TAB_SWITCH_LIMIT_EXCEEDED: 'tab-switch-limit-exceeded',

    // Copy/paste events
    COPY_ATTEMPT: 'copy-attempt',
    PASTE_ATTEMPT: 'paste-attempt',

    // Screen events
    SCREEN_SHARE_START: 'screen-share-start',
    SCREEN_SHARE_END: 'screen-share-end',

    // Security events
    DEV_TOOLS_OPEN: 'dev-tools-open',
    SCREEN_RECORDING_DETECTED: 'screen-recording-detected',
    VIRTUAL_MACHINE_DETECTED: 'virtual-machine-detected',
    SUSPICIOUS_ACTIVITY: 'suspicious-activity',

    // Connection events
    CONNECTION_LOST: 'connection-lost',
    CONNECTION_RESTORED: 'connection-restored',

    // Attempt events
    ATTEMPT_START: 'attempt-start',
    ATTEMPT_SUBMIT: 'attempt-submit',
    ATTEMPT_AUTO_SUBMIT: 'attempt-auto-submit'
};  