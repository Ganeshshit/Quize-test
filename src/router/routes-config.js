// src/router/routes-config.js
import { USER_ROLES, ROUTES } from '../utils/constants';

// Import your page components here
// Example imports (you'll need to create these components):
import Login from '../pages/auth/Login';
/*
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';

// Student pages
import StudentQuizzes from '../pages/student/Quizzes';
import StudentQuizDetail from '../pages/student/QuizDetail';
import StudentTakeQuiz from '../pages/student/TakeQuiz';
import StudentQuizResult from '../pages/student/QuizResult';
import StudentAttempts from '../pages/student/Attempts';

// Trainer pages
import TrainerDashboard from '../pages/trainer/Dashboard';
import TrainerQuizzes from '../pages/trainer/Quizzes';
import TrainerQuizCreate from '../pages/trainer/QuizCreate';
import TrainerQuizEdit from '../pages/trainer/QuizEdit';
import TrainerQuestions from '../pages/trainer/Questions';
import TrainerQuestionCreate from '../pages/trainer/QuestionCreate';
import TrainerQuestionEdit from '../pages/trainer/QuestionEdit';
import TrainerSubjects from '../pages/trainer/Subjects';
import TrainerGrading from '../pages/trainer/Grading';

// Admin pages
import AdminDashboard from '../pages/admin/Dashboard';
import AdminUsers from '../pages/admin/Users';
import AdminStats from '../pages/admin/Stats';
import AdminAudit from '../pages/admin/Audit';

// Error pages
import NotFound from '../pages/errors/NotFound';
import Unauthorized from '../pages/errors/Unauthorized';
*/

/**
 * Route configuration object
 * Each route can have:
 * - path: Route path
 * - element: Component to render
 * - isProtected: Whether route requires authentication
 * - allowedRoles: Array of roles that can access this route
 * - layout: Layout component to use (optional)
 * - title: Page title
 * - description: Page description for SEO
 */

// ========== Public Routes (No Authentication Required) ==========
export const publicRoutes = [
    {
        path: ROUTES.LOGIN,
        element: Login,
        element: null, // Replace with actual component
        isProtected: false,
        isGuestOnly: true,
        title: 'Login',
        description: 'Login to your account',
    },
    {
        path: ROUTES.REGISTER,
        // element: Register,
        element: null,
        isProtected: false,
        isGuestOnly: true,
        title: 'Register',
        description: 'Create a new account',
    },
    {
        path: ROUTES.FORGOT_PASSWORD,
        // element: ForgotPassword,
        element: null,
        isProtected: false,
        isGuestOnly: true,
        title: 'Forgot Password',
        description: 'Reset your password',
    },
    {
        path: ROUTES.RESET_PASSWORD,
        // element: ResetPassword,
        element: null,
        isProtected: false,
        isGuestOnly: true,
        title: 'Reset Password',
        description: 'Set a new password',
    },
];

// ========== Protected Routes (Authentication Required) ==========
export const protectedRoutes = [
    {
        path: ROUTES.HOME,
        // element: Dashboard,
        element: null,
        isProtected: true,
        allowedRoles: [],
        title: 'Home',
        description: 'Dashboard home',
    },
    {
        path: ROUTES.DASHBOARD,
        // element: Dashboard,
        element: null,
        isProtected: true,
        allowedRoles: [],
        title: 'Dashboard',
        description: 'Main dashboard',
    },
    {
        path: ROUTES.PROFILE,
        // element: Profile,
        element: null,
        isProtected: true,
        allowedRoles: [],
        title: 'Profile',
        description: 'User profile',
    },
];

// ========== Student Routes ==========
export const studentRoutes = [
    {
        path: ROUTES.STUDENT_QUIZZES,
        // element: StudentQuizzes,
        element: null,
        isProtected: true,
        allowedRoles: [USER_ROLES.STUDENT],
        title: 'Available Quizzes',
        description: 'Browse available quizzes',
    },
    {
        path: ROUTES.STUDENT_QUIZ_DETAIL,
        // element: StudentQuizDetail,
        element: null,
        isProtected: true,
        allowedRoles: [USER_ROLES.STUDENT],
        title: 'Quiz Details',
        description: 'View quiz details',
    },
    {
        path: ROUTES.STUDENT_TAKE_QUIZ,
        // element: StudentTakeQuiz,
        element: null,
        isProtected: true,
        allowedRoles: [USER_ROLES.STUDENT],
        title: 'Take Quiz',
        description: 'Take quiz attempt',
    },
    {
        path: ROUTES.STUDENT_QUIZ_RESULT,
        // element: StudentQuizResult,
        element: null,
        isProtected: true,
        allowedRoles: [USER_ROLES.STUDENT],
        title: 'Quiz Result',
        description: 'View quiz results',
    },
    {
        path: ROUTES.STUDENT_ATTEMPTS,
        // element: StudentAttempts,
        element: null,
        isProtected: true,
        allowedRoles: [USER_ROLES.STUDENT],
        title: 'My Attempts',
        description: 'View your quiz attempts',
    },
];

