// src/components/forms/QuestionForm.jsx
import React, { useEffect, useState } from "react";
import { subjectsAPI } from "../../api/subjects.api";

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
        correctSingle: "", // for mcq_single
        correctMulti: [], // for mcq_multi
        correctText: "", // for short_answer
        correctNumeric: "", // for numeric
        marks: 1,
        difficulty: "easy",
        tagsInput: "",
    });

    // Load subjects
    useEffect(() => {
        const loadSubjects = async () => {
            try {
                setLoadingSubjects(true);

                const data = await subjectsAPI.getAll();

                let list = [];

                if (Array.isArray(data)) {
                    // API returns an array directly
                    list = data;
                } else if (Array.isArray(data?.subjects)) {
                    // API returns { subjects: [...] }
                    list = data.subjects;
                } else if (Array.isArray(data?.data)) {
                    // API returns { data: [...] }
                    list = data.data;
                } else {
                    console.warn("Unexpected subjects API response:", data);
                }

                setSubjects(list);
            } catch (error) {
                console.error(error);
                setSubjects([]); // ensure subjects is always an array
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
            subject,
            type,
            prompt,
            choices = [],
            correct,
            marks,
            metadata = {},
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
            correctNumeric =
                typeof correct === "number" || typeof correct === "string"
                    ? correct.toString()
                    : "";
        }

        const hydratedChoices =
            choices.length > 0
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

        const updatedCorrectMulti = form.correctMulti.filter(
            (id) => updated.some((c) => c.id === id) // keep only still-existing ids
        );
        const correctSingle =
            updated.some((c) => c.id === form.correctSingle) ? form.correctSingle : "";

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
        const { subject, type, prompt, choices, marks, difficulty, tagsInput } =
            form;

        const tags = tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        let correct = null;

        if (type === "mcq_single") {
            correct = form.correctSingle || null;
        } else if (type === "mcq_multi") {
            correct = form.correctMulti;
        } else if (type === "short_answer") {
            correct = form.correctText || null;
        } else if (type === "numeric") {
            correct =
                form.correctNumeric === "" ? null : Number(form.correctNumeric);
        }

        const payload = {
            subject,
            type,
            prompt: prompt.trim(),
            choices:
                type === "mcq_single" || type === "mcq_multi"
                    ? choices.filter((c) => c.text.trim() !== "")
                    : [],
            correct,
            marks: Number(marks) || 1,
            metadata: {
                difficulty,
                tags,
            },
        };

        return payload;
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
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Something went wrong while saving the question"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const renderCorrectControls = () => {
        if (form.type === "mcq_single") {
            return (
                <div className="space-y-2">
                    <label className="block text-sm font-medium">
                        Correct Option (Single)
                    </label>
                    <select
                        className="w-full p-2 border rounded"
                        value={form.correctSingle}
                        onChange={(e) => handleChange("correctSingle", e.target.value)}
                    >
                        <option value="">Select correct option</option>
                        {form.choices.map((choice) => (
                            <option key={choice.id} value={choice.id}>
                                {choice.id}. {choice.text || "(empty)"}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }

        if (form.type === "mcq_multi") {
            return (
                <div className="space-y-2">
                    <label className="block text-sm font-medium">
                        Correct Options (Multiple)
                    </label>
                    <div className="space-y-1">
                        {form.choices.map((choice) => (
                            <label key={choice.id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={form.correctMulti.includes(choice.id)}
                                    onChange={() => toggleMultiCorrect(choice.id)}
                                />
                                <span>
                                    {choice.id}. {choice.text || "(empty)"}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            );
        }

        if (form.type === "short_answer") {
            return (
                <div className="space-y-2">
                    <label className="block text-sm font-medium">
                        Expected Answer (optional)
                    </label>
                    <textarea
                        className="w-full p-2 border rounded"
                        rows={3}
                        placeholder="Reference answer (can be used for semi-auto grading)"
                        value={form.correctText}
                        onChange={(e) => handleChange("correctText", e.target.value)}
                    />
                </div>
            );
        }

        if (form.type === "numeric") {
            return (
                <div className="space-y-2">
                    <label className="block text-sm font-medium">
                        Correct Numeric Answer
                    </label>
                    <input
                        type="number"
                        className="w-full p-2 border rounded"
                        value={form.correctNumeric}
                        onChange={(e) => handleChange("correctNumeric", e.target.value)}
                    />
                </div>
            );
        }

        return null;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
            {error && (
                <div className="p-3 rounded bg-red-100 text-red-800 text-sm">
                    {error}
                </div>
            )}

            {/* Subject & Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Subject <span className="text-red-500">*</span>
                    </label>
                    {loadingSubjects ? (
                        <div className="text-sm text-gray-500">Loading subjects...</div>
                    ) : (
                        <select
                            className="w-full p-2 border rounded"
                            value={form.subject}
                            onChange={(e) => handleChange("subject", e.target.value)}
                            required
                        >
                            <option value="">Select subject</option>
                            {subjects.map((subj) => (
                                <option key={subj._id} value={subj._id}>
                                    {subj.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Question Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        className="w-full p-2 border rounded"
                        value={form.type}
                        onChange={(e) => handleChange("type", e.target.value)}
                        required
                    >
                        {QUESTION_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                                {t.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Prompt */}
            <div>
                <label className="block text-sm font-medium mb-1">
                    Question Text <span className="text-red-500">*</span>
                </label>
                <textarea
                    className="w-full p-2 border rounded"
                    rows={4}
                    placeholder="Enter the question prompt"
                    value={form.prompt}
                    onChange={(e) => handleChange("prompt", e.target.value)}
                    required
                />
            </div>

            {/* Choices (MCQ) */}
            {(form.type === "mcq_single" || form.type === "mcq_multi") && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium">
                            Options <span className="text-red-500">*</span>
                        </label>
                        <button
                            type="button"
                            className="text-sm text-blue-600 hover:underline"
                            onClick={addChoice}
                        >
                            + Add Option
                        </button>
                    </div>

                    <div className="space-y-2">
                        {form.choices.map((choice, index) => (
                            <div key={choice.id} className="flex gap-2 items-center">
                                <span className="w-6 text-sm font-semibold">{choice.id}.</span>
                                <input
                                    type="text"
                                    className="flex-1 p-2 border rounded"
                                    placeholder={`Option ${choice.id}`}
                                    value={choice.text}
                                    onChange={(e) => handleChoiceChange(index, e.target.value)}
                                    required
                                />
                                {form.choices.length > 2 && (
                                    <button
                                        type="button"
                                        className="text-xs px-2 py-1 border rounded text-red-600"
                                        onClick={() => removeChoice(index)}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Correct Answer Controls */}
            {renderCorrectControls()}

            {/* Marks, difficulty, tags */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Marks <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        min={0}
                        className="w-full p-2 border rounded"
                        value={form.marks}
                        onChange={(e) => handleChange("marks", e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Difficulty</label>
                    <select
                        className="w-full p-2 border rounded"
                        value={form.difficulty}
                        onChange={(e) => handleChange("difficulty", e.target.value)}
                    >
                        {DIFFICULTIES.map((d) => (
                            <option key={d.value} value={d.value}>
                                {d.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Tags (comma-separated)
                    </label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded"
                        placeholder="e.g. loops, array, basics"
                        value={form.tagsInput}
                        onChange={(e) => handleChange("tagsInput", e.target.value)}
                    />
                </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3">
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
                >
                    {submitting
                        ? mode === "create"
                            ? "Creating..."
                            : "Updating..."
                        : mode === "create"
                            ? "Create Question"
                            : "Update Question"}
                </button>
            </div>
        </form>
    );
};

export default QuestionForm;
