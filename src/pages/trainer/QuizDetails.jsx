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
    List,
    Award,
    TrendingUp
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

    // Tab Configuration with enhanced styling
    const tabs = [
        {
            id: "questions",
            label: "Quiz Questions",
            icon: List,
            count: quizQuestions.length,
            color: "blue"
        },
        {
            id: "bank",
            label: "Question Bank",
            icon: Library,
            count: questionBank.filter(
                (bankQ) => !quizQuestions.some((quizQ) => quizQ._id === bankQ._id)
            ).length,
            color: "purple"
        },
        {
            id: "upload",
            label: "Bulk Upload",
            icon: Upload,
            color: "green"
        }
    ];

    if (loading) {
        return (
            <TrainerLayout>
                <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl">
                        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6 mx-auto" />
                        <p className="text-2xl font-bold text-gray-800 text-center">Loading Quiz...</p>
                        <p className="text-sm text-gray-500 mt-2 text-center">Please wait a moment</p>
                    </div>
                </div>
            </TrainerLayout>
        );
    }

    return (
        <TrainerLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
                <div className="max-w-[1600px] mx-auto">

                    {/* Breadcrumbs */}
                    <div className="mb-6">
                        <Breadcrumbs
                            items={[
                                { label: "Quizzes", to: "/trainer/quizzes" },
                                { label: quiz?.title, to: `/trainer/quizzes/${id}/details` },
                                { label: "Details" }
                            ]}
                        />
                    </div>

                    {/* Header Section - Enhanced */}
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 mb-8">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 shadow-lg">
                                        <BookOpen className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
                                        <p className="text-gray-600 text-lg">{quiz.description || "No description provided"}</p>
                                        <p className="text-gray-600 mb-4">
                                            {quiz.subject?.name || "No Subject"} • {quiz.durationMinutes} mins • Total Marks: {quiz.totalMarks}
                                        </p>

                                        <p></p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/trainer/quizzes/${id}/enrollment`)}
                                className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-bold shadow-lg hover:shadow-xl flex items-center gap-3 whitespace-nowrap hover:scale-105 transform"
                            >
                                <Users className="w-6 h-6" />
                                Manage Enrollment
                            </button>
                        </div>

                        {/* Quiz Info Section */}
                        {/* <QuizHeader quiz={quiz} /> */}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5 mb-8 flex items-center gap-4 shadow-md">
                            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                            <p className="text-red-800 font-bold text-lg">{error}</p>
                        </div>
                    )}

                    {/* Tabs Navigation - Enhanced */}
                    <div className="bg-white rounded-t-2xl shadow-xl border-2 border-gray-200 border-b-0">
                        <div className="flex overflow-x-auto">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-3 px-8 py-5 font-bold transition-all border-b-4 whitespace-nowrap text-base ${isActive
                                            ? "text-blue-700 border-blue-600 bg-gradient-to-b from-blue-50 to-white shadow-inner"
                                            : "text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50"
                                            }`}
                                    >
                                        <Icon className="w-6 h-6" />
                                        <span>{tab.label}</span>
                                        {tab.count !== undefined && (
                                            <span className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm ${isActive
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

                    {/* Tab Content - Full Width with Better Height Management */}
                    <div className="bg-white rounded-b-2xl shadow-xl border-2 border-gray-200 border-t-0 p-8 min-h-[600px]">
                        {activeTab === "questions" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 h-full">
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
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 h-full">
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
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 h-full">
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

                    {/* Quick Stats Footer - Enhanced */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg border-2 border-blue-200 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-600 rounded-2xl p-4 shadow-md">
                                    <List className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-700 font-bold uppercase tracking-wide mb-1">Questions in Quiz</p>
                                    <p className="text-4xl font-bold text-blue-900">{quizQuestions.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl shadow-lg border-2 border-emerald-200 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="bg-emerald-600 rounded-2xl p-4 shadow-md">
                                    <Library className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-emerald-700 font-bold uppercase tracking-wide mb-1">Available Questions</p>
                                    <p className="text-4xl font-bold text-emerald-900">
                                        {questionBank.filter(
                                            (bankQ) => !quizQuestions.some((quizQ) => quizQ._id === bankQ._id)
                                        ).length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg border-2 border-purple-200 p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="bg-purple-600 rounded-2xl p-4 shadow-md">
                                    <Award className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-purple-700 font-bold uppercase tracking-wide mb-1">Total Marks</p>
                                    <p className="text-4xl font-bold text-purple-900">
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