// src/pages/trainer/EditQuestion.jsx

import React, { useEffect, useState } from "react";
import TrainerLayout from "../../components/Layout/TrainerLayout";
import { useNavigate, useParams } from "react-router-dom";
import QuestionForm from "../../components/forms/QuestionForm";
import { questionsAPI } from "../../api/questions.api";

const EditQuestion = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Normalize backend => QuestionForm format
  const normalize = (q) => {
    if (!q) return null;

    return {
      _id: q._id,
      subject: q.subject?._id || "",

      type: q.type,
      prompt: q.prompt,

      // choices need only id + text
      choices: q.choices?.map((c) => ({
        id: c.id,
        text: c.text,
      })) || [],

      correct: q.correct,     // "B"

      marks: q.marks || 1,

      // Convert your backend difficulty/tags into metadata
      metadata: {
        difficulty: q.difficulty || "easy",
        tags: q.tags || [],
      },
    };
  };

  useEffect(() => {
    const loadQuestion = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await questionsAPI.getById(id);
        const norm = normalize(res);

        setQuestion(norm);
      } catch (err) {
        console.error(err);
        setError("Failed to load question");
      } finally {
        setLoading(false);
      }
    };

    loadQuestion();
  }, [id]);

  const handleUpdate = async (payload) => {
    try {
      await questionsAPI.update(id, payload);

      alert("Question updated successfully");
      navigate("/trainer/questions");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update question");
    }
  };

  return (
    <TrainerLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Edit Question</h1>

        {loading ? (
          <div className="text-gray-500">Loading question...</div>
        ) : error ? (
          <div className="bg-red-100 p-3 rounded text-red-700">{error}</div>
        ) : (
          <QuestionForm
            mode="edit"
            initialQuestion={question}
            onSubmit={handleUpdate}
          />
        )}
      </div>
    </TrainerLayout>
  );
};

export default EditQuestion;
