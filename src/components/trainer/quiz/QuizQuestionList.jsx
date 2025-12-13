import React, { useState } from "react";
import { Search, Plus, Trash2, Award, BookOpen, TrendingUp, X, Filter, SortAsc } from "lucide-react";

const QuizQuestionList = ({
    questions,
    search,
    setSearch,
    onRemove,
    onOpenModal
}) => {
    const [sortBy, setSortBy] = useState("order");
    const [filterDifficulty, setFilterDifficulty] = useState("all");
    const [filterSubject, setFilterSubject] = useState("all");
    const [showFilters, setShowFilters] = useState(false);

    // Get unique subjects
    const subjects = [...new Set(questions.map(q => q.subject?.name).filter(Boolean))];

    // Filter questions
    let filtered = questions.filter((q) =>
        q.prompt?.toLowerCase().includes(search.toLowerCase())
    );

    if (filterDifficulty !== "all") {
        filtered = filtered.filter(q => q.difficulty === filterDifficulty);
    }

    if (filterSubject !== "all") {
        filtered = filtered.filter(q => q.subject?.name === filterSubject);
    }

    // Sort questions
    const sorted = [...filtered].sort((a, b) => {
        switch (sortBy) {
            case "marks":
                return b.marks - a.marks;
            case "difficulty":
                const diffOrder = { easy: 1, medium: 2, hard: 3 };
                return (diffOrder[a.difficulty] || 2) - (diffOrder[b.difficulty] || 2);
            default:
                return 0;
        }
    });

    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case "easy":
                return "bg-green-100 text-green-700 border-green-200";
            case "medium":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "hard":
                return "bg-red-100 text-red-700 border-red-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col h-[calc(100vh-300px)]">

            {/* Header with Stats */}
            <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Quiz Questions
                        </h2>
                        <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-1.5 text-gray-600">
                                <BookOpen className="w-4 h-4" />
                                <span className="font-medium">{questions.length} Questions</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-600">
                                <Award className="w-4 h-4" />
                                <span className="font-medium">{totalMarks} Total Marks</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onOpenModal}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Question
                    </button>
                </div>

                {/* Search and Filter Bar */}
                <div className="space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search questions by keyword..."
                            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Filter Toggle */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${showFilters
                                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                                    : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                        </button>

                        <button
                            onClick={() => setSortBy(sortBy === "order" ? "marks" : sortBy === "marks" ? "difficulty" : "order")}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition"
                        >
                            <SortAsc className="w-4 h-4" />
                            {sortBy === "order" ? "Default" : sortBy === "marks" ? "By Marks" : "By Difficulty"}
                        </button>

                        {(filterDifficulty !== "all" || filterSubject !== "all") && (
                            <button
                                onClick={() => {
                                    setFilterDifficulty("all");
                                    setFilterSubject("all");
                                }}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 transition"
                            >
                                <X className="w-4 h-4" />
                                Clear Filters
                            </button>
                        )}
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Difficulty
                                    </label>
                                    <select
                                        value={filterDifficulty}
                                        onChange={(e) => setFilterDifficulty(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">All Difficulties</option>
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Subject
                                    </label>
                                    <select
                                        value={filterSubject}
                                        onChange={(e) => setFilterSubject(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">All Subjects</option>
                                        {subjects.map(subject => (
                                            <option key={subject} value={subject}>{subject}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Question List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {sorted.length === 0 ? (
                    <div className="text-center text-gray-500 py-16">
                        <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="font-semibold text-lg text-gray-700">
                            {search || filterDifficulty !== "all" || filterSubject !== "all"
                                ? "No questions match your filters"
                                : "No questions yet"}
                        </p>
                        <p className="text-sm mt-2 text-gray-500">
                            {search || filterDifficulty !== "all" || filterSubject !== "all"
                                ? "Try adjusting your search or filters"
                                : "Click 'Add Question' to get started"}
                        </p>
                    </div>
                ) : (
                    sorted.map((q, index) => (
                        <div
                            key={q._id}
                            className="border border-gray-200 rounded-xl p-5 bg-white hover:shadow-lg hover:border-gray-300 transition-all duration-200 group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                                        {index + 1}
                                    </span>
                                    <div className="flex gap-2">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getDifficultyColor(q.difficulty)}`}>
                                            {q.difficulty || "medium"}
                                        </span>
                                        <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium border border-blue-200 flex items-center gap-1">
                                            <Award className="w-3 h-3" />
                                            {q.marks} marks
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onRemove(q._id)}
                                    className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 border border-red-200 hover:border-red-600"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Remove
                                </button>
                            </div>

                            <p className="text-gray-900 mb-4 font-medium text-base leading-relaxed">
                                {q.prompt}
                            </p>

                            <div className="space-y-2">
                                {q.choices?.map((choice) => (
                                    <div
                                        key={choice.id}
                                        className={`text-sm px-4 py-2.5 rounded-lg transition-all ${choice.isCorrect
                                                ? "bg-green-50 text-green-800 font-semibold border-2 border-green-400 shadow-sm"
                                                : "bg-gray-50 text-gray-700 border border-gray-200"
                                            }`}
                                    >
                                        <span className="font-bold mr-2">{choice.id}.</span>
                                        {choice.text}
                                        {choice.isCorrect && (
                                            <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                                                Correct
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {q.subject?.name && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <span className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium border border-purple-200">
                                        📚 {q.subject.name}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default QuizQuestionList;