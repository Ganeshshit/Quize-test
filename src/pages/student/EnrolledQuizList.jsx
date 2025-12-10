import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentQuizStore } from "../../store/studentQuiz.store";

const EnrolledQuizList = () => {
    const navigate = useNavigate();
    const { enrolledQuizzes, loading, fetchEnrolledQuizzes } = useStudentQuizStore();

    useEffect(() => {
        fetchEnrolledQuizzes();
    }, []);

    // Navigate to instruction page before starting quiz
    const handleStartQuiz = (quizId) => {
        navigate(`/student/quiz/${quizId}/start`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading enrolled quizzes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800">My Enrolled Quizzes</h2>
                <p className="text-gray-600 mt-2">View and start your enrolled quizzes</p>
            </div>

            {enrolledQuizzes.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                    <div className="text-6xl mb-4">📚</div>
                    <p className="text-xl text-gray-600">No enrolled quizzes yet.</p>
                    <p className="text-gray-500 mt-2">Check available quizzes to enroll.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledQuizzes.map((quiz) => {
                        const now = new Date();
                        const startTime = new Date(quiz.startTime);
                        const endTime = new Date(quiz.endTime);
                        const isAvailable = now >= startTime && now <= endTime;
                        const hasAttemptsLeft = quiz.userAttemptCount < quiz.attemptsAllowed;
                        const canStart = isAvailable && hasAttemptsLeft && quiz.isPublished;

                        return (
                            <div
                                key={quiz._id}
                                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden"
                            >
                                {/* Quiz Header */}
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                                    <h3 className="text-xl font-bold truncate">{quiz.title}</h3>
                                    <p className="text-blue-100 text-sm mt-1 line-clamp-2">
                                        {quiz.description || "No description"}
                                    </p>
                                </div>

                                {/* Quiz Details */}
                                <div className="p-5 space-y-3">
                                    <div className="flex items-center text-sm text-gray-700">
                                        <span className="font-semibold w-24">Subject:</span>
                                        <span className="text-blue-600 font-medium">
                                            {quiz.subject?.name || "N/A"}
                                        </span>
                                    </div>

                                    <div className="flex items-center text-sm text-gray-700">
                                        <span className="font-semibold w-24">Duration:</span>
                                        <span>{quiz.durationMinutes} minutes</span>
                                    </div>

                                    <div className="flex items-center text-sm text-gray-700">
                                        <span className="font-semibold w-24">Attempts:</span>
                                        <span className={`font-bold ${hasAttemptsLeft ? 'text-green-600' : 'text-red-600'}`}>
                                            {quiz.userAttemptCount}/{quiz.attemptsAllowed}
                                        </span>
                                    </div>

                                    <div className="flex items-center text-sm text-gray-700">
                                        <span className="font-semibold w-24">Status:</span>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${quiz.isPublished
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {quiz.isPublished ? "Published" : "Unpublished"}
                                        </span>
                                    </div>

                                    {/* Availability Info */}
                                    {!isAvailable && (
                                        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                            <p className="text-xs font-semibold text-orange-800 mb-1">
                                                ⏰ Available Period:
                                            </p>
                                            <p className="text-xs text-orange-700">
                                                {startTime.toLocaleString()} <br />
                                                to {endTime.toLocaleString()}
                                            </p>
                                        </div>
                                    )}

                                    {/* No Attempts Warning */}
                                    {!hasAttemptsLeft && (
                                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-xs font-semibold text-red-800">
                                                🚫 Maximum attempts reached
                                            </p>
                                        </div>
                                    )}

                                    {/* Start Button */}
                                    <button
                                        onClick={() => handleStartQuiz(quiz._id)}
                                        disabled={!canStart}
                                        className={`mt-4 w-full px-4 py-3 rounded-lg font-semibold transition-all ${canStart
                                                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg"
                                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            }`}
                                    >
                                        {!quiz.isPublished
                                            ? "Not Published"
                                            : !isAvailable
                                                ? "Not Available Yet"
                                                : !hasAttemptsLeft
                                                    ? "No Attempts Left"
                                                    : "🚀 Start Quiz"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EnrolledQuizList;