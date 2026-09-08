// src/pages/trainer/QuizList.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TrainerLayout from "../../components/Layout/TrainerLayout";
import { quizzesAPI } from "../../api/quizzes.api";
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  Clock,
  Eye,
  Edit3,
  Activity,
  Trash2,
  CheckCircle,
  XCircle
} from "lucide-react";

const QuizList = () => {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [publishFilter, setPublishFilter] = useState("all");

  // Load quizzes
  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const res = await quizzesAPI.getAll({ role: "trainer" });
      setQuizzes(res.data || []);
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => `${Math.round(seconds / 60)} min`;

  const formatDateTime = (iso) =>
    iso ? new Date(iso).toLocaleString() : "-";

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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;

    try {
      await quizzesAPI.delete(id);
      alert("Quiz deleted!");
      setQuizzes((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      alert("Delete failed");
      console.error(err);
    }
  };

  const handleTogglePublish = async (id, currentState) => {
    try {
      if (currentState) {
        await quizzesAPI.unpublish(id);
      } else {
        await quizzesAPI.publish(id);
      }

      setQuizzes((prev) =>
        prev.map((q) =>
          q._id === id ? { ...q, isPublished: !currentState } : q
        )
      );
    } catch (err) {
      console.error("Publish toggle failed", err);
      alert("Failed to update publish status.");
    }
  };

  const handleMonitor = (id) => {
    navigate(`/trainer/quizzes/${id}/monitor`);
  };

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.subject?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : q.status === statusFilter;

    const matchesPublish =
      publishFilter === "all"
        ? true
        : publishFilter === "published"
          ? q.isPublished
          : !q.isPublished;

    return matchesSearch && matchesStatus && matchesPublish;
  });

  return (
    <TrainerLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full font-sans selection:bg-yellow-200">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Quiz List</h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">
              Manage all your quizzes, publish/unpublish, edit or monitor live attempts.
            </p>
          </div>

          <Link
            to="/trainer/quizzes/create"
            className="px-6 py-3 bg-[#0A0A0A] hover:bg-black text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Plus size={18} className="text-yellow-400" /> Create New Quiz
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or subject..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-black transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
          </div>
        </div>

        {/* Table Container */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading quizzes...</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
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
                  {filteredQuizzes.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-gray-400 font-medium">
                        No quizzes found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredQuizzes.map((quiz) => (
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
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
                            Duration: {formatDuration(quiz.durationSeconds)} • Allowed: {quiz.attemptsAllowed}
                          </div>
                        </td>

                        <td className="p-4 align-top text-xs font-medium text-gray-600">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Start:</span>
                            {formatDateTime(quiz.startTime)}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">End:</span>
                            {formatDateTime(quiz.endTime)}
                          </div>
                        </td>

                        <td className="p-4 align-top text-xs font-medium text-gray-600">
                          <div>Total: <span className="font-bold text-gray-900">{quiz.totalAttempts || 0}</span></div>
                          <div>In progress: <span className="font-bold text-gray-900">{quiz.inProgressAttempts || 0}</span></div>
                          <div className={(quiz.flaggedAttempts || 0) > 0 ? "text-red-600 font-bold" : ""}>
                            Flagged: {quiz.flaggedAttempts || 0}
                          </div>
                        </td>

                        <td className="p-4 align-top">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(quiz.status)}`}>
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

                        {/* ACTIONS */}
                        <td
                          className="p-4 pr-6 align-top text-right"
                          onClick={(e) => e.stopPropagation()} // Prevent row click navigation
                        >
                          <div className="flex items-center justify-end gap-2">

                            <button
                              onClick={() => navigate(`/trainer/quizzes/${quiz._id}/details`)}
                              title="Details"
                              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                            >
                              <Eye size={16} />
                            </button>

                            <Link
                              to={`/trainer/quizzes/edit/${quiz._id}`}
                              title="Edit"
                              className="p-2 rounded-xl bg-gray-100 hover:bg-yellow-400 hover:text-black text-gray-700 transition-colors"
                            >
                              <Edit3 size={16} />
                            </Link>

                            <button
                              onClick={() => handleTogglePublish(quiz._id, quiz.isPublished)}
                              title={quiz.isPublished ? "Unpublish" : "Publish"}
                              className={`p-2 rounded-xl transition-colors ${quiz.isPublished
                                ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                }`}
                            >
                              <CheckCircle size={16} />
                            </button>

                            <button
                              onClick={() => handleMonitor(quiz._id)}
                              title="Monitor"
                              className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                            >
                              <Activity size={16} />
                            </button>

                            <button
                              onClick={() => handleDelete(quiz._id)}
                              title="Delete"
                              className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </TrainerLayout>
  );
};

export default QuizList;