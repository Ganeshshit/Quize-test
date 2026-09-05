// src/pages/student/QuizAttempt.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizzesAPI } from "../../api/quizzes.api";
import { proctorAPI, PROCTOR_EVENTS } from "../../api/proctor.api";
import { socketService } from "../../services/socket.service";
import { toast } from "react-hot-toast";
import {
  Clock, AlertTriangle, ShieldCheck,
  MonitorOff, ArrowRight, ArrowLeft, LayoutGrid,
  XCircle, CheckCircle2, Circle, X, Monitor, Lock
} from 'lucide-react';

const QuizAttempt = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  // --- State management ---
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [needsFullscreenInteraction, setNeedsFullscreenInteraction] = useState(false); // NEW: Handles browser security blocks
  const [showMobileGrid, setShowMobileGrid] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [proctorConnected, setProctorConnected] = useState(false);

  // --- Refs ---
  const timerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const autoSaveIntervalRef = useRef(null);
  const visibilityChangeCountRef = useRef(0);
  const videoRef = useRef(null);
  const isAutoSubmittingRef = useRef(false);
  const proctorTokenRef = useRef(null);

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
  // SECURITY - Fullscreen enforcement
  // ==========================================
  const enterFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullScreen(true);
        setNeedsFullscreenInteraction(false);
        if (proctorConnected) {
          await proctorAPI.logEvent(attemptId, PROCTOR_EVENTS.FULLSCREEN_ENTER);
        }
      }
    } catch (err) {
      console.warn("Fullscreen blocked by browser due to missing user interaction.");
      setNeedsFullscreenInteraction(true);
    }
  };

  useEffect(() => {
    if (!attempt?.quiz?.antiCheatSettings?.enableFullScreen) return;

    enterFullScreen(); // Attempt to auto-enter on load

    const handleFullScreenChange = async () => {
      const isFS = !!document.fullscreenElement;
      setIsFullScreen(isFS);

      if (!isFS && !submitting && !isAutoSubmittingRef.current) {
        toast.error("⚠️ You exited fullscreen! Please return to fullscreen mode!", { duration: 5000 });
        setNeedsFullscreenInteraction(true); // Force interaction overlay if they escape
        if (proctorConnected) {
          await proctorAPI.logEvent(attemptId, PROCTOR_EVENTS.FULLSCREEN_EXIT, { timestamp: Date.now() });
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      if (document.fullscreenElement && !isAutoSubmittingRef.current) {
        document.exitFullscreen().catch(() => { });
      }
    };
  }, [attempt, submitting, proctorConnected, attemptId]);

  // ==========================================
  // SECURITY - Camera Access
  // ==========================================
  useEffect(() => {
    if (!attempt?.quiz?.antiCheatSettings?.enableWebcamProctoring) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false
        });

        setCameraStream(stream);
        if (videoRef.current) videoRef.current.srcObject = stream;

        if (proctorConnected) {
          await proctorAPI.logEvent(attemptId, PROCTOR_EVENTS.CAMERA_ENABLED);
        }
      } catch (error) {
        toast.error("⚠️ Camera access is required for this quiz!");
        if (proctorConnected) {
          await proctorAPI.logEvent(attemptId, PROCTOR_EVENTS.CAMERA_BLOCKED, { error: error.message });
        }
        setTimeout(() => navigate("/student/enrolled"), 3000);
      }
    };

    startCamera();
    return () => {
      if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
    };
  }, [attempt, proctorConnected, attemptId, navigate]);

  // ==========================================
  // SECURITY - Tab switch detection
  // ==========================================
  useEffect(() => {
    if (!attempt?.quiz?.antiCheatSettings?.enableTabSwitchDetection) return;

    const handleVisibilityChange = async () => {
      if (document.hidden && !isAutoSubmittingRef.current) {
        visibilityChangeCountRef.current += 1;
        const newCount = visibilityChangeCountRef.current;
        setTabSwitches(newCount);

        const maxSwitches = attempt.quiz.antiCheatSettings.maxTabSwitches || 2;

        if (proctorConnected) {
          await proctorAPI.logEvent(attemptId, PROCTOR_EVENTS.TAB_SWITCH, { count: newCount, maxAllowed: maxSwitches });
        }

        if (newCount >= maxSwitches) {
          toast.error(`⚠️ Maximum tab switches (${maxSwitches}) reached! Auto-submitting quiz...`, { duration: 5000 });
          if (proctorConnected) {
            await proctorAPI.logEvent(attemptId, PROCTOR_EVENTS.TAB_SWITCH_LIMIT_EXCEEDED, { finalCount: newCount });
          }
          setTimeout(() => handleAutoSubmit(), 2000);
        } else {
          toast.warning(`⚠️ Tab switch detected! Warning ${newCount}/${maxSwitches}`, { duration: 4000 });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [attempt, tabSwitches, proctorConnected, attemptId]);

  // ==========================================
  // SECURITY - Prevent copy-paste & Right Click
  // ==========================================
  useEffect(() => {
    if (!attempt?.quiz?.antiCheatSettings?.disableCopyPaste) return;

    const preventAction = async (e, eventType, toastMsg) => {
      e.preventDefault();
      toast.error(toastMsg, { duration: 2000 });
      if (proctorConnected) await proctorAPI.logEvent(attemptId, eventType);
      return false;
    };

    const copy = (e) => preventAction(e, PROCTOR_EVENTS.COPY_ATTEMPT, "Copy is disabled");
    const paste = (e) => preventAction(e, PROCTOR_EVENTS.PASTE_ATTEMPT, "Paste is disabled");
    const cut = (e) => preventAction(e, null, "Cut is disabled");
    const rightClick = (e) => { e.preventDefault(); return false; };

    document.addEventListener("copy", copy);
    document.addEventListener("paste", paste);
    document.addEventListener("cut", cut);
    document.addEventListener("contextmenu", rightClick);

    return () => {
      document.removeEventListener("copy", copy);
      document.removeEventListener("paste", paste);
      document.removeEventListener("cut", cut);
      document.removeEventListener("contextmenu", rightClick);
    };
  }, [attempt, proctorConnected, attemptId]);

  // ==========================================
  // SECURITY: Detect dev tools
  // ==========================================
  useEffect(() => {
    const detectDevTools = async () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if ((widthThreshold || heightThreshold) && proctorConnected && !isAutoSubmittingRef.current) {
        await proctorAPI.logEvent(attemptId, PROCTOR_EVENTS.DEV_TOOLS_OPEN);
        toast.error("⚠️ Developer tools detected! This has been logged.", { duration: 5000 });
      }
    };
    const interval = setInterval(detectDevTools, 1000);
    return () => clearInterval(interval);
  }, [proctorConnected, attemptId]);

  // ==========================================
  // Initialize Proctoring Socket
  // ==========================================
  useEffect(() => {
    const initProctoring = async () => {
      if (!attempt || !attemptId) return;
      try {
        const tokenData = await proctorAPI.generateToken(attemptId);
        proctorTokenRef.current = tokenData;
        await socketService.connect(tokenData.token);
        await socketService.joinProctorRoom(attemptId, tokenData.token, tokenData.nonce);
        setProctorConnected(true);
        await proctorAPI.logEvent(attemptId, PROCTOR_EVENTS.ATTEMPT_START, { quizId: attempt.quiz._id, startTime: new Date().toISOString() });
        socketService.onAdminCommand(handleAdminCommand);
      } catch (error) {
        // Silenced visual toast to prevent spam when backend socket isn't ready
        console.warn("Proctoring system offline or not yet configured on the backend.");
      }
    };

    if (attempt && !proctorConnected) initProctoring();

    return () => {
      if (proctorConnected) {
        socketService.leaveProctorRoom(attemptId);
        socketService.offAdminCommand(handleAdminCommand);
      }
    };
  }, [attempt, attemptId, proctorConnected]);

  const handleAdminCommand = async (data) => {
    const { cmd, reason } = data;
    if (cmd === 'terminate') {
      toast.error(`⚠️ Quiz terminated by admin. Reason: ${reason || 'Violation detected'}`, { duration: 10000 });
      await handleAutoSubmit();
    } else if (cmd === 'warn') {
      toast.warning(`⚠️ Warning from admin: ${reason || 'Please follow rules'}`, { duration: 8000 });
    }
  };

  // ==========================================
  // Auto-save & Data Fetching
  // ==========================================
  useEffect(() => {
    if (!attemptId || !attempt || isAutoSubmittingRef.current) return;
    autoSaveIntervalRef.current = setInterval(saveAnswersToServer, 30000);
    return () => clearInterval(autoSaveIntervalRef.current);
  }, [attemptId, attempt, answers]);

  const saveAnswersToServer = async () => {
    if (isAutoSubmittingRef.current) return;
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId, answer, clientTimestamp: new Date().toISOString()
      }));
      await quizzesAPI.autoSaveAnswers(attemptId, { answers: formattedAnswers, tabSwitches: visibilityChangeCountRef.current });
    } catch (error) { console.error("Auto-save error", error); }
  };

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
        console.log("Anti-Cheat Settings from Backend:", res.data.quiz.antiCheatSettings);

        if (!res.data.selectedQuestions?.length) {
          toast.error("Quiz data is incomplete.");
          navigate("/student/enrolled");
          return;
        }
        if (res.data.status !== "in_progress") {
          toast.info("This quiz has already been submitted");
          navigate("/student/enrolled");
          return;
        }

        setAttempt(res.data);

        if (res.data.rawAnswers?.length > 0) {
          const savedAnswers = {};
          res.data.rawAnswers.forEach(ans => savedAnswers[ans.questionId] = ans.answer);
          setAnswers(savedAnswers);
        }

        const durationMs = res.data.quiz.durationMinutes * 60 * 1000;
        const elapsed = Date.now() - new Date(res.data.startTime).getTime();
        setTimeRemaining(Math.floor(Math.max(0, durationMs - elapsed) / 1000));
        startTimer();
      } else {
        toast.error("Attempt not found");
        navigate("/student/enrolled");
      }
    } catch (error) {
      toast.error(error?.response?.data?.timeExpired ? "Session expired" : "Failed to load attempt");
      navigate("/student/enrolled");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Timer & Submissions
  // ==========================================
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) { handleAutoSubmit(); return 0; }
        if (prev === 300) toast.warning("⏰ 5 minutes remaining!", { duration: 5000 });
        if (prev === 60) toast.error("⏰ 1 minute remaining!", { duration: 5000 });
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswerChange = (questionId, answer) => {
    if (isAutoSubmittingRef.current) return;

    setAnswers(prev => {
      const updatedAnswers = { ...prev };
      if (answer === null || (Array.isArray(answer) && answer.length === 0)) {
        delete updatedAnswers[questionId];
      } else {
        updatedAnswers[questionId] = answer;
      }
      return updatedAnswers;
    });

    lastActivityRef.current = Date.now();
  };

  const handleAutoSubmit = async () => {
    if (isAutoSubmittingRef.current) return;
    isAutoSubmittingRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current);
    if (proctorConnected) {
      await proctorAPI.logEvent(attemptId, PROCTOR_EVENTS.ATTEMPT_AUTO_SUBMIT, { reason: 'time_up_or_violation', timestamp: new Date().toISOString() });
    }
    toast.error("⏰ Time's up! Auto-submitting...", { duration: 5000 });
    await submitQuiz(true);
  };

  const submitQuiz = async (isAutoSubmit = false) => {
    if (isAutoSubmittingRef.current && !isAutoSubmit) return;
    if (isAutoSubmit) isAutoSubmittingRef.current = true;

    try {
      setSubmitting(true);
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId, answer, clientTimestamp: new Date().toISOString()
      }));

      if (proctorConnected) {
        await proctorAPI.logEvent(attemptId, isAutoSubmit ? PROCTOR_EVENTS.ATTEMPT_AUTO_SUBMIT : PROCTOR_EVENTS.ATTEMPT_SUBMIT, { answerCount: formattedAnswers.length });
      }

      const res = await quizzesAPI.submit(attemptId, {
        answers: formattedAnswers,
        tabSwitches: visibilityChangeCountRef.current,
        timeSpentSeconds: Math.floor((Date.now() - new Date(attempt.startTime).getTime()) / 1000),
        isAutoSubmit,
        clientFingerprint
      });

      if (res.success) {
        if (document.fullscreenElement) await document.exitFullscreen().catch(() => { });
        if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
        if (proctorConnected) {
          socketService.leaveProctorRoom(attemptId);
          socketService.disconnect();
        }
        toast.success("✅ Quiz submitted successfully!");
        navigate("/student/results");
      } else {
        toast.error(res.error || "Submission failed");
      }
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (isAutoSubmittingRef.current) return;
    const unanswered = attempt.selectedQuestions.filter(q => !answers[q.question._id]);
    if (unanswered.length > 0) {
      if (!window.confirm(`You have ${unanswered.length} unanswered question(s). Submit anyway?`)) return;
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

  // --- Render Helpers ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Initializing Secure Environment</p>
      </div>
    );
  }

  if (!attempt || !attempt.selectedQuestions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md text-center">
          <XCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Data Unavailable</h2>
          <p className="text-sm text-gray-500 mb-6">The quiz data is missing or incomplete.</p>
          <button onClick={() => navigate("/student/enrolled")} className="w-full py-3 bg-[#0A0A0A] text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = attempt.selectedQuestions[currentQuestionIndex];
  const totalQuestions = attempt.selectedQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const hasCurrentAnswer = answers[currentQuestion.question._id] !== undefined;

  // Render Grid Function (used in both desktop sidebar and mobile drawer)
  const renderQuestionGrid = () => (
    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-5 gap-2 sm:gap-3">
      {attempt.selectedQuestions.map((q, idx) => {
        const isAnswered = answers[q.question?._id] !== undefined;
        const isCurrent = idx === currentQuestionIndex;

        let btnStyle = "bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-black";
        if (isAnswered) btnStyle = "bg-[#0A0A0A] border-[#0A0A0A] text-white";
        if (isCurrent) btnStyle = "bg-yellow-400 border-yellow-400 text-black shadow-md ring-2 ring-yellow-400/30";

        return (
          <button
            key={q.question?._id || idx}
            onClick={() => {
              setCurrentQuestionIndex(idx);
              setShowMobileGrid(false);
            }}
            disabled={isAutoSubmittingRef.current}
            className={`w-full aspect-square rounded-xl text-sm font-bold border-2 ${btnStyle} transition-all flex items-center justify-center`}
          >
            {idx + 1}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans selection:bg-yellow-200 relative">

      {/* --- Fullscreen Interaction Overlay (Triggered if browser blocks auto-fullscreen) --- */}
      {needsFullscreenInteraction && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm animate-in fade-in duration-300">
          <div className="p-5 bg-white/10 rounded-full mb-6">
            <Lock className="w-12 h-12 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Secure Environment Required</h2>
          <p className="text-gray-400 mb-8 max-w-md font-medium leading-relaxed">
            Your browser requires your permission to enter fullscreen mode. Please click the button below to secure your environment and resume the assessment.
          </p>
          <button
            onClick={enterFullScreen}
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-[0_0_30px_rgba(250,204,21,0.2)] flex items-center gap-2"
          >
            <Monitor size={20} />
            Enter Fullscreen & Resume
          </button>
        </div>
      )}

      {/* --- Top Sticky Header --- */}
      <header className="bg-[#0A0A0A] text-white sticky top-0 z-40 shadow-xl border-b border-gray-800">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">

          {/* Left: Info */}
          <div className="flex-1 min-w-0 pr-2 sm:pr-4">
            <h1 className="text-base sm:text-xl font-black truncate">
              {attempt.quiz.title}
            </h1>
            <div className="flex items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              <span>Q {currentQuestionIndex + 1} of {totalQuestions}</span>
              <span className="w-1 h-1 rounded-full bg-gray-700 hidden sm:block"></span>
              <span className="hidden sm:block text-gray-300">Answered: {answeredCount}</span>

              {proctorConnected && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-700 hidden sm:block"></span>
                  <span className="flex items-center gap-1 sm:gap-1.5 text-emerald-400 bg-emerald-500/10 px-1.5 sm:px-2 py-0.5 rounded-md border border-emerald-500/20">
                    <ShieldCheck size={12} /> <span className="hidden sm:inline">Proctored</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right: Security & Timer */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {attempt.quiz.antiCheatSettings?.enableWebcamProctoring && (
              <div className="relative hidden md:block w-24 h-14 bg-black rounded-lg overflow-hidden border border-gray-800">
                <video ref={videoRef} autoPlay muted className="w-full h-full object-cover opacity-80" />
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
              </div>
            )}

            <div className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold font-mono text-sm sm:text-lg transition-colors ${timeRemaining < 300
              ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse'
              : 'bg-white/5 text-yellow-400 border border-white/10'
              }`}>
              <Clock size={16} className="sm:w-5 sm:h-5" />
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>

        {/* Warning Banner Row */}
        {(tabSwitches > 0 || (!isFullScreen && attempt.quiz.antiCheatSettings?.enableFullScreen && !needsFullscreenInteraction)) && (
          <div className="bg-red-500 text-white px-4 py-2 flex flex-col sm:flex-row gap-2 sm:gap-6 text-[10px] sm:text-xs font-bold items-center justify-center shadow-inner text-center">
            {tabSwitches > 0 && (
              <span className="flex items-center gap-1.5"><AlertTriangle size={14} /> Tab Switches: {tabSwitches}/{attempt.quiz.antiCheatSettings?.maxTabSwitches || 2}</span>
            )}
            {!isFullScreen && attempt.quiz.antiCheatSettings?.enableFullScreen && !needsFullscreenInteraction && (
              <span className="flex items-center gap-1.5"><MonitorOff size={14} /> Fullscreen Required - Press F11 or click to enable</span>
            )}
          </div>
        )}
      </header>

      {/* --- Main Two-Column Layout --- */}
      <div className="flex-1 w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8">

        {/* LEFT SIDEBAR (Desktop Only) */}
        <aside className="hidden lg:flex w-80 shrink-0 flex-col bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden sticky top-[112px] h-[calc(100vh-144px)]">

          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <LayoutGrid size={20} className="text-gray-400" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Navigator</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {renderQuestionGrid()}
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-6">
            <div className="flex flex-col gap-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
              <span className="flex items-center gap-3"><div className="w-3.5 h-3.5 bg-yellow-400 rounded-sm"></div> Current</span>
              <span className="flex items-center gap-3"><div className="w-3.5 h-3.5 bg-[#0A0A0A] rounded-sm"></div> Answered ({answeredCount})</span>
              <span className="flex items-center gap-3"><div className="w-3.5 h-3.5 bg-white border-2 border-gray-200 rounded-sm"></div> Pending ({totalQuestions - answeredCount})</span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || isAutoSubmittingRef.current}
              className="w-full py-3.5 text-sm font-bold text-white bg-[#0A0A0A] hover:bg-black rounded-xl disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
            >
              {submitting ? "Submitting..." : "Submit Assessment"}
            </button>
          </div>
        </aside>

        {/* RIGHT MAIN AREA (Question & Options) */}
        <main className="flex-1 flex flex-col min-w-0 pb-[80px] lg:pb-0">

          {/* Question Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 p-5 sm:p-8 relative overflow-hidden mb-4 sm:mb-6">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-gray-50 rounded-full opacity-50"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4 sm:mb-6 gap-4">
                <span className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  Question {currentQuestionIndex + 1}
                </span>
                <span className="text-[10px] sm:text-xs font-bold bg-yellow-100 text-yellow-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-yellow-200 flex items-center gap-1.5 shrink-0">
                  {currentQuestion.marks || 1} Points
                </span>
              </div>

              <p className="text-base sm:text-xl text-gray-900 font-medium leading-relaxed whitespace-pre-line">
                {currentQuestion.prompt}
              </p>

              {currentQuestion.type === 'mcq_multi' && (
                <p className="mt-4 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  Select all correct answers
                </p>
              )}
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-3 sm:space-y-4">
            {currentQuestion.choices?.map((choice, idx) => {
              const isMulti = currentQuestion.type === 'mcq_multi';
              const isSelected = isMulti
                ? (answers[currentQuestion.question._id] || []).includes(choice.id)
                : answers[currentQuestion.question._id] === choice.id;

              return (
                <label
                  key={choice.id}
                  className={`group flex items-start p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all duration-200 ${isSelected
                    ? 'border-black bg-gray-50 shadow-sm ring-2 sm:ring-4 ring-gray-100'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                >
                  <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 mr-3 sm:mr-4 shrink-0 mt-0.5">
                    <input
                      type={isMulti ? "checkbox" : "radio"}
                      name={currentQuestion.question._id}
                      value={choice.id}
                      checked={isSelected}
                      onChange={(e) => {
                        if (isMulti) {
                          const current = answers[currentQuestion.question._id] || [];
                          const updated = e.target.checked
                            ? [...current, choice.id]
                            : current.filter(id => id !== choice.id);
                          handleAnswerChange(currentQuestion.question._id, updated);
                        } else {
                          handleAnswerChange(currentQuestion.question._id, e.target.value);
                        }
                      }}
                      className={`w-4 h-4 sm:w-5 sm:h-5 cursor-pointer accent-black ${isSelected ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'} transition-opacity`}
                    />
                  </div>
                  <div className="flex-1 flex gap-3 sm:gap-4">
                    <span className={`font-bold shrink-0 mt-0.5 text-sm sm:text-base ${isSelected ? 'text-black' : 'text-gray-400'}`}>
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span className={`text-sm sm:text-base font-medium ${isSelected ? 'text-black' : 'text-gray-600 group-hover:text-gray-900'}`}>
                      {choice.text}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Clear Response Button */}
          <div className="min-h-[40px] sm:min-h-[48px] mt-3 sm:mt-4 mb-6 sm:mb-8 flex justify-end">
            {hasCurrentAnswer && (
              <button
                onClick={() => handleAnswerChange(currentQuestion.question._id, null)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5 sm:gap-2"
              >
                <XCircle size={14} className="sm:w-4 sm:h-4" /> Clear Response
              </button>
            )}
          </div>

          {/* Desktop Main Area Navigation (Prev / Next) */}
          <div className="hidden lg:flex mt-auto items-center justify-between gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0 || isAutoSubmittingRef.current}
              className="px-6 py-3.5 text-sm font-bold text-gray-900 bg-white border-2 border-gray-200 hover:bg-gray-50 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Previous
            </button>

            {currentQuestionIndex < totalQuestions - 1 && (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                disabled={isAutoSubmittingRef.current}
                className="px-8 py-3.5 text-sm font-bold text-gray-900 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(250,204,21,0.2)] flex items-center gap-2"
              >
                Next <ArrowRight size={16} />
              </button>
            )}
          </div>
        </main>
      </div>

      {/* --- Mobile Only: Sticky Bottom Navigation --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-40 flex items-center justify-between gap-2 shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)] pb-safe">

        {/* Mobile Prev Button */}
        <button
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0 || isAutoSubmittingRef.current}
          className="p-3 sm:px-5 sm:py-3 text-gray-900 bg-gray-100 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Mobile Grid Toggle */}
        <button
          onClick={() => setShowMobileGrid(true)}
          className="flex-1 px-4 py-3 text-xs sm:text-sm font-bold text-gray-700 bg-white border-2 border-gray-200 hover:bg-gray-50 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <LayoutGrid size={16} />
          <span className="hidden sm:inline">Question Grid</span>
          <span className="sm:hidden">Grid</span>
        </button>

        {/* Mobile Next / Submit Button */}
        {currentQuestionIndex < totalQuestions - 1 ? (
          <button
            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            disabled={isAutoSubmittingRef.current}
            className="flex-1 px-4 py-3 text-xs sm:text-sm font-bold text-gray-900 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center gap-1 sm:gap-2 shadow-sm"
          >
            Next <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || isAutoSubmittingRef.current}
            className="flex-1 px-4 py-3 text-xs sm:text-sm font-bold text-white bg-[#0A0A0A] rounded-xl flex items-center justify-center gap-1 sm:gap-2 shadow-sm disabled:opacity-50"
          >
            Submit
          </button>
        )}
      </div>

      {/* --- Mobile Only: Fullscreen Grid Overlay Modal --- */}
      {showMobileGrid && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#F8F9FA] flex flex-col animate-in slide-in-from-bottom-4 duration-200">

          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm pt-safe">
            <div className="flex items-center gap-2">
              <LayoutGrid size={18} className="text-gray-400" />
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Question Navigator</h2>
            </div>
            <button
              onClick={() => setShowMobileGrid(false)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Grid Area */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {renderQuestionGrid()}
          </div>

          {/* Modal Footer (Legend & Action) */}
          <div className="p-4 bg-white border-t border-gray-200 space-y-4 pb-safe">
            <div className="flex flex-row justify-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-yellow-400 rounded-sm"></div> Current</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-[#0A0A0A] rounded-sm"></div> Answered</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-white border border-gray-300 rounded-sm"></div> Pending</span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || isAutoSubmittingRef.current}
              className="w-full py-3.5 text-sm font-bold text-white bg-[#0A0A0A] hover:bg-black rounded-xl disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
            >
              {submitting ? "Submitting..." : "Submit Assessment"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizAttempt;