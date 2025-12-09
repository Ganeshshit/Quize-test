// src/components/trainer/QuestionCard.jsx

import React from "react";
import { Link } from "react-router-dom";
import { Edit2, Trash2, Check, X, BookOpen, Award, TrendingUp } from "lucide-react";

const QuestionCard = ({ question, onDelete, showActions = true }) => {
    const correctIds = question.choices
        ?.filter((c) => c.isCorrect)
        .map((c) => c.id)
        .join(", ");

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy':
                return 'bg-green-100 text-green-700 border-green-300';
            case 'medium':
                return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'hard':
                return 'bg-red-100 text-red-700 border-red-300';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-300';
        }
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
        <div className="group relative bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-2xl shadow-md hover:shadow-xl hover:border-blue-300 transition-all duration-300 overflow-hidden">
            {/* Decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

            <div className="p-6">
                {/* QUESTION HEADER */}
                <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 leading-snug mb-3 line-clamp-2">
                            {question.prompt}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2">
                            {/* Subject Badge */}
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                                <BookOpen className="w-4 h-4" />
                                {question.subject?.name || "No Subject"}
                            </span>

                            {/* Type Badge */}
                            {question.type && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium border border-purple-200">
                                    {getTypeLabel(question.type)}
                                </span>
                            )}

                            {/* Marks Badge */}
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200">
                                <Award className="w-4 h-4" />
                                {question.marks || 1} {question.marks === 1 ? 'mark' : 'marks'}
                            </span>

                            {/* Difficulty Badge */}
                            {question.difficulty && (
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${getDifficultyColor(question.difficulty)}`}>
                                    <TrendingUp className="w-4 h-4" />
                                    {question.difficulty}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    {showActions && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Link
                                to={`/trainer/questions/${question._id}/edit`}
                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium text-sm"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit
                            </Link>

                            {onDelete && (
                                <button
                                    onClick={() => onDelete(question._id)}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg font-medium text-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* OPTIONS LIST */}
                {question.choices && question.choices.length > 0 && (
                    <div className="mt-5">
                        <p className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">
                            Answer Choices:
                        </p>

                        <div className="grid gap-2">
                            {question.choices.map((opt) => (
                                <div
                                    key={opt.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${opt.isCorrect
                                            ? "bg-green-50 border-green-400 shadow-sm"
                                            : "bg-slate-50 border-slate-200 hover:border-slate-300"
                                        }`}
                                >
                                    <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${opt.isCorrect
                                            ? "bg-green-500 text-white shadow-md"
                                            : "bg-slate-300 text-slate-700"
                                        }`}>
                                        {opt.id}
                                    </span>

                                    <span className={`flex-1 text-sm ${opt.isCorrect ? "font-medium text-slate-800" : "text-slate-600"
                                        }`}>
                                        {opt.text}
                                    </span>

                                    {opt.isCorrect ? (
                                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    ) : (
                                        <X className="w-5 h-5 text-slate-300 flex-shrink-0" />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* CORRECT ANSWERS SUMMARY */}
                        <div className="mt-4 p-3 bg-green-50 border-2 border-green-200 rounded-xl">
                            <p className="text-sm">
                                <span className="font-semibold text-green-800">
                                    Correct Answer{correctIds.includes(',') ? 's' : ''}:
                                </span>{" "}
                                <span className="text-green-700 font-bold">
                                    {correctIds || "Not marked"}
                                </span>
                            </p>
                        </div>
                    </div>
                )}

                {/* For non-MCQ questions */}
                {(!question.choices || question.choices.length === 0) && (
                    <div className="mt-5 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl">
                        <p className="text-sm text-slate-600">
                            <span className="font-semibold text-slate-700">Type:</span> {getTypeLabel(question.type)}
                        </p>
                        {question.correct && (
                            <p className="text-sm text-slate-600 mt-2">
                                <span className="font-semibold text-slate-700">Correct Answer:</span>{" "}
                                <span className="font-medium text-green-600">{question.correct}</span>
                            </p>
                        )}
                    </div>
                )}

                {/* Tags */}
                {question.tags && question.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tags:</span>
                        {question.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium border border-slate-200"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Usage Stats */}
                {(question.timesUsed > 0 || question.averageScore > 0) && (
                    <div className="mt-4 pt-4 border-t-2 border-slate-200 flex items-center gap-4 text-xs text-slate-500">
                        {question.timesUsed > 0 && (
                            <span>
                                <span className="font-semibold text-slate-700">Used:</span> {question.timesUsed} times
                            </span>
                        )}
                        {question.averageScore > 0 && (
                            <span>
                                <span className="font-semibold text-slate-700">Avg Score:</span> {question.averageScore.toFixed(1)}%
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionCard;