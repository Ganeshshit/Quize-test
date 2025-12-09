import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentQuizStore } from "../../store/studentQuiz.store";

const EnrolledQuizList = () => {
    const navigate = useNavigate();
    const { enrolledQuizzes, loading, fetchEnrolledQuizzes } = useStudentQuizStore();

    useEffect(() => {
        fetchEnrolledQuizzes();
    }, []);

    const handleStartQuiz = (quizId) => {
        navigate(`/student/quiz/${quizId}/start`);
    };

    if (loading) return <p className="p-5">Loading enrolled quizzes...</p>;

    return (
        <div className="p-5">
            <h2 className="text-xl font-semibold mb-4">My Enrolled Quizzes</h2>

            {enrolledQuizzes.length === 0 ? (
                <p>No enrolled quizzes yet.</p>
            ) : (
                <div className="space-y-4">
                    {enrolledQuizzes.map((quiz) => {
                        const now = new Date();
                        const isAvailable = now >= new Date(quiz.startTime) && now <= new Date(quiz.endTime);
                        const hasAttemptsLeft = quiz.userAttemptCount < quiz.attemptsAllowed;
                        const canStart = isAvailable && hasAttemptsLeft && quiz.isPublished;

                        return (
                            <div
                                key={quiz._id}
                                className="border p-4 rounded shadow-sm bg-white"
                            >
                                <h3 className="text-lg font-bold">{quiz.title}</h3>
                                <p className="text-gray-600">{quiz.description}</p>

                                <p className="text-sm mt-2">
                                    Subject: <b>{quiz.subject?.name}</b>
                                </p>

                                <p className="text-sm">
                                    Duration: <b>{quiz.durationMinutes} minutes</b>
                                </p>

                                <p className="text-sm">
                                    Attempts: <b>{quiz.userAttemptCount}/{quiz.attemptsAllowed}</b>
                                </p>

                                <p className="text-sm">
                                    Status: <b>{quiz.isPublished ? "Published" : "Unpublished"}</b>
                                </p>

                                {!isAvailable && (
                                    <p className="text-sm text-orange-600 mt-2">
                                        Available: {new Date(quiz.startTime).toLocaleString()} - {new Date(quiz.endTime).toLocaleString()}
                                    </p>
                                )}

                                {!hasAttemptsLeft && (
                                    <p className="text-sm text-red-600 mt-2">
                                        Maximum attempts reached
                                    </p>
                                )}

                                <button
                                    onClick={() => handleStartQuiz(quiz._id)}
                                    disabled={!canStart}
                                    className={`mt-3 px-4 py-2 rounded ${canStart
                                            ? "bg-blue-600 text-white hover:bg-blue-700"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        }`}
                                >
                                    {!isAvailable ? "Not Available Yet" : !hasAttemptsLeft ? "No Attempts Left" : "Start Quiz"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EnrolledQuizList;