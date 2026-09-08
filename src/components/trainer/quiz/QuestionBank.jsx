// src/components/trainer/quiz/QuestionBank.jsx
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
    questionBank = [],
    quizQuestions = [],
    subjects = [],
    selectedSubject,
    selectedDifficulty,
    setSelectedSubject,
    setSelectedDifficulty,
    search,
    setSearch,
    bankLoading,
    onAdd
}) => {
    const [showFilters, setShowFilters] = useState(false);

    // Remove questions already in quiz
    const availableQuestions = questionBank.filter(
        (bankQ) => !quizQuestions.some((quizQ) => quizQ._id === bankQ._id)
    );

    // Search filter
    const filteredQuestions = availableQuestions.filter((q) =>
        q.prompt?.toLowerCase().includes(search.toLowerCase())
    );

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

    const hasActiveFilters = selectedSubject !== "all" || selectedDifficulty !== "all" || search !== "";
    const inputClasses = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all disabled:opacity-50";

    return (
        <div className="flex flex-col h-full font-sans">

            {/* Toolbar Area */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6 items-center justify-between">

                <div className="relative w-full lg:max-w-md">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search question bank..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        disabled={bankLoading}
                        className={`${inputClasses} pl-11`}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center w-full lg:w-auto gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        disabled={bankLoading}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${showFilters || selectedDifficulty !== "all" || selectedSubject !== "all"
                                ? "bg-gray-900 text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        <Filter size={16} /> Filters
                    </button>
                </div>
            </div>

            {/* Expandable Filters Panel */}
            {showFilters && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6 animate-fade-in grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Target size={12} /> Subject
                        </label>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            disabled={bankLoading}
                            className={inputClasses}
                        >
                            <option value="all">All Subjects</option>
                            {subjects.map((sub) => (
                                <option key={sub._id} value={sub._id}>
                                    {sub.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Zap size={12} /> Difficulty
                        </label>
                        <select
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                            disabled={bankLoading}
                            className={inputClasses}
                        >
                            <option value="all">All Difficulties</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    {(selectedDifficulty !== "all" || selectedSubject !== "all") && (
                        <div className="sm:col-span-2 flex justify-end mt-2">
                            <button
                                onClick={() => {
                                    setSelectedSubject("all");
                                    setSelectedDifficulty("all");
                                    setSearch("");
                                }}
                                className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors"
                            >
                                <X size={14} /> Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                        <Library size={12} /> Bank Total
                    </div>
                    <span className="text-lg font-black text-gray-900">{questionBank.length}</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">
                        <CheckCircle2 size={12} /> Available
                    </div>
                    <span className="text-lg font-black text-emerald-700">{availableQuestions.length}</span>
                </div>
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-yellow-700 uppercase tracking-widest mb-1">
                        <TrendingUp size={12} /> In Quiz
                    </div>
                    <span className="text-lg font-black text-yellow-800">{quizQuestions.length}</span>
                </div>
            </div>

            {/* List Header */}
            {!bankLoading && (
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Showing {filteredQuestions.length} Matches
                    </span>
                </div>
            )}

            {/* Questions List Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
                {bankLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                        <Loader2 size={32} className="text-yellow-400 animate-spin mb-4" />
                        <h3 className="text-sm font-black text-gray-900 mb-1 uppercase tracking-widest">Loading Bank</h3>
                        <p className="text-xs font-bold text-gray-500">Fetching available questions...</p>
                    </div>
                ) : filteredQuestions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                        <div className="p-4 bg-white rounded-full text-gray-400 mb-4 shadow-sm">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 mb-1">
                            {availableQuestions.length === 0 && !hasActiveFilters
                                ? "All Questions Added!"
                                : "No Matches Found"}
                        </h3>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest text-center max-w-xs">
                            {availableQuestions.length === 0 && !hasActiveFilters
                                ? "Every question in the bank has been added to this quiz."
                                : "Try adjusting your filters or search terms."}
                        </p>
                    </div>
                ) : (
                    filteredQuestions.map((q) => (
                        <div
                            key={q._id}
                            className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-sm hover:border-gray-900 hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center justify-between gap-5"
                        >
                            <div className="space-y-3 flex-1">
                                <p className="text-base font-bold text-gray-900 leading-relaxed">
                                    {q.prompt}
                                </p>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-md text-[10px] font-black uppercase tracking-widest border border-gray-200 flex items-center gap-1">
                                        <Award size={10} /> {q.marks || 1} Marks
                                    </span>

                                    {q.subject?.name && (
                                        <span className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-md text-[10px] font-black uppercase tracking-widest border border-gray-200 flex items-center gap-1">
                                            <BookOpen size={10} /> {q.subject.name}
                                        </span>
                                    )}

                                    {getDifficultyBadge(q.difficulty)}
                                </div>
                            </div>

                            <div className="border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 flex-shrink-0">
                                <button
                                    onClick={() => onAdd(q._id)}
                                    className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0A0A0A] hover:bg-yellow-400 hover:text-black text-white text-xs font-black uppercase tracking-widest rounded-xl transition-colors shadow-sm"
                                >
                                    <Plus size={14} /> Add to Quiz
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default QuestionBank;