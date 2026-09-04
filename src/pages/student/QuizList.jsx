import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Clock, Target, CheckCircle,
  ArrowRight, BookOpen, AlertCircle, Award
} from 'lucide-react';
import { useStudentQuizStore } from "../../store/studentQuiz.store";
import { useDebounce } from "../../hooks/useDebounce";

// --- Extracted Sub-Components ---

const SkeletonCard = () => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse flex flex-col h-full">
    <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-4"></div>
    <div className="h-4 bg-gray-100 rounded-md w-1/3 mb-6"></div>
    <div className="space-y-4 mb-8 flex-1">
      <div className="h-4 bg-gray-50 rounded w-full"></div>
      <div className="h-4 bg-gray-50 rounded w-5/6"></div>
      <div className="h-4 bg-gray-50 rounded w-4/6"></div>
    </div>
    <div className="h-12 bg-gray-200 rounded-xl w-full mt-auto"></div>
  </div>
);

const QuizBadge = ({ text, enrolled }) => (
  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${enrolled
    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
    : 'bg-gray-100 text-gray-600 border-gray-200'
    }`}>
    {text}
  </span>
);

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-2 text-gray-500 font-medium">
      <Icon size={16} className="text-gray-400" />
      <span>{label}</span>
    </div>
    <span className="font-bold text-gray-900">{value}</span>
  </div>
);

// --- Main Component ---

const QuizList = () => {
  const navigate = useNavigate();

  const {
    quizzes,
    loading,
    error,
    search,
    setSearch,
    fetchQuizzes,
    enroll
  } = useStudentQuizStore();

  const debouncedSearch = useDebounce(search);

  // Fetch quizzes (on first load + when search changes)
  useEffect(() => {
    fetchQuizzes();
  }, [debouncedSearch, fetchQuizzes]);

  const handleEnroll = async (quizId) => {
    try {
      await enroll(quizId);
      alert("Enrolled successfully! Check 'My Enrolled Quizzes' to start.");
    } catch (err) {
      alert(err?.error || "Enrollment failed");
    }
  };

  const handleStart = (quizId) => {
    navigate(`/student/quiz/${quizId}/start`);
  };

  return (
    <div className="space-y-8 pb-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="bg-white rounded-2xl p-8 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Available Quizzes</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Browse, enroll, and begin your assigned assessments.
          </p>
        </div>

        {/* Premium Search Bar */}
        <div className="relative group w-full md:w-96 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400 group-focus-within:text-black transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by title or subject..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent focus:bg-white transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-sm text-red-900 shadow-sm">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Main Grid Area */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.length === 0 && !error ? (
            // Empty State
            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
                <BookOpen size={32} />
              </div>
              <h3 className="text-base font-bold text-gray-900">No quizzes found</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-sm text-center">
                We couldn't find any assessments matching your search. Try adjusting your keywords or check back later.
              </p>
            </div>
          ) : (
            // Quiz Cards
            quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-50 relative overflow-hidden">
                  {/* Decorative corner accent */}
                  <div className={`absolute -top-6 -right-6 w-16 h-16 rounded-full opacity-20 transition-transform group-hover:scale-150 ${quiz.isEnrolled ? 'bg-yellow-400' : 'bg-gray-300'}`}></div>

                  <div className="relative z-10 flex flex-col items-start gap-3">
                    <QuizBadge
                      text={quiz.subject?.name || "General"}
                      enrolled={quiz.isEnrolled}
                    />
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">
                      {quiz.title}
                    </h2>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="space-y-3 mb-6">
                    <DetailRow
                      icon={Target}
                      label="Attempts Left"
                      value={quiz.attemptsRemaining ?? "Unlimited"}
                    />
                    <DetailRow
                      icon={Clock}
                      label="Duration"
                      value={`${quiz.durationMinutes || 0} min`}
                    />
                    <DetailRow
                      icon={Award}
                      label="Total Marks"
                      value={quiz.totalMarks || "N/A"}
                    />
                  </div>

                  {/* Actions */}
                  <div className="mt-auto pt-4 border-t border-gray-50">
                    {quiz.isEnrolled ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-100">
                          <CheckCircle size={14} />
                          Enrolled & Ready
                        </div>
                        <button
                          onClick={() => handleStart(quiz._id)}
                          className="w-full flex items-center justify-center gap-2 bg-black text-white px-4 py-3 rounded-xl hover:bg-yellow-400 hover:text-black transition-colors font-bold text-sm shadow-sm"
                        >
                          Start Assessment <ArrowRight size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEnroll(quiz._id)}
                        className="w-full bg-white border-2 border-gray-200 text-gray-900 px-4 py-3 rounded-xl hover:border-black hover:bg-black hover:text-white transition-all font-bold text-sm shadow-sm flex items-center justify-center gap-2"
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default QuizList;