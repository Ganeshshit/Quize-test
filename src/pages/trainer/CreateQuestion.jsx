// src/pages/trainer/CreateQuestion.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import TrainerLayout from "../../components/Layout/TrainerLayout";
import QuestionForm from "../../components/forms/QuestionForm";
import { questionsAPI } from "../../api/questions.api";

const CreateQuestion = () => {
  const navigate = useNavigate();

  const handleCreate = async (payload) => {
    await questionsAPI.create(payload);
    navigate("/trainer/questions"); // adjust path if different
  };

  return (
    <TrainerLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Create New Question</h1>
        </div>
        <QuestionForm mode="create" onSubmit={handleCreate} />
      </div>
    </TrainerLayout>
  );
};

export default CreateQuestion;
