// utils/quiz.utils.js - Utility functions for quiz functionality

/**
 * Generate client fingerprint for security
 */
export const generateFingerprint = () => {
    try {
        // Canvas fingerprinting
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('fingerprint', 2, 2);
        const canvasData = canvas.toDataURL();

        // Screen info
        const screen = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;

        // Timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Language
        const language = navigator.language;

        // Platform
        const platform = navigator.platform;

        // Combine all factors
        const fingerprint = `${canvasData}-${screen}-${timezone}-${language}-${platform}`;

        // Generate hash
        return hashString(fingerprint);
    } catch (error) {
        console.error('Fingerprint generation failed:', error);
        return 'fallback-' + Date.now();
    }
};

/**
 * Simple hash function for fingerprint
 */
const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
};

/**
 * Format time in MM:SS format
 */
export const formatTime = (seconds) => {
    if (seconds < 0) return '00:00';

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format time in human-readable format
 */
export const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;

    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
};

/**
 * Calculate time remaining until quiz starts/ends
 */
export const getTimeUntil = (targetDate) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target - now;

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;

    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${seconds}s`;
};

/**
 * Check if quiz is currently available
 */
export const isQuizAvailable = (quiz) => {
    const now = new Date();
    const startTime = new Date(quiz.startTime);
    const endTime = new Date(quiz.endTime);

    return quiz.isPublished &&
        now >= startTime &&
        now <= endTime &&
        quiz.attemptsRemaining > 0;
};

/**
 * Get quiz status
 */
export const getQuizStatus = (quiz) => {
    const now = new Date();
    const startTime = new Date(quiz.startTime);
    const endTime = new Date(quiz.endTime);

    if (!quiz.isPublished) return 'unpublished';
    if (now < startTime) return 'upcoming';
    if (now > endTime) return 'ended';
    if (quiz.attemptsRemaining === 0) return 'exhausted';
    return 'available';
};

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
    const colors = {
        'available': 'green',
        'upcoming': 'blue',
        'ended': 'red',
        'exhausted': 'gray',
        'unpublished': 'yellow'
    };
    return colors[status] || 'gray';
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (score, maxScore) => {
    if (!maxScore || maxScore === 0) return 0;
    return ((score / maxScore) * 100).toFixed(2);
};

/**
 * Get performance level based on percentage
 */
export const getPerformanceLevel = (percentage) => {
    if (percentage >= 90) return { label: 'Excellent', color: 'emerald', icon: '🌟' };
    if (percentage >= 75) return { label: 'Very Good', color: 'green', icon: '✨' };
    if (percentage >= 60) return { label: 'Good', color: 'blue', icon: '👍' };
    if (percentage >= 40) return { label: 'Fair', color: 'yellow', icon: '📚' };
    return { label: 'Needs Improvement', color: 'red', icon: '💪' };
};

/**
 * Get grade letter based on percentage
 */
export const getGradeLetter = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'B-';
    if (percentage >= 60) return 'C+';
    if (percentage >= 55) return 'C';
    if (percentage >= 50) return 'C-';
    if (percentage >= 40) return 'D';
    return 'F';
};

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
export const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

/**
 * Validate answer format
 */
export const validateAnswer = (questionType, answer) => {
    switch (questionType) {
        case 'mcq_single':
            return typeof answer === 'string' && answer.length > 0;
        case 'mcq_multi':
            return Array.isArray(answer) && answer.length > 0;
        case 'true_false':
            return ['true', 'false'].includes(String(answer).toLowerCase());
        case 'numeric':
            return !isNaN(parseFloat(answer));
        case 'short_answer':
            return typeof answer === 'string' && answer.trim().length > 0;
        default:
            return false;
    }
};

/**
 * Get choice label (A, B, C, D...)
 */
export const getChoiceLabel = (index) => {
    return String.fromCharCode(65 + index);
};

/**
 * Local storage helpers with encryption
 */
export const secureStorage = {
    set: (key, value) => {
        try {
            const encrypted = btoa(JSON.stringify(value));
            localStorage.setItem(key, encrypted);
        } catch (error) {
            console.error('Storage set error:', error);
        }
    },

    get: (key) => {
        try {
            const encrypted = localStorage.getItem(key);
            if (!encrypted) return null;
            return JSON.parse(atob(encrypted));
        } catch (error) {
            console.error('Storage get error:', error);
            return null;
        }
    },

    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Storage remove error:', error);
        }
    },

    clear: () => {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Storage clear error:', error);
        }
    }
};

/**
 * Tab visibility tracking
 */
export const createVisibilityTracker = (onHidden) => {
    let count = 0;

    const handleVisibilityChange = () => {
        if (document.hidden) {
            count++;
            onHidden(count);
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return {
        getCount: () => count,
        cleanup: () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
    };
};

/**
 * Fullscreen helpers
 */
export const fullscreenUtils = {
    enter: async () => {
        try {
            await document.documentElement.requestFullscreen();
            return true;
        } catch (error) {
            console.error('Fullscreen enter error:', error);
            return false;
        }
    },

    exit: async () => {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            }
            return true;
        } catch (error) {
            console.error('Fullscreen exit error:', error);
            return false;
        }
    },

    isActive: () => {
        return !!document.fullscreenElement;
    },

    onChange: (callback) => {
        const handler = () => callback(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }
};

/**
 * Copy-paste prevention
 */
export const preventCopyPaste = (enable = true) => {
    const prevent = (e) => {
        e.preventDefault();
        return false;
    };

    if (enable) {
        document.addEventListener('copy', prevent);
        document.addEventListener('paste', prevent);
        document.addEventListener('cut', prevent);

        return () => {
            document.removeEventListener('copy', prevent);
            document.removeEventListener('paste', prevent);
            document.removeEventListener('cut', prevent);
        };
    }
};

/**
 * Right-click prevention
 */
export const preventRightClick = (enable = true) => {
    const prevent = (e) => {
        e.preventDefault();
        return false;
    };

    if (enable) {
        document.addEventListener('contextmenu', prevent);
        return () => document.removeEventListener('contextmenu', prevent);
    }
};

/**
 * Format date/time
 */
export const formatDateTime = (date, format = 'full') => {
    const d = new Date(date);

    switch (format) {
        case 'date':
            return d.toLocaleDateString();
        case 'time':
            return d.toLocaleTimeString();
        case 'short':
            return d.toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        case 'full':
        default:
            return d.toLocaleString();
    }
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

/**
 * Calculate quiz statistics
 */
export const calculateQuizStats = (attempts) => {
    if (!attempts || attempts.length === 0) {
        return {
            totalAttempts: 0,
            avgScore: 0,
            bestScore: null,
            worstScore: null,
            passRate: 0,
            avgTimeSpent: 0
        };
    }

    const scores = attempts.map(a => a.totalScore || 0);
    const passed = attempts.filter(a => a.passed).length;
    const timeSpent = attempts.map(a => a.timeSpentSeconds || 0);

    return {
        totalAttempts: attempts.length,
        avgScore: (scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(2),
        bestScore: Math.max(...scores),
        worstScore: Math.min(...scores),
        passRate: ((passed / attempts.length) * 100).toFixed(1),
        avgTimeSpent: Math.floor(timeSpent.reduce((sum, t) => sum + t, 0) / timeSpent.length)
    };
};

/**
 * Download results as JSON
 */
export const downloadResults = (attempt, filename = 'quiz-result.json') => {
    const dataStr = JSON.stringify(attempt, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', filename);
    link.click();
};

/**
 * Print results
 */
export const printResults = () => {
    window.print();
};

/**
 * Share results (if Web Share API is available)
 */
export const shareResults = async (attempt) => {
    if (!navigator.share) {
        return { success: false, error: 'Share not supported' };
    }

    try {
        await navigator.share({
            title: `Quiz Result: ${attempt.quiz.title}`,
            text: `I scored ${attempt.totalScore}/${attempt.maxScore} (${attempt.percentage}%)`,
            url: window.location.href
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Validate quiz timing
 */
export const validateQuizTiming = (startTime, endTime, attemptStartTime, durationMinutes) => {
    const now = new Date();
    const start = new Date(attemptStartTime);
    const quizStart = new Date(startTime);
    const quizEnd = new Date(endTime);

    // Check if quiz window is valid
    if (now < quizStart) {
        return { valid: false, reason: 'Quiz has not started yet' };
    }

    if (now > quizEnd) {
        return { valid: false, reason: 'Quiz has ended' };
    }

    // Check attempt duration
    const elapsed = Math.floor((now - start) / 1000);
    const allowed = durationMinutes * 60;

    if (elapsed > allowed) {
        return { valid: false, reason: 'Time limit exceeded' };
    }

    return { valid: true, remaining: allowed - elapsed };
};

/**
 * Get browser info
 */
export const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';

    if (ua.indexOf('Firefox') > -1) {
        browserName = 'Firefox';
        browserVersion = ua.match(/Firefox\/([0-9.]+)/)?.[1];
    } else if (ua.indexOf('Chrome') > -1) {
        browserName = 'Chrome';
        browserVersion = ua.match(/Chrome\/([0-9.]+)/)?.[1];
    } else if (ua.indexOf('Safari') > -1) {
        browserName = 'Safari';
        browserVersion = ua.match(/Version\/([0-9.]+)/)?.[1];
    } else if (ua.indexOf('Edge') > -1) {
        browserName = 'Edge';
        browserVersion = ua.match(/Edge\/([0-9.]+)/)?.[1];
    }

    return {
        name: browserName,
        version: browserVersion,
        userAgent: ua,
        platform: navigator.platform,
        language: navigator.language
    };
};

/**
 * Check network status
 */
export const networkStatus = {
    isOnline: () => navigator.onLine,

    onChange: (callback) => {
        const handleOnline = () => callback(true);
        const handleOffline = () => callback(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }
};

export default {
    generateFingerprint,
    formatTime,
    formatDuration,
    getTimeUntil,
    isQuizAvailable,
    getQuizStatus,
    getStatusColor,
    calculatePercentage,
    getPerformanceLevel,
    getGradeLetter,
    shuffleArray,
    validateAnswer,
    getChoiceLabel,
    secureStorage,
    createVisibilityTracker,
    fullscreenUtils,
    preventCopyPaste,
    preventRightClick,
    formatDateTime,
    debounce,
    throttle,
    calculateQuizStats,
    downloadResults,
    printResults,
    shareResults,
    validateQuizTiming,
    getBrowserInfo,
    networkStatus
};