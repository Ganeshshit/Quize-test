// pages/student/QuizResult.jsx - Enhanced Version

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizzesAPI } from "../../api/quizzes.api";
import { toast } from "react-hot-toast";
import {
    CheckCircle, XCircle, AlertTriangle, Clock, Award,
    TrendingUp, Eye, EyeOff, ChevronDown, ChevronUp,
    BarChart3, Target, FileText
} from "lucide-react";

const QuizResult = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();

    const [attempt, setAttempt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAnswers, setShowAnswers] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [expandedQuestions, setExpandedQuestions] = useState(new Set());

    useEffect(() => {
        fetchResult();
    }, [attemptId]);

    const fetchResult = async () => {
        try {
            setLoading(true);
            const res = await quizzesAPI.getMyAttemptDetail(attemptId);

            if (res.success) {
                if (res.data.status === "in_progress") {
                    toast.info("Quiz is still in progress");
                    navigate(`/student/attempt/${attemptId}`);
                    return;
                }

                setAttempt(res.data);
            } else {
                toast.error("Failed to load result");
                navigate("/student/enrolled");
            }
        } catch (error) {
            console.error("Fetch result error:", error);

            if (error?.response?.data?.status === "in_progress") {
                toast.info("Quiz is still in progress");
                navigate(`/student/attempt/${attemptId}`);
                return;
            }

            toast.error(error?.response?.data?.error || "Failed to load result");
            navigate("/student/enrolled");
        } finally {
            setLoading(false);
        }
    };

    const getChoiceLabel = (index) => {
        return String.fromCharCode(65 + index);
    };

    const getQuestionResult = (questionId) => {
        return attempt?.autoGradeResult?.find(
            r => r.questionId.toString() === questionId.toString()
        );
    };

    const toggleQuestionExpand = (index) => {
        const newExpanded = new Set(expandedQuestions);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedQuestions(newExpanded);
    };

    const calculateAccuracy = () => {
        if (!attempt) return 0;
        const total = attempt.selectedQuestions?.length || 0;
        if (total === 0) return 0;
        return ((attempt.correctCount / total) * 100).toFixed(1);
    };

    const getPerformanceLevel = (percentage) => {
        if (percentage >= 90) return { label: "Excellent", color: "emerald", icon: "🌟" };
        if (percentage >= 75) return { label: "Very Good", color: "green", icon: "✨" };
        if (percentage >= 60) return { label: "Good", color: "blue", icon: "👍" };
        if (percentage >= 40) return { label: "Fair", color: "yellow", icon: "📚" };
        return { label: "Needs Improvement", color: "red", icon: "💪" };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
                <div className="text-center bg-white p-8 rounded-xl shadow-lg">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-700 font-medium">Loading results...</p>
                </div>
            </div>
        );
    }

    if (!attempt) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
                <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
                    <div className="text-6xl mb-4">❌</div>
                    <p className="text-xl text-red-600 font-semibold mb-4">Result not found</p>
                    <button
                        onClick={() => navigate("/student/enrolled")}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                    >
                        Back to Enrolled Quizzes
                    </button>
                </div>
            </div>
        );
    }

    const percentage = ((attempt.totalScore / attempt.maxScore) * 100).toFixed(2);
    const passed = attempt.totalScore >= attempt.quiz.passingMarks;
    const performance = getPerformanceLevel(parseFloat(percentage));
    const accuracy = calculateAccuracy();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white shadow-xl rounded-2xl p-6 border-t-4 border-blue-600">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-bold text-gray-800">
                            {attempt.quiz.title}
                        </h1>
                        <FileText className="text-blue-600" size={32} />
                    </div>
                    <p className="text-gray-600 text-lg">Quiz Results</p>

                    {attempt.isFlagged && (
                        <div className="mt-4 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-lg">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="text-orange-800 font-semibold">
                                        ⚠️ Flagged for Review
                                    </p>
                                    <p className="text-orange-700 text-sm mt-1">
                                        This attempt has been marked for manual review by the instructor.
                                    </p>
                                    {attempt.flaggedReasons && attempt.flaggedReasons.length > 0 && (
                                        <ul className="text-orange-700 text-sm mt-2 space-y-1">
                                            {attempt.flaggedReasons.map((reason, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="font-medium">•</span>
                                                    <span>{reason.reason}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Score Card */}
                <div className={`shadow-xl rounded-2xl p-8 text-center relative overflow-hidden ${passed
                        ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-500'
                        : 'bg-gradient-to-br from-red-50 to-rose-100 border-2 border-red-500'
                    }`}>
                    <div className="absolute top-0 right-0 text-9xl opacity-10">
                        {performance.icon}
                    </div>

                    <div className="relative z-10">
                        <div className={`text-7xl font-bold mb-4 ${passed ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {percentage}%
                        </div>

                        <div className="text-3xl font-semibold mb-3 text-gray-800">
                            {attempt.totalScore} / {attempt.maxScore} marks
                        </div>

                        <div className={`inline-flex items-center gap-2 px-8 py-3 rounded-full text-xl font-bold shadow-lg ${passed
                                ? 'bg-green-600 text-white'
                                : 'bg-red-600 text-white'
                            }`}>
                            {passed ? <CheckCircle size={24} /> : <XCircle size={24} />}
                            {passed ? 'PASSED' : 'FAILED'}
                        </div>

                        <div className="mt-4 text-gray-700 font-medium">
                            Passing Marks: {attempt.quiz.passingMarks}
                        </div>

                        <div className={`mt-3 inline-block px-4 py-2 rounded-full text-sm font-semibold bg-${performance.color}-100 text-${performance.color}-800`}>
                            {performance.icon} {performance.label}
                        </div>
                    </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={<FileText className="text-blue-600" size={24} />}
                        value={attempt.selectedQuestions?.length || 0}
                        label="Total Questions"
                        color="blue"
                    />
                    <StatCard
                        icon={<CheckCircle className="text-green-600" size={24} />}
                        value={attempt.correctCount || 0}
                        label="Correct"
                        color="green"
                    />
                    <StatCard
                        icon={<XCircle className="text-red-600" size={24} />}
                        value={attempt.wrongCount || 0}
                        label="Wrong"
                        color="red"
                    />
                    <StatCard
                        icon={<Target className="text-purple-600" size={24} />}
                        value={`${accuracy}%`}
                        label="Accuracy"
                        color="purple"
                    />
                </div>

                {/* Additional Stats */}
                {(attempt.partialCount > 0 || attempt.tabSwitches > 0 || attempt.unansweredCount > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {attempt.partialCount > 0 && (
                            <StatCard
                                icon={<TrendingUp className="text-yellow-600" size={24} />}
                                value={attempt.partialCount}
                                label="Partial Credit"
                                color="yellow"
                            />
                        )}
                        {attempt.unansweredCount > 0 && (
                            <StatCard
                                icon={<AlertTriangle className="text-gray-600" size={24} />}
                                value={attempt.unansweredCount}
                                label="Unanswered"
                                color="gray"
                            />
                        )}
                        {attempt.tabSwitches > 0 && (
                            <StatCard
                                icon={<AlertTriangle className="text-orange-600" size={24} />}
                                value={attempt.tabSwitches}
                                label="Tab Switches"
                                color="orange"
                            />
                        )}
                    </div>
                )}

                {/* Time Information */}
                <div className="bg-white shadow-xl rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="text-blue-600" size={24} />
                        <h2 className="text-2xl font-bold text-gray-800">Time Details</h2>
                    </div>

                    <div className="space-y-3">
                        <TimeInfo label="Started" value={new Date(attempt.startTime).toLocaleString()} />
                        {attempt.endTime && (
                            <TimeInfo label="Submitted" value={new Date(attempt.endTime).toLocaleString()} />
                        )}
                        {attempt.timeSpentSeconds && (
                            <TimeInfo
                                label="Time Taken"
                                value={`${Math.floor(attempt.timeSpentSeconds / 60)} minutes ${attempt.timeSpentSeconds % 60} seconds`}
                            />
                        )}
                    </div>

                    {attempt.isAutoSubmit && (
                        <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                            <p className="text-yellow-800 text-sm font-medium flex items-center gap-2">
                                <Clock size={16} />
                                This quiz was auto-submitted due to time expiry
                            </p>
                        </div>
                    )}
                </div>

                {/* Answer Review Section */}
                {attempt.quiz.showCorrectAnswers && attempt.autoGradeResult && (
                    <div className="bg-white shadow-xl rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="text-blue-600" size={24} />
                                <h2 className="text-2xl font-bold text-gray-800">Answer Review</h2>
                            </div>
                            <button
                                onClick={() => setShowAnswers(!showAnswers)}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                                {showAnswers ? <EyeOff size={20} /> : <Eye size={20} />}
                                {showAnswers ? 'Hide Answers' : 'Show Answers'}
                            </button>
                        </div>

                        {showAnswers && (
                            <div className="space-y-4">
                                {attempt.selectedQuestions.map((sq, idx) => {
                                    const questionResult = getQuestionResult(sq.question._id);
                                    const isCorrect = questionResult?.isCorrect;
                                    const isPartial = questionResult?.isPartial;
                                    const isExpanded = expandedQuestions.has(idx);

                                    return (
                                        <div
                                            key={sq.question._id}
                                            className={`border-2 rounded-xl overflow-hidden transition-all ${isCorrect
                                                    ? 'border-green-300 bg-green-50'
                                                    : isPartial
                                                        ? 'border-yellow-300 bg-yellow-50'
                                                        : 'border-red-300 bg-red-50'
                                                }`}
                                        >
                                            <div
                                                className="p-4 cursor-pointer hover:bg-opacity-50"
                                                onClick={() => toggleQuestionExpand(idx)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="font-bold text-gray-800 text-lg">
                                                                Question {idx + 1}
                                                            </h3>
                                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                        </div>
                                                        <p className="text-gray-700 font-medium">{sq.prompt}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${isCorrect
                                                                ? 'bg-green-200 text-green-800'
                                                                : isPartial
                                                                    ? 'bg-yellow-200 text-yellow-800'
                                                                    : 'bg-red-200 text-red-800'
                                                            }`}>
                                                            {questionResult?.score}/{questionResult?.maxScore} marks
                                                        </span>
                                                        {isCorrect && <CheckCircle className="text-green-600" size={24} />}
                                                        {isPartial && <TrendingUp className="text-yellow-600" size={24} />}
                                                        {!isCorrect && !isPartial && <XCircle className="text-red-600" size={24} />}
                                                    </div>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="px-4 pb-4">
                                                    {(sq.type === 'mcq_single' || sq.type === 'mcq_multi') && (
                                                        <div className="space-y-2 mt-3">
                                                            {sq.choices.map((choice, cidx) => {
                                                                const isSubmitted = sq.type === 'mcq_single'
                                                                    ? questionResult?.submittedAnswer === choice.id
                                                                    : questionResult?.submittedAnswer?.includes(choice.id);

                                                                const isCorrectChoice = sq.type === 'mcq_single'
                                                                    ? questionResult?.correctAnswer === choice.id
                                                                    : questionResult?.correctAnswer?.includes(choice.id);

                                                                return (
                                                                    <div
                                                                        key={choice.id}
                                                                        className={`p-3 rounded-lg border-2 ${isCorrectChoice
                                                                                ? 'bg-green-100 border-green-500'
                                                                                : isSubmitted
                                                                                    ? 'bg-red-100 border-red-500'
                                                                                    : 'bg-white border-gray-200'
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="font-bold text-gray-700 bg-white px-2 py-1 rounded">
                                                                                {getChoiceLabel(cidx)}
                                                                            </span>
                                                                            <span className="flex-1">{choice.text}</span>
                                                                            {isCorrectChoice && (
                                                                                <span className="text-green-600 font-bold flex items-center gap-1">
                                                                                    <CheckCircle size={18} /> Correct
                                                                                </span>
                                                                            )}
                                                                            {isSubmitted && !isCorrectChoice && (
                                                                                <span className="text-red-600 font-bold flex items-center gap-1">
                                                                                    <XCircle size={18} /> Your Answer
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {questionResult?.feedback && (
                                                        <div className="mt-3 p-3 bg-white rounded-lg border-2 border-gray-300">
                                                            <p className="text-sm text-gray-700 font-medium">
                                                                💡 <span className="font-bold">Feedback:</span> {questionResult.feedback}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 flex-wrap">
                    <button
                        onClick={() => navigate("/student/enrolled")}
                        className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition text-lg shadow-lg"
                    >
                        Back to Enrolled Quizzes
                    </button>

                    {attempt.quiz.attemptsAllowed > 1 && (
                        <button
                            onClick={() => navigate(`/student/quiz/${attempt.quiz._id}/start`)}
                            className="flex-1 bg-gray-600 text-white py-4 rounded-xl font-semibold hover:bg-gray-700 transition text-lg shadow-lg"
                        >
                            Try Again
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper Components
const StatCard = ({ icon, value, label, color }) => (
    <div className={`bg-white rounded-xl p-5 shadow-lg border-l-4 border-${color}-500`}>
        <div className="flex items-center justify-between">
            <div>
                <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
                <div className="text-sm text-gray-600 font-medium">{label}</div>
            </div>
            <div className={`p-3 bg-${color}-50 rounded-lg`}>
                {icon}
            </div>
        </div>
    </div>
);

const TimeInfo = ({ label, value }) => (
    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
        <span className="font-semibold text-gray-700">{label}:</span>
        <span className="text-gray-900 font-medium">{value}</span>
    </div>
);

export default QuizResult;