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
  ChevronDown
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
      {/* Header Section */}
      <div className="mb-8 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg p-8 border border-blue-100">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Question Bank
            </h1>
            <p className="text-slate-600 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Manage all your quiz questions in one place
            </p>
          </div>

          <Link
            to="/trainer/questions/create"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Question
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-xl p-4 border-2 border-slate-200 shadow-sm">
            <p className="text-slate-600 text-sm font-medium mb-1">Total Questions</p>
            <p className="text-3xl font-bold text-slate-900">{questions.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-slate-200 shadow-sm">
            <p className="text-slate-600 text-sm font-medium mb-1">Filtered Results</p>
            <p className="text-3xl font-bold text-blue-600">{filteredQuestions.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-slate-200 shadow-sm">
            <p className="text-slate-600 text-sm font-medium mb-1">Subjects</p>
            <p className="text-3xl font-bold text-purple-600">{uniqueSubjects.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-slate-200 shadow-sm">
            <p className="text-slate-600 text-sm font-medium mb-1">Question Types</p>
            <p className="text-3xl font-bold text-green-600">{uniqueTypes.length}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 bg-white rounded-xl shadow-md p-4 border border-slate-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions by prompt..."
              className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-slate-50 focus:bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 transition-all font-medium ${showFilters
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-slate-700 border-slate-300 hover:border-blue-400"
              }`}
          >
            <Filter className="w-5 h-5" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          {/* Refresh Button */}
          <button
            onClick={loadQuestions}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 border-2 border-slate-300 transition-all font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t-2 border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Question Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none bg-white transition-colors"
              >
                <option value="all">All Types</option>
                <option value="mcq_single">Single Choice</option>
                <option value="mcq_multi">Multiple Choice</option>
                <option value="short_answer">Short Answer</option>
                <option value="numeric">Numeric</option>
                <option value="true_false">True/False</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none bg-white transition-colors"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none bg-white transition-colors"
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

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t-2 border-slate-200 flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-600">Active Filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                Search: "{search}"
                <button onClick={() => setSearch("")} className="hover:bg-blue-200 rounded p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedType !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                Type: {selectedType}
                <button onClick={() => setSelectedType("all")} className="hover:bg-purple-200 rounded p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedDifficulty !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
                Difficulty: {selectedDifficulty}
                <button onClick={() => setSelectedDifficulty("all")} className="hover:bg-yellow-200 rounded p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedSubject !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                Subject: {selectedSubject}
                <button onClick={() => setSelectedSubject("all")} className="hover:bg-green-200 rounded p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="ml-auto px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Loading / Error / No data */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg font-medium">Loading questions...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Error Loading Questions</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={loadQuestions}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <BookOpen className="w-20 h-20 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No Questions Found</h3>
            <p className="text-slate-500 mb-6">
              {hasActiveFilters
                ? "Try adjusting your filters or search criteria"
                : "Get started by creating your first question"}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                to="/trainer/questions/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Create First Question
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredQuestions.map((q) => (
            <QuestionCard
              key={q._id}
              question={q}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </TrainerLayout>
  );
};

export default QuestionList;