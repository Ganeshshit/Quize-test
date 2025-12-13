import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    BookOpen,
    Users,
    Upload,
    Settings,
    AlertCircle,
    Loader2,
    Library,
    List
} from "lucide-react";

import TrainerLayout from "../../components/Layout/TrainerLayout";
import { quizzesAPI } from "../../api/quizzes.api";
import { questionsAPI } from "../../api/questions.api";

import QuizHeader from "../../components/trainer/quiz/QuizHeader";
import QuizQuestionList from "../../components/trainer/quiz/QuizQuestionList";
import QuestionBank from "../../components/trainer/quiz/QuestionBank";
import BulkUpload from "../../components/trainer/quiz/BulkUpload";
import AddQuestionModal from "../../components/trainer/quiz/AddQuestionModal";
import Breadcrumbs from "../../components/comon/Breadcrumbs";

const QuizDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State Management
    const [quiz, setQuiz] = useState(null);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [questionBank, setQuestionBank] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [selectedSubject, setSelectedSubject] = useState("all");
    const [selectedDifficulty, setSelectedDifficulty] = useState("all");

    const [loading, setLoading] = useState(true);
    const [bankLoading, setBankLoading] = useState(false);
    const [searchQuiz, setSearchQuiz] = useState("");
    const [searchBank, setSearchBank] = useState("");

    const [showAddModal, setShowAddModal] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("questions"); // questions | bank | upload

    // Load subjects
    const loadSubjects = useCallback(async () => {
        try {
            const res = await questionsAPI.getAll({ limit: 1000 });
            const map = new Map();
            res.data?.forEach((q) => {
                if (q.subject?._id) {
                    map.set(q.subject._id, q.subject);
                }
            });
            setSubjects([...map.values()]);
        } catch {
            setSubjects([]);
        }
    }, []);

    // Load question bank with filters
    const loadQuestionBank = useCallback(async () => {
        try {
            setBankLoading(true);
            const params = { page: 1, limit: 1000 };
            if (selectedSubject !== "all") params.subject = selectedSubject;
            if (selectedDifficulty !== "all") params.difficulty = selectedDifficulty;

            const res = await questionsAPI.getAll(params);
            setQuestionBank(res.data || []);
        } catch {
            setQuestionBank([]);
        } finally {
            setBankLoading(false);
        }
    }, [selectedSubject, selectedDifficulty]);

    // Load quiz data initially
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const quizRes = await quizzesAPI.getById(id);
                const quizQsRes = await quizzesAPI.getQuestions(id);

                setQuiz(quizRes.data);
                setQuizQuestions(quizQsRes.data.questions || []);

                await loadSubjects();
                await loadQuestionBank();
            } catch {
                setError("Failed to load quiz");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    // Reload question bank when filters change
    useEffect(() => {
        if (!loading) loadQuestionBank();
    }, [selectedSubject, selectedDifficulty]);

    // Add question to quiz
    const handleAddQuestion = async (questionId) => {
        try {
            await quizzesAPI.addQuestion(id, questionId);
            const newQ = questionBank.find((x) => x._id === questionId);
            if (newQ) setQuizQuestions((prev) => [...prev, newQ]);
        } catch {
            alert("Failed to add question");
        }
    };

    // Remove question
    const handleRemoveQuestion = async (questionId) => {
        try {
            await quizzesAPI.removeQuestion(id, questionId);
            setQuizQuestions((prev) => prev.filter((q) => q._id !== questionId));
        } catch {
            alert("Failed to remove question");
        }
    };

    // Tab Configuration
    const tabs = [
        {
            id: "questions",
            label: "Quiz Questions",
            icon: List,
            count: quizQuestions.length
        },
        {
            id: "bank",
            label: "Question Bank",
            icon: Library,
            count: questionBank.filter(
                (bankQ) => !quizQuestions.some((quizQ) => quizQ._id === bankQ._id)
            ).length
        },
        {
            id: "upload",
            label: "Bulk Upload",
            icon: Upload
        }
    ];

    if (loading) {
        return (
            <TrainerLayout>
                <div className="flex flex-col justify-center items-center h-screen">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-xl font-semibold text-gray-700">Loading Quiz...</p>
                </div>
            </TrainerLayout>
        );
    }

    return (
        <TrainerLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="max-w-7xl mx-auto">

                    {/* Breadcrumbs */}
                    <div className="mb-4">
                        <Breadcrumbs
                            items={[
                                { label: "Quizzes", to: "/trainer/quizzes" },
                                { label: quiz?.title, to: `/trainer/quizzes/${id}/details` },
                                { label: "Details" }
                            ]}
                        />
                    </div>

                    {/* Header Section */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2.5 shadow-md">
                                        <BookOpen className="w-6 h-6 text-white" />
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
                                </div>
                                <p className="text-gray-600 ml-12">{quiz.description || "No description provided"}</p>
                            </div>

                            <button
                                onClick={() => navigate(`/trainer/quizzes/${id}/enrollment`)}
                                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
                            >
                                <Users className="w-5 h-5" />
                                Manage Enrollment
                            </button>
                        </div>

                        {/* Quiz Info Section */}
                        <QuizHeader quiz={quiz} />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <p className="text-red-800 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Tabs Navigation */}
                    <div className="bg-white rounded-t-xl shadow-lg border border-gray-200 border-b-0">
                        <div className="flex overflow-x-auto">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap ${isActive
                                                ? "text-blue-600 border-blue-600 bg-blue-50"
                                                : "text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50"
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{tab.label}</span>
                                        {tab.count !== undefined && (
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isActive
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-200 text-gray-700"
                                                }`}>
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-b-xl shadow-lg border border-gray-200 border-t-0 p-6">
                        {activeTab === "questions" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <QuizQuestionList
                                    questions={quizQuestions}
                                    search={searchQuiz}
                                    setSearch={setSearchQuiz}
                                    onRemove={handleRemoveQuestion}
                                    onOpenModal={() => setShowAddModal(true)}
                                />
                            </div>
                        )}

                        {activeTab === "bank" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <QuestionBank
                                    questionBank={questionBank}
                                    quizQuestions={quizQuestions}
                                    subjects={subjects}
                                    selectedSubject={selectedSubject}
                                    selectedDifficulty={selectedDifficulty}
                                    setSelectedSubject={setSelectedSubject}
                                    setSelectedDifficulty={setSelectedDifficulty}
                                    search={searchBank}
                                    setSearch={setSearchBank}
                                    bankLoading={bankLoading}
                                    onAdd={handleAddQuestion}
                                />
                            </div>
                        )}

                        {activeTab === "upload" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <BulkUpload
                                    quizId={id}
                                    reloadQuiz={async () => {
                                        const quizQsRes = await quizzesAPI.getQuestions(id);
                                        setQuizQuestions(quizQsRes.data.questions || []);
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Quick Stats Footer */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 rounded-lg p-3">
                                    <List className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Questions in Quiz</p>
                                    <p className="text-2xl font-bold text-gray-900">{quizQuestions.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 rounded-lg p-3">
                                    <Library className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Available Questions</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {questionBank.filter(
                                            (bankQ) => !quizQuestions.some((quizQ) => quizQ._id === bankQ._id)
                                        ).length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-100 rounded-lg p-3">
                                    <Settings className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Total Marks</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {quizQuestions.reduce((sum, q) => sum + (q.marks || 0), 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Add new question modal */}
                {showAddModal && (
                    <AddQuestionModal
                        quizId={id}
                        onClose={() => setShowAddModal(false)}
                        onAdded={(newQ) => setQuizQuestions((prev) => [...prev, newQ])}
                        reloadBank={loadQuestionBank}
                    />
                )}
            </div>
        </TrainerLayout>
    );
};

export default QuizDetails;