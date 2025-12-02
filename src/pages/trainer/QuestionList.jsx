// src/pages/trainer/QuestionList.jsx

import React, { useEffect, useState } from "react";
import TrainerLayout from "../../components/Layout/TrainerLayout";
import QuestionCard from "../../components/trainer/QuestionCard";
import { Link } from "react-router-dom";
import { questionsAPI } from "../../api/questions.api";

const QuestionList = () => {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load questions from backend
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await questionsAPI.getAll();

        // Your API response: { success: true, data: [...] }
        setQuestions(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load questions");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // Delete a question (Admin only per backend rules)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;

    try {
      await questionsAPI.delete(id);

      // Remove from UI instantly
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      alert("Failed to delete question");
      console.error(err);
    }
  };

  return (
    <TrainerLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Question Bank</h1>

        <Link
          to="/trainer/questions/create"
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Create Question
        </Link>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search question..."
        className="w-full mb-4 p-2 border rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Loading / Error / No data */}
      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : questions.length === 0 ? (
        <div>No questions found</div>
      ) : (
        <div className="grid gap-4">
          {questions
            .filter((q) =>
              q.prompt?.toLowerCase().includes(search.toLowerCase())
            )
            .map((q) => (
              <QuestionCard
                key={q._id}
                question={q}
                onDelete={handleDelete}
              />
            ))}
        </div>
      )}
    </TrainerLayout>
  );
};

export default QuestionList;
