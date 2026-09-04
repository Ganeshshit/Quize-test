// src/pages/trainer/AttemptDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import TrainerLayout from "../../components/Layout/TrainerLayout";
import { quizzesAPI } from "../../api/quizzes.api";
import {
    ArrowLeft,
    User,
    Clock,
    Award,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Eye,
    TrendingUp,
    Monitor,
    Wifi,
    Calendar
} from "lucide-react";

const AttemptDetails = () => {
    const { quizId, attemptId } = useParams();
    const [attempt, setAttempt] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAttemptDetails();
    }, [quizId, attemptId]);

    const loadAttemptDetails = async () => {
        try {
            const res = await quizzesAPI.getAttemptDetails(quizId, attemptId);
            setAttempt(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load attempt details:", err);
            setLoading(false);
        }
    };

    const getAnswerStatus = (grading) => {
        if (!grading) return { icon: <XCircle size={20} />, color: "text-slate-400", label: "Not Graded" };

        if (grading.isCorrect) {
            return { icon: <CheckCircle size={20} />, color: "text-green-600", label: "Correct" };
        } else if (grading.isPartial) {
            return { icon: <TrendingUp size={20} />, color: "text-orange-600", label: "Partially Correct" };
        } else {
            return { icon: <XCircle size={20} />, color: "text-red-600", label: "Incorrect" };
        }
    };

    if (loading) {
        return (
            <TrainerLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-lg text-slate-600">Loading attempt details...</p>
                    </div>
                </div>
            </TrainerLayout>
        );
    }

    if (!attempt) {
        return (
            <TrainerLayout>
                <div className="text-center py-20">
                    <AlertTriangle size={60} className="mx-auto mb-4 text-red-500" />
                    <h2 className="text-2xl font-bold text-gray-800">Attempt Not Found</h2>
                    <Link
                        to={`/trainer/quizzes/${quizId}/monitor`}
                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <ArrowLeft size={18} />
                        Back to Monitor
                    </Link>
                </div>
            </TrainerLayout>
        );
    }

    const { attempt: attemptInfo, student, antiCheat, questionsWithAnswers, quiz } = attempt;

    return (
        <TrainerLayout>
            {/* HEADER */}
            <div className="mb-6">
                <Link
                    to={`/trainer/quizzes/${quizId}/monitor`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
                >
                    <ArrowLeft size={18} />
                    Back to Quiz Monitor
                </Link>

                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                    <h1 className="text-3xl font-bold mb-2">Attempt Review & Analysis</h1>
                    <p className="text-blue-100">{quiz?.title}</p>
                </div>
            </div>

            {/* STUDENT & ATTEMPT INFO */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Student Card */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                            {student?.name?.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-800">{student?.name}</h3>
                            <p className="text-sm text-slate-500">{student?.email}</p>
                        </div>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-600">Reg Number:</span>
                            <span className="font-medium">{student?.registrationNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Semester:</span>
                            <span className="font-medium">{student?.semester}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Department:</span>
                            <span className="font-medium">{student?.department}</span>
                        </div>
                    </div>
                </div>

                {/* Score Card */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Award className="text-yellow-500" size={20} />
                        Performance Summary
                    </h3>

                    <div className="text-center mb-4">
                        <div className="text-5xl font-bold text-gray-800 mb-1">
                            {attemptInfo?.totalScore}
                            <span className="text-2xl text-slate-400">/{attemptInfo?.maxScore}</span>
                        </div>
                        <div className="text-lg font-semibold text-slate-600">
                            {attemptInfo?.percentage?.toFixed(1)}%
                        </div>
                        <div className={`mt-2 px-4 py-2 rounded-full inline-block font-medium ${attemptInfo?.passed
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                            {attemptInfo?.passed ? "PASSED ✓" : "FAILED ✗"}
                        </div>
                    </div>

                    <div className="space-y-2 text-sm border-t pt-4">
                        <div className="flex justify-between">
                            <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle size={16} /> Correct
                            </span>
                            <span className="font-bold">{attemptInfo?.correctCount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-red-600 flex items-center gap-1">
                                <XCircle size={16} /> Wrong
                            </span>
                            <span className="font-bold">{attemptInfo?.wrongCount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Unanswered</span>
                            <span className="font-bold">{attemptInfo?.unansweredCount}</span>
                        </div>
                    </div>
                </div>

                {/* Time & Status Card */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Clock className="text-blue-500" size={20} />
                        Attempt Metadata
                    </h3>

                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-slate-600 mb-1">Status</p>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${attemptInfo?.status === "submitted" || attemptInfo?.status === "auto_graded"
                                    ? "bg-green-100 text-green-700"
                                    : attemptInfo?.status === "in_progress"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-red-100 text-red-700"
                                }`}>
                                {attemptInfo?.status?.toUpperCase().replace("_", " ")}
                            </span>
                        </div>

                        <div>
                            <p className="text-sm text-slate-600 mb-1">Time Spent</p>
                            <p className="font-bold text-gray-800 flex items-center gap-2">
                                <Clock size={16} />
                                {Math.floor(attemptInfo?.timeSpentSeconds / 60)} min {attemptInfo?.timeSpentSeconds % 60} sec
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-600 mb-1">Started At</p>
                            <p className="text-sm font-medium flex items-center gap-2">
                                <Calendar size={14} />
                                {new Date(attemptInfo?.startTime).toLocaleString()}
                            </p>
                        </div>

                        {attemptInfo?.endTime && (
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Ended At</p>
                                <p className="text-sm font-medium flex items-center gap-2">
                                    <Calendar size={14} />
                                    {new Date(attemptInfo?.endTime).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ANTI-CHEAT ANALYSIS */}
            {antiCheat && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                        <Monitor className="text-purple-500" size={24} />
                        Anti-Cheat Analysis
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className={`p-4 rounded-lg border-2 ${antiCheat.tabSwitches > 5 ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"
                            }`}>
                            <p className="text-sm text-slate-600 mb-1">Tab Switches</p>
                            <p className={`text-3xl font-bold ${antiCheat.tabSwitches > 5 ? "text-red-600" : "text-green-600"
                                }`}>
                                {antiCheat.tabSwitches}
                            </p>
                        </div>

                        <div className="p-4 rounded-lg border-2 border-blue-300 bg-blue-50">
                            <p className="text-sm text-slate-600 mb-1 flex items-center gap-1">
                                <Wifi size={14} />
                                IP Address
                            </p>
                            <p className="text-sm font-mono font-medium">
                                Start: {antiCheat.ipAtStart || "N/A"}
                            </p>
                            <p className="text-sm font-mono font-medium">
                                End: {antiCheat.ipAtEnd || "N/A"}
                            </p>
                            {antiCheat.ipAtStart !== antiCheat.ipAtEnd && (
                                <p className="text-xs text-red-600 mt-1">⚠️ IP Changed</p>
                            )}
                        </div>

                        <div className={`p-4 rounded-lg border-2 ${antiCheat.isFlagged ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"
                            }`}>
                            <p className="text-sm text-slate-600 mb-1">Flagged Status</p>
                            <p className={`text-2xl font-bold ${antiCheat.isFlagged ? "text-red-600" : "text-green-600"
                                }`}>
                                {antiCheat.isFlagged ? "FLAGGED" : "CLEAN"}
                            </p>
                        </div>
                    </div>

                    {antiCheat.flaggedReasons && antiCheat.flaggedReasons.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                                <AlertTriangle size={18} />
                                Flagged Reasons
                            </h4>
                            <ul className="space-y-2">
                                {antiCheat.flaggedReasons.map((reason, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${reason.severity === "high" ? "bg-red-600 text-white" :
                                                reason.severity === "medium" ? "bg-orange-500 text-white" :
                                                    "bg-yellow-500 text-white"
                                            }`}>
                                            {reason.severity?.toUpperCase()}
                                        </span>
                                        <span className="text-red-800">{reason.reason}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* QUESTIONS & ANSWERS */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
                    <Eye className="text-indigo-500" size={24} />
                    Question-by-Question Analysis
                </h3>

                <div className="space-y-6">
                    {questionsWithAnswers?.map((qa, index) => {
                        const status = getAnswerStatus(qa.grading);

                        return (
                            <div key={index} className="border rounded-xl p-6 hover:shadow-md transition">
                                {/* Question Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-bold">
                                                Q{index + 1}
                                            </span>
                                            <span className={`flex items-center gap-1 font-medium ${status.color}`}>
                                                {status.icon}
                                                {status.label}
                                            </span>
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-800">
                                            {qa.question?.prompt}
                                        </h4>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-sm text-slate-600">Score</p>
                                        <p className="text-2xl font-bold text-gray-800">
                                            {qa.grading?.score || 0}
                                            <span className="text-lg text-slate-400">/{qa.grading?.maxScore || qa.question?.marks}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Question Type & Marks */}
                                <div className="flex gap-4 mb-4 text-sm">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                                        {qa.question?.type?.replace("_", " ").toUpperCase()}
                                    </span>
                                    <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full font-medium">
                                        {qa.question?.marks} Mark(s)
                                    </span>
                                </div>

                                {/* Choices (for MCQ) */}
                                {qa.question?.choices && qa.question.choices.length > 0 && (
                                    <div className="mb-4">
                                        <p className="font-semibold text-gray-700 mb-2">Options:</p>
                                        <div className="space-y-2">
                                            {qa.question.choices.map((choice) => {
                                                const isStudentAnswer = Array.isArray(qa.studentAnswer)
                                                    ? qa.studentAnswer.includes(choice.id)
                                                    : qa.studentAnswer === choice.id;

                                                const isCorrect = qa.question.correctAnswer === choice.id ||
                                                    (Array.isArray(qa.question.correctAnswer) &&
                                                        qa.question.correctAnswer.includes(choice.id));

                                                return (
                                                    <div
                                                        key={choice.id}
                                                        className={`p-3 rounded-lg border-2 ${isCorrect
                                                                ? "border-green-400 bg-green-50"
                                                                : isStudentAnswer
                                                                    ? "border-red-400 bg-red-50"
                                                                    : "border-slate-200 bg-slate-50"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {isCorrect && <CheckCircle size={18} className="text-green-600" />}
                                                            {!isCorrect && isStudentAnswer && <XCircle size={18} className="text-red-600" />}
                                                            <span className="font-semibold">{choice.id}.</span>
                                                            <span>{choice.text}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Student Answer */}
                                <div className="bg-slate-50 p-4 rounded-lg mb-3">
                                    <p className="font-semibold text-gray-700 mb-2">Student's Answer:</p>
                                    <p className="text-gray-800">
                                        {qa.studentAnswer
                                            ? (Array.isArray(qa.studentAnswer)
                                                ? qa.studentAnswer.join(", ")
                                                : qa.studentAnswer)
                                            : <span className="text-slate-400 italic">Not answered</span>
                                        }
                                    </p>
                                </div>

                                {/* Correct Answer (if quiz allows showing) */}
                                {quiz?.showCorrectAnswers && qa.question?.correctAnswer && (
                                    <div className="bg-green-50 p-4 rounded-lg mb-3">
                                        <p className="font-semibold text-green-800 mb-2">Correct Answer:</p>
                                        <p className="text-green-900 font-medium">
                                            {Array.isArray(qa.question.correctAnswer)
                                                ? qa.question.correctAnswer.join(", ")
                                                : qa.question.correctAnswer}
                                        </p>
                                    </div>
                                )}

                                {/* Feedback */}
                                {qa.grading?.feedback && (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="font-semibold text-blue-800 mb-1">Feedback:</p>
                                        <p className="text-blue-900 text-sm">{qa.grading.feedback}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </TrainerLayout>
    );
};

export default AttemptDetails;