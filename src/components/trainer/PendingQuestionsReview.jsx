// src/components/trainer/PendingQuestionsReview.jsx
import React, { useState, useEffect } from 'react';
import {
  questionsAPI
} from '../../api/questions.api';
import toast from 'react-hot-toast';
import {
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  BookOpen,
  Target,
  BarChart3,
  Sparkles,
  FileText,
  X
} from 'lucide-react';

const PendingQuestionsReview = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    topic: '',
    difficulty: ''
  });

  useEffect(() => {
    fetchPendingQuestions();
  }, [filters]);

  const fetchPendingQuestions = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await questionsAPI.getPendingQuestions(filters);
      console.log('Pending questions response:', response);
      
      // Handle different response structures
      let questionsData = [];
      if (response && response.success) {
        if (Array.isArray(response.data)) {
          questionsData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          questionsData = response.data.data;
        }
      } else if (Array.isArray(response)) {
        questionsData = response;
      }
      
      // Filter for AI-generated and unverified questions
      const pendingQuestions = questionsData.filter(q => 
        q.source === 'ai' && q.isVerified === false
      );
      
      setQuestions(pendingQuestions);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch pending questions';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (questionId) => {
    try {
      await questionsAPI.approveQuestion(questionId);
      toast.success('Question approved successfully');
      fetchPendingQuestions();
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to approve question';
      toast.error(errorMessage);
    }
  };

  const handleReject = async (questionId, reason) => {
    try {
      await questionsAPI.rejectQuestion(questionId, reason);
      toast.success('Question rejected successfully');
      fetchPendingQuestions();
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to reject question';
      toast.error(errorMessage);
    }
  };

  const inputClasses = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[40vh]">
        <Loader2 size={40} className="text-yellow-400 animate-spin mb-4" />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Pending Questions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl text-white shadow-lg">
          <Clock size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900">Pending AI Questions Review</h2>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Review and approve AI-generated questions
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-bold text-red-700">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-4 sm:p-5 flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative w-full lg:max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by topic..."
            value={filters.topic}
            onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
            className={`${inputClasses} pl-11`}
          />
        </div>

        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4 lg:ml-auto">
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            className={inputClasses}
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 min-h-[40vh] bg-white border border-gray-200 rounded-3xl border-dashed">
          <div className="p-4 bg-gray-50 rounded-full text-gray-400 mb-4">
            <Clock size={32} />
          </div>
          <h3 className="text-lg font-black text-gray-900">No Pending Questions</h3>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">
            No questions waiting for review
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map(question => (
            <QuestionCard
              key={question._id}
              question={question}
              onApprove={() => handleApprove(question._id)}
              onReject={(reason) => handleReject(question._id, reason)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const QuestionCard = ({ question, onApprove, onReject }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleRejectSubmit = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    onReject(rejectionReason);
    setShowRejectModal(false);
    setRejectionReason('');
  };

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

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:border-gray-300 transition-all">
      <div className="flex flex-wrap items-center gap-2 mb-4">
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

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">{question.prompt}</h3>

        {question.choices && question.choices.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {question.choices.map((choice) => (
              <div
                key={choice.id}
                className={`text-sm font-medium px-4 py-3 rounded-xl border flex items-center gap-3 ${
                  choice.isCorrect
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900 font-bold'
                    : 'bg-gray-50 border-gray-100 text-gray-600'
                }`}
              >
                <span className="font-black text-xs bg-gray-200 px-2 py-1 rounded-md">
                  {choice.id}
                </span>
                <span>{choice.text}</span>
                {choice.isCorrect && (
                  <CheckCircle size={16} className="ml-auto text-emerald-600" />
                )}
              </div>
            ))}
          </div>
        )}

        {question.explanation && (
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
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

      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={onApprove}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-all"
        >
          <CheckCircle size={16} />
          Approve
        </button>
        <button
          onClick={() => setShowRejectModal(true)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-all"
        >
          <XCircle size={16} />
          Reject
        </button>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-gray-900">Reject Question</h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition-all resize-none mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-all"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingQuestionsReview;