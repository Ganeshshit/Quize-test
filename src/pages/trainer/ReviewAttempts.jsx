// src/pages/trainer/ReviewAttempts.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
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
  RefreshCw,
  Activity,
  Award,
  Users,
  FileText,
  Download,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PAGE_SIZE = 10;

const ReviewAttempts = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizzesLoading, setQuizzesLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [sortKey, setSortKey] = useState("startTime");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    if (selectedQuiz) {
      loadAttempts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuiz, statusFilter, flaggedOnly]);

  // debounce search input -> searchTerm
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, flaggedOnly, selectedQuiz, sortKey, sortDir]);

  const loadQuizzes = async () => {
    setQuizzesLoading(true);
    try {
      const res = await quizzesAPI.getAll();
      setQuizzes(res.data || []);
    } catch (err) {
      console.error("Failed to load quizzes:", err);
    } finally {
      setQuizzesLoading(false);
      setLoading(false);
    }
  };

  const loadAttempts = useCallback(async () => {
    if (!selectedQuiz) return;

    setLoading(true);
    try {
      const params = {
        status: statusFilter !== "all" ? statusFilter : undefined,
      };

      const res = await quizzesAPI.getAttempts(selectedQuiz, params);
      let attemptsData = res.data.attempts || [];

      if (flaggedOnly) {
        attemptsData = attemptsData.filter((a) => a.isFlagged);
      }

      setAttempts(attemptsData);
    } catch (err) {
      console.error("Failed to load attempts:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedQuiz, statusFilter, flaggedOnly]);

  const getStatusBadge = (status, isFlagged) => {
    const baseClasses =
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border";

    if (isFlagged) {
      return (
        <span className={`${baseClasses} bg-red-50 text-red-700 border-red-200`}>
          <AlertTriangle size={12} /> Flagged
        </span>
      );
    }

    const badges = {
      in_progress: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: <Clock size={12} />,
        label: "In Progress",
      },
      submitted: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        icon: <CheckCircle size={12} />,
        label: "Submitted",
      },
      auto_graded: {
        bg: "bg-[#0A0A0A]",
        text: "text-white",
        border: "border-black",
        icon: <TrendingUp size={12} />,
        label: "Graded",
      },
      timeout: {
        bg: "bg-gray-100",
        text: "text-gray-600",
        border: "border-gray-200",
        icon: <Clock size={12} />,
        label: "Timeout",
      },
    };

    const badge = badges[status] || badges.in_progress;

    return (
      <span className={`${baseClasses} ${badge.bg} ${badge.text} ${badge.border}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  // ---- Filter ----
  const filteredAttempts = useMemo(() => {
    if (!searchTerm) return attempts;
    const search = searchTerm.toLowerCase();
    return attempts.filter(
      (attempt) =>
        attempt.user?.name?.toLowerCase().includes(search) ||
        attempt.user?.email?.toLowerCase().includes(search) ||
        attempt.user?.registrationNumber?.toLowerCase().includes(search)
    );
  }, [attempts, searchTerm]);

  // ---- Sort ----
  const sortedAttempts = useMemo(() => {
    const arr = [...filteredAttempts];
    const dir = sortDir === "asc" ? 1 : -1;

    arr.sort((a, b) => {
      let av, bv;
      switch (sortKey) {
        case "name":
          av = a.user?.name?.toLowerCase() || "";
          bv = b.user?.name?.toLowerCase() || "";
          return av.localeCompare(bv) * dir;
        case "score":
          av = a.percentage ?? -1;
          bv = b.percentage ?? -1;
          return (av - bv) * dir;
        case "timeSpent":
          av = a.timeSpentSeconds ?? -1;
          bv = b.timeSpentSeconds ?? -1;
          return (av - bv) * dir;
        case "startTime":
        default:
          av = new Date(a.startTime).getTime() || 0;
          bv = new Date(b.startTime).getTime() || 0;
          return (av - bv) * dir;
      }
    });

    return arr;
  }, [filteredAttempts, sortKey, sortDir]);

  // ---- Paginate ----
  const totalPages = Math.max(1, Math.ceil(sortedAttempts.length / PAGE_SIZE));
  const paginatedAttempts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedAttempts.slice(start, start + PAGE_SIZE);
  }, [sortedAttempts, page]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) return <ArrowUpDown size={12} className="text-gray-300" />;
    return sortDir === "asc" ? (
      <ArrowUp size={12} className="text-yellow-500" />
    ) : (
      <ArrowDown size={12} className="text-yellow-500" />
    );
  };

  const stats = {
    total: attempts.length,
    inProgress: attempts.filter((a) => a.status === "in_progress").length,
    submitted: attempts.filter((a) => ["submitted", "auto_graded"].includes(a.status)).length,
    flagged: attempts.filter((a) => a.isFlagged).length,
    avgScore:
      attempts.length > 0
        ? (attempts.reduce((sum, a) => sum + (a.totalScore || 0), 0) / attempts.length).toFixed(1)
        : 0,
  };

  const exportCSV = () => {
    if (!sortedAttempts.length) return;
    const headers = ["Name", "Email", "Reg No", "Status", "Flagged", "Score", "Max Score", "Percentage", "Time Spent (min)", "Started On"];
    const rows = sortedAttempts.map((a) => [
      a.user?.name || "",
      a.user?.email || "",
      a.user?.registrationNumber || "",
      a.status,
      a.isFlagged ? "Yes" : "No",
      a.totalScore ?? "",
      a.maxScore ?? "",
      a.percentage != null ? a.percentage.toFixed(1) : "",
      a.timeSpentSeconds ? Math.floor(a.timeSpentSeconds / 60) : "",
      a.startTime ? new Date(a.startTime).toLocaleString() : "",
    ]);

    const csvContent = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const quizTitle = quizzes.find((q) => q._id === selectedQuiz)?.title || "quiz";
    link.href = url;
    link.download = `${quizTitle.replace(/\s+/g, "_")}_attempts.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const inputClass =
    "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const labelClass = "block text-xs font-black text-gray-900 uppercase tracking-widest mb-2";
  const thSortClass =
    "p-4 select-none cursor-pointer hover:text-gray-700 transition-colors";

  return (
    <TrainerLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full font-sans selection:bg-yellow-200">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Review Attempts
            </h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1 flex items-center gap-2">
              <Activity size={16} className="text-yellow-500" />
              Monitor and grade student quiz submissions
            </p>
          </div>

          {selectedQuiz && sortedAttempts.length > 0 && (
            <button
              onClick={exportCSV}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-gray-700 rounded-xl border border-gray-200 hover:border-black hover:text-black transition-all font-bold text-sm shadow-sm"
            >
              <Download size={16} className="text-yellow-500" />
              Export CSV
            </button>
          )}
        </div>

        {/* QUIZ SELECTOR & FILTERS */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Quiz Selector */}
            <div>
              <label className={labelClass}>Select Quiz</label>
              <select
                value={selectedQuiz}
                onChange={(e) => setSelectedQuiz(e.target.value)}
                className={inputClass}
                disabled={quizzesLoading}
              >
                <option value="">
                  {quizzesLoading ? "Loading quizzes..." : "-- Choose a Quiz --"}
                </option>
                {quizzes.map((quiz) => (
                  <option key={quiz._id} value={quiz._id}>
                    {quiz.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={inputClass}
                disabled={!selectedQuiz}
              >
                <option value="all">All Statuses</option>
                <option value="in_progress">In Progress</option>
                <option value="submitted">Submitted</option>
                <option value="auto_graded">Graded</option>
                <option value="timeout">Timeout</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className={labelClass}>Search Student</label>
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Name, email, reg no..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className={`${inputClass} pl-11`}
                  disabled={!selectedQuiz}
                />
              </div>
            </div>

            {/* Flagged Filter */}
            <div>
              <label className={labelClass}>Quick Filters</label>
              <label
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors cursor-pointer ${!selectedQuiz
                    ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200"
                    : flaggedOnly
                      ? "bg-red-50 border-red-200 text-red-800"
                      : "bg-gray-50 border-gray-200 hover:border-gray-300"
                  }`}
              >
                <input
                  type="checkbox"
                  checked={flaggedOnly}
                  onChange={(e) => setFlaggedOnly(e.target.checked)}
                  disabled={!selectedQuiz}
                  className="w-4 h-4 accent-red-600"
                />
                <AlertTriangle size={16} className={flaggedOnly ? "text-red-600" : "text-gray-400"} />
                <span className="text-sm font-bold">Flagged Only</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          {selectedQuiz && (
            <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-gray-100">
              <button
                onClick={loadAttempts}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-100 hover:text-black hover:border-gray-300 transition-all font-bold text-sm"
              >
                <RefreshCw size={16} className={loading ? "animate-spin text-yellow-500" : ""} />
                Refresh Data
              </button>

              <Link
                to={`/trainer/quizzes/${selectedQuiz}/monitor`}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0A0A0A] text-white rounded-xl hover:bg-black transition-all shadow-md font-bold text-sm"
              >
                <Eye size={16} className="text-yellow-400" />
                Live Monitor
              </Link>
            </div>
          )}
        </div>

        {/* STATS CARDS */}
        {selectedQuiz && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Users size={12} /> Total Attempts
              </p>
              <p className="text-2xl font-black text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Clock size={12} /> In Progress
              </p>
              <p className="text-2xl font-black text-amber-600">{stats.inProgress}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <CheckCircle size={12} /> Submitted
              </p>
              <p className="text-2xl font-black text-emerald-600">{stats.submitted}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-red-200 bg-red-50/50 shadow-sm">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <AlertTriangle size={12} /> Flagged
              </p>
              <p className="text-2xl font-black text-red-600">{stats.flagged}</p>
            </div>
            <div className="bg-[#0A0A0A] rounded-2xl p-5 border border-gray-800 shadow-md">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Award size={12} className="text-yellow-400" /> Avg Score
              </p>
              <p className="text-2xl font-black text-white">{stats.avgScore}%</p>
            </div>
          </div>
        )}

        {/* CONTENT */}
        {!selectedQuiz ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm">
            <Filter size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-black text-gray-900 mb-2">Select a Quiz</h3>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Choose a quiz from the dropdown above to view attempts
            </p>
          </div>
        ) : loading ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-5 border-b border-gray-50 animate-pulse"
              >
                <div className="h-4 bg-gray-100 rounded w-1/4" />
                <div className="h-4 bg-gray-100 rounded w-1/6" />
                <div className="h-4 bg-gray-100 rounded w-1/6" />
                <div className="h-4 bg-gray-100 rounded w-1/6" />
                <div className="h-4 bg-gray-100 rounded w-1/6 ml-auto" />
              </div>
            ))}
          </div>
        ) : sortedAttempts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-black text-gray-900 mb-2">No Attempts Found</h3>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              No attempts match your current filters
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/75 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <th className={thSortClass} onClick={() => toggleSort("name")}>
                        <span className="flex items-center gap-1.5">Student <SortIcon colKey="name" /></span>
                      </th>
                      <th className="p-4">Status</th>
                      <th className={thSortClass} onClick={() => toggleSort("score")}>
                        <span className="flex items-center gap-1.5">Score <SortIcon colKey="score" /></span>
                      </th>
                      <th className={thSortClass} onClick={() => toggleSort("timeSpent")}>
                        <span className="flex items-center gap-1.5">Time Spent <SortIcon colKey="timeSpent" /></span>
                      </th>
                      <th className={thSortClass} onClick={() => toggleSort("startTime")}>
                        <span className="flex items-center gap-1.5">Started On <SortIcon colKey="startTime" /></span>
                      </th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {paginatedAttempts.map((attempt) => (
                      <tr
                        key={attempt._id}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="p-4 pl-6 align-top">
                          <div className="font-bold text-gray-900 group-hover:text-yellow-600 transition-colors">
                            {attempt.user?.name || "Unknown User"}
                          </div>
                          <div className="text-xs font-medium text-gray-500 mt-0.5">
                            {attempt.user?.email}
                          </div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            Reg: {attempt.user?.registrationNumber || "N/A"}
                          </div>
                        </td>

                        <td className="p-4 align-top">
                          {getStatusBadge(attempt.status, attempt.isFlagged)}
                        </td>

                        <td className="p-4 align-top">
                          {attempt.status === "in_progress" ? (
                            <span className="text-gray-400 font-bold">-</span>
                          ) : (
                            <div>
                              <span className="font-black text-gray-900">{attempt.totalScore}</span>
                              <span className="text-xs font-bold text-gray-400"> / {attempt.maxScore}</span>
                              <div className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mt-1">
                                {attempt.percentage?.toFixed(1)}%
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="p-4 align-top">
                          {attempt.timeSpentSeconds ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-md text-xs font-bold text-gray-700">
                              <Clock size={12} />
                              {Math.floor(attempt.timeSpentSeconds / 60)} min
                            </span>
                          ) : (
                            <span className="text-gray-400 font-bold">-</span>
                          )}
                        </td>

                        <td className="p-4 align-top text-xs font-bold text-gray-500 uppercase tracking-wider">
                          {new Date(attempt.startTime).toLocaleDateString()}
                        </td>

                        <td className="p-4 pr-6 align-top text-right">
                          <Link
                            to={`/trainer/quizzes/${selectedQuiz}/attempts/${attempt._id}/details`}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-[#0A0A0A] hover:text-white text-gray-700 rounded-lg font-bold text-xs uppercase tracking-widest transition-colors"
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

            {/* MOBILE CARDS */}
            <div className="md:hidden space-y-4">
              {paginatedAttempts.map((attempt) => (
                <div
                  key={attempt._id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="font-bold text-gray-900">{attempt.user?.name || "Unknown User"}</div>
                      <div className="text-xs font-medium text-gray-500 mt-0.5">{attempt.user?.email}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        Reg: {attempt.user?.registrationNumber || "N/A"}
                      </div>
                    </div>
                    {getStatusBadge(attempt.status, attempt.isFlagged)}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Score</p>
                      {attempt.status === "in_progress" ? (
                        <span className="text-gray-400 font-bold">-</span>
                      ) : (
                        <>
                          <span className="font-black text-gray-900">{attempt.totalScore}</span>
                          <span className="text-gray-400 font-bold"> / {attempt.maxScore}</span>
                        </>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Time Spent</p>
                      {attempt.timeSpentSeconds ? (
                        <span className="font-bold text-gray-700">
                          {Math.floor(attempt.timeSpentSeconds / 60)} min
                        </span>
                      ) : (
                        <span className="text-gray-400 font-bold">-</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {new Date(attempt.startTime).toLocaleDateString()}
                    </span>
                    <Link
                      to={`/trainer/quizzes/${selectedQuiz}/attempts/${attempt._id}/details`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-[#0A0A0A] hover:text-white text-gray-700 rounded-lg font-bold text-xs uppercase tracking-widest transition-colors"
                    >
                      <Eye size={14} /> View
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Showing {(page - 1) * PAGE_SIZE + 1}-
                  {Math.min(page * PAGE_SIZE, sortedAttempts.length)} of {sortedAttempts.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <span className="text-xs font-black text-gray-900 px-2">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </TrainerLayout>
  );
};

export default ReviewAttempts;