// ========== Trainer Routes ==========
export const trainerRoutes = [
    {
        path: ROUTES.TRAINER_DASHBOARD,
        // element: TrainerDashboard,
        element: null,
        isProtected: true,
        allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.TRAINER],
        title: 'Trainer Dashboard',
        description: 'Trainer dashboard',
    },
    {
        path: ROUTES.TRAINER_QUIZZES,
        // element: TrainerQuizzes,
        element: null,
        isProtected: true,
        allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.TRAINER],
        title: 'Manage Quizzes',
        description: 'Create and manage quizzes',
    },
    {
        path: ROUTES.TRAINER_QUIZ_CREATE,
        // element: TrainerQuizCreate,
        element: null,
        isProtected: true,
        allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.TRAINER],
        title: 'Create Quiz',
        description: 'Create a new quiz',
    },
    {
        path: ROUTES.TRAINER_QUIZ_EDIT,
        // element: TrainerQuizEdit,
        element: null,
        isProtected: true,
        allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.TRAINER],
        title: 'Edit Quiz',
        description: 'Edit quiz details',
    },
    {
        path: ROUTES.TRAINER_QUESTIONS,
        // element: TrainerQuestions,
        element: null,
        isProtected: true,
        allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.TRAINER],
        title: 'Question Bank',
        description: 'Manage question bank',
    },
    {
        path: ROUTES.TRAINER_QUESTION_CREATE,
        // element: TrainerQuestionCreate,
        element: null,
        isProtected: true,
        allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.TRAINER],
        title: 'Create Question',
        description: 'Add new question',
    },
    {
        path: ROUTES.TRAINER_QUESTION_EDIT,
        // element: TrainerQuestionEdit,
        element: null,
        isProtected: true,
        allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.TRAINER],
        title: 'Edit Question',
        description: 'Edit question details',
    },
    {
        path: ROUTES.TRAINER_SUBJECTS,
        // element: TrainerSubjects,
        element: null,
        isProtected: true,
        allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.TRAINER],
        title: 'Manage Subjects',
        description: 'Create and manage subjects',
    },
    {
        path: ROUTES.TRAINER_GRADING,
        // element: TrainerGrading,
        element: null,
        isProtected: true,
        allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.TRAINER],
        title: 'Grading',
        description: 'Grade student attempts',
    },
];

// ========== Admin Routes ==========
export const adminRoutes = [
    {
        path: ROUTES.ADMIN_DASHBOARD,
        // element: AdminDashboard,
        element: null,
        isProtected: true,
        allowedRoles: [USER_ROLES.ADMIN],
        title: 'Admin Dashboard',
        description: 'Administrator dashboard',
    },
    {
        path: ROUTES.ADMIN_USERS,
        // element: AdminUsers,
        element: null,
        isProtected: true,
        allowedRoles: [USER_ROLES.ADMIN],
        title: 'User Management',
        description: 'Manage users',
    },
    {
        path: ROUTES.ADMIN_STATS,
        // element: AdminStats,
        element: null,
        isProtected: true,
        allowedRoles: [USER_ROLES.ADMIN],
        title: 'System Statistics',
        description: 'View system statistics',
    },
    {
        path: ROUTES.ADMIN_AUDIT,
        // element: AdminAudit,
        element: null,
        isProtected: true,
        allowedRoles: [USER_ROLES.ADMIN],
        title: 'Audit Logs',
        description: 'View audit logs',
    },
];

// ========== Error Routes ==========
export const errorRoutes = [
    {
        path: '/unauthorized',
        // element: Unauthorized,
        element: null,
        isProtected: false,
        title: 'Unauthorized',
        description: 'Access denied',
    },
    {
        path: '*',
        // element: NotFound,
        element: null,
        isProtected: false,
        title: 'Page Not Found',
        description: '404 - Page not found',
    },
];

// ========== All Routes Combined ==========
export const allRoutes = [
    ...publicRoutes,
    ...protectedRoutes,
    ...studentRoutes,
    ...trainerRoutes,
    ...adminRoutes,
    ...errorRoutes,
];

// ========== Route Groups for Navigation ==========
export const routeGroups = {
    public: publicRoutes,
    protected: protectedRoutes,
    student: studentRoutes,
    trainer: trainerRoutes,
    admin: adminRoutes,
    error: errorRoutes,
};

