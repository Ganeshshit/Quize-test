// src/components/trainer/GeneratedQuestionsDisplay.jsx
import React from 'react';
import {
  CheckCircle,
  X,
  BookOpen,
  Target,
  BarChart3,
  Sparkles,
  FileText
} from 'lucide-react';

const GeneratedQuestionsDisplay = ({ questions, onClear }) => {
  const getDifficultyBadge = (difficulty) => {
    const configs = {
      easy: "bg-emerald-50 border-emerald-200 text-emerald-700",
      medium: "bg-yellow-50 border-yellow-200 text-yellow-700",
      hard: "bg-red-50 border-red-200 text-red-700"
    };
    const formatted = difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : "Medium";
    return (
      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${configs[difficulty] || configs.medium}`}>
        {formatted}
      </span>
    );
  };

  if (questions.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl text-white shadow-lg">
            <CheckCircle size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">Generated Questions</h2>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              {questions.length} questions successfully generated
            </p>
          </div>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-all"
        >
          <X size={16} />
          Clear
        </button>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <div
            key={question._id || index}
            className="bg-gray-50 border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-all"
          >
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-[10px] font-black uppercase tracking-widest border border-blue-200 flex items-center gap-1">
                #{index + 1}
              </span>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-[10px] font-black uppercase tracking-widest border border-blue-200 flex items-center gap-1">
                <BookOpen size={12} />
                {question.subject?.name || "General"}
              </span>
              {getDifficultyBadge(question.difficulty)}
              <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-[10px] font-black uppercase tracking-widest border border-purple-200 flex items-center gap-1">
                <Target size={12} />
                {question.topic}
              </span>
              <span className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-md text-[10px] font-black uppercase tracking-widest border border-orange-200 flex items-center gap-1">
                <Sparkles size={12} />
                AI Generated
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-gray-900">{question.prompt}</h3>

              {question.choices && question.choices.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {question.choices.map((choice) => (
                    <div
                      key={choice.id}
                      className={`text-sm font-medium px-4 py-2.5 rounded-xl border flex items-center gap-3 ${
                        choice.isCorrect
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900 font-bold'
                          : 'bg-white border-gray-100 text-gray-600'
                      }`}
                    >
                      <span className="font-black text-xs bg-gray-200 px-2 py-1 rounded-md">
                        {choice.id}
                      </span>
                      <span>{choice.text}</span>
                      {choice.isCorrect && (
                        <CheckCircle size={14} className="ml-auto text-emerald-600" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {question.explanation && (
                <div className="bg-white p-3 rounded-xl border border-gray-100">
                  <p className="text-sm font-bold text-gray-700">
                    <span className="text-gray-500">Explanation:</span> {question.explanation}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <FileText size={12} />
                Generated by: {question.generationInfo?.model || 'AI'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeneratedQuestionsDisplay;