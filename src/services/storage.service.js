// src/services/storage.service.js

const STORAGE_KEYS = {
    ACCESS_TOKEN: 'quiz_access_token',
    REFRESH_TOKEN: 'quiz_refresh_token',
    USER_DATA: 'quiz_user_data',
    PREFERENCES: 'quiz_preferences',
    THEME: 'quiz_theme',
};

class StorageService {
    constructor() {
        this.useSessionStorage = false; // Use localStorage by default
    }

    /**
     * Encrypt data before storing (simple XOR encryption for demo)
     * In production, use a proper encryption library like crypto-js
     */
    encrypt(data) {
        try {
            const key = this.getEncryptionKey();
            const jsonStr = JSON.stringify(data);
            let encrypted = '';

            for (let i = 0; i < jsonStr.length; i++) {
                encrypted += String.fromCharCode(
                    jsonStr.charCodeAt(i) ^ key.charCodeAt(i % key.length)
                );
            }

            return btoa(encrypted);
        } catch (error) {
            console.error('Encryption error:', error);
            return null;
        }
    }

    /**
     * Decrypt stored data
     */
    decrypt(encryptedData) {
        try {
            const key = this.getEncryptionKey();
            const encrypted = atob(encryptedData);
            let decrypted = '';

            for (let i = 0; i < encrypted.length; i++) {
                decrypted += String.fromCharCode(
                    encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
                );
            }

            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    }

    /**
     * Get encryption key (in production, use environment variable)
     */
    getEncryptionKey() {
        return 'quiz-app-secure-key-2024'; // In production: process.env.REACT_APP_ENCRYPTION_KEY
    }

    /**
     * Get storage instance
     */
    getStorage() {
        return this.useSessionStorage ? sessionStorage : localStorage;
    }

    /**
     * Set item in storage
     */
    setItem(key, value, encrypt = false) {
        try {
            const storage = this.getStorage();
            const dataToStore = encrypt ? this.encrypt(value) : JSON.stringify(value);
            storage.setItem(key, dataToStore);
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    /**
     * Get item from storage
     */
    getItem(key, decrypt = false) {
        try {
            const storage = this.getStorage();
            const data = storage.getItem(key);

            if (!data) return null;

            return decrypt ? this.decrypt(data) : JSON.parse(data);
        } catch (error) {
            console.error('Storage retrieval error:', error);
            return null;
        }
    }

    /**
     * Remove item from storage
     */
    removeItem(key) {
        try {
            const storage = this.getStorage();
            storage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage removal error:', error);
            return false;
        }
    }

    /**
     * Clear all storage
     */
    clear() {
        try {
            const storage = this.getStorage();
            storage.clear();
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }

    // ========== Token Management ==========

    /**
     * Store access token (encrypted)
     */
    setAccessToken(token) {
        return this.setItem(STORAGE_KEYS.ACCESS_TOKEN, token, true);
    }

    /**
     * Get access token
     */
    getAccessToken() {
        return this.getItem(STORAGE_KEYS.ACCESS_TOKEN, true);
    }

    /**
     * Store refresh token (encrypted)
     */
    setRefreshToken(token) {
        return this.setItem(STORAGE_KEYS.REFRESH_TOKEN, token, true);
    }

    /**
     * Get refresh token
     */
    getRefreshToken() {
        return this.getItem(STORAGE_KEYS.REFRESH_TOKEN, true);
    }

    /**
     * Store both tokens
     */
    setTokens(accessToken, refreshToken) {
        this.setAccessToken(accessToken);
        this.setRefreshToken(refreshToken);
    }

    /**
     * Clear all tokens
     */
    clearTokens() {
        this.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        this.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    }

    // ========== User Data Management ==========

    /**
     * Store user data
     */
    setUserData(userData) {
        return this.setItem(STORAGE_KEYS.USER_DATA, userData, false);
    }

    /**
     * Get user data
     */
    getUserData() {
        return this.getItem(STORAGE_KEYS.USER_DATA, false);
    }

    /**
     * Clear user data
     */
    clearUserData() {
        this.removeItem(STORAGE_KEYS.USER_DATA);
    }

    // ========== Complete Auth Cleanup ==========

    /**
     * Clear all authentication data
     */
    clearAuth() {
        this.clearTokens();
        this.clearUserData();
    }

    // ========== Preferences ==========

    /**
     * Store user preferences
     */
    setPreferences(preferences) {
        return this.setItem(STORAGE_KEYS.PREFERENCES, preferences, false);
    }

    /**
     * Get user preferences
     */
    getPreferences() {
        return this.getItem(STORAGE_KEYS.PREFERENCES, false);
    }

    /**
     * Set theme
     */
    setTheme(theme) {
        return this.setItem(STORAGE_KEYS.THEME, theme, false);
    }

    /**
     * Get theme
     */
    getTheme() {
        return this.getItem(STORAGE_KEYS.THEME, false);
    }

    // ========== Utility Methods ==========

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const token = this.getAccessToken();
        return !!token;
    }

    /**
     * Switch between localStorage and sessionStorage
     */
    useSession(useSession = true) {
        this.useSessionStorage = useSession;
    }
}

export const storageService = new StorageService();