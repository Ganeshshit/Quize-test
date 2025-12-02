import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import TrainerLayout from "../../components/Layout/TrainerLayout";
import { quizzesAPI } from "../../api/quizzes.api";
import { questionsAPI } from "../../api/questions.api";
import QuestionCard from "../../components/trainer/QuestionCard";

const QuizDetails = () => {
    const { id } = useParams();

    const [quiz, setQuiz] = useState(null);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [questionBank, setQuestionBank] = useState([]);
    const [loading, setLoading] = useState(true);

    const [uploading, setUploading] = useState(false);
    const [searchQuiz, setSearchQuiz] = useState("");
    const [searchBank, setSearchBank] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [file, setFile] = useState(null);

    const [newQ, setNewQ] = useState({
        prompt: "",
        marks: 1,
        choices: [
            { id: "A", text: "", isCorrect: false },
            { id: "B", text: "", isCorrect: false },
            { id: "C", text: "", isCorrect: false },
            { id: "D", text: "", isCorrect: false },
        ]
    });

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);

            const [quizRes, quizQsRes, bankRes] = await Promise.all([
                quizzesAPI.getById(id),
                quizzesAPI.getQuestions(id),
                questionsAPI.getAll(),
            ]);

            setQuiz(quizRes.data);
            setQuizQuestions(quizQsRes.data.questions || []);
            setQuestionBank(bankRes.data || []);

        } catch (err) {
            console.error("Failed to load quiz details:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = async (questionId) => {
        try {
            await quizzesAPI.addQuestion(id, questionId);
            const question = questionBank.find((q) => q._id === questionId);
            setQuizQuestions((prev) => [...prev, question]);
        } catch (err) {
            console.error(err);
            alert("Failed to add question");
        }
    };

    const handleRemoveQuestion = async (questionId) => {
        if (!window.confirm("Remove this question from quiz?")) return;

        try {
            await quizzesAPI.removeQuestion(id, questionId);
            setQuizQuestions(prev => prev.filter((q) => q._id !== questionId));
        } catch (err) {
            console.error(err);
            alert("Failed to remove question");
        }
    };

    const handleBulkUpload = async (e) => {
        e.preventDefault();
        if (!file) return alert("Please upload a file");

        setUploading(true);
        try {
            await quizzesAPI.bulkUploadQuestions(id, file);
            const res = await quizzesAPI.getQuestions(id);
            setQuizQuestions(res.data.data.questions || []);
            alert("Bulk upload successful!");
            setFile(null);
        } catch (err) {
            console.error(err);
            alert("Failed to upload file");
        } finally {
            setUploading(false);
        }
    };

    const handleManualAdd = async (e) => {
        e.preventDefault();

        const hasCorrect = newQ.choices.some(c => c.isCorrect);
        if (!hasCorrect) return alert("Select at least one correct option.");

        try {
            const res = await quizzesAPI.manualAddQuestion(id, newQ);
            setQuizQuestions(prev => [...prev, res.data]);

            alert("Question added!");

            setNewQ({
                prompt: "",
                marks: 1,
                choices: [
                    { id: "A", text: "", isCorrect: false },
                    { id: "B", text: "", isCorrect: false },
                    { id: "C", text: "", isCorrect: false },
                    { id: "D", text: "", isCorrect: false },
                ]
            });
            setShowAddModal(false);

        } catch (err) {
            console.error(err);
            alert("Failed to add question");
        }
    };

    if (loading) {
        return (
            <TrainerLayout>
                <div className="text-center text-lg py-10">Loading...</div>
            </TrainerLayout>
        );
    }

    if (!quiz) {
        return (
            <TrainerLayout>
                <div className="text-center text-lg py-10">Quiz not found</div>
            </TrainerLayout>
        );
    }

    return (
        <TrainerLayout>
            {/* HEADER */}
            <div className="mb-8 flex justify-between items-center bg-white p-5 rounded-xl shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{quiz.title}</h1>
                    <p className="text-gray-600 mt-1">
                        {quiz.subject?.name} • {quiz.durationMinutes} mins • Total Marks:{" "}
                        <span className="font-semibold">{quiz.totalMarks}</span>
                    </p>
                </div>

                <Link
                    to="/trainer/quizzes"
                    className="px-5 py-2 rounded-md border bg-gray-100 hover:bg-gray-200 transition"
                >
                    Back to List
                </Link>
            </div>

            {/* GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* LEFT - QUIZ QUESTIONS (NOW SCROLLABLE) */}
                <div className="bg-white rounded-xl shadow-sm p-6 h-[75vh] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Questions in this Quiz</h2>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            + Add Question
                        </button>
                    </div>

                    <input
                        type="text"
                        placeholder="Search questions..."
                        className="w-full mb-4 border px-3 py-2 rounded-md"
                        value={searchQuiz}
                        onChange={(e) => setSearchQuiz(e.target.value)}
                    />

                    {/* SCROLLABLE CONTENT */}
                    <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                        {quizQuestions
                            .filter((q) =>
                                q.prompt?.toLowerCase().includes(searchQuiz.toLowerCase())
                            )
                            .map((q) => (
                                <div
                                    key={q._id}
                                    className="border rounded-xl p-4 bg-gray-50 shadow-sm"
                                >
                                    <QuestionCard question={q} />

                                    <div className="flex justify-end gap-3 mt-3">
                                        <Link
                                            to={`/trainer/questions/${q._id}/edit`}
                                            className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleRemoveQuestion(q._id)}
                                            className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* RIGHT - QUESTION BANK + BULK */}
                <div className="space-y-6">

                    {/* BULK UPLOAD CARD */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-3">Bulk Upload Questions</h2>
                        <form onSubmit={handleBulkUpload} className="space-y-3">
                            <input
                                type="file"
                                accept=".xls,.xlsx,.csv"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="border p-2 w-full rounded-md"
                            />

                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                {uploading ? "Uploading..." : "Upload File"}
                            </button>
                        </form>
                    </div>

                    {/* QUESTION BANK */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-3">Question Bank</h2>

                        <input
                            type="text"
                            placeholder="Search question bank..."
                            className="w-full mb-4 border px-3 py-2 rounded-md"
                            value={searchBank}
                            onChange={(e) => setSearchBank(e.target.value)}
                        />

                        <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
                            {questionBank
                                .filter((q) =>
                                    q.prompt?.toLowerCase().includes(searchBank.toLowerCase())
                                )
                                .map((q) => (
                                    <div
                                        key={q._id}
                                        className="border rounded-xl p-4 bg-gray-50 shadow-sm flex justify-between items-start"
                                    >
                                        <div>
                                            <p className="font-medium text-sm">{q.prompt}</p>
                                            <p className="text-xs text-gray-500">
                                                Marks: {q.marks || 1}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleAddQuestion(q._id)}
                                            className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
                                        >
                                            Add
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL - ADD MANUAL QUESTION */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg animate-fadeIn">

                        <h2 className="text-xl font-bold mb-4">Add Manual Question</h2>

                        <form onSubmit={handleManualAdd} className="space-y-4">

                            <div>
                                <label className="font-semibold">Question Prompt</label>
                                <textarea
                                    required
                                    className="w-full border rounded px-3 py-2 mt-1"
                                    value={newQ.prompt}
                                    onChange={(e) =>
                                        setNewQ({ ...newQ, prompt: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="font-semibold">Marks</label>
                                <input
                                    type="number"
                                    className="w-full border rounded px-3 py-2 mt-1"
                                    min="1"
                                    value={newQ.marks}
                                    onChange={(e) =>
                                        setNewQ({ ...newQ, marks: Number(e.target.value) })
                                    }
                                />
                            </div>

                            <div>
                                <label className="font-semibold">Options</label>

                                {newQ.choices.map((choice, index) => (
                                    <div key={choice.id} className="flex items-center gap-3 mt-2">

                                        <input
                                            type="radio"
                                            name="correctOption"
                                            onChange={() => {
                                                const updated = newQ.choices.map((c) => ({
                                                    ...c,
                                                    isCorrect: c.id === choice.id,
                                                }));
                                                setNewQ({ ...newQ, choices: updated });
                                            }}
                                            checked={choice.isCorrect}
                                        />

                                        <span className="w-6 font-medium">{choice.id}.</span>

                                        <input
                                            type="text"
                                            className="flex-1 border rounded px-2 py-1"
                                            value={choice.text}
                                            onChange={(e) => {
                                                const updated = [...newQ.choices];
                                                updated[index].text = e.target.value;
                                                setNewQ({ ...newQ, choices: updated });
                                            }}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-3 mt-5">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Add Question
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </TrainerLayout>
    );
};

export default QuizDetails;
