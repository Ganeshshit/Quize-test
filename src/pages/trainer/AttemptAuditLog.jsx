import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TrainerLayout from "../../components/Layout/TrainerLayout";
import { quizzesAPI } from "../../api/quizzes.api";
import {
    ArrowLeft, ShieldAlert, Clock, Monitor,
    Copy, Keyboard, MousePointerClick, Activity
} from "lucide-react";
import { toast } from "react-hot-toast";

const AttemptAuditLog = () => {
    const { quizId, attemptId } = useParams();
    const navigate = useNavigate();

    const [attempt, setAttempt] = useState(null);
    const [audit, setAudit] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAuditDetails();
    }, [quizId, attemptId]);

    const fetchAuditDetails = async () => {
        try {
            setLoading(true);

            // Fetch both the student's final score and their cheating timeline at the same time
            const [attemptRes, auditRes] = await Promise.all([
                quizzesAPI.getAttemptDetailAdmin(quizId, attemptId),
                quizzesAPI.getAttemptAuditLog(attemptId)
            ]);

            if (attemptRes.success && auditRes.success) {
                setAttempt(attemptRes.data);
                setAudit(auditRes.data);
            } else {
                toast.error("Failed to load audit logs");
            }
        } catch (error) {
            console.error("Audit fetch error:", error);
            toast.error("An error occurred while fetching the logs.");
        } finally {
            setLoading(false);
        }
    };

    // Helper to pick the right icon based on the cheating event type
    const getEventIcon = (eventType) => {
        switch (eventType) {
            case "tab_switch": return <MousePointerClick size={16} className="text-orange-500" />;
            case "fullscreen_exit": return <Monitor size={16} className="text-red-500" />;
            case "copy":
            case "paste": return <Copy size={16} className="text-yellow-600" />;
            case "keyboard_shortcut": return <Keyboard size={16} className="text-purple-500" />;
            default: return <Activity size={16} className="text-gray-400" />;
        }
    };

    if (loading) {
        return (
            <TrainerLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </TrainerLayout>
        );
    }

    if (!attempt || !audit) {
        return (
            <TrainerLayout>
                <div className="p-6 text-red-500">Log data not found.</div>
            </TrainerLayout>
        );
    }

    const isHighRisk = attempt.riskScore >= 15;

    return (
        <TrainerLayout>
            <div className="max-w-5xl mx-auto p-6 space-y-6">
                {/* Navigation */}
                <button
                    onClick={() => navigate(`/trainer/quiz/${quizId}/attempts`)}
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Class List
                </button>

                {/* Header Profile */}
                <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">
                            {attempt.user?.name || "Student"} - Integrity Report
                        </h1>
                        <p className="text-gray-500 font-medium">{attempt.user?.email}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg border-2 flex items-center gap-2 font-bold ${isHighRisk ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                        <ShieldAlert size={20} />
                        Total Risk Score: {attempt.riskScore || 0}
                    </div>
                </div>

                {/* Quick Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 border border-gray-200 rounded-xl">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Violations</p>
                        <p className="text-2xl font-black text-gray-900">{audit.summary?.totalEvents || 0}</p>
                    </div>
                    <div className="bg-white p-4 border border-gray-200 rounded-xl">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tab Switches</p>
                        <p className="text-2xl font-black text-orange-600">{audit.summary?.tab_switch || 0}</p>
                    </div>
                    <div className="bg-white p-4 border border-gray-200 rounded-xl">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Copy/Paste Attempts</p>
                        <p className="text-2xl font-black text-yellow-600">{(audit.summary?.copy || 0) + (audit.summary?.paste || 0)}</p>
                    </div>
                    <div className="bg-white p-4 border border-gray-200 rounded-xl">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Score</p>
                        <p className="text-2xl font-black text-blue-600">{attempt.totalScore} <span className="text-sm text-gray-400 font-medium">/ {attempt.maxScore}</span></p>
                    </div>
                </div>

                {/* Incident Timeline */}
                <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                        <Clock className="text-gray-500" size={18} />
                        <h2 className="font-bold text-gray-800">Violation Timeline</h2>
                    </div>

                    <div className="p-6">
                        {!audit.events || audit.events.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 font-medium">
                                No violations recorded. The student maintained a secure environment.
                            </div>
                        ) : (
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                                {audit.events.map((event, index) => (
                                    <div key={event._id || index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        {/* Timeline Marker */}
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-gray-100 text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                            {getEventIcon(event.eventType)}
                                        </div>

                                        {/* Event Card */}
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-bold text-gray-900 capitalize text-sm">
                                                    {event.eventType.replace("_", " ")}
                                                </h3>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${event.riskWeight > 2 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    +{event.riskWeight} Risk
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 mb-2 font-mono">
                                                {new Date(event.clientTimestamp).toLocaleTimeString()}
                                            </div>
                                            {event.ipAddress && (
                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                    IP: {event.ipAddress}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </TrainerLayout>
    );
};

export default AttemptAuditLog;