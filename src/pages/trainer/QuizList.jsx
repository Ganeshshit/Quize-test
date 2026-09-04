import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TrainerLayout from "../../components/Layout/TrainerLayout";
import { quizzesAPI } from "../../api/quizzes.api";

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
        return "bg-green-100 text-green-700";
      case "draft":
        return "bg-gray-100 text-gray-700";
      case "finished":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quiz List</h1>
          <p className="text-gray-600 text-sm">
            Manage all your quizzes, publish/unpublish, edit or monitor live attempts.
          </p>
        </div>

        <Link
          to="/trainer/quizzes/create"
          className="px-5 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          + Create New Quiz
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4">
        <input
          type="text"
          placeholder="Search by title or subject..."
          className="w-full md:max-w-sm border rounded-md px-3 py-2 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-3">
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="finished">Finished</option>
          </select>

          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={publishFilter}
            onChange={(e) => setPublishFilter(e.target.value)}
          >
            <option value="all">Published + Unpublished</option>
            <option value="published">Published only</option>
            <option value="unpublished">Unpublished only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading quizzes...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Quiz</th>
                <th className="px-4 py-3 text-left font-semibold">Schedule</th>
                <th className="px-4 py-3 text-left font-semibold">Attempts</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Published</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredQuizzes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                    No quizzes found.
                  </td>
                </tr>
              ) : (
                filteredQuizzes.map((quiz) => (
                  <tr
                    key={quiz._id}
                    className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/trainer/quizzes/${quiz._id}/details`)}
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="font-semibold text-gray-900">
                        {quiz.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        Subject: {quiz.subject?.name || "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Duration: {formatDuration(quiz.durationSeconds)} | Attempts:{" "}
                        {quiz.attemptsAllowed}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top text-xs">
                      <div>
                        <span className="font-medium">Start:</span>{" "}
                        {formatDateTime(quiz.startTime)}
                      </div>
                      <div>
                        <span className="font-medium">End:</span>{" "}
                        {formatDateTime(quiz.endTime)}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top text-xs">
                      <div>Total: {quiz.totalAttempts || 0}</div>
                      <div>In progress: {quiz.inProgressAttempts || 0}</div>
                      <div
                        className={
                          (quiz.flaggedAttempts || 0) > 0 ? "text-red-600" : ""
                        }
                      >
                        Flagged: {quiz.flaggedAttempts || 0}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                          quiz.status
                        )}`}
                      >
                        {quiz.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 align-top">
                      {quiz.isPublished ? (
                        <span className="inline-flex px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                          Unpublished
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td
                      className="px-4 py-3 align-top text-right"
                      onClick={(e) => e.stopPropagation()} // Prevent row click
                    >
                      <div className="flex flex-col items-end gap-1">

                        {/* DETAILS */}
                        <button
                          onClick={() =>
                            navigate(`/trainer/quizzes/${quiz._id}/details`)
                          }
                          className="text-xs px-3 py-1 rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200"
                        >
                          Details
                        </button>

                        {/* EDIT */}
                        <Link
                          to={`/trainer/quizzes/edit/${quiz._id}`}
                          className="text-xs px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50"
                        >
                          Edit
                        </Link>

                        {/* PUBLISH / UNPUBLISH */}
                        <button
                          onClick={() =>
                            handleTogglePublish(quiz._id, quiz.isPublished)
                          }
                          className={`text-xs px-3 py-1 rounded-md ${quiz.isPublished
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                            }`}
                        >
                          {quiz.isPublished ? "Unpublish" : "Publish"}
                        </button>

                        {/* MONITOR */}
                        <button
                          onClick={() => handleMonitor(quiz._id)}
                          className="text-xs px-3 py-1 rounded-md bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                        >
                          Monitor
                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() => handleDelete(quiz._id)}
                          className="text-xs px-3 py-1 rounded-md bg-red-100 text-red-800 hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </TrainerLayout>
  );
};

export default QuizList;
