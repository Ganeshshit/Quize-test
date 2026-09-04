import React, { useEffect, useState } from "react";
// import { attemptsAPI } from "../../api/attempts.api";  // Uncomment when API ready

const History = () => {
    const [attempts, setAttempts] = useState([]);

    // TEMP MOCK DATA (replace with API data)
    const mockAttempts = [
        {
            _id: "a1",
            quizTitle: "Java Basics",
            score: 18,
            totalMarks: 20,
            status: "Passed",
            date: "2024-12-10"
        },
        {
            _id: "a2",
            quizTitle: "Data Structures - Level 1",
            score: 12,
            totalMarks: 30,
            status: "Failed",
            date: "2024-12-08"
        },
        {
            _id: "a3",
            quizTitle: "Operating Systems Fundamentals",
            score: null,
            totalMarks: 25,
            status: "Pending",
            date: "2024-12-07"
        },
    ];

    useEffect(() => {
        // Example API call
        // attemptsAPI.myAttempts().then(res => setAttempts(res.data));

        setAttempts(mockAttempts);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "Passed":
                return "bg-green-100 text-green-700";
            case "Failed":
                return "bg-red-100 text-red-700";
            default:
                return "bg-yellow-100 text-yellow-700";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Attempt History</h1>
                <p className="text-gray-600">Track your past quiz performance.</p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white shadow rounded-xl">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-gray-700">Quiz</th>
                            <th className="p-4 text-sm font-semibold text-gray-700">Score</th>
                            <th className="p-4 text-sm font-semibold text-gray-700">Status</th>
                            <th className="p-4 text-sm font-semibold text-gray-700">Date</th>
                        </tr>
                    </thead>

                    <tbody>
                        {attempts.map((att) => (
                            <tr key={att._id} className="border-b hover:bg-gray-50 transition">
                                <td className="p-4 whitespace-nowrap font-medium text-gray-800">
                                    {att.quizTitle}
                                </td>

                                <td className="p-4">
                                    {att.score !== null ? (
                                        <span className="font-semibold">
                                            {att.score}/{att.totalMarks}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 italic">—</span>
                                    )}
                                </td>

                                <td className="p-4">
                                    <span
                                        className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(att.status)}`}
                                    >
                                        {att.status}
                                    </span>
                                </td>

                                <td className="p-4 text-gray-600">{att.date}</td>
                            </tr>
                        ))}

                        {attempts.length === 0 && (
                            <tr>
                                <td className="p-4 text-gray-500" colSpan="4">
                                    No attempts yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default History;
