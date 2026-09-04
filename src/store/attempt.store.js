// src/store/attempt.store.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { attemptsAPI } from '../api/attempts.api';

export const useAttemptStore = create(
    devtools(
        (set, get) => ({
            // State
            currentAttempt: null,
            attempts: [],
            answers: {},
            isLoading: false,
            error: null,
            timeRemaining: null,
            autoSaveStatus: 'idle', // idle, saving, saved, error

            // Actions
            setCurrentAttempt: (attempt) => set({ currentAttempt: attempt }),

            setAttempts: (attempts) => set({ attempts }),

            setAnswers: (answers) => set({ answers }),

            setAnswer: (questionId, answer) =>
                set((state) => ({
                    answers: { ...state.answers, [questionId]: answer },
                })),

            setLoading: (isLoading) => set({ isLoading }),

            setError: (error) => set({ error }),

            setTimeRemaining: (time) => set({ timeRemaining: time }),

            setAutoSaveStatus: (status) => set({ autoSaveStatus: status }),

            // Start quiz attempt
            startAttempt: async (quizId) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await attemptsAPI.start(quizId);

                    set({
                        currentAttempt: response.attempt,
                        answers: response.attempt.answers || {},
                        timeRemaining: response.attempt.timeRemaining,
                        isLoading: false,
                    });

                    return { success: true, attempt: response.attempt };
                } catch (error) {
                    const errorMessage = error.response?.data?.message || 'Failed to start quiz';
                    set({ error: errorMessage, isLoading: false });
                    return { success: false, error: errorMessage };
                }
            },

            // Save progress
            saveProgress: async (quizId) => {
                const { answers } = get();
                set({ autoSaveStatus: 'saving' });

                try {
                    await attemptsAPI.save(quizId, answers);
                    set({ autoSaveStatus: 'saved' });

                    // Reset status after 2 seconds
                    setTimeout(() => {
                        set({ autoSaveStatus: 'idle' });
                    }, 2000);
                } catch (error) {
                    console.error('Auto-save failed:', error);
                    set({ autoSaveStatus: 'error' });
                }
            },

            // Submit quiz
            submitAttempt: async (quizId) => {
                const { answers } = get();
                set({ isLoading: true, error: null });

                try {
                    const response = await attemptsAPI.submit(quizId, answers);

                    set({
                        currentAttempt: response.attempt,
                        isLoading: false,
                    });

                    return { success: true, attempt: response.attempt };
                } catch (error) {
                    const errorMessage = error.response?.data?.message || 'Failed to submit quiz';
                    set({ error: errorMessage, isLoading: false });
                    return { success: false, error: errorMessage };
                }
            },

            // Fetch attempt
            fetchAttempt: async (quizId, attemptId) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await attemptsAPI.getAttempt(quizId, attemptId);

                    set({
                        currentAttempt: response.attempt,
                        answers: response.attempt.answers || {},
                        isLoading: false,
                    });

                    return { success: true, attempt: response.attempt };
                } catch (error) {
                    const errorMessage = error.response?.data?.message || 'Failed to fetch attempt';
                    set({ error: errorMessage, isLoading: false });
                    return { success: false, error: errorMessage };
                }
            },

            // Fetch all attempts for a quiz
            fetchAttempts: async (quizId) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await attemptsAPI.getAllAttempts(quizId);

                    set({ attempts: response.attempts, isLoading: false });
                } catch (error) {
                    const errorMessage = error.response?.data?.message || 'Failed to fetch attempts';
                    set({ error: errorMessage, isLoading: false });
                }
            },

            // Fetch student's attempts
            fetchMyAttempts: async (quizId) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await attemptsAPI.getMyAttempts(quizId);

                    set({ attempts: response.attempts, isLoading: false });
                } catch (error) {
                    const errorMessage = error.response?.data?.message || 'Failed to fetch attempts';
                    set({ error: errorMessage, isLoading: false });
                }
            },

            // Clear current attempt
            clearAttempt: () =>
                set({
                    currentAttempt: null,
                    answers: {},
                    timeRemaining: null,
                    autoSaveStatus: 'idle',
                }),

            // Clear error
            clearError: () => set({ error: null }),
        }),
        { name: 'AttemptStore' }
    )
);