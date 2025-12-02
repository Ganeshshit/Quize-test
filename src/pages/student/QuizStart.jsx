import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import { quizzesAPI } from "../../api/quizzes.api"; // Uncomment when API ready

const QuizStart = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);

  // TEMP MOCK DATA – Replace with API data
  const mockQuiz = {
    _id: id,
    title: "Java Basics",
    subject: "Programming Fundamentals",
    durationSeconds: 1800,
    totalMarks: 20,
    instructions:
      "Make sure you have a stable internet connection. Do not refresh the page during the quiz.",
  };

  useEffect(() => {
    // Example API call:
    // quizzesAPI.getQuiz(id).then(res => setQuiz(res.data));

    setQuiz(mockQuiz);
  }, [id]);

  const handleStart = async () => {
    setLoading(true);
    try {
      // Backend call example:
      // const res = await quizzesAPI.startQuiz(id);
      // navigate(`/student/quizzes/${res.data.attemptId}/attempt`);

      setTimeout(() => {
        // TEMP MOCK NAVIGATION
        navigate(`/student/quizzes/mockAttempt123/attempt`);
      }, 600);
    } catch (error) {
      alert("Unable to start quiz.");
    } finally {
      setLoading(false);
    }
  };

  if (!quiz) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
        <p className="text-gray-600">{quiz.subject}</p>
      </div>

      {/* Quiz Details Card */}
      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Quiz Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
          <p><strong>Duration:</strong> {quiz.durationSeconds / 60} minutes</p>
          <p><strong>Total Marks:</strong> {quiz.totalMarks}</p>
        </div>

        {/* Instructions */}
        <div className="mt-4">
          <h3 className="text-md font-semibold text-gray-800 mb-2">Instructions</h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {quiz.instructions || "No special instructions provided."}
          </p>
        </div>

        {/* Start Button */}
        <button
          disabled={loading}
          onClick={handleStart}
          className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 mt-4"
        >
          {loading ? "Starting Quiz..." : "Start Quiz"}
        </button>
      </div>
    </div>
  );
};

export default QuizStart;
