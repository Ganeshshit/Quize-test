// src/utils/constants.js

// ========== API Configuration ==========
export const API_CONFIG = {
    BASE_URL: 'http://localhost:5000/api/v1',
    TIMEOUT: 15000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
};

// ========== User Roles ==========
export const USER_ROLES = {
    ADMIN: 'admin',
    TRAINER: 'trainer',
    STUDENT: 'student',
};

export const ROLE_LABELS = {
    [USER_ROLES.ADMIN]: 'Administrator',
    [USER_ROLES.TRAINER]: 'Trainer',
    [USER_ROLES.STUDENT]: 'Student',
};

// ========== Question Types ==========
export const QUESTION_TYPES = {
    MCQ: 'MCQ',
    TRUE_FALSE: 'True/False',
    SHORT_ANSWER: 'Short Answer',
    ESSAY: 'Essay',
};

export const QUESTION_TYPE_LABELS = {
    [QUESTION_TYPES.MCQ]: 'Multiple Choice',
    [QUESTION_TYPES.TRUE_FALSE]: 'True/False',
    [QUESTION_TYPES.SHORT_ANSWER]: 'Short Answer',
    [QUESTION_TYPES.ESSAY]: 'Essay',
};

// ========== Difficulty Levels ==========
export const DIFFICULTY_LEVELS = {
    EASY: 'Easy',
    MEDIUM: 'Medium',
    HARD: 'Hard',
};

export const DIFFICULTY_COLORS = {
    [DIFFICULTY_LEVELS.EASY]: '#10B981',
    [DIFFICULTY_LEVELS.MEDIUM]: '#F59E0B',
    [DIFFICULTY_LEVELS.HARD]: '#EF4444',
};

// ========== Quiz Status ==========
export const QUIZ_STATUS = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ACTIVE: 'active',
    EXPIRED: 'expired',
    ARCHIVED: 'archived',
};

export const QUIZ_STATUS_LABELS = {
    [QUIZ_STATUS.DRAFT]: 'Draft',
    [QUIZ_STATUS.PUBLISHED]: 'Published',
    [QUIZ_STATUS.ACTIVE]: 'Active',
    [QUIZ_STATUS.EXPIRED]: 'Expired',
    [QUIZ_STATUS.ARCHIVED]: 'Archived',
};

export const QUIZ_STATUS_COLORS = {
    [QUIZ_STATUS.DRAFT]: '#6B7280',
    [QUIZ_STATUS.PUBLISHED]: '#3B82F6',
    [QUIZ_STATUS.ACTIVE]: '#10B981',
    [QUIZ_STATUS.EXPIRED]: '#EF4444',
    [QUIZ_STATUS.ARCHIVED]: '#6B7280',
};

// ========== Attempt Status ==========
export const ATTEMPT_STATUS = {
    IN_PROGRESS: 'in-progress',
    SUBMITTED: 'submitted',
    GRADED: 'graded',
    EXPIRED: 'expired',
};

export const ATTEMPT_STATUS_LABELS = {
    [ATTEMPT_STATUS.IN_PROGRESS]: 'In Progress',
    [ATTEMPT_STATUS.SUBMITTED]: 'Submitted',
    [ATTEMPT_STATUS.GRADED]: 'Graded',
    [ATTEMPT_STATUS.EXPIRED]: 'Expired',
};

// ========== Auto-save Status ==========
export const AUTOSAVE_STATUS = {
    IDLE: 'idle',
    SAVING: 'saving',
    SAVED: 'saved',
    ERROR: 'error',
};

export const AUTOSAVE_MESSAGES = {
    [AUTOSAVE_STATUS.IDLE]: '',
    [AUTOSAVE_STATUS.SAVING]: 'Saving...',
    [AUTOSAVE_STATUS.SAVED]: 'Saved',
    [AUTOSAVE_STATUS.ERROR]: 'Save failed',
};

// ========== Departments ==========
export const DEPARTMENTS = [
    'Computer Science',
    'Information Technology',
    'Electronics and Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Chemical Engineering',
    'Biotechnology',
];

// ========== Semesters ==========
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

// ========== Batches ==========
export const getCurrentBatches = () => {
    const currentYear = new Date().getFullYear();
    const batches = [];
    for (let i = 0; i < 5; i++) {
        batches.push((currentYear - i).toString());
    }
    return batches;
};

// ========== Time Limits ==========
export const TIME_LIMITS = {
    MIN_QUIZ_DURATION: 5, // minutes
    MAX_QUIZ_DURATION: 300, // minutes
    AUTO_SAVE_INTERVAL: 30, // seconds
    SESSION_TIMEOUT: 3600, // seconds (1 hour)
    TOKEN_REFRESH_BUFFER: 300, // seconds (5 minutes before expiry)
};

// ========== Pagination ==========
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
    MAX_PAGE_SIZE: 100,
};

// ========== Validation Limits ==========
export const VALIDATION_LIMITS = {
    MIN_PASSWORD_LENGTH: 6,
    MAX_PASSWORD_LENGTH: 128,
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50,
    MIN_QUESTION_LENGTH: 10,
    MAX_QUESTION_LENGTH: 1000,
    MIN_OPTIONS_COUNT: 2,
    MAX_OPTIONS_COUNT: 6,
    MIN_POINTS: 1,
    MAX_POINTS: 100,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};

