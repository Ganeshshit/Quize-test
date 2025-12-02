// src/api/axios.js
import axios from 'axios';
import { jwtService } from '../services/jwt.service';
import { storageService } from '../services/storage.service';

const BASE_URL = 'http://localhost:5000/api/v1';

// Create axios instance
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = storageService.getAccessToken();

        if (token && !jwtService.isTokenExpired(token)) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = generateRequestId();

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token refresh
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = storageService.getRefreshToken();

                if (!refreshToken || jwtService.isTokenExpired(refreshToken)) {
                    // Refresh token expired, logout user
                    storageService.clearAuth();
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                // Attempt to refresh the access token
                const response = await axios.post(`${BASE_URL}/auth/refresh`, {
                    refreshToken,
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                // Store new tokens
                storageService.setAccessToken(accessToken);
                if (newRefreshToken) {
                    storageService.setRefreshToken(newRefreshToken);
                }

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // Refresh failed, logout user
                storageService.clearAuth();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Helper function to generate unique request ID
function generateRequestId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default axiosInstance;