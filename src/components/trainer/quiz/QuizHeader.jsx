// src/components/trainer/quiz/QuizHeader.jsx
import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, ArrowLeft } from "lucide-react";

const QuizHeader = ({ quiz }) => {
    if (!quiz) return null;

    return (
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 sm:p-8 mb-8 font-sans">

            <Link
                to="/trainer/quizzes"
                className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black uppercase tracking-widest mb-6 transition-colors"
            >
                <ArrowLeft size={14} /> Back to Quizzes
            </Link>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">

                    <div className="w-14 h-14 bg-[#0A0A0A] rounded-2xl flex items-center justify-center text-white shadow-sm flex-shrink-0">
                        <BookOpen size={28} className="text-yellow-400" />
                    </div>

                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-2">
                            {quiz.title}
                        </h1>
                        <p className="text-sm font-bold text-gray-500 mb-4 max-w-2xl">
                            {quiz.description || "No description provided for this quiz."}
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-200">
                                {quiz.subject?.name || "No Subject"}
                            </span>
                            <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-200">
                                {quiz.durationMinutes} MINS
                            </span>
                            <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-[10px] font-black uppercase tracking-widest border border-yellow-200">
                                {quiz.totalMarks} MARKS
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default QuizHeader;