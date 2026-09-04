// src/utils/helpers.js

// ========== Date/Time Helpers ==========

export const formatDate = (date, format = 'short') => {
    if (!date) return '';

    const d = new Date(date);

    const options = {
        short: { month: 'short', day: 'numeric', year: 'numeric' },
        long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
        time: { hour: '2-digit', minute: '2-digit' },
        full: {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        },
    };

    return new Intl.DateTimeFormat('en-US', options[format] || options.short).format(d);
};

export const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '00:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const getTimeAgo = (date) => {
    if (!date) return '';

    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }

    return 'Just now';
};

export const isDateInPast = (date) => {
    return new Date(date) < new Date();
};

export const isDateInFuture = (date) => {
    return new Date(date) > new Date();
};

// ========== String Helpers ==========

export const truncate = (str, length = 50, suffix = '...') => {
    if (!str || str.length <= length) return str;
    return str.substring(0, length).trim() + suffix;
};

export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
    if (!str) return '';
    return str.split(' ').map(capitalize).join(' ');
};

export const slugify = (str) => {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

export const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ========== Number Helpers ==========

export const formatNumber = (num, decimals = 0) => {
    if (num === null || num === undefined) return '0';
    return Number(num).toFixed(decimals);
};

export const formatPercentage = (value, total, decimals = 1) => {
    if (!total || total === 0) return '0%';
    const percentage = (value / total) * 100;
    return `${percentage.toFixed(decimals)}%`;
};

export const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
};

// ========== Array Helpers ==========

export const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, {});
};

export const sortBy = (array, key, order = 'asc') => {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];

        if (order === 'asc') {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
    });
};

export const uniqueBy = (array, key) => {
    const seen = new Set();
    return array.filter(item => {
        const value = item[key];
        if (seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
};

// ========== Object Helpers ==========

export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

export const pick = (obj, keys) => {
    return keys.reduce((result, key) => {
        if (obj.hasOwnProperty(key)) {
            result[key] = obj[key];
        }
        return result;
    }, {});
};

export const omit = (obj, keys) => {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
};

// ========== Quiz/Attempt Helpers ==========

export const calculateScore = (answers, questions) => {
    let totalScore = 0;
    let earnedScore = 0;

    questions.forEach(question => {
        totalScore += question.points || 0;

        const answer = answers[question._id];
        if (answer && isAnswerCorrect(answer, question)) {
            earnedScore += question.points || 0;
        }
    });

    return {
        earnedScore,
        totalScore,
        percentage: totalScore > 0 ? (earnedScore / totalScore) * 100 : 0,
    };
};

export const isAnswerCorrect = (answer, question) => {
    if (!answer || !question.correctAnswer) return false;

    switch (question.questionType) {
        case 'MCQ':
            return answer === question.correctAnswer;
        case 'True/False':
            return answer === question.correctAnswer;
        case 'Short Answer':
            return answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
        default:
            return false;
    }
};

export const getQuizStatus = (quiz) => {
    const now = new Date();
    const start = new Date(quiz.startDate);
    const end = new Date(quiz.endDate);

    if (now < start) return 'upcoming';
    if (now > end) return 'expired';
    if (quiz.status === 'published') return 'active';
    return 'draft';
};

export const canTakeQuiz = (quiz, attempts) => {
    const status = getQuizStatus(quiz);
    if (status !== 'active') return false;

    if (quiz.maxAttempts && attempts.length >= quiz.maxAttempts) {
        return false;
    }

    return true;
};

// ========== File Helpers ==========

export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const getFileExtension = (filename) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// ========== Local Storage Helpers ==========

export const saveToLocalStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
};

export const getFromLocalStorage = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
};

export const removeFromLocalStorage = (key) => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
};

// ========== Debounce/Throttle ==========

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

export const throttle = (func, limit) => {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// ========== Clipboard ==========

export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
};

// ========== Browser Detection ==========

export const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
};

export const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    let browser = 'Unknown';

    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    return {
        browser,
        userAgent: ua,
        isMobile: isMobile(),
    };
};