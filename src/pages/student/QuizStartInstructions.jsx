import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizzesAPI } from "../../api/quizzes.api";
import { toast } from "react-hot-toast";

const QuizStartInstructions = () => {
    const { id: quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [agreed, setAgreed] = useState(false);
    const [cameraAccess, setCameraAccess] = useState(false);
    const [fullscreenReady, setFullscreenReady] = useState(false);
    const [starting, setStarting] = useState(false);
    const videoRef = React.useRef(null);

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
                toast.error("Quiz not found");
                navigate("/student/enrolled");
            }
        } catch (error) {
            console.error("Error fetching quiz:", error);
            toast.error("Failed to load quiz details");
            navigate("/student/enrolled");
        } finally {
            setLoading(false);
        }
    };

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
            toast.error("Camera access is required for this quiz");
            setCameraAccess(false);
        }
    };

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
                toast.success("Quiz started!");
                // Navigate to attempt page
                navigate(`/student/attempt/${res.data._id}`);
            } else {
                toast.error(res.error || "Failed to start quiz");
            }
        } catch (error) {
            console.error("Start quiz error:", error);
            const errorMsg = error?.response?.data?.error || "Failed to start quiz";
            toast.error(errorMsg);
        } finally {
            setStarting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-700 font-medium">Loading quiz details...</p>
                </div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
                    <div className="text-6xl mb-4">❌</div>
                    <p className="text-xl text-red-600 font-semibold mb-4">Quiz not found</p>
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

    const now = new Date();
    const startTime = new Date(quiz.startTime);
    const endTime = new Date(quiz.endTime);
    const isAvailable = now >= startTime && now <= endTime;
    const hasAttemptsLeft = (quiz.userAttemptCount || 0) < quiz.attemptsAllowed;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">{quiz.title}</h1>
                            <p className="text-gray-600 mt-1">{quiz.description}</p>
                        </div>
                        <button
                            onClick={() => navigate("/student/enrolled")}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                            ← Back
                        </button>
                    </div>

                    {/* Quiz Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-sm text-gray-600">Subject</p>
                            <p className="text-lg font-semibold text-blue-700">{quiz.subject?.name || "N/A"}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="text-lg font-semibold text-green-700">{quiz.durationMinutes} min</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <p className="text-sm text-gray-600">Total Marks</p>
                            <p className="text-lg font-semibold text-purple-700">{quiz.totalMarks || "N/A"}</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <p className="text-sm text-gray-600">Attempts Left</p>
                            <p className="text-lg font-semibold text-orange-700">
                                {quiz.attemptsAllowed - (quiz.userAttemptCount || 0)}/{quiz.attemptsAllowed}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Availability Status */}
                {!isAvailable && (
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg mb-6">
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">⏰</span>
                            <div>
                                <p className="font-semibold text-orange-800">Quiz Not Available</p>
                                <p className="text-sm text-orange-700">
                                    Available from: {startTime.toLocaleString()} to {endTime.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {!hasAttemptsLeft && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">🚫</span>
                            <div>
                                <p className="font-semibold text-red-800">No Attempts Remaining</p>
                                <p className="text-sm text-red-700">You have used all available attempts for this quiz</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="text-3xl mr-3">📋</span>
                        Quiz Instructions
                    </h2>

                    <div className="space-y-4 text-gray-700">
                        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                            <p className="font-semibold text-blue-800 mb-2">⏱️ Time Management</p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>You have <strong>{quiz.durationMinutes} minutes</strong> to complete this quiz</li>
                                <li>Timer starts immediately when you begin the quiz</li>
                                <li>Quiz will auto-submit when time expires</li>
                                <li>Warnings will appear at 5 minutes and 1 minute remaining</li>
                            </ul>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                            <p className="font-semibold text-green-800 mb-2">✅ Answering Questions</p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Read each question carefully before answering</li>
                                <li>You can navigate between questions using Previous/Next buttons</li>
                                <li>Use the Question Navigator to jump to any question</li>
                                <li>Answered questions will be marked in green</li>
                                <li>You can change your answers before final submission</li>
                            </ul>
                        </div>

                        {quiz.antiCheatSettings?.enableTabSwitchDetection && (
                            <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                                <p className="font-semibold text-orange-800 mb-2">⚠️ Tab Switch Detection</p>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>Do NOT switch tabs or windows during the quiz</li>
                                    <li>You are allowed <strong>{quiz.antiCheatSettings.maxTabSwitches || 2} warnings</strong></li>
                                    <li>After {quiz.antiCheatSettings.maxTabSwitches || 2} tab switches, quiz will auto-submit</li>
                                    <li>Stay focused on the quiz tab at all times</li>
                                </ul>
                            </div>
                        )}

                        {quiz.antiCheatSettings?.enableFullScreen && (
                            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                                <p className="font-semibold text-purple-800 mb-2">🖥️ Fullscreen Mode</p>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>Fullscreen mode is <strong>mandatory</strong> for this quiz</li>
                                    <li>Click "Enable Fullscreen" below before starting</li>
                                    <li>Do NOT exit fullscreen during the quiz</li>
                                    <li>Exiting fullscreen will trigger warnings</li>
                                </ul>
                            </div>
                        )}

                        {quiz.antiCheatSettings?.disableCopyPaste && (
                            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                                <p className="font-semibold text-red-800 mb-2">🚫 Restrictions</p>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>Copy-paste is disabled</li>
                                    <li>Right-click is disabled</li>
                                    <li>Keyboard shortcuts are restricted</li>
                                </ul>
                            </div>
                        )}

                        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-500">
                            <p className="font-semibold text-gray-800 mb-2">💾 Auto-Save Feature</p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Your answers are automatically saved every 30 seconds</li>
                                <li>If connection is lost, your progress will be restored</li>
                                <li>Make sure to click "Submit Quiz" when you're done</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Security Setup */}
                {isAvailable && hasAttemptsLeft && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">🔒 Security Setup</h2>

                        <div className="space-y-4">
                            {/* Camera Access */}
                            {quiz.antiCheatSettings?.enableWebcamProctoring && (
                                <div className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="font-semibold text-gray-800">📹 Camera Access</p>
                                            <p className="text-sm text-gray-600">Required for proctoring</p>
                                        </div>
                                        {cameraAccess ? (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                                ✓ Enabled
                                            </span>
                                        ) : (
                                            <button
                                                onClick={requestCameraAccess}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                            >
                                                Enable Camera
                                            </button>
                                        )}
                                    </div>
                                    {cameraAccess && (
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            className="w-full max-w-xs rounded-lg border-2 border-green-500"
                                        />
                                    )}
                                </div>
                            )}

                            {/* Fullscreen */}
                            {quiz.antiCheatSettings?.enableFullScreen && (
                                <div className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-800">🖥️ Fullscreen Mode</p>
                                            <p className="text-sm text-gray-600">Required for quiz</p>
                                        </div>
                                        {fullscreenReady ? (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                                ✓ Enabled
                                            </span>
                                        ) : (
                                            <button
                                                onClick={enterFullscreen}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                            >
                                                Enable Fullscreen
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Terms Agreement */}
                {isAvailable && hasAttemptsLeft && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <label className="flex items-start cursor-pointer">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-1 w-5 h-5 text-blue-600"
                            />
                            <span className="ml-3 text-gray-700">
                                I have read and understood all the instructions. I agree to follow the quiz rules and regulations.
                                I understand that any violation may result in disqualification.
                            </span>
                        </label>
                    </div>
                )}

                {/* Start Button */}
                {isAvailable && hasAttemptsLeft && (
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-center">
                        <button
                            onClick={handleStartQuiz}
                            disabled={
                                starting ||
                                !agreed ||
                                (quiz.antiCheatSettings?.enableWebcamProctoring && !cameraAccess) ||
                                (quiz.antiCheatSettings?.enableFullScreen && !fullscreenReady)
                            }
                            className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                        >
                            {starting ? "Starting Quiz..." : "🚀 Start Quiz Now"}
                        </button>
                        <p className="text-white text-sm mt-3">
                            {!agreed && "Please accept the terms and conditions"}
                            {quiz.antiCheatSettings?.enableWebcamProctoring && !cameraAccess && " • Enable camera access"}
                            {quiz.antiCheatSettings?.enableFullScreen && !fullscreenReady && " • Enable fullscreen mode"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizStartInstructions;