// src/components/forms/QuestionForm.jsx
import React, { useEffect, useState } from "react";
import { subjectsAPI } from "../../api/subjects.api";
import { Plus, Trash2, Save, AlertCircle } from "lucide-react";

const QUESTION_TYPES = [
    { value: "mcq_single", label: "MCQ (Single Correct)" },
    { value: "mcq_multi", label: "MCQ (Multiple Correct)" },
    { value: "short_answer", label: "Short Answer" },
    { value: "numeric", label: "Numeric" },
];

const DIFFICULTIES = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
];

const defaultChoiceIds = ["A", "B", "C", "D"];

const QuestionForm = ({
    mode = "create", // 'create' | 'edit'
    initialQuestion = null, // full question object from API when editing
    onSubmit, // async function(payload)
}) => {
    const [subjects, setSubjects] = useState([]);
    const [loadingSubjects, setLoadingSubjects] = useState(true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        subject: "",
        type: "mcq_single",
        prompt: "",
        choices: defaultChoiceIds.map((id) => ({ id, text: "" })),
        correctSingle: "",
        correctMulti: [],
        correctText: "",
        correctNumeric: "",
        marks: 1,
        difficulty: "easy",
        tagsInput: "",
    });

    // Reusable premium input styling class
    const inputClasses = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all";
    const labelClasses = "block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2";

    // Load subjects
    useEffect(() => {
        const loadSubjects = async () => {
            try {
                setLoadingSubjects(true);
                const data = await subjectsAPI.getAll();
                let list = [];

                if (Array.isArray(data)) {
                    list = data;
                } else if (Array.isArray(data?.subjects)) {
                    list = data.subjects;
                } else if (Array.isArray(data?.data)) {
                    list = data.data;
                } else {
                    console.warn("Unexpected subjects API response:", data);
                }
                setSubjects(list);
            } catch (error) {
                console.error(error);
                setSubjects([]);
                setError("Failed to load subjects");
            } finally {
                setLoadingSubjects(false);
            }
        };
        loadSubjects();
    }, []);

    // Hydrate form for edit mode
    useEffect(() => {
        if (!initialQuestion) return;

        const {
            subject, type, prompt, choices = [], correct, marks, metadata = {},
        } = initialQuestion;

        const difficulty = metadata.difficulty || "easy";
        const tags = Array.isArray(metadata.tags) ? metadata.tags : [];
        const tagsInput = tags.join(", ");

        let correctSingle = "";
        let correctMulti = [];
        let correctText = "";
        let correctNumeric = "";

        if (type === "mcq_single" && typeof correct === "string") {
            correctSingle = correct;
        } else if (type === "mcq_multi" && Array.isArray(correct)) {
            correctMulti = correct;
        } else if (type === "short_answer") {
            correctText = (correct ?? "").toString();
        } else if (type === "numeric") {
            correctNumeric = (typeof correct === "number" || typeof correct === "string") ? correct.toString() : "";
        }

        const hydratedChoices = choices.length > 0
            ? choices
            : defaultChoiceIds.map((id) => ({ id, text: "" }));

        setForm((prev) => ({
            ...prev,
            subject: subject?._id || subject || "",
            type,
            prompt,
            choices: hydratedChoices,
            correctSingle,
            correctMulti,
            correctText,
            correctNumeric,
            marks: marks || 1,
            difficulty,
            tagsInput,
        }));
    }, [initialQuestion]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleChoiceChange = (index, value) => {
        const updated = [...form.choices];
        updated[index] = { ...updated[index], text: value };
        setForm((prev) => ({ ...prev, choices: updated }));
    };

    const addChoice = () => {
        const nextId = String.fromCharCode(65 + form.choices.length); // A, B, C...
        setForm((prev) => ({
            ...prev,
            choices: [...prev.choices, { id: nextId, text: "" }],
        }));
    };

    const removeChoice = (index) => {
        const updated = [...form.choices];
        updated.splice(index, 1);

        const updatedCorrectMulti = form.correctMulti.filter((id) => updated.some((c) => c.id === id));
        const correctSingle = updated.some((c) => c.id === form.correctSingle) ? form.correctSingle : "";

        setForm((prev) => ({
            ...prev,
            choices: updated,
            correctMulti: updatedCorrectMulti,
            correctSingle,
        }));
    };

    const toggleMultiCorrect = (choiceId) => {
        if (form.correctMulti.includes(choiceId)) {
            setForm((prev) => ({
                ...prev,
                correctMulti: prev.correctMulti.filter((id) => id !== choiceId),
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                correctMulti: [...prev.correctMulti, choiceId],
            }));
        }
    };

    const buildPayload = () => {
        const { subject, type, prompt, choices, marks, difficulty, tagsInput } = form;
        const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);

        let correct = null;
        if (type === "mcq_single") {
            correct = form.correctSingle || null;
        } else if (type === "mcq_multi") {
            correct = form.correctMulti;
        } else if (type === "short_answer") {
            correct = form.correctText || null;
        } else if (type === "numeric") {
            correct = form.correctNumeric === "" ? null : Number(form.correctNumeric);
        }

        return {
            subject,
            type,
            prompt: prompt.trim(),
            choices: (type === "mcq_single" || type === "mcq_multi") ? choices.filter((c) => c.text.trim() !== "") : [],
            correct,
            marks: Number(marks) || 1,
            metadata: { difficulty, tags },
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            setSubmitting(true);
            const payload = buildPayload();
            await onSubmit(payload);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || err?.message || "Something went wrong while saving the question");
        } finally {
            setSubmitting(false);
        }
    };

    const renderCorrectControls = () => {
        if (form.type === "mcq_single") {
            return (
                <div className="p-5 bg-yellow-50/50 border border-yellow-100 rounded-2xl">
                    <label className={labelClasses}>Correct Option (Single)</label>
                    <select
                        className={inputClasses}
                        value={form.correctSingle}
                        onChange={(e) => handleChange("correctSingle", e.target.value)}
                    >
                        <option value="">-- Select correct option --</option>
                        {form.choices.map((choice) => (
                            <option key={choice.id} value={choice.id}>
                                Option {choice.id}: {choice.text || "(empty)"}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }

        if (form.type === "mcq_multi") {
            return (
                <div className="p-5 bg-yellow-50/50 border border-yellow-100 rounded-2xl">
                    <label className={labelClasses}>Correct Options (Multiple)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        {form.choices.map((choice) => (
                            <label key={choice.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-yellow-400 transition-colors">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 accent-yellow-400 cursor-pointer"
                                    checked={form.correctMulti.includes(choice.id)}
                                    onChange={() => toggleMultiCorrect(choice.id)}
                                />
                                <span className="text-sm font-bold text-gray-800">
                                    {choice.id}. <span className="font-medium text-gray-600">{choice.text || "(empty)"}</span>
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            );
        }

        if (form.type === "short_answer") {
            return (
                <div className="p-5 bg-yellow-50/50 border border-yellow-100 rounded-2xl">
                    <label className={labelClasses}>Expected Answer (optional)</label>
                    <textarea
                        className={inputClasses}
                        rows={2}
                        placeholder="Reference answer for grading..."
                        value={form.correctText}
                        onChange={(e) => handleChange("correctText", e.target.value)}
                    />
                </div>
            );
        }

        if (form.type === "numeric") {
            return (
                <div className="p-5 bg-yellow-50/50 border border-yellow-100 rounded-2xl">
                    <label className={labelClasses}>Correct Numeric Answer</label>
                    <input
                        type="number"
                        className={inputClasses}
                        placeholder="e.g. 42"
                        value={form.correctNumeric}
                        onChange={(e) => handleChange("correctNumeric", e.target.value)}
                    />
                </div>
            );
        }
        return null;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">

            {/* Error Alert */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
                    <AlertCircle size={20} />
                    <span className="text-sm font-bold">{error}</span>
                </div>
            )}

            {/* Subject & Type Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelClasses}>Subject <span className="text-red-500">*</span></label>
                    {loadingSubjects ? (
                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 font-medium">
                            Loading subjects...
                        </div>
                    ) : (
                        <select
                            className={inputClasses}
                            value={form.subject}
                            onChange={(e) => handleChange("subject", e.target.value)}
                            required
                        >
                            <option value="">-- Select Subject --</option>
                            {subjects.map((subj) => (
                                <option key={subj._id} value={subj._id}>
                                    {subj.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div>
                    <label className={labelClasses}>Question Type <span className="text-red-500">*</span></label>
                    <select
                        className={inputClasses}
                        value={form.type}
                        onChange={(e) => handleChange("type", e.target.value)}
                        required
                    >
                        {QUESTION_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Prompt */}
            <div>
                <label className={labelClasses}>Question Text <span className="text-red-500">*</span></label>
                <textarea
                    className={inputClasses}
                    rows={4}
                    placeholder="Type the question prompt here..."
                    value={form.prompt}
                    onChange={(e) => handleChange("prompt", e.target.value)}
                    required
                />
            </div>

            {/* Choices (MCQ) */}
            {(form.type === "mcq_single" || form.type === "mcq_multi") && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-widest m-0">
                            Options <span className="text-red-500">*</span>
                        </label>
                        <button
                            type="button"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
                            onClick={addChoice}
                        >
                            <Plus size={14} /> Add Option
                        </button>
                    </div>

                    <div className="space-y-3">
                        {form.choices.map((choice, index) => (
                            <div key={choice.id} className="flex gap-3 items-center">
                                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white border border-gray-200 rounded-xl font-black text-gray-600 shadow-sm">
                                    {choice.id}
                                </div>
                                <input
                                    type="text"
                                    className={inputClasses}
                                    placeholder={`Enter text for option ${choice.id}`}
                                    value={choice.text}
                                    onChange={(e) => handleChoiceChange(index, e.target.value)}
                                    required
                                />
                                {form.choices.length > 2 && (
                                    <button
                                        type="button"
                                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                        onClick={() => removeChoice(index)}
                                        title="Remove option"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Correct Answer Controls */}
            {renderCorrectControls()}

            {/* Marks, Difficulty, Tags Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
                <div>
                    <label className={labelClasses}>Marks <span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        min={0}
                        className={inputClasses}
                        value={form.marks}
                        onChange={(e) => handleChange("marks", e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className={labelClasses}>Difficulty</label>
                    <select
                        className={inputClasses}
                        value={form.difficulty}
                        onChange={(e) => handleChange("difficulty", e.target.value)}
                    >
                        {DIFFICULTIES.map((d) => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className={labelClasses}>Tags</label>
                    <input
                        type="text"
                        className={inputClasses}
                        placeholder="comma, separated"
                        value={form.tagsInput}
                        onChange={(e) => handleChange("tagsInput", e.target.value)}
                    />
                </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 flex justify-end">
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-[#0A0A0A] hover:bg-black text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                    {submitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <><Save size={18} /> {mode === "create" ? "Create Question" : "Save Changes"}</>
                    )}
                </button>
            </div>
        </form>
    );
};

export default QuestionForm;