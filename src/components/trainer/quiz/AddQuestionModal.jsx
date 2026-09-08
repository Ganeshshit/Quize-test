// src/components/trainer/quiz/AddQuestionModal.jsx
import React, { useState } from "react";
import { X, Plus, Award, CheckCircle, AlertCircle, Radio, CheckSquare, Loader2 } from "lucide-react";

const AddQuestionModal = ({ quizId, onClose, onAdded, reloadBank }) => {
    const [questionType, setQuestionType] = useState("mcq"); // mcq or msq
    const [isSubmitting, setIsSubmitting] = useState(false);
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
            setIsSubmitting(true);
            const questionData = { ...newQ, type: questionType };
            const res = await manualAddQuestion(quizId, questionData);

            // Add to UI instantly
            onAdded(res.data);

            // Reload question bank
            if (reloadBank) reloadBank();

            onClose();

        } catch (err) {
            alert("Failed to add question");
            setIsSubmitting(false);
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
    const inputClasses = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up relative">

                {/* Header */}
                <div className="flex items-center justify-between p-6 sm:p-8 border-b border-gray-100 relative z-10 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#0A0A0A] rounded-2xl flex items-center justify-center text-white shadow-sm flex-shrink-0">
                            <Plus size={24} className="text-yellow-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Create Manual Question</h2>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Add a new question directly to this quiz</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 bg-gray-50/30">

                    {/* Section: Question Type */}
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                            1. Select Format <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => handleTypeChange("mcq")}
                                className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${questionType === "mcq"
                                    ? "border-yellow-400 bg-white shadow-md"
                                    : "border-gray-200 bg-white hover:border-gray-300"
                                    }`}
                            >
                                {questionType === "mcq" && (
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-400 rounded-bl-full opacity-10 pointer-events-none"></div>
                                )}
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-xl mt-1 ${questionType === "mcq" ? "bg-yellow-400 text-black" : "bg-gray-100 text-gray-400"}`}>
                                        <Radio size={20} />
                                    </div>
                                    <div>
                                        <h4 className={`text-base font-black ${questionType === "mcq" ? "text-gray-900" : "text-gray-700"}`}>
                                            Single Choice (MCQ)
                                        </h4>
                                        <p className="text-xs font-bold text-gray-500 mt-1">Students can only select one correct answer.</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleTypeChange("msq")}
                                className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${questionType === "msq"
                                    ? "border-[#0A0A0A] bg-white shadow-md"
                                    : "border-gray-200 bg-white hover:border-gray-300"
                                    }`}
                            >
                                {questionType === "msq" && (
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#0A0A0A] rounded-bl-full opacity-5 pointer-events-none"></div>
                                )}
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-xl mt-1 ${questionType === "msq" ? "bg-[#0A0A0A] text-white" : "bg-gray-100 text-gray-400"}`}>
                                        <CheckSquare size={20} />
                                    </div>
                                    <div>
                                        <h4 className={`text-base font-black ${questionType === "msq" ? "text-gray-900" : "text-gray-700"}`}>
                                            Multiple Choice (MSQ)
                                        </h4>
                                        <p className="text-xs font-bold text-gray-500 mt-1">Students must select two or more correct answers.</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Section: Question Prompt */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-3">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                2. Question Prompt <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <textarea
                                    className={`${inputClasses} resize-none min-h-[120px]`}
                                    value={newQ.prompt}
                                    onChange={(e) => setNewQ({ ...newQ, prompt: e.target.value })}
                                    placeholder="Type your question here..."
                                />
                                <span className="absolute bottom-3 right-4 text-[10px] font-bold text-gray-400">
                                    {newQ.prompt.length} chars
                                </span>
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                <Award size={12} className="text-yellow-500" /> Marks
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                className={inputClasses}
                                value={newQ.marks}
                                onChange={(e) => setNewQ({ ...newQ, marks: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    {/* Section: Choices */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                3. Answer Choices <span className="text-red-500">*</span>
                            </label>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-gray-200">
                                {correctAnswerCount > 0 ? (
                                    <>
                                        <CheckCircle size={12} className="text-emerald-500" />
                                        {correctAnswerCount} Selected
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle size={12} className="text-red-500" />
                                        Needs Answer
                                    </>
                                )}
                            </span>
                        </div>

                        {validationMessage && (
                            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700">
                                <AlertCircle size={16} className="flex-shrink-0" />
                                <p className="text-xs font-bold">{validationMessage}</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            {newQ.choices.map((choice, idx) => (
                                <div
                                    key={choice.id}
                                    className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-2xl border-2 transition-all bg-white ${choice.isCorrect
                                        ? "border-emerald-400 shadow-sm"
                                        : "border-gray-200"
                                        }`}
                                >
                                    <div className="flex flex-1 items-center gap-3">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl font-black text-sm flex-shrink-0 transition-colors ${choice.isCorrect
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-gray-100 text-gray-500"
                                            }`}>
                                            {choice.id}
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-900 p-0 placeholder-gray-400"
                                            placeholder={`Enter option ${choice.id} text...`}
                                            value={choice.text}
                                            onChange={(e) => updateChoice(idx, "text", e.target.value)}
                                        />
                                    </div>

                                    <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-colors border-2 sm:w-auto w-full justify-center ${choice.isCorrect
                                        ? "bg-emerald-50 border-emerald-200"
                                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                        }`}>
                                        {questionType === "mcq" ? (
                                            <input
                                                type="radio"
                                                name="correct-answer"
                                                checked={choice.isCorrect}
                                                onChange={(e) => updateChoice(idx, "isCorrect", e.target.checked)}
                                                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                                            />
                                        ) : (
                                            <input
                                                type="checkbox"
                                                checked={choice.isCorrect}
                                                onChange={(e) => updateChoice(idx, "isCorrect", e.target.checked)}
                                                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                                            />
                                        )}
                                        <span className={`text-xs font-black uppercase tracking-widest ${choice.isCorrect ? "text-emerald-700" : "text-gray-500"}`}>
                                            Mark Correct
                                        </span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-white border-t border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:block">
                        Creating <span className="text-gray-900">{questionType.toUpperCase()}</span> Question
                    </p>
                    <div className="flex w-full sm:w-auto gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-all"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-[#0A0A0A] hover:bg-black text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <><Loader2 size={18} className="animate-spin" /> Adding...</>
                            ) : (
                                <><Plus size={18} /> Add to Quiz</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddQuestionModal;