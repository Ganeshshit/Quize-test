import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentQuizStore } from "../../store/studentQuiz.store";
import { useDebounce } from "../../hooks/useDebounce";
import { quizzesAPI } from "../../api/quizzes.api";

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
      alert("Enrolled successfully!");
    } catch (err) {
      alert(err?.error || "Enrollment failed");
    }
  };

  const handleStart = async (quizId) => {
    try {
      const res = await quizzesAPI.start(quizId);
      navigate(`/student/attempt/${res.data._id}`);
    } catch (err) {
      alert(err?.response?.data?.error || "Cannot start quiz");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Available Quizzes</h1>
        <p className="text-gray-600">Enroll & attempt quizzes assigned to you</p>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search quizzes..."
        className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring focus:ring-blue-300"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Loading */}
      {loading && (
        <p className="text-blue-600 font-medium">Loading quizzes...</p>
      )}

      {error && (
        <p className="text-red-500">{error}</p>
      )}

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz._id} className="p-5 bg-white shadow rounded-xl border">
            <h2 className="text-lg font-bold text-gray-800">{quiz.title}</h2>
            <p className="text-gray-500">{quiz.subject?.name || "No subject"}</p>

            <div className="mt-4 text-sm text-gray-700 space-y-1">
              <p><strong>Attempts Left:</strong> {quiz.attemptsRemaining ?? "-"}</p>
              <p><strong>Duration:</strong> {quiz.durationMinutes || 0} min</p>
            </div>

            {/* Conditional Buttons */}
            {!quiz.isEnrolled ? (
              <button
                onClick={() => handleEnroll(quiz._id)}
                className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Enroll
              </button>
            ) : (
              <button
                onClick={() => handleStart(quiz._id)}
                className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Start Quiz →
              </button>
            )}
          </div>
        ))}

        {/* Empty state */}
        {quizzes.length === 0 && !loading && (
          <p className="text-gray-500 text-center w-full">No quizzes found.</p>
        )}
      </div>
    </div>
  );
};

export default QuizList;
