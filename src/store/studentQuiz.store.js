// store/studentQuiz.store.js - Enhanced Version with Analytics

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { quizzesAPI } from "../api/quizzes.api";

export const useStudentQuizStore = create(
    persist(
        (set, get) => ({
            // State
            quizzes: [],
            enrolledQuizzes: [],
            currentAttempt: null,
            attemptHistory: {},
            loading: false,
            error: null,
            search: "",
            page: 1,
            filters: {
                subject: null,
                difficulty: null,
                status: 'all' // 'all', 'available', 'completed'
            },

            // Analytics
            studentStats: {
                totalAttempts: 0,
                avgScore: 0,
                highestScore: 0,
                lowestScore: 0,
                totalFlagged: 0
            },

            // ---------------------------
            // Fetch ALL quizzes (published)
            // ---------------------------
            fetchQuizzes: async (resetPage = false) => {
                try {
                    set({ loading: true, error: null });

                    if (resetPage) {
                        set({ page: 1 });
                    }

                    const params = {
                        search: get().search,
                        page: get().page,
                        limit: 20,
                        subject: get().filters.subject,
                    };

                    const res = await quizzesAPI.getAll(params);

                    set({
                        quizzes: res.data || [],
                        loading: false
                    });

                    return res;
                } catch (err) {
                    const errorMsg = err?.response?.data?.error || "Failed to load quizzes";
                    set({
                        error: errorMsg,
                        loading: false
                    });
                    throw err;
                }
            },

            // ---------------------------
            // Search and Filters
            // ---------------------------
            setSearch: (value) => {
                set({ search: value, page: 1 });
                get().fetchQuizzes(true);
            },

            setFilter: (filterType, value) => {
                set(state => ({
                    filters: {
                        ...state.filters,
                        [filterType]: value
                    },
                    page: 1
                }));
                get().fetchQuizzes(true);
            },

            clearFilters: () => {
                set({
                    search: "",
                    filters: {
                        subject: null,
                        difficulty: null,
                        status: 'all'
                    },
                    page: 1
                });
                get().fetchQuizzes(true);
            },

            // ---------------------------
            // Pagination
            // ---------------------------
            setPage: (page) => {
                set({ page });
                get().fetchQuizzes();
            },

            nextPage: () => {
                set(state => ({ page: state.page + 1 }));
                get().fetchQuizzes();
            },

            prevPage: () => {
                set(state => ({ page: Math.max(1, state.page - 1) }));
                get().fetchQuizzes();
            },

            // ---------------------------
            // Student → Enroll in quiz
            // ---------------------------
            enroll: async (quizId) => {
                try {
                    set({ loading: true, error: null });
                    const res = await quizzesAPI.enroll(quizId);

                    // Refresh both lists
                    await get().fetchQuizzes();
                    await get().fetchEnrolledQuizzes();

                    set({ loading: false });
                    return res;
                } catch (error) {
                    const errorMsg = error?.response?.data?.error || "Enrollment failed";
                    set({ error: errorMsg, loading: false });
                    throw error;
                }
            },

            // ---------------------------
            // Fetch quizzes student enrolled in
            // ---------------------------
            fetchEnrolledQuizzes: async () => {
                try {
                    set({ loading: true, error: null });

                    const res = await quizzesAPI.getEnrolled();

                    set({
                        enrolledQuizzes: res.data || [],
                        loading: false
                    });

                    return res;
                } catch (err) {
                    const errorMsg = err?.response?.data?.error || "Failed to load enrolled quizzes";
                    set({
                        error: errorMsg,
                        loading: false
                    });
                    throw err;
                }
            },

            // ---------------------------
            // Get quiz details
            // ---------------------------
            getQuizDetails: async (quizId) => {
                try {
                    set({ loading: true, error: null });
                    const res = await quizzesAPI.getById(quizId);
                    set({ loading: false });
                    return res.data;
                } catch (err) {
                    const errorMsg = err?.response?.data?.error || "Failed to load quiz details";
                    set({ error: errorMsg, loading: false });
                    throw err;
                }
            },

            // ---------------------------
            // Attempt Management
            // ---------------------------
            startQuiz: async (quizId) => {
                try {
                    set({ loading: true, error: null });
                    const res = await quizzesAPI.start(quizId);

                    set({
                        currentAttempt: res.data,
                        loading: false
                    });

                    return res;
                } catch (error) {
                    const errorMsg = error?.response?.data?.error || "Failed to start quiz";
                    set({ error: errorMsg, loading: false });
                    throw error;
                }
            },

            getAttempt: async (attemptId) => {
                try {
                    set({ loading: true, error: null });
                    const res = await quizzesAPI.getAttemptById(attemptId);

                    set({
                        currentAttempt: res.data,
                        loading: false
                    });

                    return res.data;
                } catch (error) {
                    const errorMsg = error?.response?.data?.error || "Failed to load attempt";
                    set({ error: errorMsg, loading: false });
                    throw error;
                }
            },

            submitQuiz: async (attemptId, data) => {
                try {
                    set({ loading: true, error: null });
                    const res = await quizzesAPI.submit(attemptId, data);

                    set({
                        currentAttempt: null,
                        loading: false
                    });

                    // Refresh enrolled quizzes to update attempt counts
                    await get().fetchEnrolledQuizzes();

                    return res;
                } catch (error) {
                    const errorMsg = error?.response?.data?.error || "Failed to submit quiz";
                    set({ error: errorMsg, loading: false });
                    throw error;
                }
            },

            autoSaveAnswers: async (attemptId, data) => {
                try {
                    await quizzesAPI.autoSaveAnswers(attemptId, data);
                } catch (error) {
                    console.error("Auto-save failed:", error);
                    // Don't set error state for auto-save failures
                }
            },

            // ---------------------------
            // Attempt History
            // ---------------------------
            fetchAttemptHistory: async (quizId) => {
                try {
                    const res = await quizzesAPI.getMyAttemptsForQuiz(quizId);

                    set(state => ({
                        attemptHistory: {
                            ...state.attemptHistory,
                            [quizId]: res.data || []
                        }
                    }));

                    return res.data;
                } catch (error) {
                    console.error("Failed to fetch attempt history:", error);
                    throw error;
                }
            },

            getAttemptDetail: async (attemptId) => {
                try {
                    const res = await quizzesAPI.getMyAttemptDetail(attemptId);
                    return res.data;
                } catch (error) {
                    console.error("Failed to fetch attempt detail:", error);
                    throw error;
                }
            },

            // ---------------------------
            // Analytics & Stats
            // ---------------------------
            calculateQuizStats: (quizId) => {
                const attempts = get().attemptHistory[quizId] || [];

                if (attempts.length === 0) {
                    return {
                        totalAttempts: 0,
                        bestScore: null,
                        avgScore: 0,
                        lastAttempt: null,
                        passed: false
                    };
                }

                const scores = attempts.map(a => a.totalScore || 0);
                const bestScore = Math.max(...scores);
                const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
                const lastAttempt = attempts[0]; // Assuming sorted by date desc

                return {
                    totalAttempts: attempts.length,
                    bestScore,
                    avgScore: avgScore.toFixed(2),
                    lastAttempt: lastAttempt.startTime,
                    passed: lastAttempt.passed
                };
            },

            calculateOverallStats: () => {
                const allAttempts = Object.values(get().attemptHistory).flat();

                if (allAttempts.length === 0) {
                    return {
                        totalAttempts: 0,
                        avgScore: 0,
                        highestScore: 0,
                        lowestScore: 0,
                        passRate: 0,
                        totalFlagged: 0
                    };
                }

                const scores = allAttempts.map(a => a.percentage || 0);
                const passed = allAttempts.filter(a => a.passed).length;
                const flagged = allAttempts.filter(a => a.isFlagged).length;

                return {
                    totalAttempts: allAttempts.length,
                    avgScore: (scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(2),
                    highestScore: Math.max(...scores).toFixed(2),
                    lowestScore: Math.min(...scores).toFixed(2),
                    passRate: ((passed / allAttempts.length) * 100).toFixed(1),
                    totalFlagged: flagged
                };
            },

            // ---------------------------
            // Utility Functions
            // ---------------------------
            clearError: () => set({ error: null }),

            clearCurrentAttempt: () => set({ currentAttempt: null }),

            resetStore: () => set({
                quizzes: [],
                enrolledQuizzes: [],
                currentAttempt: null,
                attemptHistory: {},
                loading: false,
                error: null,
                search: "",
                page: 1,
                filters: {
                    subject: null,
                    difficulty: null,
                    status: 'all'
                }
            }),

            // ---------------------------
            // Computed Values
            // ---------------------------
            getFilteredQuizzes: () => {
                const { quizzes, filters } = get();

                return quizzes.filter(quiz => {
                    // Status filter
                    if (filters.status !== 'all') {
                        if (filters.status === 'available') {
                            return quiz.attemptsRemaining > 0;
                        } else if (filters.status === 'completed') {
                            return quiz.attemptsRemaining === 0;
                        }
                    }

                    return true;
                });
            },

            // ---------------------------
            // Quiz Availability Check
            // ---------------------------
            isQuizAvailable: (quiz) => {
                const now = new Date();
                const startTime = new Date(quiz.startTime);
                const endTime = new Date(quiz.endTime);

                return quiz.isPublished &&
                    now >= startTime &&
                    now <= endTime &&
                    quiz.attemptsRemaining > 0;
            },

            // ---------------------------
            // Time Calculations
            // ---------------------------
            getTimeUntilQuiz: (quiz) => {
                const now = new Date();
                const startTime = new Date(quiz.startTime);
                const diff = startTime - now;

                if (diff <= 0) return null;

                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

                if (days > 0) return `${days}d ${hours}h`;
                if (hours > 0) return `${hours}h ${minutes}m`;
                return `${minutes}m`;
            },

            // ---------------------------
            // Recommendation Engine
            // ---------------------------
            getRecommendedQuizzes: () => {
                const { enrolledQuizzes, attemptHistory } = get();

                // Get subjects with low performance
                const weakSubjects = enrolledQuizzes
                    .filter(quiz => {
                        const stats = get().calculateQuizStats(quiz._id);
                        return stats.avgScore < 60;
                    })
                    .map(quiz => quiz.subject._id);

                // Recommend similar quizzes
                return enrolledQuizzes.filter(quiz =>
                    weakSubjects.includes(quiz.subject._id) &&
                    quiz.attemptsRemaining > 0
                );
            }
        }),

        {
            name: "student-quiz-storage",
            partialize: (state) => ({
                enrolledQuizzes: state.enrolledQuizzes,
                attemptHistory: state.attemptHistory,
                studentStats: state.studentStats
            }),
        }
    )
);

// Selectors for performance
export const selectQuizzes = (state) => state.quizzes;
export const selectEnrolledQuizzes = (state) => state.enrolledQuizzes;
export const selectCurrentAttempt = (state) => state.currentAttempt;
export const selectLoading = (state) => state.loading;
export const selectError = (state) => state.error;
export const selectFilters = (state) => state.filters;
export const selectStudentStats = (state) => state.studentStats;