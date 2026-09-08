import React from "react";
import { Link } from "react-router-dom";
import { Edit3, Trash2, Tag, Book, BarChart, CheckCircle2 } from "lucide-react";

const QuestionCard = ({ question, onDelete }) => {
    // Format the question type for display
    const formatType = (type) => {
        const types = {
            mcq_single: "Single Choice",
            mcq_multi: "Multiple Choice",
            short_answer: "Short Answer",
            numeric: "Numeric",
            true_false: "True / False",
        };
        return types[type] || type;
    };

    // Determine difficulty badge colors
    const getDifficultyStyles = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case "easy":
                return "bg-green-100 text-green-800 border-green-200";
            case "medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "hard":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col sm:flex-row sm:items-start justify-between gap-6">

            {/* Left Side: Question Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0A0A0A] text-yellow-400 text-[10px] font-black uppercase tracking-widest rounded-md">
                        <CheckCircle2 size={12} />
                        {question.marks || 1} {question.marks === 1 ? "Mark" : "Marks"}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border ${getDifficultyStyles(question.difficulty)}`}>
                        {question.difficulty || "Unrated"}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-md border border-gray-200">
                        <Tag size={12} />
                        {formatType(question.type)}
                    </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug mb-4 group-hover:text-yellow-600 transition-colors">
                    {question.prompt}
                </h3>

                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {question.subject?.name && (
                        <div className="flex items-center gap-1.5">
                            <Book size={14} />
                            {question.subject.name}
                        </div>
                    )}
                    {question.tags && question.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 border-l border-gray-200 pl-4">
                            <BarChart size={14} />
                            {question.tags.join(", ")}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side: Actions */}
            <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6">
                <Link
                    to={`/trainer/questions/edit/${question._id}`}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-gray-50 text-gray-700 hover:bg-yellow-400 hover:text-black rounded-xl font-bold text-xs uppercase tracking-widest transition-colors border border-gray-200 hover:border-yellow-400"
                >
                    <Edit3 size={14} />
                    <span>Edit</span>
                </Link>
                <button
                    onClick={() => onDelete(question._id)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-gray-50 text-red-600 hover:bg-red-500 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors border border-gray-200 hover:border-red-500"
                >
                    <Trash2 size={14} />
                    <span>Delete</span>
                </button>
            </div>

        </div>
    );
};

export default QuestionCard;