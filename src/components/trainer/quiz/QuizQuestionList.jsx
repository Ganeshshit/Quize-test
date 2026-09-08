// src/components/trainer/quiz/QuizQuestionList.jsx
import React, { useState } from "react";
import { Search, Plus, Trash2, Award, BookOpen, X, Filter, SortAsc, CheckCircle } from "lucide-react";

const QuizQuestionList = ({
    questions = [],
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

    const getDifficultyBadge = (difficulty) => {
        const configs = {
            easy: "bg-emerald-50 border-emerald-200 text-emerald-700",
            medium: "bg-yellow-50 border-yellow-200 text-yellow-700",
            hard: "bg-red-50 border-red-200 text-red-700"
        };
        const formatted = difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : "Medium";
        return (
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${configs[difficulty?.toLowerCase()] || configs.medium}`}>
                {formatted}
            </span>
        );
    };

    const inputClasses = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all";

    return (
        <div className="flex flex-col h-full font-sans">

            {/* Toolbar Area */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6 items-center justify-between">

                <div className="relative w-full lg:max-w-md">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search questions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`${inputClasses} pl-11`}
                    />
                </div>

                <div className="flex flex-wrap items-center w-full lg:w-auto gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${showFilters || filterDifficulty !== "all" || filterSubject !== "all"
                            ? "bg-gray-900 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        <Filter size={16} /> Filters
                    </button>

                    <button
                        onClick={onOpenModal}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0A0A0A] hover:bg-black text-white text-sm font-bold rounded-xl shadow-md transition-all whitespace-nowrap ml-auto lg:ml-0"
                    >
                        <Plus size={18} /> Add Question
                    </button>
                </div>
            </div>

            {/* Expandable Filters Panel */}
            {showFilters && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6 animate-fade-in grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Difficulty</label>
                        <select
                            value={filterDifficulty}
                            onChange={(e) => setFilterDifficulty(e.target.value)}
                            className={inputClasses}
                        >
                            <option value="all">All Difficulties</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Subject</label>
                        <select
                            value={filterSubject}
                            onChange={(e) => setFilterSubject(e.target.value)}
                            className={inputClasses}
                        >
                            <option value="all">All Subjects</option>
                            {subjects.map(subject => (
                                <option key={subject} value={subject}>{subject}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Sort By</label>
                        <button
                            onClick={() => setSortBy(sortBy === "order" ? "marks" : sortBy === "marks" ? "difficulty" : "order")}
                            className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <SortAsc size={16} className="text-gray-400" />
                                {sortBy === "order" ? "Default Order" : sortBy === "marks" ? "By Marks" : "By Difficulty"}
                            </span>
                        </button>
                    </div>

                    {(filterDifficulty !== "all" || filterSubject !== "all" || sortBy !== "order") && (
                        <div className="sm:col-span-3 flex justify-end mt-2">
                            <button
                                onClick={() => {
                                    setFilterDifficulty("all");
                                    setFilterSubject("all");
                                    setSortBy("order");
                                }}
                                className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors"
                            >
                                <X size={14} /> Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* List Header Stats */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Showing {sorted.length} Questions
                </span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Award size={14} className="text-yellow-500" /> {totalMarks} Total Marks
                </span>
            </div>

            {/* Question List Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
                {sorted.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                        <div className="p-4 bg-white rounded-full text-gray-400 mb-4 shadow-sm">
                            <BookOpen size={32} />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 mb-1">
                            {search || filterDifficulty !== "all" || filterSubject !== "all"
                                ? "No matches found"
                                : "Quiz is empty"}
                        </h3>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 text-center max-w-xs">
                            {search || filterDifficulty !== "all" || filterSubject !== "all"
                                ? "Try adjusting your search filters to find what you're looking for."
                                : "Start building your quiz by adding questions from the bank or creating new ones."}
                        </p>
                        {!search && filterDifficulty === "all" && filterSubject === "all" && (
                            <button
                                onClick={onOpenModal}
                                className="text-sm font-bold text-yellow-700 hover:text-yellow-800 bg-yellow-50 px-6 py-2.5 rounded-lg transition-colors"
                            >
                                + Add First Question
                            </button>
                        )}
                    </div>
                ) : (
                    sorted.map((q, index) => (
                        <div
                            key={q._id}
                            className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-sm hover:border-gray-300 transition-all group"
                        >
                            {/* Question Header Row */}
                            <div className="flex justify-between items-start mb-4 gap-4">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 text-xs font-black text-gray-900">
                                        {index + 1}
                                    </span>
                                    {getDifficultyBadge(q.difficulty)}
                                    <span className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-md text-[10px] font-black uppercase tracking-widest border border-gray-200 flex items-center gap-1">
                                        <Award size={10} /> {q.marks || 1} Marks
                                    </span>
                                    {q.subject?.name && (
                                        <span className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-md text-[10px] font-black uppercase tracking-widest border border-gray-200">
                                            {q.subject.name}
                                        </span>
                                    )}
                                </div>

                                <button
                                    onClick={() => onRemove(q._id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-red-100"
                                    title="Remove from Quiz"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* Prompt */}
                            <div className="mb-5 sm:pl-11">
                                <p className="text-base font-bold text-gray-900 leading-relaxed">
                                    {q.prompt}
                                </p>
                            </div>

                            {/* Choices Grid */}
                            {q.choices && q.choices.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:pl-11">
                                    {q.choices.map((choice) => (
                                        <div
                                            key={choice.id}
                                            className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${choice.isCorrect
                                                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                                                : "bg-gray-50 border-gray-100 text-gray-600"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`font-black ${choice.isCorrect ? 'text-emerald-700' : 'text-gray-400'}`}>
                                                    {choice.id}.
                                                </span>
                                                <span>{choice.text}</span>
                                            </div>
                                            {choice.isCorrect && (
                                                <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                                            )}
                                        </div>
                                    ))}
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