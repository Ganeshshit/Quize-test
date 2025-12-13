import React, { useState } from "react";
import {
    Search,
    Library,
    Plus,
    Award,
    BookOpen,
    TrendingUp,
    Filter,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Target,
    Zap
} from "lucide-react";

const QuestionBank = ({
    questionBank,
    quizQuestions,
    subjects,
    selectedSubject,
    selectedDifficulty,
    setSelectedSubject,
    setSelectedDifficulty,
    search,
    setSearch,
    bankLoading,
    onAdd
}) => {
    const [showFilters, setShowFilters] = useState(true);

    // Remove questions already in quiz
    const availableQuestions = questionBank.filter(
        (bankQ) => !quizQuestions.some((quizQ) => quizQ._id === bankQ._id)
    );

    // Search filter
    const filteredQuestions = availableQuestions.filter((q) =>
        q.prompt?.toLowerCase().includes(search.toLowerCase())
    );

    const getDifficultyConfig = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case "easy":
                return {
                    color: "bg-green-100 text-green-700 border-green-200",
                    icon: "🟢"
                };
            case "medium":
                return {
                    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
                    icon: "🟡"
                };
            case "hard":
                return {
                    color: "bg-red-100 text-red-700 border-red-200",
                    icon: "🔴"
                };
            default:
                return {
                    color: "bg-gray-100 text-gray-700 border-gray-200",
                    icon: "⚪"
                };
        }
    };

    const hasActiveFilters = selectedSubject !== "all" || selectedDifficulty !== "all" || search !== "";

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col max-h-[80vh]">

            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-2.5 shadow-md">
                            <Library className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Question Bank</h2>
                            <p className="text-sm text-gray-500">Browse and add questions to your quiz</p>
                        </div>
                    </div>

                    {bankLoading && (
                        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="font-medium">Loading...</span>
                        </div>
                    )}
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-semibold text-blue-800">Total Questions</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">{questionBank.length}</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-semibold text-green-800">Available</span>
                        </div>
                        <p className="text-2xl font-bold text-green-700">{availableQuestions.length}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Plus className="w-4 h-4 text-purple-600" />
                            <span className="text-xs font-semibold text-purple-800">In Quiz</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-700">{quizQuestions.length}</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search questions by keyword..."
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        disabled={bankLoading}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Filter Toggle & Clear */}
                <div className="flex gap-2 mb-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${showFilters
                                ? "bg-purple-100 text-purple-700 border border-purple-300"
                                : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                            }`}
                        disabled={bankLoading}
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>

                    {hasActiveFilters && (
                        <button
                            onClick={() => {
                                setSelectedSubject("all");
                                setSelectedDifficulty("all");
                                setSearch("");
                            }}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 transition"
                            disabled={bankLoading}
                        >
                            <X className="w-4 h-4" />
                            Clear All
                        </button>
                    )}
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Subject Filter */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                                    <Target className="w-4 h-4 text-purple-600" />
                                    Subject
                                </label>
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                                    disabled={bankLoading}
                                >
                                    <option value="all">All Subjects</option>
                                    {subjects.map((sub) => (
                                        <option key={sub._id} value={sub._id}>
                                            {sub.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Difficulty Filter */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                                    <Zap className="w-4 h-4 text-orange-600" />
                                    Difficulty
                                </label>
                                <select
                                    value={selectedDifficulty}
                                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                                    disabled={bankLoading}
                                >
                                    <option value="all">All Difficulties</option>
                                    <option value="easy">🟢 Easy</option>
                                    <option value="medium">🟡 Medium</option>
                                    <option value="hard">🔴 Hard</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {bankLoading ? (
                    <div className="text-center text-gray-500 py-16">
                        <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                        </div>
                        <p className="font-semibold text-lg text-gray-700">Loading questions...</p>
                        <p className="text-sm mt-2 text-gray-500">Please wait a moment</p>
                    </div>
                ) : filteredQuestions.length === 0 ? (
                    <div className="text-center text-gray-500 py-16">
                        <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="font-semibold text-lg text-gray-700">
                            {availableQuestions.length === 0 && !hasActiveFilters
                                ? "All questions added!"
                                : "No matching questions"}
                        </p>
                        <p className="text-sm mt-2 text-gray-500">
                            {availableQuestions.length === 0 && !hasActiveFilters
                                ? "All available questions are already in your quiz"
                                : "Try adjusting your filters or search terms"}
                        </p>
                    </div>
                ) : (
                    filteredQuestions.map((q) => {
                        const diffConfig = getDifficultyConfig(q.difficulty);

                        return (
                            <div
                                key={q._id}
                                className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-lg hover:border-purple-300 transition-all duration-200 group"
                            >
                                <p className="font-medium text-gray-900 mb-3 leading-relaxed text-base">
                                    {q.prompt}
                                </p>

                                <div className="flex justify-between items-center flex-wrap gap-3">
                                    <div className="flex gap-2 flex-wrap text-xs">
                                        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium border border-blue-200 flex items-center gap-1">
                                            <Award className="w-3 h-3" />
                                            {q.marks || 1} marks
                                        </span>

                                        <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-medium border border-purple-200 flex items-center gap-1">
                                            <BookOpen className="w-3 h-3" />
                                            {q.subject?.name || "No Subject"}
                                        </span>

                                        <span className={`px-2.5 py-1 rounded-full font-medium border ${diffConfig.color} flex items-center gap-1`}>
                                            <span>{diffConfig.icon}</span>
                                            <span className="capitalize">{q.difficulty || "medium"}</span>
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => onAdd(q._id)}
                                        className="px-4 py-2 text-sm bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium shadow-md hover:shadow-lg flex items-center gap-1.5 group-hover:scale-105"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add to Quiz
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer Info */}
            {!bankLoading && filteredQuestions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                        Showing <span className="font-semibold text-gray-700">{filteredQuestions.length}</span> of{" "}
                        <span className="font-semibold text-gray-700">{availableQuestions.length}</span> available questions
                    </p>
                </div>
            )}
        </div>
    );
};

export default QuestionBank;