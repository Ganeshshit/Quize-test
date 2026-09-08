// src/pages/trainer/QuizMonitor.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import TrainerLayout from "../../components/Layout/TrainerLayout";
import { quizzesAPI } from "../../api/quizzes.api";
import {
    Users,
    FileText,
    AlertTriangle,
    TrendingUp,
    Eye,
    ArrowLeft,
    Activity,
    Search,
    ChevronLeft,
    ChevronRight,
    Loader2
} from "lucide-react";

const QuizMonitor = () => {
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    const [quiz, setQuiz] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [attempts, setAttempts] = useState([]);

    const [enrollPage, setEnrollPage] = useState(1);
    const [attemptPage, setAttemptPage] = useState(1);
    const [enrollTotal, setEnrollTotal] = useState(0);
    const [attemptTotal, setAttemptTotal] = useState(0);

    const [searchEnroll, setSearchEnroll] = useState("");
    const [searchAttempt, setSearchAttempt] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // Load quiz and statistics
    useEffect(() => {
        loadQuizData();
    }, [id]);

    // Load enrollments when tab changes
    useEffect(() => {
        if (activeTab === "enrollments") {
            loadEnrollments();
        }
    }, [activeTab, enrollPage, searchEnroll]);

    // Load attempts when tab changes
    useEffect(() => {
        if (activeTab === "attempts") {
            loadAttempts();
        }
    }, [activeTab, attemptPage, searchAttempt, statusFilter]);

    const loadQuizData = async () => {
        try {
            setLoading(true);
            const [quizRes, statsRes] = await Promise.all([
                quizzesAPI.getById(id),
                quizzesAPI.getStatistics(id)
            ]);
            setQuiz(quizRes.data);
            setStatistics(statsRes.data.statistics);
        } catch (err) {
            console.error("Failed to load quiz data:", err);
        } finally {
            setLoading(false);
        }
    };

    const loadEnrollments = async () => {
        try {
            const res = await quizzesAPI.getEnrollments(id, {
                page: enrollPage,
                limit: 20,
                search: searchEnroll
            });
            setEnrollments(res.data.enrollments);
            setEnrollTotal(res.data.pagination.total);
        } catch (err) {
            console.error("Failed to load enrollments:", err);
        }
    };

    const loadAttempts = async () => {
        try {
            const res = await quizzesAPI.getAttempts(id, {
                page: attemptPage,
                limit: 20,
                search: searchAttempt,
                status: statusFilter || undefined
            });
            setAttempts(res.data.attempts);
            setAttemptTotal(res.data.pagination.total);
        } catch (err) {
            console.error("Failed to load attempts:", err);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            in_progress: { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-700", label: "In Progress" },
            submitted: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", label: "Submitted" },
            auto_graded: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", label: "Graded" },
            flagged: { bg: "bg-red-50 border-red-200", text: "text-red-700", label: "Flagged" },
            needs_manual_review: { bg: "bg-orange-50 border-orange-200", text: "text-orange-700", label: "Manual Review" }
        };

        const config = statusConfig[status] || statusConfig.submitted;

        return (
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    // Premium common input classes
    const inputClasses = "w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all";

    if (loading) {
        return (
            <TrainerLayout>
                <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                    <Loader2 size={40} className="text-yellow-400 animate-spin mb-4" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Monitor Data...</p>
                </div>
            </TrainerLayout>
        );
    }

    return (
        <TrainerLayout>
            <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full font-sans selection:bg-yellow-200">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <Link
                            to="/trainer/quizzes"
                            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black uppercase tracking-widest mb-3 transition-colors"
                        >
                            <ArrowLeft size={14} /> Back to Quizzes
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-[#0A0A0A] rounded-lg text-white shadow-sm">
                                <Activity size={24} />
                            </div>
                            {quiz?.title || "Quiz Monitor"}
                        </h1>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2">
                            Monitor live activity and student performance
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            to={`/trainer/quizzes/${id}/details`}
                            className="px-5 py-2.5 bg-white border border-gray-200 hover:border-gray-900 text-gray-700 hover:text-black text-xs font-bold rounded-xl shadow-sm uppercase tracking-widest transition-all"
                        >
                            View Details
                        </Link>
                    </div>
                </div>

                {/* Custom Tabs */}
                <div className="flex gap-2 mb-8 p-1 bg-gray-100 rounded-xl inline-flex overflow-x-auto w-full sm:w-auto">
                    {["overview", "enrollments", "attempts"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* --- OVERVIEW TAB --- */}
                {activeTab === "overview" && statistics && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                icon={<Users size={24} />}
                                iconBg="bg-blue-50 text-blue-600"
                                label="Total Enrolled"
                                value={statistics.enrollment.total}
                                subtitle={`${statistics.enrollment.attempted} attempted`}
                            />
                            <StatCard
                                icon={<FileText size={24} />}
                                iconBg="bg-emerald-50 text-emerald-600"
                                label="Total Attempts"
                                value={statistics.attempts.total}
                                subtitle={`${statistics.attempts.completed} completed`}
                            />
                            <StatCard
                                icon={<AlertTriangle size={24} />}
                                iconBg="bg-red-50 text-red-600"
                                label="Flagged"
                                value={statistics.attempts.flagged}
                                subtitle="Suspicious activity"
                            />
                            <StatCard
                                icon={<TrendingUp size={24} />}
                                iconBg="bg-purple-50 text-purple-600"
                                label="Pass Rate"
                                value={`${statistics.performance.passRate.toFixed(1)}%`}
                                subtitle={`Avg Score: ${statistics.scores.average.toFixed(1)}`}
                            />
                        </div>

                        {/* Performance Metrics */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Score Distribution */}
                            <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 sm:p-8">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Score Distribution</h3>
                                <div className="space-y-4">
                                    {statistics.distribution.map((range) => (
                                        <div key={range.label}>
                                            <div className="flex justify-between text-xs font-bold text-gray-700 mb-2">
                                                <span>{range.label}</span>
                                                <span>{range.count} students</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className="bg-yellow-400 h-full rounded-full transition-all duration-1000"
                                                    style={{
                                                        width: statistics.attempts.completed > 0
                                                            ? `${(range.count / statistics.attempts.completed) * 100}%`
                                                            : '0%'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Detailed Stats */}
                            <div className="bg-[#0A0A0A] border border-gray-800 rounded-3xl shadow-lg p-6 sm:p-8 relative overflow-hidden text-white">
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-400 rounded-full blur-3xl opacity-10 pointer-events-none"></div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 relative z-10">Detailed Statistics</h3>

                                <div className="space-y-1 relative z-10">
                                    <StatRow label="Highest Score" value={statistics.scores.highest} />
                                    <StatRow label="Lowest Score" value={statistics.scores.lowest} />
                                    <StatRow label="Median Score" value={statistics.scores.median.toFixed(1)} />
                                    <StatRow label="Avg Time Spent" value={`${Math.floor(statistics.timing.averageTimeSpent / 60)} min`} />
                                    <StatRow label="Avg Tab Switches" value={statistics.antiCheat.averageTabSwitches.toFixed(1)} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- ENROLLMENTS TAB --- */}
                {activeTab === "enrollments" && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Search */}
                        <div className="relative max-w-md">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by student name or email..."
                                className={inputClasses}
                                value={searchEnroll}
                                onChange={(e) => {
                                    setSearchEnroll(e.target.value);
                                    setEnrollPage(1);
                                }}
                            />
                        </div>

                        {/* Table */}
                        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Enrolled Date</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Attempts</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Best Score</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {enrollments.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-sm font-bold text-gray-500">
                                                    No enrollments found.
                                                </td>
                                            </tr>
                                        ) : enrollments.map((enrollment) => (
                                            <tr key={enrollment._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-sm text-gray-900">{enrollment.student.name}</div>
                                                    <div className="text-xs font-medium text-gray-500">{enrollment.student.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-700">
                                                    {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-gray-900">
                                                        {enrollment.stats.completedAttempts} <span className="text-gray-400 font-medium">/ {enrollment.stats.totalAttempts}</span>
                                                    </div>
                                                    {enrollment.stats.inProgressAttempts > 0 && (
                                                        <div className="text-yellow-600 text-[10px] font-black uppercase tracking-widest mt-1">
                                                            {enrollment.stats.inProgressAttempts} in progress
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {enrollment.stats.bestScore !== null ? (
                                                        <span className="font-bold text-gray-900">
                                                            {enrollment.stats.bestScore} <span className="text-gray-400 text-xs">/ {quiz.totalMarks}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">No Attempts</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Link
                                                        to={`/trainer/students/${enrollment.student._id}/attempts?quiz=${id}`}
                                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-colors flex items-center gap-1"
                                                    >
                                                        <Eye size={14} /> View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {enrollTotal > 20 && (
                            <PaginationControls
                                page={enrollPage}
                                total={enrollTotal}
                                setPage={setEnrollPage}
                            />
                        )}
                    </div>
                )}

                {/* --- ATTEMPTS TAB --- */}
                {activeTab === "attempts" && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by student name..."
                                    className={inputClasses}
                                    value={searchAttempt}
                                    onChange={(e) => {
                                        setSearchAttempt(e.target.value);
                                        setAttemptPage(1);
                                    }}
                                />
                            </div>
                            <select
                                className="w-full sm:w-auto px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setAttemptPage(1);
                                }}
                            >
                                <option value="">All Statuses</option>
                                <option value="in_progress">In Progress</option>
                                <option value="submitted">Submitted</option>
                                <option value="auto_graded">Graded</option>
                                <option value="flagged">Flagged</option>
                            </select>
                        </div>

                        {/* Table */}
                        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Score</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time Spent</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Started</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {attempts.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-sm font-bold text-gray-500">
                                                    No attempts found.
                                                </td>
                                            </tr>
                                        ) : attempts.map((attempt) => (
                                            <tr key={attempt._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-sm text-gray-900">{attempt.user.name}</div>
                                                    <div className="text-xs font-medium text-gray-500">{attempt.user.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(attempt.status)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {attempt.totalScore !== undefined ? (
                                                        <span className="font-bold text-gray-900">
                                                            {attempt.totalScore} <span className="text-gray-400 text-xs">/ {attempt.maxScore}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 font-bold">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-700">
                                                    {attempt.timeSpentSeconds
                                                        ? `${Math.floor(attempt.timeSpentSeconds / 60)} min`
                                                        : "-"}
                                                </td>
                                                <td className="px-6 py-4 text-xs font-bold text-gray-500">
                                                    {new Date(attempt.startTime).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Link
                                                        to={`/trainer/quizzes/${id}/attempts/${attempt._id}/details`}
                                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-colors flex items-center gap-1"
                                                    >
                                                        <Eye size={14} /> Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {attemptTotal > 20 && (
                            <PaginationControls
                                page={attemptPage}
                                total={attemptTotal}
                                setPage={setAttemptPage}
                            />
                        )}
                    </div>
                )}
            </div>
        </TrainerLayout>
    );
};

// Helper Components
const StatCard = ({ icon, iconBg, label, value, subtitle }) => (
    <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm hover:border-gray-300 hover:shadow-md transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${iconBg} transition-colors`}>
                {icon}
            </div>
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-4xl font-black text-gray-900">{value}</p>
        {subtitle && <p className="text-xs font-bold text-gray-500 mt-2">{subtitle}</p>}
    </div>
);

const StatRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-3 border-b border-white/10 last:border-0">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-black text-white">{value}</span>
    </div>
);

const PaginationControls = ({ page, total, setPage }) => {
    const totalPages = Math.ceil(total / 20);
    return (
        <div className="flex items-center justify-center gap-4 py-4">
            <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
                <ChevronLeft size={20} />
            </button>
            <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">
                Page {page} of {totalPages}
            </span>
            <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages}
                className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

export default QuizMonitor;