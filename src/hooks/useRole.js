// src/hooks/useRole.js
import { useMemo } from 'react';
import { authService } from '../services/auth.service';

export const ROLES = {
    ADMIN: 'admin',
    TRAINER: 'trainer',
    STUDENT: 'student',
};

export const useRole = () => {
    const currentRole = authService.getCurrentUserRole();

    const permissions = useMemo(() => {
        return {
            // Admin permissions
            isAdmin: currentRole === ROLES.ADMIN,
            canManageUsers: currentRole === ROLES.ADMIN,
            canDeleteQuizzes: currentRole === ROLES.ADMIN,
            canDeleteQuestions: currentRole === ROLES.ADMIN,
            canDeleteSubjects: currentRole === ROLES.ADMIN,
            canViewSystemStats: currentRole === ROLES.ADMIN,
            canAccessAdminPanel: currentRole === ROLES.ADMIN,

            // Trainer permissions
            isTrainer: currentRole === ROLES.TRAINER,
            canCreateQuizzes: [ROLES.ADMIN, ROLES.TRAINER].includes(currentRole),
            canEditQuizzes: [ROLES.ADMIN, ROLES.TRAINER].includes(currentRole),
            canPublishQuizzes: [ROLES.ADMIN, ROLES.TRAINER].includes(currentRole),
            canCreateQuestions: [ROLES.ADMIN, ROLES.TRAINER].includes(currentRole),
            canEditQuestions: [ROLES.ADMIN, ROLES.TRAINER].includes(currentRole),
            canCreateSubjects: [ROLES.ADMIN, ROLES.TRAINER].includes(currentRole),
            canEditSubjects: [ROLES.ADMIN, ROLES.TRAINER].includes(currentRole),
            canGradeQuizzes: [ROLES.ADMIN, ROLES.TRAINER].includes(currentRole),
            canViewAttempts: [ROLES.ADMIN, ROLES.TRAINER].includes(currentRole),
            canViewAuditLogs: [ROLES.ADMIN, ROLES.TRAINER].includes(currentRole),
            canExportData: [ROLES.ADMIN, ROLES.TRAINER].includes(currentRole),

            // Student permissions
            isStudent: currentRole === ROLES.STUDENT,
            canTakeQuizzes: currentRole === ROLES.STUDENT,
            canViewOwnAttempts: currentRole === ROLES.STUDENT,
            canViewOwnResults: currentRole === ROLES.STUDENT,

            // Common permissions
            canViewProfile: !!currentRole,
            canEditProfile: !!currentRole,
            canViewSubjects: !!currentRole,
            canViewQuestions: !!currentRole,
        };
    }, [currentRole]);

    const hasRole = (role) => {
        return currentRole === role;
    };

    const hasAnyRole = (roles) => {
        return roles.includes(currentRole);
    };

    const hasAllRoles = (roles) => {
        return roles.every(role => currentRole === role);
    };

    const canAccess = (requiredRoles) => {
        if (!requiredRoles || requiredRoles.length === 0) {
            return true; // Public access
        }
        return requiredRoles.includes(currentRole);
    };

    return {
        currentRole,
        permissions,
        hasRole,
        hasAnyRole,
        hasAllRoles,
        canAccess,
    };
};