// src/pages/trainer/Dashboard.jsx
import React from "react";
import TrainerLayout from "../../components/Layout/TrainerLayout";

const TrainerDashboard = () => {
  return (
    <TrainerLayout>
      <h2 className="text-2xl font-semibold mb-4">Trainer Dashboard</h2>

      {/* Simple cards summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-sm text-slate-500">Total Quizzes</p>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-sm text-slate-500">Active Quizzes</p>
          <p className="text-2xl font-bold">3</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-sm text-slate-500">Total Attempts</p>
          <p className="text-2xl font-bold">145</p>
        </div>
      </div>

      {/* Recent quizzes list (placeholder) */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-2">Recent Quizzes</h3>
        <ul className="space-y-2 text-sm">
          <li>JavaScript Basics – closes today</li>
          <li>Data Structures – scheduled for tomorrow</li>
        </ul>
      </div>
    </TrainerLayout>
  );
};

export default TrainerDashboard;
