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
    Calendar,
    Loader2
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
        if (!grading) return { icon: <XCircle size={18} />, color: "text-gray-400 bg-gray-50 border-gray-200", label: "NOT GRADED" };

        if (grading.isCorrect) {
            return { icon: <CheckCircle size={18} />, color: "text-emerald-700 bg-emerald-50 border-emerald-200", label: "CORRECT" };
        } else if (grading.isPartial) {
            return { icon: <TrendingUp size={18} />, color: "text-yellow-700 bg-yellow-50 border-yellow-200", label: "PARTIAL" };
        } else {
            return { icon: <XCircle size={18} />, color: "text-red-700 bg-red-50 border-red-200", label: "INCORRECT" };
        }
    };

    if (loading) {
        return (
            <TrainerLayout>
                <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                    <Loader2 size={40} className="text-yellow-400 animate-spin mb-4" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Attempt Data...</p>
                </div>
            </TrainerLayout>
        );
    }

    if (!attempt) {
        return (
            <TrainerLayout>
                <div className="flex flex-col items-center justify-center py-20 min-h-[60vh] max-w-md mx-auto text-center">
                    <div className="p-4 bg-red-50 text-red-500 rounded-2xl mb-4">
                        <AlertTriangle size={48} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Attempt Not Found</h2>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">The requested record does not exist.</p>
                    <Link
                        to={`/trainer/quizzes/${quizId}/monitor`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A0A0A] hover:bg-black text-white text-sm font-bold rounded-xl transition-all"
                    >
                        <ArrowLeft size={16} /> Back to Monitor
                    </Link>
                </div>
            </TrainerLayout>
        );
    }

    const { attempt: attemptInfo, student, antiCheat, questionsWithAnswers, quiz } = attempt;

    return (
        <TrainerLayout>
            <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full font-sans selection:bg-yellow-200">

                {/* Premium Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <Link
                            to={`/trainer/quizzes/${quizId}/monitor`}
                            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black uppercase tracking-widest mb-3 transition-colors"
                        >
                            <ArrowLeft size={14} /> Back to Quiz Monitor
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-yellow-400 rounded-lg text-black shadow-sm">
                                <Eye size={24} />
                            </div>
                            Attempt Analysis
                        </h1>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2">
                            {quiz?.title || "Quiz Review"}
                        </p>
                    </div>
                </div>

                {/* Grid: Student, Score, Time */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                    {/* Student Card */}
                    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 sm:p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <User size={100} />
                        </div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Candidate Details</h3>

                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-black font-black text-2xl shadow-sm border-4 border-yellow-50">
                                {student?.name?.charAt(0) || "U"}
                            </div>
                            <div>
                                <h3 className="font-black text-lg text-gray-900">{student?.name || "Unknown"}</h3>
                                <p className="text-xs font-bold text-gray-500">{student?.email}</p>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reg Number</span>
                                <span className="text-sm font-bold text-gray-900">{student?.registrationNumber || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Semester</span>
                                <span className="text-sm font-bold text-gray-900">{student?.semester || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</span>
                                <span className="text-sm font-bold text-gray-900">{student?.department || "N/A"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Score Card */}
                    <div className="bg-[#0A0A0A] rounded-3xl shadow-lg p-6 sm:p-8 text-white relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 relative z-10">Performance Summary</h3>

                        <div className="text-center mb-6 relative z-10">
                            <div className="text-5xl font-black text-white mb-1">
                                {attemptInfo?.totalScore}
                                <span className="text-2xl text-gray-600">/{attemptInfo?.maxScore}</span>
                            </div>
                            <div className="text-sm font-bold text-yellow-400 tracking-widest mb-3">
                                {attemptInfo?.percentage?.toFixed(1)}% OVERALL
                            </div>
                            <div className={`px-4 py-1.5 rounded-md text-[10px] font-black tracking-widest inline-block border ${attemptInfo?.passed ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                                }`}>
                                {attemptInfo?.passed ? "PASSED VERIFIED ✓" : "FAILED REQUIREMENT ✗"}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center border-t border-white/10 pt-4 relative z-10">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Correct</p>
                                <p className="text-lg font-black text-emerald-400">{attemptInfo?.correctCount || 0}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Wrong</p>
                                <p className="text-lg font-black text-red-400">{attemptInfo?.wrongCount || 0}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Skipped</p>
                                <p className="text-lg font-black text-gray-300">{attemptInfo?.unansweredCount || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Time & Status Card */}
                    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 sm:p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Clock size={100} />
                        </div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Attempt Metadata</h3>

                        <div className="space-y-6 relative z-10">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current Status</p>
                                <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border inline-block ${attemptInfo?.status === "submitted" || attemptInfo?.status === "auto_graded"
                                    ? "bg-green-50 border-green-200 text-green-700"
                                    : attemptInfo?.status === "in_progress"
                                        ? "bg-blue-50 border-blue-200 text-blue-700"
                                        : "bg-red-50 border-red-200 text-red-700"
                                    }`}>
                                    {attemptInfo?.status?.toUpperCase().replace("_", " ") || "UNKNOWN"}
                                </span>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Time Spent</p>
                                <p className="text-lg font-black text-gray-900 flex items-center gap-2">
                                    <Clock size={18} className="text-yellow-500" />
                                    {Math.floor((attemptInfo?.timeSpentSeconds || 0) / 60)}m {(attemptInfo?.timeSpentSeconds || 0) % 60}s
                                </p>
                            </div>

                            <div className="pt-4 border-t border-gray-50">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Timeline</p>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-700 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        {new Date(attemptInfo?.startTime).toLocaleString()}
                                    </p>
                                    {attemptInfo?.endTime && (
                                        <p className="text-xs font-bold text-gray-700 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                            {new Date(attemptInfo?.endTime).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ANTI-CHEAT ANALYSIS */}
                {antiCheat && (
                    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 sm:p-8 mb-8">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                            <div className="p-2 bg-gray-100 rounded-lg text-gray-700">
                                <Monitor size={20} />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Anti-Cheat Analysis</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className={`p-5 rounded-2xl border ${antiCheat.tabSwitches > 5 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Tab Switches</p>
                                <p className={`text-3xl font-black ${antiCheat.tabSwitches > 5 ? "text-red-700" : "text-gray-900"}`}>
                                    {antiCheat.tabSwitches}
                                </p>
                                {antiCheat.tabSwitches > 5 && <p className="text-[10px] font-bold text-red-600 mt-2 uppercase">High Warning</p>}
                            </div>

                            <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1">
                                    <Wifi size={12} /> Network / IP
                                </p>
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-gray-800">Start: <span className="font-medium text-gray-600">{antiCheat.ipAtStart || "N/A"}</span></p>
                                    <p className="text-xs font-bold text-gray-800">End: <span className="font-medium text-gray-600">{antiCheat.ipAtEnd || "N/A"}</span></p>
                                </div>
                                {antiCheat.ipAtStart !== antiCheat.ipAtEnd && (
                                    <p className="text-[10px] font-bold text-red-600 mt-3 uppercase border border-red-200 bg-red-100 inline-block px-2 py-0.5 rounded">IP Changed</p>
                                )}
                            </div>

                            <div className={`p-5 rounded-2xl border ${antiCheat.isFlagged ? "bg-red-50 border-red-300" : "bg-emerald-50 border-emerald-200"}`}>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">System Verdict</p>
                                <p className={`text-2xl font-black mt-2 ${antiCheat.isFlagged ? "text-red-700" : "text-emerald-700"}`}>
                                    {antiCheat.isFlagged ? "FLAGGED" : "CLEAN"}
                                </p>
                            </div>
                        </div>

                        {antiCheat.flaggedReasons && antiCheat.flaggedReasons.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                                <h4 className="text-xs font-black text-red-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <AlertTriangle size={16} /> Violation Log
                                </h4>
                                <ul className="space-y-3">
                                    {antiCheat.flaggedReasons.map((reason, idx) => (
                                        <li key={idx} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-red-100">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-widest ${reason.severity === "high" ? "bg-red-600 text-white" :
                                                reason.severity === "medium" ? "bg-orange-500 text-white" :
                                                    "bg-yellow-400 text-black"
                                                }`}>
                                                {reason.severity?.toUpperCase()}
                                            </span>
                                            <span className="text-sm font-bold text-gray-800">{reason.reason}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* QUESTIONS & ANSWERS */}
                <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-yellow-100 rounded-lg text-yellow-700">
                            <Eye size={20} />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Question Breakdown</h3>
                    </div>

                    <div className="space-y-6">
                        {questionsWithAnswers?.map((qa, index) => {
                            const status = getAnswerStatus(qa.grading);

                            return (
                                <div key={index} className="border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-colors">

                                    {/* Question Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                                <span className="px-3 py-1 bg-[#0A0A0A] text-white rounded-md text-[10px] font-black uppercase tracking-widest">
                                                    Q{index + 1}
                                                </span>
                                                <span className={`px-3 py-1 rounded-md text-[10px] font-black tracking-widest border flex items-center gap-1 ${status.color}`}>
                                                    {status.icon} {status.label}
                                                </span>
                                                <span className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 rounded-md text-[10px] font-black uppercase tracking-widest">
                                                    {qa.question?.type?.replace("_", " ")}
                                                </span>
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-900 leading-snug">
                                                {qa.question?.prompt}
                                            </h4>
                                        </div>

                                        <div className="sm:text-right bg-gray-50 border border-gray-200 p-3 rounded-xl min-w-[100px]">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Score</p>
                                            <p className="text-2xl font-black text-gray-900">
                                                {qa.grading?.score || 0}
                                                <span className="text-sm text-gray-400 font-bold">/{qa.grading?.maxScore || qa.question?.marks}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* MCQ Choices */}
                                    {qa.question?.choices && qa.question.choices.length > 0 && (
                                        <div className="mb-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                                            className={`p-3 rounded-xl border-2 flex items-center gap-3 ${isCorrect ? "border-emerald-400 bg-emerald-50" :
                                                                isStudentAnswer ? "border-red-400 bg-red-50" :
                                                                    "border-gray-200 bg-gray-50"
                                                                }`}
                                                        >
                                                            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black ${isCorrect ? "bg-emerald-200 text-emerald-800" :
                                                                isStudentAnswer ? "bg-red-200 text-red-800" :
                                                                    "bg-white border border-gray-300 text-gray-500"
                                                                }`}>
                                                                {choice.id}
                                                            </div>
                                                            <span className="text-sm font-bold text-gray-800 flex-1">{choice.text}</span>
                                                            {isCorrect && <CheckCircle size={18} className="text-emerald-600" />}
                                                            {!isCorrect && isStudentAnswer && <XCircle size={18} className="text-red-600" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Direct Answer Display (Non-MCQ or summary) */}
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1 bg-gray-50 border border-gray-200 p-4 rounded-xl">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Student's Answer</p>
                                            <p className="text-sm font-bold text-gray-900">
                                                {qa.studentAnswer
                                                    ? (Array.isArray(qa.studentAnswer) ? qa.studentAnswer.join(", ") : qa.studentAnswer)
                                                    : <span className="text-gray-400 italic">Not answered</span>
                                                }
                                            </p>
                                        </div>

                                        {quiz?.showCorrectAnswers && qa.question?.correctAnswer && (
                                            <div className="flex-1 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                                                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2">Correct Answer</p>
                                                <p className="text-sm font-bold text-emerald-900">
                                                    {Array.isArray(qa.question.correctAnswer) ? qa.question.correctAnswer.join(", ") : qa.question.correctAnswer}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Feedback */}
                                    {qa.grading?.feedback && (
                                        <div className="mt-4 bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-start gap-3">
                                            <AlertTriangle size={16} className="text-yellow-600 mt-0.5" />
                                            <div>
                                                <p className="text-[10px] font-black text-yellow-800 uppercase tracking-widest mb-1">Trainer Feedback</p>
                                                <p className="text-sm font-bold text-yellow-900">{qa.grading.feedback}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </TrainerLayout>
    );
};

export default AttemptDetails;