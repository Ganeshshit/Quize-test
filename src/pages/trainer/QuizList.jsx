// src/pages/trainer/QuizList.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import TrainerLayout from "../../components/Layout/TrainerLayout";
import { quizzesAPI } from "../../api/quizzes.api";
import {
  ClipboardList,
  Plus,
  Search,
  Calendar,
  Users,
  Clock,
  Eye,
  Edit3,
  Activity,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  FileQuestion,
  Layers,
  X,
} from "lucide-react";

const QuizList = () => {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [publishFilter, setPublishFilter] = useState("all");

  const [confirmTarget, setConfirmTarget] = useState(null); // { id, title } | null
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message }

  useEffect(() => {
    loadQuizzes();
  }, []);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  // auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const res = await quizzesAPI.getAll({ role: "trainer" });
      setQuizzes(res.data || []);
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
      setToast({ type: "error", message: "Failed to load quizzes." });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => `${Math.round((seconds || 0) / 60)} min`;

  const formatDateTime = (iso) => (iso ? new Date(iso).toLocaleString() : "-");

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "draft":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "finished":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const requestDelete = (quiz) => setConfirmTarget({ id: quiz._id, title: quiz.title });

  const confirmDelete = async () => {
    if (!confirmTarget) return;
    const { id } = confirmTarget;
    setDeletingId(id);
    try {
      await quizzesAPI.delete(id);
      setQuizzes((prev) => prev.filter((q) => q._id !== id));
      setToast({ type: "success", message: "Quiz deleted successfully." });
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Failed to delete quiz." });
    } finally {
      setDeletingId(null);
      setConfirmTarget(null);
    }
  };

  const handleTogglePublish = async (id, currentState) => {
    setTogglingId(id);
    try {
      if (currentState) {
        await quizzesAPI.unpublish(id);
      } else {
        await quizzesAPI.publish(id);
      }

      setQuizzes((prev) =>
        prev.map((q) => (q._id === id ? { ...q, isPublished: !currentState } : q))
      );
      setToast({
        type: "success",
        message: currentState ? "Quiz unpublished." : "Quiz published.",
      });
    } catch (err) {
      console.error("Publish toggle failed", err);
      setToast({ type: "error", message: "Failed to update publish status." });
    } finally {
      setTogglingId(null);
    }
  };

  const handleMonitor = (id) => navigate(`/trainer/quizzes/${id}/monitor`);

  const filteredQuizzes = useMemo(
    () =>
      quizzes.filter((q) => {
        const matchesSearch =
          q.title.toLowerCase().includes(search.toLowerCase()) ||
          q.subject?.name?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === "all" ? true : q.status === statusFilter;

        const matchesPublish =
          publishFilter === "all"
            ? true
            : publishFilter === "published"
              ? q.isPublished
              : !q.isPublished;

        return matchesSearch && matchesStatus && matchesPublish;
      }),
    [quizzes, search, statusFilter, publishFilter]
  );

  const stats = useMemo(
    () => ({
      total: quizzes.length,
      active: quizzes.filter((q) => q.status === "active").length,
      published: quizzes.filter((q) => q.isPublished).length,
      flagged: quizzes.reduce((sum, q) => sum + (q.flaggedAttempts || 0), 0),
    }),
    [quizzes]
  );

  const hasActiveFilters = search || statusFilter !== "all" || publishFilter !== "all";

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatusFilter("all");
    setPublishFilter("all");
  };

  const ActionButtons = ({ quiz, dense }) => (
    <div className={`flex items-center gap-2 ${dense ? "" : "justify-end"}`}>
      <button
        onClick={() => navigate(`/trainer/quizzes/${quiz._id}/details`)}
        title="Details"
        className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
      >
        <Eye size={16} />
      </button>

      <Link
        to={`/trainer/quizzes/${quiz._id}/edit`}
        title="Edit"
        className="p-2 rounded-xl bg-gray-100 hover:bg-yellow-400 hover:text-black text-gray-700 transition-colors"
      >
        <Edit3 size={16} />
      </Link>

      <button
        onClick={() => handleTogglePublish(quiz._id, quiz.isPublished)}
        title={quiz.isPublished ? "Unpublish" : "Publish"}
        disabled={togglingId === quiz._id}
        className={`p-2 rounded-xl transition-colors disabled:opacity-50 ${quiz.isPublished
            ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
          }`}
      >
        {togglingId === quiz._id ? (
          <RefreshCw size={16} className="animate-spin" />
        ) : (
          <CheckCircle size={16} />
        )}
      </button>

      <button
        onClick={() => handleMonitor(quiz._id)}
        title="Monitor"
        className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
      >
        <Activity size={16} />
      </button>

      <button
        onClick={() => requestDelete(quiz)}
        title="Delete"
        className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <TrainerLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full font-sans selection:bg-yellow-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Quiz List</h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1 flex items-center gap-2">
              <Layers size={16} className="text-yellow-500" />
              Manage, publish and monitor all your quizzes
            </p>
          </div>

          <Link
            to="/trainer/quizzes/create"
            className="px-6 py-3 bg-[#0A0A0A] hover:bg-black text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 w-fit"
          >
            <Plus size={18} className="text-yellow-400" /> Create New Quiz
          </Link>
        </div>

        {/* STATS */}
        {!loading && quizzes.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <ClipboardList size={12} /> Total Quizzes
              </p>
              <p className="text-2xl font-black text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Activity size={12} /> Active
              </p>
              <p className="text-2xl font-black text-emerald-600">{stats.active}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <CheckCircle size={12} /> Published
              </p>
              <p className="text-2xl font-black text-gray-900">{stats.published}</p>
            </div>
            <div className="bg-[#0A0A0A] rounded-2xl p-5 border border-gray-800 shadow-md">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <AlertTriangle size={12} className="text-yellow-400" /> Flagged Attempts
              </p>
              <p className="text-2xl font-black text-white">{stats.flagged}</p>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or subject..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-black transition-colors"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto">
            <select
              className="flex-1 sm:flex-none border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:border-black transition-colors"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="finished">Finished</option>
            </select>

            <select
              className="flex-1 sm:flex-none border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:border-black transition-colors"
              value={publishFilter}
              onChange={(e) => setPublishFilter(e.target.value)}
            >
              <option value="all">Published + Unpublished</option>
              <option value="published">Published only</option>
              <option value="unpublished">Unpublished only</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                title="Clear filters"
                className="flex-shrink-0 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-gray-200 text-gray-500 hover:text-black hover:border-black transition-colors text-xs font-bold uppercase tracking-widest"
              >
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-5 border-b border-gray-50 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/4" />
                <div className="h-4 bg-gray-100 rounded w-1/6" />
                <div className="h-4 bg-gray-100 rounded w-1/6" />
                <div className="h-4 bg-gray-100 rounded w-1/6" />
                <div className="h-4 bg-gray-100 rounded w-1/6 ml-auto" />
              </div>
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm">
            <FileQuestion size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-black text-gray-900 mb-2">No Quizzes Yet</h3>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
              Create your first quiz to get started
            </p>
            <Link
              to="/trainer/quizzes/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A0A0A] hover:bg-black text-white text-sm font-bold rounded-xl transition-all shadow-md"
            >
              <Plus size={18} className="text-yellow-400" /> Create New Quiz
            </Link>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm">
            <Search size={40} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-black text-gray-900 mb-2">No Matches Found</h3>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
              No quizzes match your current search or filters
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-widest rounded-xl transition-colors"
            >
              <X size={14} /> Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden lg:block bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/75 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <th className="p-4 pl-6">Quiz</th>
                      <th className="p-4">Schedule</th>
                      <th className="p-4">Attempts</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Published</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="text-sm">
                    {filteredQuizzes.map((quiz) => (
                      <tr
                        key={quiz._id}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer group"
                        onClick={() => navigate(`/trainer/quizzes/${quiz._id}/details`)}
                      >
                        <td className="p-4 pl-6 align-top">
                          <div className="font-bold text-gray-900 group-hover:text-yellow-600 transition-colors">
                            {quiz.title}
                          </div>
                          <div className="text-xs font-medium text-gray-500 mt-0.5">
                            Subject: {quiz.subject?.name || "-"}
                          </div>
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                            <Clock size={11} /> {formatDuration(quiz.durationSeconds)} • Allowed: {quiz.attemptsAllowed}
                          </div>
                        </td>

                        <td className="p-4 align-top text-xs font-medium text-gray-600">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                              Start:
                            </span>
                            {formatDateTime(quiz.startTime)}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                              End:
                            </span>
                            {formatDateTime(quiz.endTime)}
                          </div>
                        </td>

                        <td className="p-4 align-top text-xs font-medium text-gray-600">
                          <div>
                            Total: <span className="font-bold text-gray-900">{quiz.totalAttempts || 0}</span>
                          </div>
                          <div>
                            In progress:{" "}
                            <span className="font-bold text-gray-900">{quiz.inProgressAttempts || 0}</span>
                          </div>
                          <div className={(quiz.flaggedAttempts || 0) > 0 ? "text-red-600 font-bold" : ""}>
                            Flagged: {quiz.flaggedAttempts || 0}
                          </div>
                        </td>

                        <td className="p-4 align-top">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(
                              quiz.status
                            )}`}
                          >
                            {quiz.status}
                          </span>
                        </td>

                        <td className="p-4 align-top">
                          {quiz.isPublished ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle size={12} /> Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                              <XCircle size={12} /> Unpublished
                            </span>
                          )}
                        </td>

                        <td className="p-4 pr-6 align-top text-right" onClick={(e) => e.stopPropagation()}>
                          <ActionButtons quiz={quiz} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MOBILE / TABLET CARDS */}
            <div className="lg:hidden space-y-4">
              {filteredQuizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 cursor-pointer"
                  onClick={() => navigate(`/trainer/quizzes/${quiz._id}/details`)}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 truncate">{quiz.title}</div>
                      <div className="text-xs font-medium text-gray-500 mt-0.5">
                        {quiz.subject?.name || "-"}
                      </div>
                    </div>
                    <span
                      className={`flex-shrink-0 inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(
                        quiz.status
                      )}`}
                    >
                      {quiz.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Calendar size={10} /> Start
                      </p>
                      <p className="font-bold text-gray-700">{formatDateTime(quiz.startTime)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Users size={10} /> Attempts
                      </p>
                      <p className="font-bold text-gray-700">
                        {quiz.totalAttempts || 0} total
                        {(quiz.flaggedAttempts || 0) > 0 && (
                          <span className="text-red-600"> • {quiz.flaggedAttempts} flagged</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {quiz.isPublished ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle size={12} /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                        <XCircle size={12} /> Unpublished
                      </span>
                    )}
                    <div onClick={(e) => e.stopPropagation()}>
                      <ActionButtons quiz={quiz} dense />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {confirmTarget && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => !deletingId && setConfirmTarget(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl w-fit mb-4">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">Delete this quiz?</h3>
            <p className="text-sm font-medium text-gray-500 mb-6">
              "<span className="font-bold text-gray-700">{confirmTarget.title}</span>" will be
              permanently deleted along with its attempt history. This can't be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfirmTarget(null)}
                disabled={!!deletingId}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={!!deletingId}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors disabled:opacity-60"
              >
                {deletingId ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {deletingId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-lg border font-bold text-sm ${toast.type === "success"
                ? "bg-[#0A0A0A] text-white border-black"
                : "bg-red-50 text-red-700 border-red-200"
              }`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={18} className="text-yellow-400 flex-shrink-0" />
            ) : (
              <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
            )}
            {toast.message}
            <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </TrainerLayout>
  );
};

export default QuizList;