import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentQuizStore } from "../../store/studentQuiz.store";
import { useDebounce } from "../../hooks/useDebounce";

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
  }, [debouncedSearch]);

  const handleEnroll = async (quizId) => {
    try {
      await enroll(quizId);
      alert("Enrolled successfully! Check 'My Enrolled Quizzes' to start.");
    } catch (err) {
      alert(err?.error || "Enrollment failed");
    }
  };

  // Navigate to instruction page before starting
  const handleStart = (quizId) => {
    navigate(`/student/quiz/${quizId}/start`);
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Available Quizzes</h1>
        <p className="text-gray-600 mt-2">Enroll and start quizzes assigned to you</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="🔍 Search quizzes by title or subject..."
          className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-600 font-medium">Loading quizzes...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-700 font-semibold">{error}</p>
        </div>
      )}

      {/* Quiz Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="bg-white shadow-md hover:shadow-xl transition-all rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Quiz Header */}
              <div className={`p-4 ${quiz.isEnrolled
                ? 'bg-gradient-to-r from-green-500 to-green-600'
                : 'bg-gradient-to-r from-blue-500 to-blue-600'
                } text-white`}>
                <h2 className="text-xl font-bold truncate">{quiz.title}</h2>
                <p className="text-sm mt-1 opacity-90">
                  {quiz.subject?.name || "No subject"}
                </p>
              </div>

              {/* Quiz Details */}
              <div className="p-5 space-y-3">
                <div className="flex items-center text-sm text-gray-700">
                  <span className="font-semibold w-32">Attempts Left:</span>
                  <span className="font-bold text-blue-600">
                    {quiz.attemptsRemaining ?? "-"}
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-700">
                  <span className="font-semibold w-32">Duration:</span>
                  <span>{quiz.durationMinutes || 0} minutes</span>
                </div>

                <div className="flex items-center text-sm text-gray-700">
                  <span className="font-semibold w-32">Total Marks:</span>
                  <span className="font-bold text-purple-600">
                    {quiz.totalMarks || "N/A"}
                  </span>
                </div>

                {/* Enrollment Status Badge */}
                {quiz.isEnrolled && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                    <span className="text-green-700 font-semibold text-sm">
                      ✅ Enrolled
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                {!quiz.isEnrolled ? (
                  <button
                    onClick={() => handleEnroll(quiz._id)}
                    className="mt-4 w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition font-semibold shadow-md hover:shadow-lg"
                  >
                    📝 Enroll Now
                  </button>
                ) : (
                  <button
                    onClick={() => handleStart(quiz._id)}
                    className="mt-4 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-semibold shadow-md hover:shadow-lg"
                  >
                    🚀 Start Quiz
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Empty state */}
          {quizzes.length === 0 && !loading && (
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-xl text-gray-600">No quizzes found.</p>
              <p className="text-gray-500 mt-2">Try adjusting your search or check back later.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizList;