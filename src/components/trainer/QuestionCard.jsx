// src/components/trainer/QuestionCard.jsx

import React from "react";
import { Link } from "react-router-dom";

const QuestionCard = ({ question, onDelete }) => {
    const correctIds = question.choices
        ?.filter((c) => c.isCorrect)
        .map((c) => c.id)
        .join(", ");

    return (
        <div className="bg-white border rounded-xl shadow-sm p-5 hover:shadow-md transition-all duration-200">
            {/* QUESTION HEADER */}
            <div className="flex justify-between items-start gap-4">
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 leading-snug">
                        {question.prompt}
                    </h3>

                    <p className="text-gray-500 text-sm mt-1">
                        Subject:{" "}
                        <span className="font-medium text-gray-700">
                            {question.subject?.name || "No Subject"}
                        </span>
                    </p>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-col gap-2 shrink-0">
                    <Link
                        to={`/trainer/questions/${question._id}/edit`}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Edit
                    </Link>

                    {onDelete && (
                        <button
                            onClick={() => onDelete(question._id)}
                            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>

            {/* OPTIONS LIST */}
            <div className="mt-4">
                <p className="font-semibold text-gray-700 mb-1">Options:</p>

                <ul className="space-y-2">
                    {question.choices?.map((opt) => (
                        <li
                            key={opt.id}
                            className={`p-2 rounded-lg border text-sm ${opt.isCorrect
                                    ? "bg-green-50 border-green-400 font-medium"
                                    : "bg-gray-50 border-gray-300"
                                }`}
                        >
                            <span className="font-semibold">{opt.id}.</span>{" "}
                            {opt.text}
                        </li>
                    ))}
                </ul>

                {/* CORRECT ANSWERS */}
                <p className="mt-3 text-sm">
                    <span className="font-semibold text-gray-700">
                        Correct Answer:
                    </span>{" "}
                    <span className="text-green-700 font-medium">
                        {correctIds || "Not marked"}
                    </span>
                </p>

                {/* DIFFICULTY */}
                {question.difficulty && (
                    <p className="mt-1 text-sm text-gray-500">
                        Difficulty:{" "}
                        <span className="font-medium">{question.difficulty}</span>
                    </p>
                )}
            </div>
        </div>
    );
};

export default QuestionCard;
