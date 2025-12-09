// src/pages/trainer/ReviewAttempts.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TrainerLayout from "../../components/Layout/TrainerLayout";
import { quizzesAPI } from "../../api/quizzes.api";
import {
  Eye,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Download,
  RefreshCw
} from "lucide-react";

const ReviewAttempts = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    if (selectedQuiz) {
      loadAttempts();
    }
  }, [selectedQuiz, statusFilter, flaggedOnly]);

  const loadQuizzes = async () => {
    try {
      const res = await quizzesAPI.getAll();
      setQuizzes(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load quizzes:", err);
      setLoading(false);
    }
  };

  const loadAttempts = async () => {
    if (!selectedQuiz) return;

    setLoading(true);
    try {
      const params = {
        status: statusFilter !== "all" ? statusFilter : undefined,
      };

      const res = await quizzesAPI.getAttempts(selectedQuiz, params);
      let attemptsData = res.data.attempts || [];

      if (flaggedOnly) {
        attemptsData = attemptsData.filter(a => a.isFlagged);
      }

      setAttempts(attemptsData);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load attempts:", err);
      setLoading(false);
    }
  };

  const getStatusBadge = (status, isFlagged) => {
    if (isFlagged) {
      return (
        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <AlertTriangle size={14} />
          Flagged
        </span>
      );
    }

    const badges = {
      in_progress: { bg: "bg-blue-100", text: "text-blue-700", icon: <Clock size={14} />, label: "In Progress" },
      submitted: { bg: "bg-green-100", text: "text-green-700", icon: <CheckCircle size={14} />, label: "Submitted" },
      auto_graded: { bg: "bg-purple-100", text: "text-purple-700", icon: <TrendingUp size={14} />, label: "Graded" },
      timeout: { bg: "bg-orange-100", text: "text-orange-700", icon: <Clock size={14} />, label: "Timeout" },
    };

    const badge = badges[status] || badges.in_progress;

    return (
      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const filteredAttempts = attempts.filter(attempt => {
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase();
    return (
      attempt.user?.name?.toLowerCase().includes(search) ||
      attempt.user?.email?.toLowerCase().includes(search) ||
      attempt.user?.registrationNumber?.toLowerCase().includes(search)
    );
  });

  const stats = {
    total: attempts.length,
    inProgress: attempts.filter(a => a.status === "in_progress").length,
    submitted: attempts.filter(a => ["submitted", "auto_graded"].includes(a.status)).length,
    flagged: attempts.filter(a => a.isFlagged).length,
    avgScore: attempts.length > 0
      ? (attempts.reduce((sum, a) => sum + (a.totalScore || 0), 0) / attempts.length).toFixed(1)
      : 0
  };

  return (
    <TrainerLayout>
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Review All Attempts</h1>
        <p className="text-slate-600">Monitor and review student quiz attempts across all quizzes</p>
      </div>

      {/* QUIZ SELECTOR & FILTERS */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Quiz Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Quiz
            </label>
            <select
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Select a Quiz --</option>
              {quizzes.map((quiz) => (
                <option key={quiz._id} value={quiz._id}>
                  {quiz.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!selectedQuiz}
            >
              <option value="all">All Status</option>
              <option value="in_progress">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="auto_graded">Graded</option>
              <option value="timeout">Timeout</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search Student
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Name, email, reg no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!selectedQuiz}
              />
            </div>
          </div>

          {/* Flagged Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quick Filters
            </label>
            <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-slate-50 transition">
              <input
                type="checkbox"
                checked={flaggedOnly}
                onChange={(e) => setFlaggedOnly(e.target.checked)}
                disabled={!selectedQuiz}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <AlertTriangle size={16} className="text-red-500" />
              <span className="text-sm font-medium">Flagged Only</span>
            </label>
          </div>
        </div>

        {selectedQuiz && (
          <div className="flex gap-3">
            <button
              onClick={loadAttempts}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <Link
              to={`/trainer/quizzes/${selectedQuiz}/monitor`}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Eye size={16} />
              Live Monitor
            </Link>
          </div>
        )}
      </div>

      {/* STATS CARDS */}
      {selectedQuiz && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <p className="text-sm text-slate-600">Total</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-slate-600">In Progress</p>
            <p className="text-2xl font-bold text-gray-800">{stats.inProgress}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <p className="text-sm text-slate-600">Submitted</p>
            <p className="text-2xl font-bold text-gray-800">{stats.submitted}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
            <p className="text-sm text-slate-600">Flagged</p>
            <p className="text-2xl font-bold text-gray-800">{stats.flagged}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
            <p className="text-sm text-slate-600">Avg Score</p>
            <p className="text-2xl font-bold text-gray-800">{stats.avgScore}%</p>
          </div>
        </div>
      )}

      {/* ATTEMPTS TABLE */}
      {!selectedQuiz ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Filter size={60} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Quiz</h3>
          <p className="text-slate-500">Choose a quiz from the dropdown above to view attempts</p>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={40} />
          <p className="text-slate-600">Loading attempts...</p>
        </div>
      ) : filteredAttempts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <AlertTriangle size={60} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Attempts Found</h3>
          <p className="text-slate-500">No attempts match your current filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Score</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Time</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Started</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredAttempts.map((attempt) => (
                  <tr key={attempt._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{attempt.user?.name}</p>
                        <p className="text-xs text-slate-500">{attempt.user?.email}</p>
                        <p className="text-xs text-slate-500">{attempt.user?.registrationNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(attempt.status, attempt.isFlagged)}
                    </td>
                    <td className="px-6 py-4">
                      {attempt.status === "in_progress" ? (
                        <span className="text-slate-400">-</span>
                      ) : (
                        <div>
                          <p className="font-bold text-lg">{attempt.totalScore}/{attempt.maxScore}</p>
                          <p className="text-xs text-slate-500">{attempt.percentage?.toFixed(1)}%</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {attempt.timeSpentSeconds ? (
                        <span className="text-sm">{Math.floor(attempt.timeSpentSeconds / 60)} min</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {new Date(attempt.startTime).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/trainer/quizzes/${selectedQuiz}/attempts/${attempt._id}/details`}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        <Eye size={14} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </TrainerLayout>
  );
};

export default ReviewAttempts;
