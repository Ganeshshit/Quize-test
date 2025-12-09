import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizzesAPI } from "../../api/quizzes.api";
import { toast } from "react-hot-toast";

const QuizStart = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchQuizDetails();
  }, [id]);

  const fetchQuizDetails = async () => {
    try {
      setLoading(true);
      const res = await quizzesAPI.getById(id);

      if (res.success) {
        setQuiz(res.data);
      } else {
        toast.error(res.error || "Failed to load quiz");
        navigate("/student/enrolled");
      }
    } catch (error) {
      console.error("Fetch quiz error:", error);
      toast.error(error?.response?.data?.error || "Failed to load quiz");
      navigate("/student/enrolled");
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await quizzesAPI.start(id);

      if (res.success) {
        // Check if we're resuming an existing attempt
        if (res.resumed) {
          toast.success("Resuming your quiz...");
        } else {
          toast.success(res.message || "Quiz started successfully!");
        }

        // Navigate to quiz attempt page
        navigate(`/student/attempt/${res.data._id}`);
      } else {
        toast.error(res.error || "Failed to start quiz");
      }
    } catch (error) {
      console.error("Start quiz error:", error);

      const errorData = error?.response?.data;
      const errorMsg = errorData?.error || "Unable to start quiz";

      // ✅ Handle expired attempt case
      if (errorData?.timeExpired) {
        toast.error("Your previous attempt has expired. Redirecting to results...");
        // Give user a moment to read the message
        setTimeout(() => {
          // Refresh the quiz details to get updated attempt count
          fetchQuizDetails();
        }, 2000);
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading quiz details...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-600">Quiz not found</p>
      </div>
    );
  }

  // Check if attempts are exhausted
  const attemptsRemaining = quiz.attemptsRemaining || 0;
  const canAttempt = attemptsRemaining > 0;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
        <p className="text-gray-600">{quiz.subject?.name}</p>
      </div>

      {/* Quiz Details Card */}
      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Quiz Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-semibold">{quiz.durationMinutes} minutes</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Total Marks</p>
            <p className="font-semibold">{quiz.totalMarks}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Passing Marks</p>
            <p className="font-semibold">{quiz.passingMarks}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Attempts</p>
            <p className={`font-semibold ${!canAttempt ? 'text-red-600' : 'text-gray-800'}`}>
              {quiz.userAttemptCount || 0}/{quiz.attemptsAllowed}
            </p>
          </div>
        </div>

        {/* No attempts remaining warning */}
        {!canAttempt && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">
              ⚠️ You have exhausted all allowed attempts for this quiz.
            </p>
            <p className="text-red-700 text-sm mt-1">
              Maximum attempts: {quiz.attemptsAllowed}
            </p>
          </div>
        )}

        {/* Instructions */}
        {quiz.instructions && (
          <div className="mt-4">
            <h3 className="text-md font-semibold text-gray-800 mb-2">Instructions</h3>
            <div className="text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded">
              {quiz.instructions}
            </div>
          </div>
        )}

        {/* General Guidelines */}
        <div className="mt-4">
          <h3 className="text-md font-semibold text-gray-800 mb-2">General Guidelines</h3>
          <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
            <li>Ensure you have a stable internet connection</li>
            <li>Do not refresh the page during the quiz</li>
            {quiz.antiCheatSettings?.enableTabSwitchDetection && (
              <li>Avoid switching tabs (limited to {quiz.antiCheatSettings.maxTabSwitches} switches)</li>
            )}
            {quiz.antiCheatSettings?.disableCopyPaste && (
              <li>Copy-paste is disabled during the quiz</li>
            )}
            {quiz.antiCheatSettings?.enableFullScreen && (
              <li>Full-screen mode is required</li>
            )}
            <li>Answer all questions before submitting</li>
            <li>You can review your answers before final submission</li>
          </ul>
        </div>

        {/* Start Button */}
        <button
          disabled={starting || !canAttempt}
          onClick={handleStart}
          className={`w-full py-3 rounded-lg text-lg font-medium transition mt-6 ${!canAttempt
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
        >
          {starting ? "Starting Quiz..." : !canAttempt ? "No Attempts Remaining" : "Start Quiz"}
        </button>

        <button
          onClick={() => navigate("/student/enrolled")}
          className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
        >
          Back to Enrolled Quizzes
        </button>
      </div>
    </div>
  );
};

export default QuizStart;