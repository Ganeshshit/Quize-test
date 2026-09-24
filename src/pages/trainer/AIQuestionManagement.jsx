// src/pages/trainer/AIQuestionManagement.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TrainerLayout from '../../components/Layout/TrainerLayout';
import AIQuestionGenerator from '../../components/trainer/AIQuestionGenerator';
import PendingQuestionsReview from '../../components/trainer/PendingQuestionsReview';
import GeneratedQuestionsDisplay from '../../components/trainer/GeneratedQuestionsDisplay';
import {
  Sparkles,
  Clock,
  ArrowLeft
} from 'lucide-react';

const AIQuestionManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('generate');
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  const handleQuestionsGenerated = (questions) => {
    setGeneratedQuestions(questions);
    // Stay on generate tab but show the generated questions
  };

  const tabs = [
    {
      id: 'generate',
      label: 'Generate AI Questions',
      icon: Sparkles,
      description: 'Create questions using AI'
    },
    {
      id: 'review',
      label: 'Review Pending',
      icon: Clock,
      description: 'Approve or reject questions'
    }
  ];

  return (
    <TrainerLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full font-sans selection:bg-yellow-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate('/trainer/questions')}
              className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-700 mb-3 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Question Bank
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg text-white shadow-sm">
                <Sparkles size={24} />
              </div>
              AI Question Management
            </h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2">
              Generate, review, and manage AI-powered questions
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-gray-100 p-2 rounded-2xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="min-h-[60vh]">
          {activeTab === 'generate' && (
            <div className="space-y-6">
              <AIQuestionGenerator onSuccess={handleQuestionsGenerated} />
              {generatedQuestions.length > 0 && (
                <GeneratedQuestionsDisplay 
                  questions={generatedQuestions}
                  onClear={() => setGeneratedQuestions([])}
                />
              )}
            </div>
          )}

          {activeTab === 'review' && (
            <PendingQuestionsReview />
          )}
        </div>
      </div>
    </TrainerLayout>
  );
};

export default AIQuestionManagement;