// ========== Navigation Menu Items ==========
export const navigationMenus = {
    student: [
        {
            label: 'Dashboard',
            path: ROUTES.DASHBOARD,
            icon: 'dashboard',
        },
        {
            label: 'Available Quizzes',
            path: ROUTES.STUDENT_QUIZZES,
            icon: 'quiz',
        },
        {
            label: 'My Attempts',
            path: ROUTES.STUDENT_ATTEMPTS,
            icon: 'attempts',
        },
        {
            label: 'Profile',
            path: ROUTES.PROFILE,
            icon: 'profile',
        },
    ],

    trainer: [
        {
            label: 'Dashboard',
            path: ROUTES.TRAINER_DASHBOARD,
            icon: 'dashboard',
        },
        {
            label: 'Quizzes',
            path: ROUTES.TRAINER_QUIZZES,
            icon: 'quiz',
        },
        {
            label: 'Questions',
            path: ROUTES.TRAINER_QUESTIONS,
            icon: 'questions',
        },
        {
            label: 'Subjects',
            path: ROUTES.TRAINER_SUBJECTS,
            icon: 'subjects',
        },
        {
            label: 'Grading',
            path: ROUTES.TRAINER_GRADING,
            icon: 'grading',
        },
        {
            label: 'Profile',
            path: ROUTES.PROFILE,
            icon: 'profile',
        },
    ],

    admin: [
        {
            label: 'Dashboard',
            path: ROUTES.ADMIN_DASHBOARD,
            icon: 'dashboard',
        },
        {
            label: 'Users',
            path: ROUTES.ADMIN_USERS,
            icon: 'users',
        },
        {
            label: 'Statistics',
            path: ROUTES.ADMIN_STATS,
            icon: 'stats',
        },
        {
            label: 'Audit Logs',
            path: ROUTES.ADMIN_AUDIT,
            icon: 'audit',
        },
        {
            label: 'Quizzes',
            path: ROUTES.TRAINER_QUIZZES,
            icon: 'quiz',
        },
        {
            label: 'Questions',
            path: ROUTES.TRAINER_QUESTIONS,
            icon: 'questions',
        },
        {
            label: 'Subjects',
            path: ROUTES.TRAINER_SUBJECTS,
            icon: 'subjects',
        },
        {
            label: 'Profile',
            path: ROUTES.PROFILE,
            icon: 'profile',
        },
    ],
};

// ========== Breadcrumb Configuration ==========
export const breadcrumbConfig = {
    [ROUTES.DASHBOARD]: ['Home'],
    [ROUTES.PROFILE]: ['Home', 'Profile'],

    [ROUTES.STUDENT_QUIZZES]: ['Home', 'Quizzes'],
    [ROUTES.STUDENT_QUIZ_DETAIL]: ['Home', 'Quizzes', 'Details'],
    [ROUTES.STUDENT_TAKE_QUIZ]: ['Home', 'Quizzes', 'Take Quiz'],
    [ROUTES.STUDENT_QUIZ_RESULT]: ['Home', 'Quizzes', 'Results'],
    [ROUTES.STUDENT_ATTEMPTS]: ['Home', 'My Attempts'],

    [ROUTES.TRAINER_DASHBOARD]: ['Home', 'Trainer'],
    [ROUTES.TRAINER_QUIZZES]: ['Home', 'Trainer', 'Quizzes'],
    [ROUTES.TRAINER_QUIZ_CREATE]: ['Home', 'Trainer', 'Quizzes', 'Create'],
    [ROUTES.TRAINER_QUIZ_EDIT]: ['Home', 'Trainer', 'Quizzes', 'Edit'],
    [ROUTES.TRAINER_QUESTIONS]: ['Home', 'Trainer', 'Questions'],
    [ROUTES.TRAINER_SUBJECTS]: ['Home', 'Trainer', 'Subjects'],
    [ROUTES.TRAINER_GRADING]: ['Home', 'Trainer', 'Grading'],

    [ROUTES.ADMIN_DASHBOARD]: ['Home', 'Admin'],
    [ROUTES.ADMIN_USERS]: ['Home', 'Admin', 'Users'],
    [ROUTES.ADMIN_STATS]: ['Home', 'Admin', 'Statistics'],
    [ROUTES.ADMIN_AUDIT]: ['Home', 'Admin', 'Audit Logs'],
};

// ========== Helper Functions ==========

/**
 * Get routes for specific role
 */
export const getRoutesByRole = (role) => {
    return allRoutes.filter(route => {
        if (!route.allowedRoles || route.allowedRoles.length === 0) {
            return true;
        }
        return route.allowedRoles.includes(role);
    });
};

/**
 * Get navigation menu for specific role
 */
export const getNavigationMenu = (role) => {
    return navigationMenus[role] || [];
};

/**
 * Get breadcrumb for specific path
 */
export const getBreadcrumb = (path) => {
    return breadcrumbConfig[path] || ['Home'];
};

/**
 * Check if route is accessible by role
 */
export const isRouteAccessible = (path, role) => {
    const route = allRoutes.find(r => r.path === path);

    if (!route) {
        return false;
    }

    if (!route.isProtected) {
        return true;
    }

    if (!route.allowedRoles || route.allowedRoles.length === 0) {
        return true;
    }

    return route.allowedRoles.includes(role);
};

export default allRoutes;