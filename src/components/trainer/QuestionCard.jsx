// src/components/trainer/QuestionCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Edit2, Trash2, CheckCircle2, BookOpen, Award, TrendingUp, Tags, Activity } from "lucide-react";

const QuestionCard = ({ question, onDelete, showActions = true }) => {
    if (!question) return null;

    const correctIds = question.choices
        ?.filter((c) => c.isCorrect)
        .map((c) => c.id)
        .join(", ");

    const getDifficultyBadge = (difficulty) => {
        const configs = {
            easy: "bg-emerald-50 border-emerald-200 text-emerald-700",
            medium: "bg-yellow-50 border-yellow-200 text-yellow-700",
            hard: "bg-red-50 border-red-200 text-red-700"
        };
        const formatted = difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : "Medium";
        return (
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border flex items-center gap-1 ${configs[difficulty?.toLowerCase()] || configs.medium}`}>
                <TrendingUp size={10} /> {formatted}
            </span>
        );
    };

    const getTypeLabel = (type) => {
        const typeMap = {
            'mcq_single': 'Single Choice',
            'mcq_multi': 'Multiple Choice',
            'short_answer': 'Short Answer',
            'numeric': 'Numeric',
            'true_false': 'True/False'
        };
        return typeMap[type] || type;
    };

    return (
        <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-sm hover:border-gray-900 hover:shadow-md transition-all group flex flex-col h-full relative overflow-hidden font-sans">

            {/* Top Row: Metadata & Actions */}
            <div className="flex justify-between items-start mb-4 gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    {/* Marks */}
                    <span className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-md text-[10px] font-black uppercase tracking-widest border border-gray-200 flex items-center gap-1">
                        <Award size={10} /> {question.marks || 1} Marks
                    </span>

                    {/* Subject */}
                    {question.subject?.name && (
                        <span className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-md text-[10px] font-black uppercase tracking-widest border border-gray-200 flex items-center gap-1">
                            <BookOpen size={10} /> {question.subject.name}
                        </span>
                    )}

                    {/* Type */}
                    {question.type && (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-[10px] font-black uppercase tracking-widest border border-blue-200">
                            {getTypeLabel(question.type)}
                        </span>
                    )}

                    {/* Difficulty */}
                    {getDifficultyBadge(question.difficulty)}
                </div>

                {/* Actions */}
                {showActions && (
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                            to={`/trainer/questions/${question._id}/edit`}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                            title="Edit Question"
                        >
                            <Edit2 size={16} />
                        </Link>

                        {onDelete && (
                            <button
                                onClick={() => onDelete(question._id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                title="Delete Question"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Question Prompt */}
            <div className="mb-5">
                <h3 className="text-lg font-black text-gray-900 leading-snug">
                    {question.prompt}
                </h3>
            </div>

            {/* Answer Choices */}
            {question.choices && question.choices.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    {question.choices.map((opt) => (
                        <div
                            key={opt.id}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${opt.isCorrect
                                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                                : "bg-gray-50 border-gray-100 text-gray-600"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`font-black ${opt.isCorrect ? 'text-emerald-700' : 'text-gray-400'}`}>
                                    {opt.id}.
                                </span>
                                <span>{opt.text}</span>
                            </div>
                            {opt.isCorrect && (
                                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                /* Non-MCQ Displays (e.g. Short Answer) */
                <div className="mb-2 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Correct Answer:</p>
                    <p className="text-sm font-black text-gray-900">{question.correct || "Manual Grading Required"}</p>
                </div>
            )}

            {/* Footer Stats & Tags */}
            {(question.tags?.length > 0 || question.timesUsed > 0 || question.averageScore > 0) && (
                <div className="mt-auto pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">

                    {/* Tags */}
                    {question.tags && question.tags.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                            <Tags size={12} className="text-gray-400 mr-1" />
                            {question.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-black uppercase tracking-widest"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    ) : <div />}

                    {/* Usage Stats */}
                    {(question.timesUsed > 0 || question.averageScore > 0) && (
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            {question.timesUsed > 0 && (
                                <span className="flex items-center gap-1">
                                    <Activity size={12} /> Used {question.timesUsed}x
                                </span>
                            )}
                            {question.averageScore > 0 && (
                                <span className="flex items-center gap-1">
                                    <CheckCircle2 size={12} className={question.averageScore > 70 ? "text-emerald-500" : "text-yellow-500"} />
                                    Avg: {question.averageScore.toFixed(1)}%
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuestionCard;