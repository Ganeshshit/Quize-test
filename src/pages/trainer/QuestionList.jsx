// src/pages/trainer/QuestionList.jsx

import React, { useEffect, useState, useMemo } from "react";
import TrainerLayout from "../../components/Layout/TrainerLayout";
import QuestionCard from "../../components/trainer/QuestionCard";
import { Link } from "react-router-dom";
import { questionsAPI } from "../../api/questions.api";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  X,
  ChevronDown,
  Database,
  FileText,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Trash2,
  CheckSquare,
  Square,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { key: "newest", label: "Newest First" },
  { key: "oldest", label: "Oldest First" },
  { key: "difficulty", label: "Difficulty (Easy → Hard)" },
  { key: "marks", label: "Marks (High → Low)" },
];

const DIFFICULTY_RANK = { easy: 0, medium: 1, hard: 2 };

const QuestionList = () => {
  const [questions, setQuestions] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  // Selection / delete / toast
  const [selectedIds, setSelectedIds] = useState([]);
  const [deletingIds, setDeletingIds] = useState([]);
  const [confirmTarget, setConfirmTarget] = useState(null); // { ids, label } | null
  const [toast, setToast] = useState(null);

  // Extract unique values for filters
  const uniqueSubjects = [...new Set(questions.map((q) => q.subject?.name).filter(Boolean))];
  const uniqueTypes = [...new Set(questions.map((q) => q.type).filter(Boolean))];

  useEffect(() => {
    loadQuestions();
  }, []);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [selectedType, selectedDifficulty, selectedSubject, sortBy]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError("");
      setSelectedIds([]);

      const allQuestions = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const res = await questionsAPI.getAll({ page: currentPage, limit: 100 });

        if (res.data && res.data.length > 0) {
          allQuestions.push(...res.data);
          if (res.pagination && res.pagination.hasNextPage) {
            currentPage++;
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }

      setQuestions(allQuestions);
    } catch (err) {
      console.error(err);
      setError("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (id, label) => setConfirmTarget({ ids: [id], label });
  const requestBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmTarget({ ids: selectedIds, label: `${selectedIds.length} question(s)` });
  };

  const confirmDelete = async () => {
    if (!confirmTarget) return;
    const { ids } = confirmTarget;
    setDeletingIds(ids);
    try {
      await Promise.all(ids.map((id) => questionsAPI.delete(id)));
      setQuestions((prev) => prev.filter((q) => !ids.includes(q._id)));
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
      setToast({
        type: "success",
        message: ids.length > 1 ? `${ids.length} questions deleted.` : "Question deleted.",
      });
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Failed to delete question(s)." });
    } finally {
      setDeletingIds([]);
      setConfirmTarget(null);
    }
  };

  const clearFilters = () => {
    setSelectedType("all");
    setSelectedDifficulty("all");
    setSelectedSubject("all");
    setSearchInput("");
    setSearch("");
  };

  const hasActiveFilters =
    selectedType !== "all" || selectedDifficulty !== "all" || selectedSubject !== "all" || search;

  // Filter
  const filteredQuestions = useMemo(
    () =>
      questions.filter((q) => {
        const matchesSearch = q.prompt?.toLowerCase().includes(search.toLowerCase());
        const matchesType = selectedType === "all" || q.type === selectedType;
        const matchesDifficulty = selectedDifficulty === "all" || q.difficulty === selectedDifficulty;
        const matchesSubject = selectedSubject === "all" || q.subject?.name === selectedSubject;
        return matchesSearch && matchesType && matchesDifficulty && matchesSubject;
      }),
    [questions, search, selectedType, selectedDifficulty, selectedSubject]
  );

  // Sort
  const sortedQuestions = useMemo(() => {
    const arr = [...filteredQuestions];
    switch (sortBy) {
      case "oldest":
        arr.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case "difficulty":
        arr.sort((a, b) => (DIFFICULTY_RANK[a.difficulty] ?? 1) - (DIFFICULTY_RANK[b.difficulty] ?? 1));
        break;
      case "marks":
        arr.sort((a, b) => (b.marks || 0) - (a.marks || 0));
        break;
      case "newest":
      default:
        arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }
    return arr;
  }, [filteredQuestions, sortBy]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sortedQuestions.length / PAGE_SIZE));
  const paginatedQuestions = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedQuestions.slice(start, start + PAGE_SIZE);
  }, [sortedQuestions, page]);

  const pageIds = paginatedQuestions.map((q) => q._id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  const toggleSelectPage = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <TrainerLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full font-sans selection:bg-yellow-200">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Question Bank</h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1 flex items-center gap-2">
              <Database size={16} className="text-yellow-500" />
              Manage all your quiz questions in one place
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/trainer/questions/ai"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group"
            >
              <Sparkles size={18} className="text-white group-hover:scale-110 transition-transform" />
              AI Generate
            </Link>
            <Link
              to="/trainer/questions/create"
              className="px-6 py-3 bg-[#0A0A0A] hover:bg-black text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group"
            >
              <Plus size={18} className="text-yellow-400 group-hover:scale-110 transition-transform" />
              Create Question
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Questions</p>
            <p className="text-3xl font-black text-gray-900">{questions.length}</p>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Filtered Results</p>
            <p className="text-3xl font-black text-yellow-500">{filteredQuestions.length}</p>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Subjects</p>
            <p className="text-3xl font-black text-gray-900">{uniqueSubjects.length}</p>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Question Types</p>
            <p className="text-3xl font-black text-gray-900">{uniqueTypes.length}</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions by prompt..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-black transition-colors"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:border-black transition-colors cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ArrowUpDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all border ${showFilters
                  ? "bg-[#0A0A0A] text-white border-[#0A0A0A]"
                  : "bg-white text-gray-700 border-gray-200 hover:border-black"
                }`}
            >
              <Filter className={`w-4 h-4 ${showFilters ? "text-yellow-400" : ""}`} />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>

            {/* Refresh Button */}
            <button
              onClick={loadQuestions}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-50 text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-100 hover:text-black hover:border-gray-300 transition-all font-bold text-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-yellow-500" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Expanded Filter Options */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2">
                  Question Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:border-black transition-colors"
                >
                  <option value="all">All Types</option>
                  <option value="mcq_single">Single Choice</option>
                  <option value="mcq_multi">Multiple Choice</option>
                  <option value="short_answer">Short Answer</option>
                  <option value="numeric">Numeric</option>
                  <option value="true_false">True/False</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2">
                  Difficulty
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:border-black transition-colors"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:border-black transition-colors"
                >
                  <option value="all">All Subjects</option>
                  {uniqueSubjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-3 flex-wrap">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Filters:</span>

              {search && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border border-gray-200 text-gray-800 rounded-lg text-xs font-bold uppercase tracking-wider">
                  Search: "{search}"
                  <button
                    onClick={() => {
                      setSearchInput("");
                      setSearch("");
                    }}
                    className="hover:text-red-500 transition-colors ml-1"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {selectedType !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border border-gray-200 text-gray-800 rounded-lg text-xs font-bold uppercase tracking-wider">
                  Type: {selectedType.replace("_", " ")}
                  <button onClick={() => setSelectedType("all")} className="hover:text-red-500 transition-colors ml-1">
                    <X size={14} />
                  </button>
                </span>
              )}
              {selectedDifficulty !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border border-gray-200 text-gray-800 rounded-lg text-xs font-bold uppercase tracking-wider">
                  Diff: {selectedDifficulty}
                  <button
                    onClick={() => setSelectedDifficulty("all")}
                    className="hover:text-red-500 transition-colors ml-1"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {selectedSubject !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border border-gray-200 text-gray-800 rounded-lg text-xs font-bold uppercase tracking-wider">
                  Sub: {selectedSubject}
                  <button
                    onClick={() => setSelectedSubject("all")}
                    className="hover:text-red-500 transition-colors ml-1"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}

              <button
                onClick={clearFilters}
                className="ml-auto px-4 py-1.5 text-xs font-black text-gray-500 hover:text-black uppercase tracking-widest transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Bulk selection bar */}
        {!loading && sortedQuestions.length > 0 && (
          <div className="flex items-center justify-between mb-4 px-1">
            <button
              onClick={toggleSelectPage}
              className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-black uppercase tracking-widest transition-colors"
            >
              {allPageSelected ? (
                <CheckSquare size={16} className="text-black" />
              ) : (
                <Square size={16} className="text-gray-400" />
              )}
              Select page ({selectedIds.length} selected)
            </button>

            {selectedIds.length > 0 && (
              <button
                onClick={requestBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-black uppercase tracking-widest transition-colors"
              >
                <Trash2 size={14} /> Delete Selected ({selectedIds.length})
              </button>
            )}
          </div>
        )}

        {/* Main Content Area */}
        {loading ? (
          <div className="grid gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl border border-red-200 p-16 text-center shadow-sm max-w-2xl mx-auto">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-gray-900 mb-2">Error Loading Questions</h3>
            <p className="text-sm font-medium text-red-600 mb-6">{error}</p>
            <button
              onClick={loadQuestions}
              className="px-6 py-3 bg-[#0A0A0A] text-white rounded-xl hover:bg-black font-bold text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm max-w-2xl mx-auto">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-black text-gray-900 mb-2">No Questions Found</h3>
            <p className="text-sm font-medium text-gray-500 mb-8">
              {hasActiveFilters
                ? "Try adjusting your filters or search criteria."
                : "Your question bank is empty. Get started by creating your first question."}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 font-bold text-sm transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <div className="flex gap-3 justify-center">
                <Link
                  to="/trainer/questions/ai"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 font-bold text-sm transition-colors shadow-md"
                >
                  <Sparkles size={18} className="text-white" />
                  AI Generate
                </Link>
                <Link
                  to="/trainer/questions/create"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A0A0A] text-white rounded-xl hover:bg-black font-bold text-sm transition-colors shadow-md"
                >
                  <Plus size={18} className="text-yellow-400" />
                  Create First Question
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:gap-6">
              {paginatedQuestions.map((q) => (
                <div key={q._id} className="relative flex items-start gap-3">
                  <button
                    onClick={() => toggleSelectOne(q._id)}
                    className="mt-6 flex-shrink-0"
                    title={selectedIds.includes(q._id) ? "Deselect" : "Select"}
                  >
                    {selectedIds.includes(q._id) ? (
                      <CheckSquare size={20} className="text-black" />
                    ) : (
                      <Square size={20} className="text-gray-300 hover:text-gray-500 transition-colors" />
                    )}
                  </button>
                  <div className={`flex-1 min-w-0 ${deletingIds.includes(q._id) ? "opacity-40 pointer-events-none" : ""}`}>
                    <QuestionCard
                      question={q}
                      onDelete={(id) => requestDelete(id, q.prompt?.slice(0, 60))}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, sortedQuestions.length)} of{" "}
                  {sortedQuestions.length}
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

      {/* DELETE CONFIRMATION MODAL */}
      {confirmTarget && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => deletingIds.length === 0 && setConfirmTarget(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl w-fit mb-4">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">
              {confirmTarget.ids.length > 1 ? "Delete these questions?" : "Delete this question?"}
            </h3>
            <p className="text-sm font-medium text-gray-500 mb-6">
              {confirmTarget.ids.length > 1 ? (
                <>
                  <span className="font-bold text-gray-700">{confirmTarget.label}</span> will be permanently
                  removed from the bank, including from any quizzes still referencing them.
                </>
              ) : (
                <>
                  "<span className="font-bold text-gray-700">{confirmTarget.label || "This question"}</span>" will
                  be permanently deleted. This can't be undone.
                </>
              )}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfirmTarget(null)}
                disabled={deletingIds.length > 0}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingIds.length > 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors disabled:opacity-60"
              >
                {deletingIds.length > 0 ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                {deletingIds.length > 0 ? "Deleting..." : "Delete"}
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

export default QuestionList;