// ========== Audit Event Types ==========
export const AUDIT_EVENT_TYPES = {
    QUIZ_STARTED: 'QUIZ_STARTED',
    QUIZ_SUBMITTED: 'QUIZ_SUBMITTED',
    ANSWER_CHANGED: 'ANSWER_CHANGED',
    QUESTION_NAVIGATED: 'QUESTION_NAVIGATED',
    TAB_BLURRED: 'TAB_BLURRED',
    TAB_FOCUSED: 'TAB_FOCUSED',
    WINDOW_BLURRED: 'WINDOW_BLURRED',
    WINDOW_FOCUSED: 'WINDOW_FOCUSED',
    COPY_PASTE_DETECTED: 'COPY_PASTE_DETECTED',
    RIGHT_CLICK_DETECTED: 'RIGHT_CLICK_DETECTED',
    FULLSCREEN_CHANGED: 'FULLSCREEN_CHANGED',
    SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
    MULTIPLE_TABS_DETECTED: 'MULTIPLE_TABS_DETECTED',
    DEVICE_CHANGED: 'DEVICE_CHANGED',
    TIME_EXPIRED: 'TIME_EXPIRED',
};

// ========== Routes ==========
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',

    // Student routes
    STUDENT_QUIZZES: '/student/quizzes',
    STUDENT_QUIZ_DETAIL: '/student/quizzes/:id',
    STUDENT_TAKE_QUIZ: '/student/quizzes/:id/take',
    STUDENT_QUIZ_RESULT: '/student/quizzes/:id/result/:attemptId',
    STUDENT_ATTEMPTS: '/student/attempts',

    // Trainer routes
    TRAINER_DASHBOARD: '/trainer/dashboard',
    TRAINER_QUIZZES: '/trainer/quizzes',
    TRAINER_QUIZ_CREATE: '/trainer/quizzes/create',
    TRAINER_QUIZ_EDIT: '/trainer/quizzes/:id/edit',
    TRAINER_QUESTIONS: '/trainer/questions',
    TRAINER_QUESTION_CREATE: '/trainer/questions/create',
    TRAINER_QUESTION_EDIT: '/trainer/questions/:id/edit',
    TRAINER_SUBJECTS: '/trainer/subjects',
    TRAINER_GRADING: '/trainer/grading',

    // Admin routes
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_USERS: '/admin/users',
    ADMIN_STATS: '/admin/stats',
    ADMIN_AUDIT: '/admin/audit',
};

// ========== Error Messages ==========
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your internet connection.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    SESSION_EXPIRED: 'Your session has expired. Please login again.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    NOT_FOUND: 'The requested resource was not found.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

// ========== Success Messages ==========
export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Login successful!',
    LOGOUT_SUCCESS: 'Logout successful!',
    REGISTER_SUCCESS: 'Registration successful!',
    UPDATE_SUCCESS: 'Update successful!',
    DELETE_SUCCESS: 'Delete successful!',
    SAVE_SUCCESS: 'Saved successfully!',
    SUBMIT_SUCCESS: 'Submitted successfully!',
};

// ========== Storage Keys ==========
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'quiz_access_token',
    REFRESH_TOKEN: 'quiz_refresh_token',
    USER_DATA: 'quiz_user_data',
    PREFERENCES: 'quiz_preferences',
    THEME: 'quiz_theme',
};

// ========== Theme Colors ==========
export const THEME_COLORS = {
    PRIMARY: '#3B82F6',
    SECONDARY: '#6B7280',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    INFO: '#3B82F6',
};

// ========== Date Formats ==========
export const DATE_FORMATS = {
    SHORT: 'MMM DD, YYYY',
    LONG: 'MMMM DD, YYYY',
    FULL: 'dddd, MMMM DD, YYYY',
    TIME: 'hh:mm A',
    DATETIME: 'MMM DD, YYYY hh:mm A',
};

// ========== Regex Patterns ==========
export const REGEX_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    ROLL_NO: /^\d{2}[A-Z]{2,4}\d{3}$/,
    REGISTRATION_NO: /^REG\d{4}[A-Z]{2,4}\d{3}$/,
    PHONE: /^[6-9]\d{9}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
};

// ========== File Types ==========
export const ALLOWED_FILE_TYPES = {
    IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    EXCEL: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
};

export const FILE_EXTENSIONS = {
    IMAGE: ['.jpg', '.jpeg', '.png', '.gif'],
    DOCUMENT: ['.pdf', '.doc', '.docx'],
    EXCEL: ['.xls', '.xlsx'],
};

// ========== Grade Scale ==========
export const GRADE_SCALE = [
    { min: 90, max: 100, grade: 'A+', label: 'Excellent' },
    { min: 80, max: 89, grade: 'A', label: 'Very Good' },
    { min: 70, max: 79, grade: 'B+', label: 'Good' },
    { min: 60, max: 69, grade: 'B', label: 'Above Average' },
    { min: 50, max: 59, grade: 'C', label: 'Average' },
    { min: 40, max: 49, grade: 'D', label: 'Below Average' },
    { min: 0, max: 39, grade: 'F', label: 'Fail' },
];

// ========== Export Formats ==========
export const EXPORT_FORMATS = {
    PDF: 'pdf',
    EXCEL: 'excel',
    CSV: 'csv',
    JSON: 'json',
};