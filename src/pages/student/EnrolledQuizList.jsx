import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    BookOpen, Clock, Target, AlertCircle,
    Calendar, ArrowRight, Lock, CheckCircle
} from 'lucide-react';
import { useStudentQuizStore } from "../../store/studentQuiz.store";

// --- Extracted Sub-Components ---

const SkeletonCard = () => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
            <div className="h-5 bg-gray-200 rounded-md w-1/4"></div>
            <div className="h-5 bg-gray-100 rounded-md w-1/5"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-100 rounded-md w-full mb-6"></div>
        <div className="space-y-4 mb-8 flex-1">
            <div className="h-4 bg-gray-50 rounded w-full"></div>
            <div className="h-4 bg-gray-50 rounded w-5/6"></div>
        </div>
        <div className="h-12 bg-gray-200 rounded-xl w-full mt-auto"></div>
    </div>
);

const DetailRow = ({ icon: Icon, label, value, valueClass = "text-gray-900" }) => (
    <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-500 font-medium">
            <Icon size={16} className="text-gray-400" />
            <span>{label}</span>
        </div>
        <span className={`font-bold ${valueClass}`}>{value}</span>
    </div>
);

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit'
    }).format(new Date(dateString));
};

// --- Main Component ---

const EnrolledQuizList = () => {
    const navigate = useNavigate();
    const { enrolledQuizzes, loading, fetchEnrolledQuizzes } = useStudentQuizStore();

    useEffect(() => {
        fetchEnrolledQuizzes();
    }, [fetchEnrolledQuizzes]);

    const handleStartQuiz = (quizId) => {
        navigate(`/student/quiz/${quizId}/start`);
    };

    return (
        <div className="space-y-8 pb-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <header className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-gray-900">My Enrolled Quizzes</h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                        Track your progress and start your upcoming assessments.
                    </p>
                </div>
                <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm font-bold text-gray-600">
                    Total Enrolled: {enrolledQuizzes.length}
                </div>
            </header>

            {/* Main Content Area */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                </div>
            ) : enrolledQuizzes.length === 0 ? (
                // Empty State
                <div className="py-20 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
                        <BookOpen size={32} />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">No enrolled quizzes yet</h3>
                    <p className="text-sm text-gray-500 mt-2 max-w-sm text-center">
                        You haven't enrolled in any assessments. Check the Available Quizzes page to get started.
                    </p>
                    <button
                        onClick={() => navigate('/student/quizzes')}
                        className="mt-6 px-6 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-yellow-400 hover:text-black transition-colors"
                    >
                        Browse Quizzes
                    </button>
                </div>
            ) : (
                // Enrolled Quizzes Grid
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
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group"
                            >
                                {/* Card Header */}
                                <div className="p-6 border-b border-gray-50">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[10px] font-bold px-2.5 py-1 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-md uppercase tracking-wider">
                                            {quiz.subject?.name || "General"}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${quiz.isPublished
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : 'bg-gray-100 text-gray-500 border-gray-200'
                                            }`}>
                                            {quiz.isPublished ? "Published" : "Draft"}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 leading-tight truncate">
                                        {quiz.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                        {quiz.description || "No description provided for this assessment."}
                                    </p>
                                </div>

                                {/* Card Details */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="space-y-3 mb-6">
                                        <DetailRow
                                            icon={Clock}
                                            label="Duration"
                                            value={`${quiz.durationMinutes} min`}
                                        />
                                        <DetailRow
                                            icon={Target}
                                            label="Attempts"
                                            value={`${quiz.userAttemptCount} / ${quiz.attemptsAllowed}`}
                                            valueClass={hasAttemptsLeft ? 'text-gray-900' : 'text-red-600'}
                                        />
                                    </div>

                                    {/* Status Warnings */}
                                    <div className="mb-6 space-y-2">
                                        {!isAvailable && (
                                            <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-100 rounded-xl">
                                                <Calendar size={16} className="text-orange-500 shrink-0 mt-0.5" />
                                                <div className="text-xs text-orange-800">
                                                    <span className="font-bold block mb-0.5">Availability Window:</span>
                                                    {formatDate(quiz.startTime)} — {formatDate(quiz.endTime)}
                                                </div>
                                            </div>
                                        )}

                                        {!hasAttemptsLeft && (
                                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-800 font-medium">
                                                <AlertCircle size={16} className="text-red-500 shrink-0" />
                                                Maximum attempts reached
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <div className="mt-auto pt-4 border-t border-gray-50">
                                        <button
                                            onClick={() => handleStartQuiz(quiz._id)}
                                            disabled={!canStart}
                                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${canStart
                                                    ? "bg-black text-white hover:bg-yellow-400 hover:text-black shadow-sm"
                                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                }`}
                                        >
                                            {!quiz.isPublished ? (
                                                <><Lock size={16} /> Not Published</>
                                            ) : !isAvailable ? (
                                                <><Clock size={16} /> Not Available Yet</>
                                            ) : !hasAttemptsLeft ? (
                                                <><AlertCircle size={16} /> No Attempts Left</>
                                            ) : (
                                                <>Start Assessment <ArrowRight size={16} /></>
                                            )}
                                        </button>
                                    </div>
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