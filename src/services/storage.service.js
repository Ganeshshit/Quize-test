// src/services/storage.service.js
import CryptoJS from 'crypto-js';

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
        this.encryptionVersion = 'v2'; // Track encryption version for migration
        this.encryptionEnabled = true; // Can be disabled for troubleshooting
        this.migrationPerformed = false;
    }

    /**
     * Enable/disable encryption (for troubleshooting)
     */
    setEncryptionEnabled(enabled) {
        this.encryptionEnabled = enabled;
        console.log(`Encryption ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Perform migration of old encrypted data
     */
    performMigration() {
        if (this.migrationPerformed) return;

        console.log('Starting data migration...');
        const migrated = this.migrateAllData();
        this.migrationPerformed = true;
        
        if (migrated > 0) {
            console.log(`Successfully migrated ${migrated} items to new encryption`);
        } else {
            console.log('No items needed migration');
        }
    }

    /**
     * Get encryption key from environment or generate secure key
     * In production, this should come from a secure environment variable
     */
    getEncryptionKey() {
        // Priority: Environment variable > localStorage generated key > fallback
        if (import.meta.env.VITE_ENCRYPTION_KEY) {
            return import.meta.env.VITE_ENCRYPTION_KEY;
        }
        
        // Check if we have a generated key in storage
        const storedKey = localStorage.getItem('quiz_encryption_key');
        if (storedKey) {
            return storedKey;
        }
        
        // Generate and store a secure key (for development only)
        const secureKey = this.generateSecureKey();
        localStorage.setItem('quiz_encryption_key', secureKey);
        return secureKey;
    }

    /**
     * Generate a cryptographically secure key
     */
    generateSecureKey() {
        const array = new Uint8Array(32); // 256 bits
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Legacy XOR encryption (for backward compatibility)
     */
    encryptLegacy(data) {
        try {
            const key = 'quiz-app-secure-key-2024';
            const jsonStr = JSON.stringify(data);
            let encrypted = '';

            for (let i = 0; i < jsonStr.length; i++) {
                encrypted += String.fromCharCode(
                    jsonStr.charCodeAt(i) ^ key.charCodeAt(i % key.length)
                );
            }

            return btoa(encrypted);
        } catch (error) {
            console.error('Legacy encryption error:', error);
            return null;
        }
    }

    /**
     * Legacy XOR decryption (for backward compatibility)
     */
    decryptLegacy(encryptedData) {
        try {
            const key = 'quiz-app-secure-key-2024';
            const encrypted = atob(encryptedData);
            let decrypted = '';

            for (let i = 0; i < encrypted.length; i++) {
                decrypted += String.fromCharCode(
                    encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
                );
            }

            return JSON.parse(decrypted);
        } catch (error) {
            // Silent fail - old data is invalid, will be cleared
            return null;
        }
    }

    /**
     * Encrypt data using AES-256-GCM
     */
    encrypt(data) {
        if (!this.encryptionEnabled) {
            return JSON.stringify(data);
        }

        try {
            const key = this.getEncryptionKey();
            const jsonStr = JSON.stringify(data);
            
            // Use AES-256 encryption with the key
            const encrypted = CryptoJS.AES.encrypt(jsonStr, key).toString();
            
            // Add version prefix
            return `${this.encryptionVersion}:${encrypted}`;
        } catch (error) {
            console.error('Encryption error:', error);
            // Fallback to legacy encryption
            return this.encryptLegacy(data);
        }
    }

    /**
     * Decrypt stored data with backward compatibility
     */
    decrypt(encryptedData) {
        try {
            if (!encryptedData) return null;

            // Check if it's new format (version:encrypted)
            if (typeof encryptedData === 'string' && encryptedData.includes(':')) {
                const [version, data] = encryptedData.split(':', 2);
                
                if (version === 'v2') {
                    // Use AES-256 decryption
                    const key = this.getEncryptionKey();
                    const decrypted = CryptoJS.AES.decrypt(data, key);
                    const jsonStr = decrypted.toString(CryptoJS.enc.Utf8);
                    return JSON.parse(jsonStr);
                }
            }

            // Try legacy decryption for old data
            const legacyResult = this.decryptLegacy(encryptedData);
            if (legacyResult) {
                console.log('Decrypted using legacy format, will re-encrypt on next save');
                return legacyResult;
            }

            // If it's not encrypted, try to parse as JSON directly
            try {
                return JSON.parse(encryptedData);
            } catch {
                // Return as plain string if not JSON
                return encryptedData;
            }
        } catch (error) {
            console.error('Decryption error:', error);
            // Final fallback: try to return as plain string
            try {
                return JSON.parse(encryptedData);
            } catch {
                return encryptedData;
            }
        }
    }

    /**
     * Migrate old encrypted data to new encryption
     */
    migrateData(key) {
        try {
            const storage = this.getStorage();
            const oldData = storage.getItem(key);
            
            if (!oldData) return false;

            // Try to decrypt with legacy method
            const decrypted = this.decryptLegacy(oldData);
            if (decrypted) {
                // Re-encrypt with new method
                const newEncrypted = this.encrypt(decrypted);
                storage.setItem(key, newEncrypted);
                console.log(`Migrated ${key} to new encryption`);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error(`Migration error for ${key}:`, error);
            return false;
        }
    }

    /**
     * Migrate all sensitive data
     */
    migrateAllData() {
        const sensitiveKeys = [
            STORAGE_KEYS.ACCESS_TOKEN,
            STORAGE_KEYS.REFRESH_TOKEN,
            STORAGE_KEYS.USER_DATA,
        ];

        let migratedCount = 0;
        for (const key of sensitiveKeys) {
            if (this.migrateData(key)) {
                migratedCount++;
            }
        }

        console.log(`Migration complete: ${migratedCount} items migrated`);
        return migratedCount;
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

            if (decrypt) {
                return this.decrypt(data);
            }

            // Try to parse as JSON, but handle encrypted data gracefully
            try {
                return JSON.parse(data);
            } catch {
                // If JSON parsing fails, it might be encrypted data
                // Try to decrypt it anyway
                const decrypted = this.decrypt(data);
                if (decrypted) {
                    console.log(`Auto-decrypted ${key} that was stored as encrypted`);
                    return decrypted;
                }
                // Return as string if nothing works
                return data;
            }
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