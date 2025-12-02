import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import { quizzesAPI } from "../../api/quizzes.api";  // uncomment once API ready

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [search, setSearch] = useState("");

  // TEMP MOCK DATA — replace with API response
  const mockQuizzes = [
    {
      _id: "1",
      title: "Java Basics",
      subject: "Programming",
      duration: 30,
      totalMarks: 20
    },
    {
      _id: "2",
      title: "Data Structures - Level 1",
      subject: "DSA",
      duration: 45,
      totalMarks: 30
    },
    {
      _id: "3",
      title: "Operating System Fundamentals",
      subject: "OS",
      duration: 40,
      totalMarks: 25
    }
  ];

  useEffect(() => {
    // API CALL EXAMPLE
    // quizzesAPI.listForStudent().then(res => setQuizzes(res.data));

    setQuizzes(mockQuizzes); // temporary
  }, []);

  const filteredQuizzes = quizzes.filter(q =>
    q.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Available Quizzes</h1>
        <p className="text-gray-600">Choose a quiz and start whenever you’re ready.</p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search quizzes..."
          className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => (
          <div
            key={quiz._id}
            className="bg-white p-6 shadow rounded-xl hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-gray-800">
              {quiz.title}
            </h2>

            <p className="text-gray-500 mt-1">{quiz.subject}</p>

            <div className="mt-4 text-sm text-gray-700 space-y-1">
              <p><strong>Duration:</strong> {quiz.duration} min</p>
              <p><strong>Total Marks:</strong> {quiz.totalMarks}</p>
            </div>

            <Link
              to={`/student/quizzes/${quiz._id}/start`}
              className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
            >
              Start Quiz →
            </Link>
          </div>
        ))}

        {/* No Results */}
        {filteredQuizzes.length === 0 && (
          <p className="text-gray-500">No quizzes found.</p>
        )}
      </div>
    </div>
  );
};

export default QuizList;
