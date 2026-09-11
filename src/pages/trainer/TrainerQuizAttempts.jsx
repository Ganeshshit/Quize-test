import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TrainerLayout from "../../components/Layout/TrainerLayout";
import { quizzesAPI } from "../../api/quizzes.api";
import { Eye, ShieldAlert, CheckCircle } from "lucide-react";

const TrainerQuizAttempts = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAttempts();
    }, [quizId]);

    const fetchAttempts = async () => {
        try {
            setLoading(true);
            // Fetching the data from the new endpoint we just added
            const res = await quizzesAPI.getQuizAttemptsAdmin(quizId);
            if (res.success && res.data) {
                setAttempts(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch attempts:", error);
        } finally {
            setLoading(false);
        }
    };

    // Maps the backend risk score to the exact alert thresholds from the documentation
    const getRiskBadge = (score) => {
        if (score >= 25) {
            return <span className="bg-red-900 text-white px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-max animate-pulse"><ShieldAlert size={14} /> CRITICAL ({score})</span>;
        }
        if (score >= 15) {
            return <span className="bg-red-500 text-white px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-max"><ShieldAlert size={14} /> HIGH ({score})</span>;
        }
        if (score >= 7) {
            return <span className="bg-yellow-500 text-white px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-max">WARNING ({score})</span>;
        }
        return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-max"><CheckCircle size={14} /> LOW ({score})</span>;
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

    return (
        <TrainerLayout>
            <div className="max-w-6xl mx-auto p-6 space-y-6 w-full font-sans">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student Attempts & Security Logs</h1>
                    <p className="text-gray-500 text-sm mt-1">Review scores and anti-cheating risk profiles for this assessment.</p>
                </div>

                <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 font-bold text-gray-700">Student Name</th>
                                    <th className="p-4 font-bold text-gray-700">Status</th>
                                    <th className="p-4 font-bold text-gray-700">Final Score</th>
                                    <th className="p-4 font-bold text-gray-700">Cheating Risk</th>
                                    <th className="p-4 font-bold text-gray-700">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {attempts.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-gray-500 font-medium">
                                            No attempts have been recorded for this quiz yet.
                                        </td>
                                    </tr>
                                ) : (
                                    attempts.map((attempt) => (
                                        <tr key={attempt._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-medium text-gray-900">
                                                {attempt.user?.name || "Unknown Student"}
                                                <div className="text-xs text-gray-500 font-normal">{attempt.user?.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className="capitalize bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-semibold">
                                                    {attempt.status?.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="p-4 font-bold text-gray-900">
                                                {attempt.totalScore} <span className="text-gray-400 font-normal">/ {attempt.maxScore}</span>
                                            </td>
                                            <td className="p-4">
                                                {getRiskBadge(attempt.riskScore || 0)}
                                            </td>
                                            <td className="p-4">
                                                {/* This button will route to the Detective View we build next! */}
                                                <button
                                                    onClick={() => navigate(`/trainer/quiz/${quizId}/audit/${attempt._id}`)}
                                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
                                                >
                                                    <Eye size={16} /> Audit Logs
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </TrainerLayout>
    );
};


export default TrainerQuizAttempts;