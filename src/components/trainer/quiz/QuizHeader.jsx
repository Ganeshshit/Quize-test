import React from "react";
import { Link } from "react-router-dom";

const QuizHeader = ({ quiz }) => {
    if (!quiz) return null;

    return (
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {quiz.title}
            </h1>

            <p className="text-gray-600 mb-4">
                {quiz.subject?.name || "No Subject"} • {quiz.durationMinutes} mins • Total Marks: {quiz.totalMarks}
            </p>

            <Link
                to="/trainer/quizzes"
                className="text-blue-600 hover:underline font-medium"
            >
                ← Back to List
            </Link>
        </div>
    );
};

export default QuizHeader;
