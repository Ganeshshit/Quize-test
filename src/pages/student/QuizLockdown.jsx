// src/components/student/QuizLockdown.jsx
import React, { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Maximize } from "lucide-react";

const QuizLockdown = ({
    children,
    settings,
    onViolation,
    onForceSubmit
}) => {
    const [violationCount, setViolationCount] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Destructure settings with safe defaults
    const {
        enableTabSwitchDetection = true,
        maxTabSwitches = 3,
        disableCopyPaste = true,
        enableFullScreen = false
    } = settings || {};

    const handleViolation = useCallback((type, message) => {
        setViolationCount(prev => {
            const newCount = prev + 1;

            // Log violation to backend via prop
            if (onViolation) {
                onViolation({ type, message, timestamp: new Date(), currentCount: newCount });
            }

            // Force submit if max tab switches reached
            if (enableTabSwitchDetection && type === "tab_switch" && newCount > maxTabSwitches) {
                if (onForceSubmit) onForceSubmit("Maximum tab switches exceeded.");
                return newCount;
            }

            setShowWarning(true);
            return newCount;
        });
    }, [enableTabSwitchDetection, maxTabSwitches, onViolation, onForceSubmit]);

    // 1. Tab Switch & Focus Detection
    useEffect(() => {
        if (!enableTabSwitchDetection) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                handleViolation("tab_switch", "User switched tabs or minimized the browser.");
            }
        };

        const handleWindowBlur = () => {
            handleViolation("focus_loss", "Browser window lost focus.");
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleWindowBlur);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleWindowBlur);
        };
    }, [enableTabSwitchDetection, handleViolation]);

    // 2. Copy/Paste & Context Menu Prevention
    useEffect(() => {
        if (!disableCopyPaste) return;

        const preventAction = (e) => {
            e.preventDefault();
            handleViolation("clipboard", "Copy/paste or right-click is disabled during the quiz.");
        };

        document.addEventListener("contextmenu", preventAction);
        document.addEventListener("copy", preventAction);
        document.addEventListener("paste", preventAction);
        document.addEventListener("cut", preventAction);

        return () => {
            document.removeEventListener("contextmenu", preventAction);
            document.removeEventListener("copy", preventAction);
            document.removeEventListener("paste", preventAction);
            document.removeEventListener("cut", preventAction);
        };
    }, [disableCopyPaste, handleViolation]);

    // 3. Keyboard Shortcut Prevention (DevTools, Print, Refresh)
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Block F12 (DevTools)
            if (e.key === "F12") {
                e.preventDefault();
                handleViolation("keyboard_shortcut", "Developer tools are disabled.");
            }

            // Block Ctrl/Cmd + Shift + I/J/C (DevTools)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) {
                e.preventDefault();
                handleViolation("keyboard_shortcut", "Developer tools are disabled.");
            }

            // Block Ctrl/Cmd + U (View Source)
            if ((e.ctrlKey || e.metaKey) && e.key.toUpperCase() === "U") {
                e.preventDefault();
                handleViolation("keyboard_shortcut", "Viewing page source is disabled.");
            }

            // Block Ctrl/Cmd + P (Print/Save to PDF)
            if ((e.ctrlKey || e.metaKey) && e.key.toUpperCase() === "P") {
                e.preventDefault();
                handleViolation("keyboard_shortcut", "Printing is disabled during the quiz.");
            }
        };

        // Add event listener to the capture phase so it triggers before other handlers
        document.addEventListener("keydown", handleKeyDown, true);

        return () => {
            document.removeEventListener("keydown", handleKeyDown, true);
        };
    }, [handleViolation]);

    // 4. Fullscreen Management
    const requestFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => console.log(err));
        }
    };

    useEffect(() => {
        if (!enableFullScreen) return;

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFullscreen(false);
                handleViolation("fullscreen_exit", "User exited fullscreen mode.");
            } else {
                setIsFullscreen(true);
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, [enableFullScreen, handleViolation]);

    // If fullscreen is required but not active, force them to enter it
    if (enableFullScreen && !isFullscreen) {
        return (
            <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center p-6 text-center z-[100] font-sans">
                <div className="bg-white p-8 rounded-3xl max-w-md shadow-2xl space-y-6">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                        <Maximize size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 mb-2">Fullscreen Required</h2>
                        <p className="text-sm font-medium text-gray-600">
                            This quiz requires you to be in fullscreen mode to ensure exam integrity. Exiting fullscreen will be recorded.
                        </p>
                    </div>
                    <button
                        onClick={requestFullscreen}
                        className="w-full py-4 bg-[#0A0A0A] hover:bg-black text-white font-black rounded-xl transition-colors"
                    >
                        Enter Fullscreen & Continue
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full min-h-screen select-none">
            {/* The Actual Quiz Content */}
            {children}

            {/* Violation Warning Overlay */}
            {showWarning && (
                <div className="fixed inset-0 bg-red-900/90 flex flex-col items-center justify-center p-6 text-center z-[200] backdrop-blur-sm animate-in fade-in font-sans">
                    <div className="bg-white p-8 rounded-3xl max-w-md shadow-2xl space-y-6 border-4 border-red-500 animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <AlertTriangle size={40} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Warning!</h2>
                            <p className="text-sm font-bold text-gray-600 mb-4">
                                Suspicious activity detected. Navigating away from the quiz or attempting to copy content is strictly prohibited.
                            </p>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4">
                                <span className="text-xs font-black uppercase tracking-widest text-gray-500 block mb-1">
                                    Violations Recorded
                                </span>
                                <span className="text-2xl font-black text-red-600">
                                    {violationCount} {maxTabSwitches > 0 ? `/ ${maxTabSwitches}` : ""}
                                </span>
                            </div>

                            {enableTabSwitchDetection && maxTabSwitches > 0 && violationCount >= maxTabSwitches && (
                                <p className="text-xs font-black text-red-600 uppercase tracking-widest bg-red-50 p-2 rounded-lg">
                                    Final warning. Next violation will auto-submit.
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => setShowWarning(false)}
                            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl transition-colors shadow-lg"
                        >
                            I Understand, Return to Quiz
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizLockdown;