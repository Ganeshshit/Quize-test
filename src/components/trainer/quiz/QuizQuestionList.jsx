import React, { useState } from "react";
import { Search, Plus, Trash2, Award, BookOpen, X, Filter, SortAsc, CheckCircle } from "lucide-react";

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
                return "bg-emerald-100 text-emerald-700 border-emerald-300";
            case "medium":
                return "bg-amber-100 text-amber-700 border-amber-300";
            case "hard":
                return "bg-rose-100 text-rose-700 border-rose-300";
            default:
                return "bg-gray-100 text-gray-700 border-gray-300";
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header with Stats */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6 mb-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <BookOpen className="w-7 h-7 text-white" />
                            </div>
                            Quiz Questions
                        </h2>
                        <div className="flex gap-6 text-sm">
                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-blue-200 shadow-sm">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                <span className="font-semibold text-gray-700">{questions.length}</span>
                                <span className="text-gray-600">Questions</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-amber-200 shadow-sm">
                                <Award className="w-5 h-5 text-amber-600" />
                                <span className="font-semibold text-gray-700">{totalMarks}</span>
                                <span className="text-gray-600">Total Marks</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onOpenModal}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 hover:scale-105 transform"
                    >
                        <Plus className="w-5 h-5" />
                        Add Question
                    </button>
                </div>

                {/* Search and Filter Bar */}
                <div className="space-y-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search questions by keyword..."
                            className="w-full border-2 border-gray-300 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white shadow-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Filter Toggle */}
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm ${showFilters
                                    ? "bg-blue-600 text-white border-2 border-blue-700"
                                    : "bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                        </button>

                        <button
                            onClick={() => setSortBy(sortBy === "order" ? "marks" : sortBy === "marks" ? "difficulty" : "order")}
                            className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 transition shadow-sm"
                        >
                            <SortAsc className="w-4 h-4" />
                            {sortBy === "order" ? "Default Order" : sortBy === "marks" ? "By Marks" : "By Difficulty"}
                        </button>

                        {(filterDifficulty !== "all" || filterSubject !== "all") && (
                            <button
                                onClick={() => {
                                    setFilterDifficulty("all");
                                    setFilterSubject("all");
                                }}
                                className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 bg-rose-100 text-rose-700 border-2 border-rose-300 hover:bg-rose-200 transition shadow-sm"
                            >
                                <X className="w-4 h-4" />
                                Clear Filters
                            </button>
                        )}
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="bg-white border-2 border-gray-200 rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 shadow-md">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Difficulty Level
                                    </label>
                                    <select
                                        value={filterDifficulty}
                                        onChange={(e) => setFilterDifficulty(e.target.value)}
                                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                                    >
                                        <option value="all">All Difficulties</option>
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Subject
                                    </label>
                                    <select
                                        value={filterSubject}
                                        onChange={(e) => setFilterSubject(e.target.value)}
                                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
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

            {/* Question List - Full Width with Better Scrolling */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
                {sorted.length === 0 ? (
                    <div className="text-center text-gray-500 py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        <div className="bg-gray-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="font-bold text-xl text-gray-700 mb-2">
                            {search || filterDifficulty !== "all" || filterSubject !== "all"
                                ? "No questions match your filters"
                                : "No questions yet"}
                        </p>
                        <p className="text-sm text-gray-500">
                            {search || filterDifficulty !== "all" || filterSubject !== "all"
                                ? "Try adjusting your search or filters"
                                : "Click 'Add Question' to get started"}
                        </p>
                    </div>
                ) : (
                    sorted.map((q, index) => (
                        <div
                            key={q._id}
                            className="border-2 border-gray-200 rounded-xl p-6 bg-white hover:shadow-xl hover:border-blue-300 transition-all duration-200 group"
                        >
                            {/* Question Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-lg shadow-md">
                                        {index + 1}
                                    </span>
                                    <div className="flex gap-2 flex-wrap">
                                        <span className={`text-xs px-3 py-1.5 rounded-full font-bold border-2 ${getDifficultyColor(q.difficulty)}`}>
                                            {q.difficulty?.toUpperCase() || "MEDIUM"}
                                        </span>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-bold border-2 border-blue-300 flex items-center gap-1.5">
                                            <Award className="w-4 h-4" />
                                            {q.marks} marks
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onRemove(q._id)}
                                    className="px-4 py-2 text-sm bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-600 hover:text-white transition-all font-semibold flex items-center gap-2 opacity-0 group-hover:opacity-100 border-2 border-rose-300 hover:border-rose-600 shadow-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Remove
                                </button>
                            </div>

                            {/* Question Text */}
                            <div className="mb-5 pl-14">
                                <p className="text-gray-900 font-semibold text-lg leading-relaxed">
                                    {q.prompt}
                                </p>
                            </div>

                            {/* Answer Choices */}
                            <div className="space-y-2.5 pl-14">
                                {q.choices?.map((choice) => (
                                    <div
                                        key={choice.id}
                                        className={`text-sm px-5 py-3 rounded-lg transition-all border-2 ${choice.isCorrect
                                                ? "bg-emerald-50 text-emerald-900 font-bold border-emerald-400 shadow-md"
                                                : "bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-base">{choice.id}.</span>
                                                <span>{choice.text}</span>
                                            </div>
                                            {choice.isCorrect && (
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                                    <span className="text-xs bg-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full font-bold">
                                                        CORRECT
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Subject Tag */}
                            {q.subject?.name && (
                                <div className="mt-5 pt-4 border-t-2 border-gray-100 pl-14">
                                    <span className="text-xs bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full font-bold border-2 border-purple-300 inline-flex items-center gap-2">
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