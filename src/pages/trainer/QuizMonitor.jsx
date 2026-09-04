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
    Eye
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
            in_progress: { bg: "bg-blue-100", text: "text-blue-800", label: "In Progress" },
            submitted: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Submitted" },
            auto_graded: { bg: "bg-green-100", text: "text-green-800", label: "Graded" },
            flagged: { bg: "bg-red-100", text: "text-red-800", label: "Flagged" },
            needs_manual_review: { bg: "bg-orange-100", text: "text-orange-800", label: "Manual Review" }
        };

        const config = statusConfig[status] || statusConfig.submitted;

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <TrainerLayout>
                <div className="text-center py-10">Loading...</div>
            </TrainerLayout>
        );
    }

    return (
        <TrainerLayout>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">{quiz?.title}</h1>
                    <p className="text-gray-600">Monitor quiz activity and student performance</p>
                </div>
                <Link
                    to={`/trainer/quizzes/${id}/details`}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                    Back to Details
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b">
                {["overview", "enrollments", "attempts"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium capitalize ${activeTab === tab
                                ? "border-b-2 border-blue-600 text-blue-600"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && statistics && (
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <StatCard
                            icon={<Users className="text-blue-600" />}
                            label="Total Enrolled"
                            value={statistics.enrollment.total}
                            subtitle={`${statistics.enrollment.attempted} attempted`}
                        />
                        <StatCard
                            icon={<FileText className="text-green-600" />}
                            label="Total Attempts"
                            value={statistics.attempts.total}
                            subtitle={`${statistics.attempts.completed} completed`}
                        />
                        <StatCard
                            icon={<AlertTriangle className="text-red-600" />}
                            label="Flagged"
                            value={statistics.attempts.flagged}
                            subtitle="Suspicious activity"
                        />
                        <StatCard
                            icon={<TrendingUp className="text-purple-600" />}
                            label="Pass Rate"
                            value={`${statistics.performance.passRate.toFixed(1)}%`}
                            subtitle={`Avg: ${statistics.scores.average.toFixed(1)}`}
                        />
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Score Distribution */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
                            <div className="space-y-3">
                                {statistics.distribution.map((range) => (
                                    <div key={range.label}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>{range.label}</span>
                                            <span className="font-medium">{range.count} students</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{
                                                    width: `${(range.count / statistics.attempts.completed) * 100}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Detailed Stats */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">Detailed Statistics</h3>
                            <div className="space-y-3">
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

            {/* Enrollments Tab */}
            {activeTab === "enrollments" && (
                <div className="space-y-4">
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full px-4 py-2 border rounded-lg"
                        value={searchEnroll}
                        onChange={(e) => {
                            setSearchEnroll(e.target.value);
                            setEnrollPage(1);
                        }}
                    />

                    {/* Enrollments Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Student</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Enrolled Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Attempts</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Best Score</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {enrollments.map((enrollment) => (
                                    <tr key={enrollment._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className="font-medium">{enrollment.student.name}</div>
                                                <div className="text-sm text-gray-500">{enrollment.student.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm">
                                                <div>{enrollment.stats.completedAttempts} / {enrollment.stats.totalAttempts}</div>
                                                {enrollment.stats.inProgressAttempts > 0 && (
                                                    <div className="text-blue-600 text-xs">
                                                        {enrollment.stats.inProgressAttempts} in progress
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {enrollment.stats.bestScore !== null ? (
                                                <span className="font-medium">{enrollment.stats.bestScore} / {quiz.totalMarks}</span>
                                            ) : (
                                                <span className="text-gray-400">Not attempted</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                to={`/trainer/students/${enrollment.student._id}/attempts?quiz=${id}`}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                View Attempts
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {enrollTotal > 20 && (
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={() => setEnrollPage(p => Math.max(1, p - 1))}
                                disabled={enrollPage === 1}
                                className="px-4 py-2 border rounded disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">
                                Page {enrollPage} of {Math.ceil(enrollTotal / 20)}
                            </span>
                            <button
                                onClick={() => setEnrollPage(p => p + 1)}
                                disabled={enrollPage >= Math.ceil(enrollTotal / 20)}
                                className="px-4 py-2 border rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Attempts Tab */}
            {activeTab === "attempts" && (
                <div className="space-y-4">
                    {/* Filters */}
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Search by student name..."
                            className="flex-1 px-4 py-2 border rounded-lg"
                            value={searchAttempt}
                            onChange={(e) => {
                                setSearchAttempt(e.target.value);
                                setAttemptPage(1);
                            }}
                        />
                        <select
                            className="px-4 py-2 border rounded-lg"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setAttemptPage(1);
                            }}
                        >
                            <option value="">All Status</option>
                            <option value="in_progress">In Progress</option>
                            <option value="submitted">Submitted</option>
                            <option value="auto_graded">Graded</option>
                            <option value="flagged">Flagged</option>
                        </select>
                    </div>

                    {/* Attempts Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Student</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Score</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Time</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Started</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {attempts.map((attempt) => (
                                    <tr key={attempt._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className="font-medium">{attempt.user.name}</div>
                                                <div className="text-sm text-gray-500">{attempt.user.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(attempt.status)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {attempt.totalScore !== undefined ? (
                                                <span className="font-medium">
                                                    {attempt.totalScore} / {attempt.maxScore}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {attempt.timeSpentSeconds
                                                ? `${Math.floor(attempt.timeSpentSeconds / 60)} min`
                                                : "-"}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {new Date(attempt.startTime).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                to={`/trainer/quizzes/${id}/attempts/${attempt._id}/details`}
                                                className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center gap-1"
                                            >
                                                <Eye size={16} />
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {attemptTotal > 20 && (
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={() => setAttemptPage(p => Math.max(1, p - 1))}
                                disabled={attemptPage === 1}
                                className="px-4 py-2 border rounded disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">
                                Page {attemptPage} of {Math.ceil(attemptTotal / 20)}
                            </span>
                            <button
                                onClick={() => setAttemptPage(p => p + 1)}
                                disabled={attemptPage >= Math.ceil(attemptTotal / 20)}
                                className="px-4 py-2 border rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </TrainerLayout>
    );
};

// Helper Components
const StatCard = ({ icon, label, value, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-2">
            {icon}
            <span className="text-sm text-gray-600">{label}</span>
        </div>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
    </div>
);

const StatRow = ({ label, value }) => (
    <div className="flex justify-between items-center">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{value}</span>
    </div>
);

export default QuizMonitor;