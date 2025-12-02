// src/hooks/useQuizEngine.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { attemptsAPI } from '../api/attempts.api';
import { telemetryService } from '../services/telemetry.service';

export const useQuizEngine = (quiz, attemptId) => {
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [answers, setAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // idle, saving, saved, error

    const timerRef = useRef(null);
    const autoSaveRef = useRef(null);
    const answersRef = useRef(answers);

    // Update answers ref when answers change
    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    // Initialize quiz engine
    useEffect(() => {
        if (!quiz || !attemptId) return;

        // Calculate initial time remaining
        const duration = quiz.duration * 60; // Convert minutes to seconds
        setTimeRemaining(duration);

        // Initialize telemetry
        telemetryService.init(attemptId);
        telemetryService.setupMonitoring();

        return () => {
            // Cleanup
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (autoSaveRef.current) {
                clearInterval(autoSaveRef.current);
            }
            telemetryService.stop();
        };
    }, [quiz, attemptId]);

    // Start timer
    useEffect(() => {
        if (timeRemaining === null || timeRemaining <= 0) return;

        timerRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    // Time's up - auto submit
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [timeRemaining]);

    // Start auto-save
    useEffect(() => {
        if (!attemptId) return;

        // Auto-save every 30 seconds
        autoSaveRef.current = setInterval(() => {
            saveProgress();
        }, 30000);

        return () => {
            if (autoSaveRef.current) {
                clearInterval(autoSaveRef.current);
            }
        };
    }, [attemptId]);

    // Save progress
    const saveProgress = useCallback(async () => {
        if (!quiz || !attemptId) return;

        setAutoSaveStatus('saving');

        try {
            await attemptsAPI.save(quiz._id, answersRef.current);
            setAutoSaveStatus('saved');

            // Reset status after 2 seconds
            setTimeout(() => {
                setAutoSaveStatus('idle');
            }, 2000);
        } catch (error) {
            console.error('Auto-save failed:', error);
            setAutoSaveStatus('error');
        }
    }, [quiz, attemptId]);

    // Handle answer change
    const handleAnswerChange = useCallback((questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer,
        }));

        // Log answer change
        telemetryService.logAnswerChange(questionId, answer);
    }, []);

    // Navigate to question
    const navigateToQuestion = useCallback((index) => {
        if (index < 0 || index >= quiz?.questions?.length) return;

        const fromQuestion = quiz.questions[currentQuestionIndex]?._id;
        const toQuestion = quiz.questions[index]?._id;

        setCurrentQuestionIndex(index);

        // Log navigation
        if (fromQuestion && toQuestion) {
            telemetryService.logQuestionNavigation(fromQuestion, toQuestion);
        }
    }, [quiz, currentQuestionIndex]);

    // Next question
    const nextQuestion = useCallback(() => {
        navigateToQuestion(currentQuestionIndex + 1);
    }, [currentQuestionIndex, navigateToQuestion]);

    // Previous question
    const previousQuestion = useCallback(() => {
        navigateToQuestion(currentQuestionIndex - 1);
    }, [currentQuestionIndex, navigateToQuestion]);

    // Submit quiz
    const submitQuiz = useCallback(async () => {
        if (!quiz || !attemptId || isSubmitting) return;

        setIsSubmitting(true);

        try {
            // Final save before submit
            await saveProgress();

            // Submit quiz
            const result = await attemptsAPI.submit(quiz._id, answersRef.current);

            // Stop telemetry
            telemetryService.stop();

            return { success: true, data: result };
        } catch (error) {
            console.error('Quiz submission failed:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Submission failed',
            };
        } finally {
            setIsSubmitting(false);
        }
    }, [quiz, attemptId, isSubmitting, saveProgress]);

    // Auto-submit when time runs out
    const handleAutoSubmit = useCallback(async () => {
        telemetryService.logEvent('TIME_EXPIRED', {
            autoSubmit: true,
        });

        await submitQuiz();
    }, [submitQuiz]);

    // Get quiz statistics
    const getStatistics = useCallback(() => {
        const totalQuestions = quiz?.questions?.length || 0;
        const answeredQuestions = Object.keys(answers).length;
        const unansweredQuestions = totalQuestions - answeredQuestions;
        const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

        return {
            totalQuestions,
            answeredQuestions,
            unansweredQuestions,
            progress,
        };
    }, [quiz, answers]);

    // Format time remaining
    const formatTime = useCallback((seconds) => {
        if (seconds === null) return '00:00';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    return {
        // State
        timeRemaining,
        answers,
        currentQuestionIndex,
        isSubmitting,
        autoSaveStatus,

        // Current question
        currentQuestion: quiz?.questions?.[currentQuestionIndex],

        // Actions
        handleAnswerChange,
        navigateToQuestion,
        nextQuestion,
        previousQuestion,
        submitQuiz,
        saveProgress,

        // Utilities
        getStatistics,
        formatTime,

        // Flags
        isFirstQuestion: currentQuestionIndex === 0,
        isLastQuestion: currentQuestionIndex === (quiz?.questions?.length || 0) - 1,
        isTimeCritical: timeRemaining !== null && timeRemaining < 300, // Less than 5 minutes
    };
};