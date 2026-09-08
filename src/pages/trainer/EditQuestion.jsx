// src/pages/trainer/EditQuestion.jsx

import React, { useEffect, useState } from "react";
import TrainerLayout from "../../components/Layout/TrainerLayout";
import { useNavigate, useParams } from "react-router-dom";
import QuestionForm from "../../components/forms/QuestionForm";
import { questionsAPI } from "../../api/questions.api";
import { ArrowLeft, Edit3, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

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
        setError("Failed to load question data.");
        toast.error("Failed to load question");
      } finally {
        setLoading(false);
      }
    };

    loadQuestion();
  }, [id]);

  const handleUpdate = async (payload) => {
    const loadingToast = toast.loading("Updating question...");
    try {
      await questionsAPI.update(id, payload);

      toast.dismiss(loadingToast);
      toast.success("Question updated successfully!");
      navigate("/trainer/questions");
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err?.response?.data?.message || "Failed to update question");
    }
  };

  return (
    <TrainerLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto w-full font-sans selection:bg-yellow-200">

        {/* Premium Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate("/trainer/questions")}
              className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black uppercase tracking-widest mb-3 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Question Bank
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-yellow-400 rounded-lg text-black shadow-sm">
                <Edit3 size={24} />
              </div>
              Edit Question
            </h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2">
              Modify and refine your existing question details
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 sm:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 size={40} className="text-yellow-400 animate-spin mb-4" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading question data...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-center">
              <p className="text-sm font-bold text-red-700">{error}</p>
              <button
                onClick={() => navigate("/trainer/questions")}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-colors"
              >
                Go Back
              </button>
            </div>
          ) : (
            <QuestionForm
              mode="edit"
              initialQuestion={question}
              onSubmit={handleUpdate}
            />
          )}
        </div>

      </div>
    </TrainerLayout>
  );
};

export default EditQuestion;