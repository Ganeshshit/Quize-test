import React, { useState } from "react";
import {
    Search,
    Library,
    Plus,
    Award,
    BookOpen,
    Filter,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Target,
    Zap,
    TrendingUp
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
                    color: "bg-emerald-100 text-emerald-700 border-emerald-300",
                    icon: "🟢",
                    gradient: "from-emerald-500 to-emerald-600"
                };
            case "medium":
                return {
                    color: "bg-amber-100 text-amber-700 border-amber-300",
                    icon: "🟡",
                    gradient: "from-amber-500 to-amber-600"
                };
            case "hard":
                return {
                    color: "bg-rose-100 text-rose-700 border-rose-300",
                    icon: "🔴",
                    gradient: "from-rose-500 to-rose-600"
                };
            default:
                return {
                    color: "bg-gray-100 text-gray-700 border-gray-300",
                    icon: "⚪",
                    gradient: "from-gray-500 to-gray-600"
                };
        }
    };

    const hasActiveFilters = selectedSubject !== "all" || selectedDifficulty !== "all" || search !== "";

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 p-6 mb-6 shadow-sm">
                <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-3 shadow-lg">
                            <Library className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Question Bank</h2>
                            <p className="text-sm text-gray-600 mt-1 font-medium">Browse and add questions to your quiz</p>
                        </div>
                    </div>

                    {bankLoading && (
                        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-100 px-4 py-2 rounded-lg border-2 border-blue-300 shadow-sm">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="font-bold">Loading...</span>
                        </div>
                    )}
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-3 gap-4 mb-5">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-bold text-blue-900">Total Questions</span>
                        </div>
                        <p className="text-3xl font-bold text-blue-700">{questionBank.length}</p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-emerald-600 p-2 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-bold text-emerald-900">Available</span>
                        </div>
                        <p className="text-3xl font-bold text-emerald-700">{availableQuestions.length}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-purple-600 p-2 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-bold text-purple-900">In Quiz</span>
                        </div>
                        <p className="text-3xl font-bold text-purple-700">{quizQuestions.length}</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search questions by keyword..."
                        className="w-full border-2 border-gray-300 rounded-xl pl-12 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed bg-white shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        disabled={bankLoading}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded-full hover:bg-gray-200 transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Filter Toggle & Clear */}
                <div className="flex gap-3 flex-wrap mb-4">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition shadow-sm ${showFilters
                                ? "bg-purple-600 text-white border-2 border-purple-700"
                                : "bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50"
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
                            className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 bg-rose-100 text-rose-700 border-2 border-rose-300 hover:bg-rose-200 transition shadow-sm"
                            disabled={bankLoading}
                        >
                            <X className="w-4 h-4" />
                            Clear All Filters
                        </button>
                    )}
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 shadow-md">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Subject Filter */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <Target className="w-4 h-4 text-purple-600" />
                                    Subject
                                </label>
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition shadow-sm"
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
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-orange-600" />
                                    Difficulty
                                </label>
                                <select
                                    value={selectedDifficulty}
                                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition shadow-sm"
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

            {/* Questions List - Full Width with Better Scrolling */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
                {bankLoading ? (
                    <div className="text-center text-gray-500 py-20 bg-purple-50 rounded-xl border-2 border-dashed border-purple-300">
                        <div className="bg-purple-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                            <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
                        </div>
                        <p className="font-bold text-xl text-gray-700">Loading questions...</p>
                        <p className="text-sm mt-2 text-gray-500">Please wait a moment</p>
                    </div>
                ) : filteredQuestions.length === 0 ? (
                    <div className="text-center text-gray-500 py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        <div className="bg-gray-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="font-bold text-xl text-gray-700 mb-2">
                            {availableQuestions.length === 0 && !hasActiveFilters
                                ? "All questions added!"
                                : "No matching questions"}
                        </p>
                        <p className="text-sm text-gray-500">
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
                                className="border-2 border-gray-200 rounded-xl p-6 bg-white hover:shadow-xl hover:border-purple-400 transition-all duration-200 group"
                            >
                                {/* Question Text */}
                                <p className="font-semibold text-gray-900 mb-4 leading-relaxed text-lg">
                                    {q.prompt}
                                </p>

                                {/* Metadata and Add Button */}
                                <div className="flex justify-between items-center flex-wrap gap-4">
                                    <div className="flex gap-2.5 flex-wrap text-xs">
                                        <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full font-bold border-2 border-blue-300 flex items-center gap-1.5 shadow-sm">
                                            <Award className="w-4 h-4" />
                                            {q.marks || 1} marks
                                        </span>

                                        <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full font-bold border-2 border-purple-300 flex items-center gap-1.5 shadow-sm">
                                            <BookOpen className="w-4 h-4" />
                                            {q.subject?.name || "No Subject"}
                                        </span>

                                        <span className={`px-3 py-1.5 rounded-full font-bold border-2 ${diffConfig.color} flex items-center gap-1.5 shadow-sm`}>
                                            <span>{diffConfig.icon}</span>
                                            <span className="capitalize">{q.difficulty || "medium"}</span>
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => onAdd(q._id)}
                                        className="px-5 py-2.5 text-sm bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all font-bold shadow-lg hover:shadow-xl flex items-center gap-2 group-hover:scale-105 transform"
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
                <div className="mt-4 pt-4 border-t-2 border-gray-200 bg-gray-50 rounded-lg px-4 py-3">
                    <p className="text-sm text-gray-600 text-center font-medium">
                        Showing <span className="font-bold text-purple-700">{filteredQuestions.length}</span> of{" "}
                        <span className="font-bold text-purple-700">{availableQuestions.length}</span> available questions
                    </p>
                </div>
            )}
        </div>
    );
};

export default QuestionBank;