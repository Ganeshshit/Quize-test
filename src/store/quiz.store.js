// src/store/quiz.store.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { quizzesAPI } from '../api/quizzes.api';

export const useQuizStore = create(
    devtools(
        (set, get) => ({
            // State
            quizzes: [],
            currentQuiz: null,
            isLoading: false,
            error: null,
            filters: {
                subject: null,
                status: null,
                search: '',
            },

            // Actions
            setQuizzes: (quizzes) => set({ quizzes }),

            setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),

            setLoading: (isLoading) => set({ isLoading }),

            setError: (error) => set({ error }),

            setFilters: (filters) => set((state) => ({
                filters: { ...state.filters, ...filters },
            })),

            // Fetch all quizzes
            fetchQuizzes: async (params = {}) => {
                set({ isLoading: true, error: null });

                try {
                    const filters = get().filters;
                    const response = await quizzesAPI.getAll({
                        ...filters,
                        ...params,
                    });

                    set({ quizzes: response.quizzes, isLoading: false });
                } catch (error) {
                    const errorMessage = error.response?.data?.message || 'Failed to fetch quizzes';
                    set({ error: errorMessage, isLoading: false });
                }
            },

            // Fetch available quizzes (for students)
            fetchAvailableQuizzes: async () => {
                set({ isLoading: true, error: null });

                try {
                    const response = await quizzesAPI.getAvailable();
                    set({ quizzes: response.quizzes, isLoading: false });
                } catch (error) {
                    const errorMessage = error.response?.data?.message || 'Failed to fetch quizzes';
                    set({ error: errorMessage, isLoading: false });
                }
            },

            // Fetch quiz by ID
            fetchQuizById: async (quizId) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await quizzesAPI.getById(quizId);
                    set({ currentQuiz: response.quiz, isLoading: false });
                    return response.quiz;
                } catch (error) {
                    const errorMessage = error.response?.data?.message || 'Failed to fetch quiz';
                    set({ error: errorMessage, isLoading: false });
                    return null;
                }
            },

            // Create quiz
            createQuiz: async (quizData) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await quizzesAPI.create(quizData);

                    // Add to quizzes list
                    set((state) => ({
                        quizzes: [response.quiz, ...state.quizzes],
                        currentQuiz: response.quiz,
                        isLoading: false,
                    }));

                    return { success: true, quiz: response.quiz };
                } catch (error) {
                    const errorMessage = error.response?.data?.message || 'Failed to create quiz';
                    set({ error: errorMessage, isLoading: false });
                    return { success: false, error: errorMessage };
                }
            },

            // Update quiz
            updateQuiz: async (quizId, quizData) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await quizzesAPI.update(quizId, quizData);

                    // Update in quizzes list
                    set((state) => ({
                        quizzes: state.quizzes.map((q) =>
                            q._id === quizId ? response.quiz : q
                        ),
                        currentQuiz: state.currentQuiz?._id === quizId ? response.quiz : state.currentQuiz,
                        isLoading: false,
                    }));

                    return { success: true, quiz: response.quiz };
                } catch (error) {
                    const errorMessage = error.response?.data?.message || 'Failed to update quiz';
                    set({ error: errorMessage, isLoading: false });
                    return { success: false, error: errorMessage };
                }
            },

            // Delete quiz
            deleteQuiz: async (quizId) => {
                set({ isLoading: true, error: null });

                try {
                    await quizzesAPI.delete(quizId);

                    // Remove from quizzes list
                    set((state) => ({
                        quizzes: state.quizzes.filter((q) => q._id !== quizId),
                        currentQuiz: state.currentQuiz?._id === quizId ? null : state.currentQuiz,
                        isLoading: false,
                    }));

                    return { success: true };
                } catch (error) {
                    const errorMessage = error.response?.data?.message || 'Failed to delete quiz';
                    set({ error: errorMessage, isLoading: false });
                    return { success: false, error: errorMessage };
                }
            },

            // Publish quiz
            publishQuiz: async (quizId) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await quizzesAPI.publish(quizId);

                    // Update in quizzes list
                    set((state) => ({
                        quizzes: state.quizzes.map((q) =>
                            q._id === quizId ? { ...q, status: 'published' } : q
                        ),
                        currentQuiz: state.currentQuiz?._id === quizId
                            ? { ...state.currentQuiz, status: 'published' }
                            : state.currentQuiz,
                        isLoading: false,
                    }));

                    return { success: true };
                } catch (error) {
                    const errorMessage = error.response?.data?.message || 'Failed to publish quiz';
                    set({ error: errorMessage, isLoading: false });
                    return { success: false, error: errorMessage };
                }
            },

            // Clear error
            clearError: () => set({ error: null }),

            // Clear current quiz
            clearCurrentQuiz: () => set({ currentQuiz: null }),
        }),
        { name: 'QuizStore' }
    )
);