// Temporary utility to clear old encrypted data
// Run this in browser console to clear storage if needed

export const clearOldStorage = () => {
    console.log('Clearing old storage data...');
    
    // Clear all auth-related storage
    const keysToRemove = [
        'quiz_access_token',
        'quiz_refresh_token', 
        'quiz_user_data',
        'quiz_encryption_key',
        'quiz_csrf_token',
        'user', // any fallback keys
        'authUser',
        'currentUser',
        'userData'
    ];

    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
        console.log(`Removed ${key}`);
    });

    console.log('Storage cleared. Please refresh the page and login again.');
};

// Also provide a function to check what's in storage
export const debugStorage = () => {
    console.log('=== Current Storage Contents ===');
    
    const keysToCheck = [
        'quiz_access_token',
        'quiz_refresh_token',
        'quiz_user_data',
        'quiz_encryption_key',
        'user',
        'authUser'
    ];

    keysToCheck.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            console.log(`${key}:`, value.substring(0, 50) + '...');
        } else {
            console.log(`${key}: (empty)`);
        }
    });
};

// Auto-run migration if needed
export const forceMigration = () => {
    console.log('Forcing data migration...');
    
    try {
        // Import storage service
        const { storageService } = require('../services/storage.service');
        storageService.performMigration();
        console.log('Migration completed');
    } catch (error) {
        console.error('Migration failed:', error);
    }
};

// Export for use in console
if (typeof window !== 'undefined') {
    window.clearOldStorage = clearOldStorage;
    window.debugStorage = debugStorage;
    window.forceMigration = forceMigration;
}