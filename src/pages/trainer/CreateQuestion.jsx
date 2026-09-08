// src/pages/trainer/CreateQuestion.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import TrainerLayout from "../../components/Layout/TrainerLayout";
import QuestionForm from "../../components/forms/QuestionForm";
import { questionsAPI } from "../../api/questions.api";
import { ArrowLeft, HelpCircle } from "lucide-react";
import toast from "react-hot-toast";

const CreateQuestion = () => {
  const navigate = useNavigate();

  const handleCreate = async (payload) => {
    try {
      // Show loading toast (optional, but good UX)
      const loadingToast = toast.loading("Saving question...");

      await questionsAPI.create(payload);

      toast.dismiss(loadingToast);
      toast.success("Question created successfully!");
      navigate("/trainer/questions");
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Failed to create question");
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
                <HelpCircle size={24} />
              </div>
              Create New Question
            </h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2">
              Add a new question to your central repository
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 sm:p-8">
          {/* Note: The internal styling of QuestionForm will dictate how the actual inputs look, 
              but this wrapper ensures it fits the enterprise theme layout perfectly */}
          <QuestionForm mode="create" onSubmit={handleCreate} />
        </div>

      </div>
    </TrainerLayout>
  );
};

export default CreateQuestion;