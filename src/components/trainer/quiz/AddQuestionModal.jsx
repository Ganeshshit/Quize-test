import React, { useState } from "react";
import { quizzesAPI } from "../../../api/quizzes.api";

const AddQuestionModal = ({ quizId, onClose, onAdded, reloadBank }) => {
    const [newQ, setNewQ] = useState({
        prompt: "",
        marks: 1,
        choices: [
            { id: "A", text: "", isCorrect: false },
            { id: "B", text: "", isCorrect: false },
            { id: "C", text: "", isCorrect: false },
            { id: "D", text: "", isCorrect: false },
        ],
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const hasCorrect = newQ.choices.some((ch) => ch.isCorrect);
        if (!hasCorrect) return alert("Select at least one correct option.");

        try {
            const res = await quizzesAPI.manualAddQuestion(quizId, newQ);

            // Add to UI instantly
            onAdded(res.data);

            // Reload question bank
            if (reloadBank) reloadBank();

            alert("Question added!");
            onClose();

        } catch (err) {
            alert("Failed to add question");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">✍️ Add Manual Question</h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Question Prompt */}
                    <div>
                        <label className="font-semibold block mb-2 text-gray-700">
                            Question Prompt
                        </label>

                        <textarea
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            required
                            value={newQ.prompt}
                            onChange={(e) =>
                                setNewQ({ ...newQ, prompt: e.target.value })
                            }
                            placeholder="Enter your question here..."
                        />
                    </div>

                    {/* Marks */}
                    <div>
                        <label className="font-semibold block mb-2 text-gray-700">Marks</label>
                        <input
                            type="number"
                            min="1"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            value={newQ.marks}
                            onChange={(e) =>
                                setNewQ({ ...newQ, marks: Number(e.target.value) })
                            }
                        />
                    </div>

                    {/* Choices */}
                    <div>
                        <label className="font-semibold block mb-2 text-gray-700">Choices</label>

                        <div className="grid grid-cols-1 gap-3">
                            {newQ.choices.map((choice, idx) => (
                                <div
                                    key={choice.id}
                                    className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg bg-gray-50"
                                >
                                    <input
                                        type="text"
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder={`Option ${choice.id}`}
                                        value={choice.text}
                                        onChange={(e) => {
                                            const updated = [...newQ.choices];
                                            updated[idx].text = e.target.value;
                                            setNewQ({ ...newQ, choices: updated });
                                        }}
                                        required
                                    />

                                    <label className="flex items-center gap-2 text-sm font-medium">
                                        <input
                                            type="checkbox"
                                            checked={choice.isCorrect}
                                            onChange={(e) => {
                                                const updated = [...newQ.choices];
                                                updated[idx].isCorrect = e.target.checked;
                                                setNewQ({ ...newQ, choices: updated });
                                            }}
                                        />
                                        Correct
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                        >
                            Add Question
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AddQuestionModal;
