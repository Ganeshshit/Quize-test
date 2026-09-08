// src/pages/trainer/QuestionList.jsx

import React, { useEffect, useState } from "react";
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
  BookOpen,
  X,
  ChevronDown,
  Database,
  Layers,
  FileText
} from "lucide-react";

const QuestionList = () => {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");

  // Extract unique values for filters
  const uniqueSubjects = [...new Set(questions.map(q => q.subject?.name).filter(Boolean))];
  const uniqueTypes = [...new Set(questions.map(q => q.type).filter(Boolean))];

  // Load questions from backend - FIXED TO FETCH ALL PAGES
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch all questions by requesting a large limit or fetching all pages
      const allQuestions = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const res = await questionsAPI.getAll({ page: currentPage, limit: 100 });

        if (res.data && res.data.length > 0) {
          allQuestions.push(...res.data);

          // Check if there are more pages
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

  // Delete a question
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;

    try {
      await questionsAPI.delete(id);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      alert("Failed to delete question");
      console.error(err);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedType("all");
    setSelectedDifficulty("all");
    setSelectedSubject("all");
    setSearch("");
  };

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.prompt?.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === "all" || q.type === selectedType;
    const matchesDifficulty = selectedDifficulty === "all" || q.difficulty === selectedDifficulty;
    const matchesSubject = selectedSubject === "all" || q.subject?.name === selectedSubject;

    return matchesSearch && matchesType && matchesDifficulty && matchesSubject;
  });

  const hasActiveFilters = selectedType !== "all" || selectedDifficulty !== "all" || selectedSubject !== "all" || search;

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

          <Link
            to="/trainer/questions/create"
            className="px-6 py-3 bg-[#0A0A0A] hover:bg-black text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group"
          >
            <Plus size={18} className="text-yellow-400 group-hover:scale-110 transition-transform" />
            Create Question
          </Link>
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
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row gap-4">

            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions by prompt..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-black transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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
                <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2">Question Type</label>
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
                <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2">Difficulty</label>
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
                <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2">Subject</label>
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
                  <button onClick={() => setSearch("")} className="hover:text-red-500 transition-colors ml-1">
                    <X size={14} />
                  </button>
                </span>
              )}
              {selectedType !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border border-gray-200 text-gray-800 rounded-lg text-xs font-bold uppercase tracking-wider">
                  Type: {selectedType.replace('_', ' ')}
                  <button onClick={() => setSelectedType("all")} className="hover:text-red-500 transition-colors ml-1">
                    <X size={14} />
                  </button>
                </span>
              )}
              {selectedDifficulty !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border border-gray-200 text-gray-800 rounded-lg text-xs font-bold uppercase tracking-wider">
                  Diff: {selectedDifficulty}
                  <button onClick={() => setSelectedDifficulty("all")} className="hover:text-red-500 transition-colors ml-1">
                    <X size={14} />
                  </button>
                </span>
              )}
              {selectedSubject !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border border-gray-200 text-gray-800 rounded-lg text-xs font-bold uppercase tracking-wider">
                  Sub: {selectedSubject}
                  <button onClick={() => setSelectedSubject("all")} className="hover:text-red-500 transition-colors ml-1">
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

        {/* Main Content Area */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-20 text-center shadow-sm">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading question bank...</p>
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
              <Link
                to="/trainer/questions/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A0A0A] text-white rounded-xl hover:bg-black font-bold text-sm transition-colors shadow-md"
              >
                <Plus size={18} className="text-yellow-400" />
                Create First Question
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {filteredQuestions.map((q) => (
              <QuestionCard
                key={q._id}
                question={q}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </TrainerLayout>
  );
};

export default QuestionList;