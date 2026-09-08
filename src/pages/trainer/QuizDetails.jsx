// src/pages/trainer/QuizDetails.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    BookOpen,
    Users,
    Upload,
    AlertCircle,
    Loader2,
    Library,
    List,
    Award,
    ArrowLeft
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
        { id: "questions", label: "Quiz Questions", icon: List, count: quizQuestions.length },
        { id: "bank", label: "Question Bank", icon: Library, count: questionBank.filter((bankQ) => !quizQuestions.some((quizQ) => quizQ._id === bankQ._id)).length },
        { id: "upload", label: "Bulk Upload", icon: Upload }
    ];

    if (loading) {
        return (
            <TrainerLayout>
                <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                    <Loader2 size={40} className="text-yellow-400 animate-spin mb-4" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Quiz Details...</p>
                </div>
            </TrainerLayout>
        );
    }

    return (
        <TrainerLayout>
            <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full font-sans selection:bg-yellow-200">

                {/* Breadcrumbs */}
                <div className="mb-6">
                    <Breadcrumbs
                        items={[
                            { label: "Quizzes", to: "/trainer/quizzes" },
                            { label: quiz?.title || "Details" }
                        ]}
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
                        <AlertCircle size={20} />
                        <span className="text-sm font-bold">{error}</span>
                    </div>
                )}

                {/* Premium Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                    <div className="flex gap-4">
                        <div className="w-14 h-14 bg-[#0A0A0A] rounded-2xl flex items-center justify-center text-white shadow-sm flex-shrink-0">
                            <BookOpen size={28} className="text-yellow-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-1">{quiz.title}</h1>
                            <p className="text-sm font-bold text-gray-500 mb-2">{quiz.description || "No description provided"}</p>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-black uppercase tracking-widest border border-gray-200">
                                    {quiz.subject?.name || "No Subject"}
                                </span>
                                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-black uppercase tracking-widest border border-gray-200">
                                    {quiz.durationMinutes} MINS
                                </span>
                                <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-md text-[10px] font-black uppercase tracking-widest border border-yellow-200">
                                    {quiz.totalMarks} MARKS
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(`/trainer/quizzes/${id}/enrollment`)}
                        className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0A0A0A] hover:bg-black text-white text-sm font-bold rounded-xl shadow-md transition-all whitespace-nowrap"
                    >
                        <Users size={18} /> Manage Enrollment
                    </button>
                </div>

                {/* Custom Tabs Navigation */}
                <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl inline-flex overflow-x-auto w-full sm:w-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${isActive
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                                    }`}
                            >
                                <Icon size={16} />
                                <span>{tab.label}</span>
                                {tab.count !== undefined && (
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] ml-1 ${isActive ? "bg-yellow-400 text-black" : "bg-gray-200 text-gray-700"
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 sm:p-8 min-h-[500px] mb-8">
                    {activeTab === "questions" && (
                        <div className="animate-fade-in h-full">
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
                        <div className="animate-fade-in h-full">
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
                        <div className="animate-fade-in h-full">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm hover:border-gray-300 hover:shadow-md transition-all group">
                        <div className="p-3 bg-gray-50 rounded-xl text-gray-600 group-hover:bg-gray-900 group-hover:text-white transition-colors w-fit mb-4">
                            <List size={24} />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Questions in Quiz</p>
                        <p className="text-4xl font-black text-gray-900">{quizQuestions.length}</p>
                    </div>

                    <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm hover:border-gray-300 hover:shadow-md transition-all group">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors w-fit mb-4">
                            <Library size={24} />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Available in Bank</p>
                        <p className="text-4xl font-black text-gray-900">
                            {questionBank.filter((bankQ) => !quizQuestions.some((quizQ) => quizQ._id === bankQ._id)).length}
                        </p>
                    </div>

                    <div className="bg-[#0A0A0A] p-6 rounded-3xl shadow-lg relative overflow-hidden group text-white">
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-30"></div>
                        <div className="p-3 bg-yellow-400 text-black rounded-xl w-fit mb-4 relative z-10">
                            <Award size={24} />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 relative z-10">Total Marks</p>
                        <p className="text-4xl font-black text-white relative z-10">
                            {quizQuestions.reduce((sum, q) => sum + (q.marks || 0), 0)}
                        </p>
                    </div>
                </div>

                {/* Modals */}
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