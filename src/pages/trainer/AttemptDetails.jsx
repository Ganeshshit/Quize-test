// src/pages/trainer/AttemptDetails.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
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
    Loader2,
    Printer,
    ChevronUp,
    ListFilter,
    ShieldAlert,
    ShieldCheck,
} from "lucide-react";

const FILTERS = [
    { key: "all", label: "All" },
    { key: "correct", label: "Correct" },
    { key: "partial", label: "Partial" },
    { key: "incorrect", label: "Incorrect" },
    { key: "unanswered", label: "Unanswered" },
];

const AttemptDetails = () => {
    const { quizId, attemptId } = useParams();
    const [attempt, setAttempt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [questionFilter, setQuestionFilter] = useState("all");
    const [showBackToTop, setShowBackToTop] = useState(false);
    const questionsRef = useRef(null);

    useEffect(() => {
        loadAttemptDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quizId, attemptId]);

    useEffect(() => {
        const onScroll = () => setShowBackToTop(window.scrollY > 600);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const loadAttemptDetails = async () => {
        setLoading(true);
        try {
            const res = await quizzesAPI.getAttemptDetails(quizId, attemptId);
            setAttempt(res.data);
        } catch (err) {
            console.error("Failed to load attempt details:", err);
        } finally {
            setLoading(false);
        }
    };

    const getAnswerStatus = (grading) => {
        if (!grading)
            return {
                icon: <XCircle size={16} />,
                color: "text-gray-500 bg-gray-50 border-gray-200",
                dot: "bg-gray-400",
                label: "NOT GRADED",
                key: "unanswered",
            };
        if (grading.isCorrect) {
            return {
                icon: <CheckCircle size={16} />,
                color: "text-emerald-700 bg-emerald-50 border-emerald-200",
                dot: "bg-emerald-500",
                label: "CORRECT",
                key: "correct",
            };
        } else if (grading.isPartial) {
            return {
                icon: <TrendingUp size={16} />,
                color: "text-yellow-700 bg-yellow-50 border-yellow-200",
                dot: "bg-yellow-500",
                label: "PARTIAL",
                key: "partial",
            };
        }
        return {
            icon: <XCircle size={16} />,
            color: "text-red-700 bg-red-50 border-red-200",
            dot: "bg-red-500",
            label: "INCORRECT",
            key: "incorrect",
        };
    };

    const { attempt: attemptInfo, student, antiCheat, questionsWithAnswers, quiz } = attempt || {};

    const questionsWithStatus = useMemo(() => {
        if (!questionsWithAnswers) return [];
        return questionsWithAnswers.map((qa, idx) => ({
            ...qa,
            _index: idx,
            _status: getAnswerStatus(qa.grading),
        }));
    }, [questionsWithAnswers]);

    const filterCounts = useMemo(() => {
        const counts = { all: questionsWithStatus.length, correct: 0, partial: 0, incorrect: 0, unanswered: 0 };
        questionsWithStatus.forEach((qa) => {
            if (!qa.studentAnswer && qa._status.key !== "correct" && qa._status.key !== "partial") {
                counts.unanswered += 1;
            } else {
                counts[qa._status.key] = (counts[qa._status.key] || 0) + 1;
            }
        });
        return counts;
    }, [questionsWithStatus]);

    const filteredQuestions = useMemo(() => {
        if (questionFilter === "all") return questionsWithStatus;
        return questionsWithStatus.filter((qa) => {
            const answered = qa.studentAnswer && (!Array.isArray(qa.studentAnswer) || qa.studentAnswer.length > 0);
            if (questionFilter === "unanswered") return !answered;
            return qa._status.key === questionFilter;
        });
    }, [questionsWithStatus, questionFilter]);

    if (loading) {
        return (
            <TrainerLayout>
                <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                    <Loader2 size={40} className="text-yellow-400 animate-spin mb-4" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Loading Attempt Data...
                    </p>
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
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">
                        The requested record does not exist.
                    </p>
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

    const scorePct = attemptInfo?.percentage ?? 0;

    return (
        <TrainerLayout>
            <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full font-sans selection:bg-yellow-200">
                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <Link
                            to={`/trainer/quizzes/${quizId}/monitor`}
                            className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black uppercase tracking-widest mb-3 transition-colors"
                        >
                            <ArrowLeft size={14} /> Back to Quiz Monitor
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-yellow-400 rounded-lg text-black shadow-sm">
                                <Eye size={22} />
                            </div>
                            Attempt Analysis
                        </h1>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2">
                            {quiz?.title || "Quiz Review"}
                        </p>
                    </div>

                    <button
                        onClick={() => window.print()}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-gray-700 rounded-xl border border-gray-200 hover:border-black hover:text-black transition-all font-bold text-sm shadow-sm w-fit print:hidden"
                    >
                        <Printer size={16} className="text-yellow-500" />
                        Print / Save PDF
                    </button>
                </div>

                {/* TOP GRID: Student / Score / Meta */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Student Card */}
                    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 sm:p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                            <User size={100} />
                        </div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
                            Candidate Details
                        </h3>

                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-yellow-400 flex items-center justify-center text-black font-black text-2xl shadow-sm ring-4 ring-yellow-50">
                                {student?.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-black text-lg text-gray-900 truncate">{student?.name || "Unknown"}</h3>
                                <p className="text-xs font-bold text-gray-500 truncate">{student?.email}</p>
                            </div>
                        </div>

                        <dl className="relative z-10 divide-y divide-gray-50">
                            <div className="flex justify-between items-center py-2.5">
                                <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reg Number</dt>
                                <dd className="text-sm font-bold text-gray-900">{student?.registrationNumber || "N/A"}</dd>
                            </div>
                            <div className="flex justify-between items-center py-2.5">
                                <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Semester</dt>
                                <dd className="text-sm font-bold text-gray-900">{student?.semester || "N/A"}</dd>
                            </div>
                            <div className="flex justify-between items-center py-2.5">
                                <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</dt>
                                <dd className="text-sm font-bold text-gray-900 text-right">{student?.department || "N/A"}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Score Card */}
                    <div className="bg-[#0A0A0A] rounded-3xl shadow-lg p-6 sm:p-8 text-white relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400 rounded-full blur-3xl opacity-20 pointer-events-none" />
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 relative z-10">
                            Performance Summary
                        </h3>

                        <div className="text-center mb-5 relative z-10">
                            <div className="text-5xl font-black text-white mb-1">
                                {attemptInfo?.totalScore}
                                <span className="text-2xl text-gray-600">/{attemptInfo?.maxScore}</span>
                            </div>
                            <div className="text-sm font-bold text-yellow-400 tracking-widest mb-3">
                                {scorePct.toFixed(1)}% OVERALL
                            </div>

                            {/* Score progress bar */}
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                                <div
                                    className={`h-full rounded-full transition-all ${attemptInfo?.passed ? "bg-emerald-400" : "bg-red-400"
                                        }`}
                                    style={{ width: `${Math.min(100, Math.max(0, scorePct))}%` }}
                                />
                            </div>

                            <div
                                className={`px-4 py-1.5 rounded-md text-[10px] font-black tracking-widest inline-flex items-center gap-1.5 border ${attemptInfo?.passed
                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                        : "bg-red-500/10 border-red-500/20 text-red-400"
                                    }`}
                            >
                                {attemptInfo?.passed ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                                {attemptInfo?.passed ? "PASSED" : "FAILED"}
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
                        <div className="absolute top-0 right-0 p-4 opacity-[0.04] pointer-events-none">
                            <Clock size={100} />
                        </div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
                            Attempt Metadata
                        </h3>

                        <div className="space-y-5 relative z-10">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                    Current Status
                                </p>
                                <span
                                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border inline-block ${attemptInfo?.status === "submitted" || attemptInfo?.status === "auto_graded"
                                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                            : attemptInfo?.status === "in_progress"
                                                ? "bg-amber-50 border-amber-200 text-amber-700"
                                                : "bg-red-50 border-red-200 text-red-700"
                                        }`}
                                >
                                    {attemptInfo?.status?.toUpperCase().replace("_", " ") || "UNKNOWN"}
                                </span>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                    Total Time Spent
                                </p>
                                <p className="text-lg font-black text-gray-900 flex items-center gap-2">
                                    <Clock size={18} className="text-yellow-500" />
                                    {Math.floor((attemptInfo?.timeSpentSeconds || 0) / 60)}m{" "}
                                    {(attemptInfo?.timeSpentSeconds || 0) % 60}s
                                </p>
                            </div>

                            <div className="pt-4 border-t border-gray-50">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    Timeline
                                </p>
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-gray-700 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                                        {attemptInfo?.startTime ? new Date(attemptInfo.startTime).toLocaleString() : "N/A"}
                                    </p>
                                    {attemptInfo?.endTime && (
                                        <p className="text-xs font-bold text-gray-700 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                                            {new Date(attemptInfo.endTime).toLocaleString()}
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
                        <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-700">
                                    <Monitor size={20} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">
                                    Anti-Cheat Analysis
                                </h3>
                            </div>
                            <span
                                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${antiCheat.isFlagged
                                        ? "bg-red-50 border-red-200 text-red-700"
                                        : "bg-emerald-50 border-emerald-200 text-emerald-700"
                                    }`}
                            >
                                {antiCheat.isFlagged ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
                                {antiCheat.isFlagged ? "Flagged" : "Clean"}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div
                                className={`p-5 rounded-2xl border ${antiCheat.tabSwitches > 5 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
                                    }`}
                            >
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                                    Tab Switches
                                </p>
                                <p
                                    className={`text-3xl font-black ${antiCheat.tabSwitches > 5 ? "text-red-700" : "text-gray-900"
                                        }`}
                                >
                                    {antiCheat.tabSwitches}
                                </p>
                                {antiCheat.tabSwitches > 5 && (
                                    <p className="text-[10px] font-bold text-red-600 mt-2 uppercase tracking-widest">
                                        High Warning
                                    </p>
                                )}
                            </div>

                            <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                    <Wifi size={12} /> Network / IP
                                </p>
                                <div className="space-y-1.5">
                                    <p className="text-xs font-bold text-gray-800">
                                        Start: <span className="font-medium text-gray-600">{antiCheat.ipAtStart || "N/A"}</span>
                                    </p>
                                    <p className="text-xs font-bold text-gray-800">
                                        End: <span className="font-medium text-gray-600">{antiCheat.ipAtEnd || "N/A"}</span>
                                    </p>
                                </div>
                                {antiCheat.ipAtStart !== antiCheat.ipAtEnd && (
                                    <p className="text-[10px] font-bold text-red-600 mt-3 uppercase tracking-widest border border-red-200 bg-red-100 inline-block px-2 py-0.5 rounded">
                                        IP Changed
                                    </p>
                                )}
                            </div>

                            <div
                                className={`p-5 rounded-2xl border ${antiCheat.isFlagged ? "bg-red-50 border-red-300" : "bg-emerald-50 border-emerald-200"
                                    }`}
                            >
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                                    System Verdict
                                </p>
                                <p
                                    className={`text-2xl font-black mt-2 ${antiCheat.isFlagged ? "text-red-700" : "text-emerald-700"
                                        }`}
                                >
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
                                        <li
                                            key={idx}
                                            className="flex items-start gap-3 bg-white p-3 rounded-xl border border-red-100"
                                        >
                                            <span
                                                className={`px-2 py-1 rounded-md text-[10px] font-black tracking-widest flex-shrink-0 ${reason.severity === "high"
                                                        ? "bg-red-600 text-white"
                                                        : reason.severity === "medium"
                                                            ? "bg-orange-500 text-white"
                                                            : "bg-yellow-400 text-black"
                                                    }`}
                                            >
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
                <div ref={questionsRef} className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-lg text-yellow-700">
                                <Eye size={20} />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">
                                Question Breakdown
                            </h3>
                        </div>

                        {/* Filter pills */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <ListFilter size={14} className="text-gray-400 hidden sm:block" />
                            {FILTERS.map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setQuestionFilter(f.key)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-colors ${questionFilter === f.key
                                            ? "bg-[#0A0A0A] text-white border-black"
                                            : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    {f.label}
                                    <span
                                        className={`ml-1.5 ${questionFilter === f.key ? "text-yellow-400" : "text-gray-400"
                                            }`}
                                    >
                                        {filterCounts[f.key] ?? 0}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredQuestions.length === 0 ? (
                        <div className="text-center py-16">
                            <CheckCircle size={40} className="mx-auto mb-3 text-gray-300" />
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                No questions match this filter
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredQuestions.map((qa) => {
                                const status = qa._status;
                                const index = qa._index;

                                return (
                                    <div
                                        key={index}
                                        className="border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-sm transition-all scroll-mt-24"
                                        id={`question-${index}`}
                                    >
                                        {/* Question Header */}
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                                    <span className="w-7 h-7 flex items-center justify-center bg-[#0A0A0A] text-white rounded-md text-[11px] font-black">
                                                        {index + 1}
                                                    </span>
                                                    <span
                                                        className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest border flex items-center gap-1 ${status.color}`}
                                                    >
                                                        {status.icon} {status.label}
                                                    </span>
                                                    <span className="px-2.5 py-1 bg-gray-100 border border-gray-200 text-gray-600 rounded-md text-[10px] font-black uppercase tracking-widest">
                                                        {qa.question?.type?.replace("_", " ")}
                                                    </span>
                                                </div>
                                                <h4 className="text-lg font-bold text-gray-900 leading-snug">
                                                    {qa.question?.prompt}
                                                </h4>
                                            </div>

                                            <div className="sm:text-right bg-gray-50 border border-gray-200 p-3 rounded-xl min-w-[100px] flex-shrink-0">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                                    Score
                                                </p>
                                                <p className="text-2xl font-black text-gray-900">
                                                    {qa.grading?.score || 0}
                                                    <span className="text-sm text-gray-400 font-bold">
                                                        /{qa.grading?.maxScore || qa.question?.marks}
                                                    </span>
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

                                                        const isCorrect =
                                                            qa.question.correctAnswer === choice.id ||
                                                            (Array.isArray(qa.question.correctAnswer) &&
                                                                qa.question.correctAnswer.includes(choice.id));

                                                        return (
                                                            <div
                                                                key={choice.id}
                                                                className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-colors ${isCorrect
                                                                        ? "border-emerald-400 bg-emerald-50"
                                                                        : isStudentAnswer
                                                                            ? "border-red-400 bg-red-50"
                                                                            : "border-gray-200 bg-gray-50"
                                                                    }`}
                                                            >
                                                                <div
                                                                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black flex-shrink-0 ${isCorrect
                                                                            ? "bg-emerald-200 text-emerald-800"
                                                                            : isStudentAnswer
                                                                                ? "bg-red-200 text-red-800"
                                                                                : "bg-white border border-gray-300 text-gray-500"
                                                                        }`}
                                                                >
                                                                    {choice.id}
                                                                </div>
                                                                <span className="text-sm font-bold text-gray-800 flex-1">
                                                                    {choice.text}
                                                                </span>
                                                                {isCorrect && (
                                                                    <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
                                                                )}
                                                                {!isCorrect && isStudentAnswer && (
                                                                    <XCircle size={18} className="text-red-600 flex-shrink-0" />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Direct Answer Display (Non-MCQ or summary) */}
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="flex-1 bg-gray-50 border border-gray-200 p-4 rounded-xl">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                                                    Student's Answer
                                                </p>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {qa.studentAnswer ? (
                                                        Array.isArray(qa.studentAnswer) ? (
                                                            qa.studentAnswer.join(", ")
                                                        ) : (
                                                            qa.studentAnswer
                                                        )
                                                    ) : (
                                                        <span className="text-gray-400 italic font-medium">Not answered</span>
                                                    )}
                                                </p>
                                            </div>

                                            {quiz?.showCorrectAnswers && qa.question?.correctAnswer && (
                                                <div className="flex-1 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                                                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2">
                                                        Correct Answer
                                                    </p>
                                                    <p className="text-sm font-bold text-emerald-900">
                                                        {Array.isArray(qa.question.correctAnswer)
                                                            ? qa.question.correctAnswer.join(", ")
                                                            : qa.question.correctAnswer}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Feedback */}
                                        {qa.grading?.feedback && (
                                            <div className="mt-4 bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-start gap-3">
                                                <AlertTriangle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-[10px] font-black text-yellow-800 uppercase tracking-widest mb-1">
                                                        Trainer Feedback
                                                    </p>
                                                    <p className="text-sm font-bold text-yellow-900">{qa.grading.feedback}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* BACK TO TOP */}
                {showBackToTop && (
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="fixed bottom-6 right-6 p-3 bg-[#0A0A0A] hover:bg-black text-white rounded-full shadow-lg transition-all print:hidden"
                        aria-label="Back to top"
                    >
                        <ChevronUp size={20} className="text-yellow-400" />
                    </button>
                )}
            </div>
        </TrainerLayout>
    );
};

export default AttemptDetails;