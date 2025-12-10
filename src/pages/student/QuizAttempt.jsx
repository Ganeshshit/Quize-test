import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizzesAPI } from "../../api/quizzes.api";
import { toast } from "react-hot-toast";

const QuizAttempt = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  // State management
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [questionTimeTracking, setQuestionTimeTracking] = useState({});
  const [cameraStream, setCameraStream] = useState(null);

  // Refs
  const timerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const autoSaveIntervalRef = useRef(null);
  const questionStartTimeRef = useRef(Date.now());
  const visibilityChangeCountRef = useRef(0);
  const videoRef = useRef(null);
  const isAutoSubmittingRef = useRef(false);

  // Generate client fingerprint
  const generateFingerprint = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
    return canvas.toDataURL();
  }, []);

  const [clientFingerprint] = useState(() => generateFingerprint());

  // ==========================================
  // SECURITY: Camera Access
  // ==========================================
  useEffect(() => {
    if (!attempt?.quiz?.antiCheatSettings?.enableWebcamProctoring) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });

        setCameraStream(stream);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Camera access error:", error);
        toast.error("Camera access is required for this quiz");
      }
    };

    startCamera();

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [attempt]);

  // ==========================================
  // SECURITY: Prevent copy-paste
  // ==========================================
  useEffect(() => {
    if (!attempt?.quiz?.antiCheatSettings?.disableCopyPaste) return;

    const preventCopyPaste = (e) => {
      e.preventDefault();
      toast.error("Copy-paste is disabled during quiz", { duration: 2000 });
      return false;
    };

    document.addEventListener("copy", preventCopyPaste);
    document.addEventListener("paste", preventCopyPaste);
    document.addEventListener("cut", preventCopyPaste);

    return () => {
      document.removeEventListener("copy", preventCopyPaste);
      document.removeEventListener("paste", preventCopyPaste);
      document.removeEventListener("cut", preventCopyPaste);
    };
  }, [attempt]);

  // ==========================================
  // SECURITY: Prevent right-click
  // ==========================================
  useEffect(() => {
    const preventRightClick = (e) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener("contextmenu", preventRightClick);
    return () => document.removeEventListener("contextmenu", preventRightClick);
  }, []);

  // ==========================================
  // SECURITY: Fullscreen enforcement
  // ==========================================
  useEffect(() => {
    if (!attempt?.quiz?.antiCheatSettings?.enableFullScreen) return;

    const enterFullScreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
          setIsFullScreen(true);
        }
      } catch (err) {
        console.error("Fullscreen error:", err);
        toast.error("Please enable fullscreen mode");
      }
    };

    const handleFullScreenChange = () => {
      const isFS = !!document.fullscreenElement;
      setIsFullScreen(isFS);

      if (!isFS && !submitting && !isAutoSubmittingRef.current) {
        toast.error("⚠️ You exited fullscreen! Please return to fullscreen mode!", {
          duration: 5000
        });

        // Try to re-enter fullscreen after 2 seconds
        setTimeout(() => {
          if (!document.fullscreenElement && !isAutoSubmittingRef.current) {
            enterFullScreen();
          }
        }, 2000);
      }
    };

    // Enter fullscreen immediately when quiz loads
    enterFullScreen();

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      if (document.fullscreenElement && !isAutoSubmittingRef.current) {
        document.exitFullscreen().catch(() => { });
      }
    };
  }, [attempt, submitting]);

  // ==========================================
  // SECURITY: Tab switch detection
  // ==========================================
  useEffect(() => {
    if (!attempt?.quiz?.antiCheatSettings?.enableTabSwitchDetection) return;

    const handleVisibilityChange = () => {
      if (document.hidden && !isAutoSubmittingRef.current) {
        visibilityChangeCountRef.current += 1;
        const newCount = visibilityChangeCountRef.current;
        setTabSwitches(newCount);

        const maxSwitches = attempt.quiz.antiCheatSettings.maxTabSwitches || 2;

        if (newCount >= maxSwitches) {
          toast.error(
            `⚠️ Maximum tab switches (${maxSwitches}) reached! Auto-submitting quiz...`,
            { duration: 5000 }
          );
          setTimeout(() => handleAutoSubmit(), 2000);
        } else {
          toast.warning(
            `⚠️ Tab switch detected! Warning ${newCount}/${maxSwitches}`,
            { duration: 4000 }
          );
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [attempt, tabSwitches]);

  // ==========================================
  // Track time spent on each question
  // ==========================================
  useEffect(() => {
    questionStartTimeRef.current = Date.now();

    return () => {
      if (attempt?.selectedQuestions?.[currentQuestionIndex]) {
        const questionId = attempt.selectedQuestions[currentQuestionIndex].question._id;
        const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);

        setQuestionTimeTracking(prev => ({
          ...prev,
          [questionId]: (prev[questionId] || 0) + timeSpent
        }));
      }
    };
  }, [currentQuestionIndex, attempt]);

  // ==========================================
  // Auto-save answers periodically
  // ==========================================
  useEffect(() => {
    if (!attemptId || !attempt || isAutoSubmittingRef.current) return;

    autoSaveIntervalRef.current = setInterval(() => {
      saveAnswersToServer();
    }, 30000);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [attemptId, attempt, answers]);

  const saveAnswersToServer = async () => {
    if (isAutoSubmittingRef.current) return;

    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
        clientTimestamp: new Date().toISOString()
      }));

      await quizzesAPI.autoSaveAnswers(attemptId, {
        answers: formattedAnswers,
        tabSwitches: visibilityChangeCountRef.current
      });

      console.log("Answers auto-saved successfully");
    } catch (error) {
      console.error("Auto-save error:", error);
    }
  };

  // ==========================================
  // Fetch attempt data
  // ==========================================
  useEffect(() => {
    fetchAttempt();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current);
    };
  }, [attemptId]);

  const fetchAttempt = async () => {
    try {
      setLoading(true);
      const res = await quizzesAPI.getAttemptById(attemptId);

      if (res.success && res.data) {
        if (!res.data.selectedQuestions || res.data.selectedQuestions.length === 0) {
          toast.error("Quiz data is incomplete. Please restart the quiz.");
          navigate("/student/enrolled");
          return;
        }

        if (res.data.status !== "in_progress") {
          toast.info("This quiz has already been submitted");
          navigate("/student/enrolled");
          return;
        }

        setAttempt(res.data);

        // Load saved answers
        if (res.data.rawAnswers && res.data.rawAnswers.length > 0) {
          const savedAnswers = {};
          res.data.rawAnswers.forEach(ans => {
            savedAnswers[ans.questionId] = ans.answer;
          });
          setAnswers(savedAnswers);
          toast.success("Previous answers restored", { duration: 2000 });
        }

        // Calculate time remaining
        const quiz = res.data.quiz;
        const durationMs = quiz.durationMinutes * 60 * 1000;
        const elapsed = Date.now() - new Date(res.data.startTime).getTime();
        const remaining = Math.max(0, durationMs - elapsed);

        setTimeRemaining(Math.floor(remaining / 1000));
        startTimer();
      } else {
        toast.error("Attempt not found");
        navigate("/student/enrolled");
      }
    } catch (error) {
      console.error("Fetch attempt error:", error);
      const errorMsg = error?.response?.data?.error || "Failed to load attempt";

      if (error?.response?.data?.timeExpired) {
        toast.error("Your quiz session has expired");
        navigate("/student/enrolled");
      } else {
        toast.error(errorMsg);
        navigate("/student/enrolled");
      }
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }

        // Show warnings
        if (prev === 300) {
          toast.warning("⏰ 5 minutes remaining!", { duration: 5000 });
        } else if (prev === 60) {
          toast.error("⏰ 1 minute remaining!", { duration: 5000 });
        }

        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswerChange = (questionId, answer) => {
    if (isAutoSubmittingRef.current) return;

    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    lastActivityRef.current = Date.now();
  };

  const handleAutoSubmit = async () => {
    if (isAutoSubmittingRef.current) return;

    isAutoSubmittingRef.current = true;

    if (timerRef.current) clearInterval(timerRef.current);
    if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current);

    toast.error("⏰ Time's up! Auto-submitting...", { duration: 5000 });
    await submitQuiz(true);
  };

  const submitQuiz = async (isAutoSubmit = false) => {
    if (isAutoSubmittingRef.current && !isAutoSubmit) return;

    if (isAutoSubmit) {
      isAutoSubmittingRef.current = true;
    }

    try {
      setSubmitting(true);

      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
        clientTimestamp: new Date().toISOString()
      }));

      const res = await quizzesAPI.submit(attemptId, {
        answers: formattedAnswers,
        tabSwitches: visibilityChangeCountRef.current,
        timeSpentSeconds: Math.floor((Date.now() - new Date(attempt.startTime).getTime()) / 1000),
        isAutoSubmit,
        clientFingerprint
      });

      if (res.success) {
        // Exit fullscreen
        if (document.fullscreenElement) {
          await document.exitFullscreen().catch(() => { });
        }

        // Stop camera stream
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
        }

        toast.success("✅ Quiz submitted successfully!");
        navigate("/student/enrolled");
      } else {
        toast.error(res.error || "Submission failed");
      }
    } catch (error) {
      console.error("Submit error:", error);
      const errorMsg = error?.response?.data?.error || "Failed to submit quiz";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (isAutoSubmittingRef.current) return;

    const unanswered = attempt.selectedQuestions.filter(
      q => !answers[q.question._id]
    );

    if (unanswered.length > 0) {
      const confirm = window.confirm(
        `You have ${unanswered.length} unanswered question(s). Do you want to submit anyway?`
      );
      if (!confirm) return;
    }

    if (timerRef.current) clearInterval(timerRef.current);
    if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current);

    submitQuiz(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 font-medium">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!attempt || !attempt.selectedQuestions || attempt.selectedQuestions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-red-600 font-semibold mb-4">Quiz data not found</p>
          <p className="text-gray-600 mb-6">The quiz data is incomplete or unavailable.</p>
          <button
            onClick={() => navigate("/student/enrolled")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
          >
            Back to Enrolled Quizzes
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = attempt.selectedQuestions[currentQuestionIndex];
  const totalQuestions = attempt.selectedQuestions.length;

  if (!currentQuestion || !currentQuestion.question) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-xl text-red-600 font-semibold mb-4">Question data is missing</p>
          <button
            onClick={() => navigate("/student/enrolled")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
          >
            Back to Enrolled Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-5 mb-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">{attempt.quiz.title}</h1>
            <div className="flex gap-4 mt-2 text-sm text-gray-600">
              <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              <span>•</span>
              <span>Answered: {getAnsweredCount()}/{totalQuestions}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Camera Indicator */}
            {attempt.quiz.antiCheatSettings?.enableWebcamProctoring && (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-24 h-24 rounded-lg border-2 border-green-500 object-cover"
                />
                <div className="absolute top-1 right-1 w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              </div>
            )}

            {/* Timer */}
            <div className="text-right">
              <div className={`text-3xl font-bold ${timeRemaining < 300 ? 'text-red-600 animate-pulse' :
                timeRemaining < 600 ? 'text-orange-600' : 'text-blue-600'
                }`}>
                {formatTime(timeRemaining)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Time Remaining</p>
            </div>
          </div>
        </div>

        {/* Warning indicators */}
        <div className="mt-4 flex gap-2 flex-wrap">
          {tabSwitches > 0 && (
            <div className="text-sm px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full font-medium">
              ⚠️ Tab switch warnings: {tabSwitches}/{attempt.quiz.antiCheatSettings?.maxTabSwitches || 2}
            </div>
          )}
          {attempt.quiz.antiCheatSettings?.enableFullScreen && !isFullScreen && (
            <div className="text-sm px-3 py-1.5 bg-red-100 text-red-700 rounded-full animate-pulse font-medium">
              ⚠️ Fullscreen required
            </div>
          )}
          {timeRemaining < 300 && (
            <div className="text-sm px-3 py-1.5 bg-red-100 text-red-700 rounded-full font-medium">
              ⏰ Less than 5 minutes remaining!
            </div>
          )}
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-6 mb-4">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Question {currentQuestionIndex + 1}
            </h2>
            <span className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-sm font-semibold">
              {currentQuestion.marks || 1} {(currentQuestion.marks || 1) === 1 ? 'mark' : 'marks'}
            </span>
          </div>

          <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-blue-600">
            <p className="text-gray-800 text-base leading-relaxed whitespace-pre-line">
              {currentQuestion.prompt}
            </p>
          </div>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestion.type === 'mcq_single' && currentQuestion.choices && (
            <>
              {currentQuestion.choices.map((choice, idx) => (
                <label
                  key={choice.id}
                  className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${answers[currentQuestion.question._id] === choice.id
                    ? 'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name={currentQuestion.question._id}
                      value={choice.id}
                      checked={answers[currentQuestion.question._id] === choice.id}
                      onChange={(e) => handleAnswerChange(currentQuestion.question._id, e.target.value)}
                      className="mt-1 mr-3 w-5 h-5"
                    />
                    <span className="flex-1">
                      <span className="font-bold text-gray-700 mr-3 bg-gray-100 px-2 py-1 rounded">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {choice.text}
                    </span>
                  </div>
                </label>
              ))}
            </>
          )}

          {currentQuestion.type === 'mcq_multi' && currentQuestion.choices && (
            <>
              <p className="text-sm text-blue-700 mb-3 italic font-medium bg-blue-50 p-2 rounded">
                ℹ️ Select all that apply
              </p>
              {currentQuestion.choices.map((choice, idx) => (
                <label
                  key={choice.id}
                  className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${(answers[currentQuestion.question._id] || []).includes(choice.id)
                    ? 'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      value={choice.id}
                      checked={(answers[currentQuestion.question._id] || []).includes(choice.id)}
                      onChange={(e) => {
                        const currentAnswers = answers[currentQuestion.question._id] || [];
                        const newAnswers = e.target.checked
                          ? [...currentAnswers, choice.id]
                          : currentAnswers.filter(id => id !== choice.id);
                        handleAnswerChange(currentQuestion.question._id, newAnswers);
                      }}
                      className="mt-1 mr-3 w-5 h-5"
                    />
                    <span className="flex-1">
                      <span className="font-bold text-gray-700 mr-3 bg-gray-100 px-2 py-1 rounded">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {choice.text}
                    </span>
                  </div>
                </label>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-5 mb-4">
        <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0 || isAutoSubmittingRef.current}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ← Previous
          </button>

          <button
            onClick={() => setShowNavigator(!showNavigator)}
            disabled={isAutoSubmittingRef.current}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50"
          >
            {showNavigator ? 'Hide' : 'Show'} Navigator
          </button>

          {currentQuestionIndex < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              disabled={isAutoSubmittingRef.current}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || isAutoSubmittingRef.current}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz ✓'}
            </button>
          )}
        </div>

        {/* Question Navigator */}
        {showNavigator && (
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-3 font-semibold">Question Navigator</p>
            <div className="flex gap-2 flex-wrap">
              {attempt.selectedQuestions.map((q, idx) => (
                <button
                  key={q.question?._id || idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  disabled={isAutoSubmittingRef.current}
                  className={`w-12 h-12 rounded-lg font-semibold transition disabled:opacity-50 ${idx === currentQuestionIndex
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                    : answers[q.question?._id]
                      ? 'bg-green-200 text-green-800 hover:bg-green-300'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  title={answers[q.question?._id] ? 'Answered' : 'Not answered'}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-200 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <span>Not Answered</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizAttempt;