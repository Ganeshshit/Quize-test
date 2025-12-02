import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome Back 👋</h1>
        <p className="text-gray-600">Here’s an overview of your quiz activity.</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="p-6 rounded-xl bg-blue-600 text-white shadow hover:shadow-lg transition">
          <h2 className="text-lg font-semibold">Available Quizzes</h2>
          <p className="text-3xl font-bold mt-3">12</p>
          <Link
            to="/student/quizzes"
            className="inline-block mt-4 text-sm underline"
          >
            View Quizzes →
          </Link>
        </div>

        {/* Card 2 */}
        <div className="p-6 rounded-xl bg-green-600 text-white shadow hover:shadow-lg transition">
          <h2 className="text-lg font-semibold">Completed Attempts</h2>
          <p className="text-3xl font-bold mt-3">8</p>
          <Link
            to="/student/history"
            className="inline-block mt-4 text-sm underline"
          >
            View History →
          </Link>
        </div>

        {/* Card 3 */}
        <div className="p-6 rounded-xl bg-yellow-500 text-white shadow hover:shadow-lg transition">
          <h2 className="text-lg font-semibold">Passed Quizzes</h2>
          <p className="text-3xl font-bold mt-3">5</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>

        <ul className="space-y-3">
          <li className="p-3 border rounded-lg hover:bg-gray-50 transition">
            You completed <span className="font-semibold">Java Basics Quiz</span> — Scored 85%
          </li>
          <li className="p-3 border rounded-lg hover:bg-gray-50 transition">
            You passed <span className="font-semibold">DSA Level-1 Quiz</span> 🎉
          </li>
          <li className="p-3 border rounded-lg hover:bg-gray-50 transition">
            New quiz available: <span className="font-semibold">React Fundamentals</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
