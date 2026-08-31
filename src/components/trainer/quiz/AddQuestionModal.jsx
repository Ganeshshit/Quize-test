import React, { useState } from "react";
import { X, Plus, Award, CheckCircle, AlertCircle, Radio, CheckSquare } from "lucide-react";

const AddQuestionModal = ({ quizId, onClose, onAdded, reloadBank }) => {
    const [questionType, setQuestionType] = useState("mcq"); // mcq or msq
    const [newQ, setNewQ] = useState({
        prompt: "",
        marks: 1,
        type: "mcq",
        choices: [
            { id: "A", text: "", isCorrect: false },
            { id: "B", text: "", isCorrect: false },
            { id: "C", text: "", isCorrect: false },
            { id: "D", text: "", isCorrect: false },
        ],
    });

    // Mock API call - replace with actual API
    const manualAddQuestion = async (quizId, question) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ data: { ...question, _id: Date.now().toString() } });
            }, 1000);
        });
    };

    const handleSubmit = async () => {
        const hasCorrect = newQ.choices.some((ch) => ch.isCorrect);
        if (!hasCorrect) {
            alert("Please select at least one correct option.");
            return;
        }

        if (!newQ.prompt.trim()) {
            alert("Please enter a question prompt.");
            return;
        }

        const hasEmptyChoice = newQ.choices.some((ch) => !ch.text.trim());
        if (hasEmptyChoice) {
            alert("Please fill in all answer choices.");
            return;
        }

        // Validate MCQ has exactly one correct answer
        if (questionType === "mcq" && correctAnswerCount !== 1) {
            alert("MCQ (Single Choice) must have exactly one correct answer.");
            return;
        }

        // Validate MSQ has at least 2 correct answers
        if (questionType === "msq" && correctAnswerCount < 2) {
            alert("MSQ (Multiple Choice) must have at least two correct answers.");
            return;
        }

        try {
            const questionData = { ...newQ, type: questionType };
            const res = await manualAddQuestion(quizId, questionData);

            // Add to UI instantly
            onAdded(res.data);

            // Reload question bank
            if (reloadBank) reloadBank();

            alert(`Question added successfully as ${questionType.toUpperCase()}!`);
            onClose();

        } catch (err) {
            alert("Failed to add question");
        }
    };

    const updateChoice = (idx, field, value) => {
        const updated = [...newQ.choices];

        // For MCQ (radio behavior), uncheck all others when checking one
        if (questionType === "mcq" && field === "isCorrect" && value === true) {
            updated.forEach((choice, i) => {
                choice.isCorrect = i === idx;
            });
        } else {
            updated[idx][field] = value;
        }

        setNewQ({ ...newQ, choices: updated });
    };

    const handleTypeChange = (type) => {
        setQuestionType(type);

        // Reset correct answers when changing type
        const resetChoices = newQ.choices.map(choice => ({
            ...choice,
            isCorrect: false
        }));

        setNewQ({ ...newQ, type, choices: resetChoices });
    };

    const correctAnswerCount = newQ.choices.filter(ch => ch.isCorrect).length;

    // Validation messages
    const getValidationMessage = () => {
        if (questionType === "mcq" && correctAnswerCount > 1) {
            return "MCQ must have exactly one correct answer. Please uncheck other options.";
        }
        if (questionType === "msq" && correctAnswerCount === 1) {
            return "MSQ must have at least two correct answers. Please select one more option.";
        }
        return null;
    };

    const validationMessage = getValidationMessage();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                            <Plus className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Add Manual Question</h2>
                            <p className="text-blue-100 text-sm font-medium">Create MCQ or MSQ question for your quiz</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Question Type Selection */}
                    <div>
                        <label className="font-bold block mb-3 text-gray-800 text-lg flex items-center gap-2">
                            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-sm font-semibold">Required</span>
                            Question Type
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => handleTypeChange("mcq")}
                                className={`p-5 rounded-xl border-3 transition-all ${questionType === "mcq"
                                        ? "border-blue-500 bg-blue-50 shadow-lg"
                                        : "border-gray-300 bg-white hover:bg-gray-50"
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-lg ${questionType === "mcq" ? "bg-blue-600" : "bg-gray-400"
                                        }`}>
                                        <Radio className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <p className={`font-bold text-lg ${questionType === "mcq" ? "text-blue-700" : "text-gray-700"
                                            }`}>
                                            MCQ (Single Choice)
                                        </p>
                                        <p className="text-sm text-gray-600 font-medium">
                                            Only one correct answer
                                        </p>
                                    </div>
                                </div>
                                {questionType === "mcq" && (
                                    <div className="mt-3 pt-3 border-t border-blue-200">
                                        <p className="text-xs text-blue-700 font-semibold">✓ Selected</p>
                                    </div>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => handleTypeChange("msq")}
                                className={`p-5 rounded-xl border-3 transition-all ${questionType === "msq"
                                        ? "border-purple-500 bg-purple-50 shadow-lg"
                                        : "border-gray-300 bg-white hover:bg-gray-50"
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-lg ${questionType === "msq" ? "bg-purple-600" : "bg-gray-400"
                                        }`}>
                                        <CheckSquare className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <p className={`font-bold text-lg ${questionType === "msq" ? "text-purple-700" : "text-gray-700"
                                            }`}>
                                            MSQ (Multiple Choice)
                                        </p>
                                        <p className="text-sm text-gray-600 font-medium">
                                            Two or more correct answers
                                        </p>
                                    </div>
                                </div>
                                {questionType === "msq" && (
                                    <div className="mt-3 pt-3 border-t border-purple-200">
                                        <p className="text-xs text-purple-700 font-semibold">✓ Selected</p>
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Question Prompt */}
                    <div>
                        <label className="font-bold block mb-3 text-gray-800 text-lg flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-semibold">Required</span>
                            Question Prompt
                        </label>
                        <textarea
                            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                            rows="4"
                            value={newQ.prompt}
                            onChange={(e) =>
                                setNewQ({ ...newQ, prompt: e.target.value })
                            }
                            placeholder="Enter your question here..."
                        />
                        <p className="text-xs text-gray-500 mt-2 font-medium">
                            {newQ.prompt.length} characters
                        </p>
                    </div>

                    {/* Marks */}
                    <div>
                        <label className="font-bold block mb-3 text-gray-800 text-lg flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-600" />
                            Marks
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            value={newQ.marks}
                            onChange={(e) =>
                                setNewQ({ ...newQ, marks: Number(e.target.value) })
                            }
                        />
                    </div>

                    {/* Choices */}
                    <div>
                        <label className="font-bold block mb-3 text-gray-800 text-lg flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-sm font-semibold ${questionType === "mcq"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-purple-100 text-purple-700"
                                    }`}>
                                    Required
                                </span>
                                Answer Choices {questionType === "mcq" ? "(Select One)" : "(Select Multiple)"}
                            </span>
                            <span className="text-sm text-gray-600 font-medium flex items-center gap-2">
                                {correctAnswerCount > 0 ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        {correctAnswerCount} correct {correctAnswerCount === 1 ? "answer" : "answers"} selected
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="w-4 h-4 text-amber-600" />
                                        {questionType === "mcq" ? "Select one correct answer" : "Select at least two correct answers"}
                                    </>
                                )}
                            </span>
                        </label>

                        {/* Validation Warning for MSQ/MCQ */}
                        {validationMessage && (
                            <div className="mb-4 bg-amber-50 border-2 border-amber-300 rounded-xl p-3 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                <p className="text-sm text-amber-800 font-bold">{validationMessage}</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            {newQ.choices.map((choice, idx) => (
                                <div
                                    key={choice.id}
                                    className={`flex items-center gap-3 border-2 p-4 rounded-xl transition-all ${choice.isCorrect
                                            ? "border-green-400 bg-green-50 shadow-md"
                                            : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                                        }`}
                                >
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-lg shadow-md flex-shrink-0 ${questionType === "mcq"
                                            ? "bg-gradient-to-br from-blue-600 to-blue-700"
                                            : "bg-gradient-to-br from-purple-600 to-purple-700"
                                        }`}>
                                        {choice.id}
                                    </div>

                                    <input
                                        type="text"
                                        className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        placeholder={`Enter option ${choice.id}`}
                                        value={choice.text}
                                        onChange={(e) => updateChoice(idx, "text", e.target.value)}
                                    />

                                    <label className="flex items-center gap-2 text-sm font-bold cursor-pointer bg-white px-4 py-2.5 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition">
                                        {questionType === "mcq" ? (
                                            <input
                                                type="radio"
                                                name="correct-answer"
                                                checked={choice.isCorrect}
                                                onChange={(e) => updateChoice(idx, "isCorrect", e.target.checked)}
                                                className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <input
                                                type="checkbox"
                                                checked={choice.isCorrect}
                                                onChange={(e) => updateChoice(idx, "isCorrect", e.target.checked)}
                                                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                                            />
                                        )}
                                        <span className={choice.isCorrect ? "text-green-700" : "text-gray-700"}>
                                            Correct
                                        </span>
                                    </label>
                                </div>
                            ))}
                        </div>

                        {/* Helper Text */}
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs text-blue-700 font-semibold">
                                {questionType === "mcq"
                                    ? "💡 MCQ Tip: Use radio buttons to select exactly one correct answer"
                                    : "💡 MSQ Tip: Use checkboxes to select multiple correct answers (minimum 2)"}
                            </p>
                        </div>
                    </div>

                    {/* Validation Info */}
                    {(!newQ.prompt.trim() || newQ.choices.some(ch => !ch.text.trim()) || correctAnswerCount === 0 || validationMessage) && (
                        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-800">
                                <p className="font-bold mb-1">Complete the following to add this question:</p>
                                <ul className="space-y-1 font-medium">
                                    {!newQ.prompt.trim() && <li>• Enter a question prompt</li>}
                                    {newQ.choices.some(ch => !ch.text.trim()) && <li>• Fill in all answer choices</li>}
                                    {questionType === "mcq" && correctAnswerCount === 0 && <li>• Select exactly one correct answer</li>}
                                    {questionType === "mcq" && correctAnswerCount > 1 && <li>• Select only one correct answer (currently {correctAnswerCount} selected)</li>}
                                    {questionType === "msq" && correctAnswerCount < 2 && <li>• Select at least two correct answers</li>}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t-2 border-gray-200 p-6 flex justify-between items-center">
                    <div className="text-sm text-gray-600 font-medium">
                        Question Type: <span className={`font-bold ${questionType === "mcq" ? "text-blue-700" : "text-purple-700"
                            }`}>
                            {questionType === "mcq" ? "MCQ (Single Choice)" : "MSQ (Multiple Choice)"}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-100 transition font-bold border-2 border-gray-300 shadow-sm"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            className={`px-8 py-3 rounded-xl transition font-bold shadow-lg hover:shadow-xl flex items-center gap-2 ${questionType === "mcq"
                                    ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                                    : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                                }`}
                        >
                            <Plus className="w-5 h-5" />
                            Add {questionType.toUpperCase()} Question
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddQuestionModal;