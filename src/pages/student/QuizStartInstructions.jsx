// src/pages/student/QuizStartInstructions.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizzesAPI } from "../../api/quizzes.api";
import { toast } from "react-hot-toast";
import {
    XCircle, Clock, Ban, ClipboardList, Timer,
    CheckCircle, AlertTriangle, Monitor, HardDrive,
    Lock, Camera, Rocket, ArrowLeft, Check
} from "lucide-react";

const QuizStartInstructions = () => {
    const { id: quizId } = useParams();
    const navigate = useNavigate();

    // Core State
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [agreed, setAgreed] = useState(false);
    const [cameraAccess, setCameraAccess] = useState(false);
    const [fullscreenReady, setFullscreenReady] = useState(false);
    const [starting, setStarting] = useState(false);
    const videoRef = useRef(null);

    // Logic: Fetch Quiz
    useEffect(() => {
        fetchQuizDetails();
    }, [quizId]);

    const fetchQuizDetails = async () => {
        try {
            setLoading(true);
            const res = await quizzesAPI.getById(quizId);
            if (res.success && res.data) {
                setQuiz(res.data);
            } else {
                toast.error("Assessment not found");
                navigate("/student/enrolled");
            }
        } catch (error) {
            console.error("Error fetching quiz:", error);
            toast.error("Failed to load assessment details");
            navigate("/student/enrolled");
        } finally {
            setLoading(false);
        }
    };

    // Logic: Camera
    const requestCameraAccess = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraAccess(true);
            toast.success("Camera access granted");
        } catch (error) {
            console.error("Camera error:", error);
            toast.error("Camera access is required for this assessment");
            setCameraAccess(false);
        }
    };

    // Logic: Fullscreen
    const enterFullscreen = async () => {
        try {
            await document.documentElement.requestFullscreen();
            setFullscreenReady(true);
            toast.success("Fullscreen mode activated");
        } catch (error) {
            console.error("Fullscreen error:", error);
            toast.error("Fullscreen mode is required");
        }
    };

    // Logic: Start Quiz
    const handleStartQuiz = async () => {
        if (!agreed) {
            toast.error("Please agree to the terms and conditions");
            return;
        }
        if (quiz?.antiCheatSettings?.enableWebcamProctoring && !cameraAccess) {
            toast.error("Camera access is required");
            return;
        }
        if (quiz?.antiCheatSettings?.enableFullScreen && !fullscreenReady) {
            toast.error("Please enable fullscreen mode first");
            return;
        }

        try {
            setStarting(true);
            const res = await quizzesAPI.start(quizId);

            if (res.success && res.data) {
                toast.success("Assessment started!");
                navigate(`/student/attempt/${res.data._id}`);
            } else {
                toast.error(res.error || "Failed to start assessment");
            }
        } catch (error) {
            console.error("Start quiz error:", error);
            const errorMsg = error?.response?.data?.error || "Failed to start assessment";
            toast.error(errorMsg);
        } finally {
            setStarting(false);
        }
    };

    // UI: Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading Assessment Data</p>
            </div>
        );
    }

    // UI: Error State
    if (!quiz) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md text-center">
                    <XCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Assessment Not Found</h2>
                    <button
                        onClick={() => navigate("/student/enrolled")}
                        className="w-full mt-6 py-3 bg-[#0A0A0A] text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const now = new Date();
    // Safety fallback for dates
    const startTime = quiz.startTime ? new Date(quiz.startTime) : new Date();
    const endTime = quiz.endTime ? new Date(quiz.endTime) : new Date();

    const isAvailable = now >= startTime && now <= endTime;
    const hasAttemptsLeft = (quiz.userAttemptCount || 0) < (quiz.attemptsAllowed || 1);

    const needsSystemCheck = (quiz.antiCheatSettings?.enableWebcamProctoring) || (quiz.antiCheatSettings?.enableFullScreen);
    const systemChecksPassed =
        (!quiz.antiCheatSettings?.enableWebcamProctoring || cameraAccess) &&
        (!quiz.antiCheatSettings?.enableFullScreen || fullscreenReady);

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-12 selection:bg-yellow-200">

            {/* Minimalist Top Navigation */}
            <nav className="bg-white border-b border-gray-200 px-4 sm:px-8 h-16 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                    <button
                        onClick={() => navigate("/student/enrolled")}
                        className="flex items-center gap-2 hover:text-black transition-colors"
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                </div>
                <div className="text-xs font-bold px-3 py-1 bg-gray-100 rounded-md text-gray-600 uppercase tracking-widest">
                    Pre-Assessment Check
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">

                {/* Header Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                        {quiz.title || "Untitled Assessment"}
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm sm:text-base font-medium max-w-2xl leading-relaxed">
                        {quiz.description || "Please read all instructions carefully before beginning."}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Subject</p>
                            <p className="text-lg font-bold text-gray-900">{quiz.subject?.name || "General"}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Duration</p>
                            <p className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                                <Clock size={16} className="text-gray-400" /> {quiz.durationMinutes || 0} min
                            </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Marks</p>
                            <p className="text-lg font-bold text-gray-900">{quiz.totalMarks || "N/A"}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Attempts</p>
                            <p className="text-lg font-bold text-gray-900">
                                {(quiz.attemptsAllowed || 1) - (quiz.userAttemptCount || 0)} <span className="text-sm text-gray-400">/ {quiz.attemptsAllowed || 1}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Warnings */}
                {!isAvailable && (
                    <div className="bg-red-50 border border-red-200 p-5 rounded-2xl flex items-start gap-4">
                        <Clock className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-red-900">Assessment Not Available</p>
                            <p className="text-sm text-red-700 font-medium mt-1">
                                Window: {startTime.toLocaleString()} — {endTime.toLocaleString()}
                            </p>
                        </div>
                    </div>
                )}

                {!hasAttemptsLeft && (
                    <div className="bg-red-50 border border-red-200 p-5 rounded-2xl flex items-start gap-4">
                        <Ban className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-red-900">Maximum Attempts Reached</p>
                            <p className="text-sm text-red-700 font-medium mt-1">You have exhausted all available attempts for this module.</p>
                        </div>
                    </div>
                )}

                {/* Instructions Box */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-[#0A0A0A] px-6 py-4 flex items-center gap-3">
                        <ClipboardList className="text-yellow-400" size={20} />
                        <h2 className="text-base font-bold text-white tracking-wide">Candidate Instructions</h2>
                    </div>

                    <div className="p-6 sm:p-8 space-y-8">
                        {/* Instruction Block: Time */}
                        <div className="relative pl-6 border-l-2 border-gray-200">
                            <div className="absolute -left-[11px] top-0 bg-white p-1">
                                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Time Management</h3>
                            <ul className="space-y-2 text-sm font-medium text-gray-600">
                                <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 shrink-0"></div> Duration is strictly {quiz.durationMinutes || 0} minutes.</li>
                                <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 shrink-0"></div> Timer begins immediately upon clicking "Begin Assessment".</li>
                                <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 shrink-0"></div> System auto-submits when the timer reaches zero.</li>
                            </ul>
                        </div>


                        <div className="relative pl-6 border-l-2 border-gray-200">
                            <div className="absolute -left-[11px] top-0 bg-white p-1">
                                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Test Navigation</h3>
                            <ul className="space-y-2 text-sm font-medium text-gray-600">
                                <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 shrink-0"></div> Navigate using Prev/Next buttons or the Question Grid.</li>
                                <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 shrink-0"></div> You may alter your responses at any point prior to final submission.</li>
                                <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 shrink-0"></div> Answers are automatically synced to the server every 30 seconds.</li>
                            </ul>
                        </div>


                        {(quiz.antiCheatSettings?.enableTabSwitchDetection || quiz.antiCheatSettings?.disableCopyPaste) && (
                            <div className="relative pl-6 border-l-2 border-red-200">
                                <div className="absolute -left-[11px] top-0 bg-white p-1">
                                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                                </div>
                                <h3 className="text-sm font-bold text-red-600 uppercase tracking-widest mb-3">Strict Proctoring Rules</h3>
                                <ul className="space-y-2 text-sm font-medium text-gray-600">
                                    {quiz.antiCheatSettings?.enableTabSwitchDetection && (
                                        <>
                                            <li className="flex gap-2 text-red-700 font-bold"><AlertTriangle size={16} className="shrink-0" /> Tab switching is strictly prohibited.</li>
                                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 shrink-0"></div> Maximum allowed deviations: {quiz.antiCheatSettings?.maxTabSwitches || 2}.</li>
                                            <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 shrink-0"></div> Exceeding limits will result in immediate auto-termination.</li>
                                        </>
                                    )}
                                    {quiz.antiCheatSettings?.disableCopyPaste && (
                                        <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 shrink-0"></div> Clipboard operations (Copy, Paste, Right-Click) are disabled.</li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>


                {isAvailable && hasAttemptsLeft && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <CheckCircle size={18} className={systemChecksPassed ? "text-emerald-500" : "text-gray-400"} />
                                System Requirements Check
                            </h3>
                            {systemChecksPassed && (
                                <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded">All Systems Go</span>
                            )}
                        </div>

                        <div className="p-6 sm:p-8 space-y-6">


                            {quiz.antiCheatSettings?.enableWebcamProctoring && (
                                <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border-2 transition-colors ${cameraAccess ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-200 bg-white'}`}>
                                    <div className="flex items-start gap-4 mb-4 sm:mb-0">
                                        <div className={`p-3 rounded-lg ${cameraAccess ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                            <Camera size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Identity Verification (Webcam)</p>
                                            <p className="text-sm font-medium text-gray-500 mt-0.5">Required for AI proctoring</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {cameraAccess && (
                                            <div className="w-16 h-12 bg-black rounded overflow-hidden border border-gray-800">
                                                <video ref={videoRef} autoPlay muted className="w-full h-full object-cover opacity-80" />
                                            </div>
                                        )}
                                        {cameraAccess ? (
                                            <span className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold">
                                                <Check size={16} /> Verified
                                            </span>
                                        ) : (
                                            <button onClick={requestCameraAccess} className="w-full sm:w-auto px-6 py-2 bg-gray-900 text-white rounded-lg font-bold text-sm hover:bg-black transition-colors">
                                                Grant Access
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}


                            {quiz.antiCheatSettings?.enableFullScreen && (
                                <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border-2 transition-colors ${fullscreenReady ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-200 bg-white'}`}>
                                    <div className="flex items-start gap-4 mb-4 sm:mb-0">
                                        <div className={`p-3 rounded-lg ${fullscreenReady ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                            <Monitor size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Secure Environment (Fullscreen)</p>
                                            <p className="text-sm font-medium text-gray-500 mt-0.5">Prevents unauthorized navigation</p>
                                        </div>
                                    </div>

                                    {fullscreenReady ? (
                                        <span className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold">
                                            <Check size={16} /> Active
                                        </span>
                                    ) : (
                                        <button onClick={enterFullscreen} className="w-full sm:w-auto px-6 py-2 bg-gray-900 text-white rounded-lg font-bold text-sm hover:bg-black transition-colors">
                                            Enter Fullscreen
                                        </button>
                                    )}
                                </div>
                            )}


                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <label className="flex items-start gap-4 cursor-pointer group">
                                    <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={agreed}
                                            onChange={(e) => setAgreed(e.target.checked)}
                                            className="w-5 h-5 cursor-pointer appearance-none border-2 border-gray-300 rounded focus:ring-0 checked:border-black checked:bg-black transition-colors group-hover:border-gray-400"
                                        />
                                        <Check size={14} className={`absolute text-white pointer-events-none transition-opacity ${agreed ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 leading-relaxed">
                                        I confirm that my testing environment meets all requirements. I agree to abide by the academic integrity policies and understand that any violation may result in immediate termination of my assessment.
                                    </span>
                                </label>
                            </div>

                        </div>
                    </div>
                )}


                {isAvailable && hasAttemptsLeft && (
                    <div className="pt-4 flex justify-end">
                        <button
                            onClick={handleStartQuiz}
                            disabled={starting || !agreed || (quiz.antiCheatSettings?.enableWebcamProctoring && !cameraAccess) || (quiz.antiCheatSettings?.enableFullScreen && !fullscreenReady)}
                            className={`
                                relative overflow-hidden flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-black text-lg transition-all duration-300
                                ${starting || !agreed || (needsSystemCheck && !systemChecksPassed)
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-yellow-400 text-black hover:bg-yellow-500 hover:shadow-[0_8px_20px_-6px_rgba(250,204,21,0.5)] transform hover:-translate-y-0.5'
                                }
                            `}
                        >
                            {starting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                    Initializing Secure Session...
                                </>
                            ) : (
                                <>
                                    Begin Assessment
                                    <Rocket size={20} />
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizStartInstructions;