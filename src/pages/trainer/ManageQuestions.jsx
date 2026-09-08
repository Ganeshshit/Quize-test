// src/pages/trainer/ManageQuestions.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TrainerLayout from '../../components/Layout/TrainerLayout';
import {
  Library,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  Filter,
  HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { questionsAPI } from '../../api/questions.api';

const ManageQuestions = () => {
  const navigate = useNavigate();

  // State
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  // Load subjects and questions on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await questionsAPI.getAll({ limit: 1000 });
      const allQuestions = res.data || [];
      setQuestions(allQuestions);

      // Extract unique subjects
      const map = new Map();
      allQuestions.forEach((q) => {
        if (q.subject?._id) {
          map.set(q.subject._id, q.subject);
        }
      });
      setSubjects([...map.values()]);

    } catch (err) {
      console.error("Failed to load questions:", err);
      setError("Failed to load question bank.");
      toast.error("Failed to load question bank.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    try {
      await questionsAPI.delete(id);
      setQuestions(prev => prev.filter(q => q._id !== id));
      toast.success("Question deleted successfully.");
    } catch (err) {
      console.error("Failed to delete question:", err);
      toast.error("Failed to delete question.");
    }
  };

  // Filter Logic
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.text?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === "all" || q.subject?._id === selectedSubject;
    const matchesDifficulty = selectedDifficulty === "all" || q.difficulty === selectedDifficulty;
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

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

  const inputClasses = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all";

  return (
    <TrainerLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full font-sans selection:bg-yellow-200">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-yellow-400 rounded-lg text-black shadow-sm">
                <Library size={24} />
              </div>
              Question Bank Management
            </h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2">
              Create, organize, and manage reusable assessment questions
            </p>
          </div>

          <button
            onClick={() => navigate('/trainer/questions/create')}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0A0A0A] hover:bg-black text-white text-sm font-bold rounded-xl shadow-md transition-all whitespace-nowrap"
          >
            <Plus size={18} /> Add New Question
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-4 sm:p-5 mb-8 flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative w-full lg:max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search question text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputClasses} pl-11`}
            />
          </div>

          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4 lg:ml-auto">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className={inputClasses}
            >
              <option value="all">All Subjects</option>
              {subjects.map(sub => (
                <option key={sub._id} value={sub._id}>{sub.name}</option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className={inputClasses}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 min-h-[40vh]">
            <Loader2 size={40} className="text-yellow-400 animate-spin mb-4" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Question Bank...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 min-h-[40vh] text-center">
            <AlertCircle size={48} className="text-red-400 mb-4" />
            <h3 className="text-lg font-black text-gray-900">Failed to load</h3>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">{error}</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 min-h-[40vh] bg-white border border-gray-200 rounded-3xl border-dashed">
            <div className="p-4 bg-gray-50 rounded-full text-gray-400 mb-4">
              <HelpCircle size={32} />
            </div>
            <h3 className="text-lg font-black text-gray-900">No Questions Found</h3>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1 mb-6">No questions match your current filters.</p>
            <button
              onClick={() => navigate('/trainer/questions/create')}
              className="text-sm font-bold text-yellow-700 hover:text-yellow-800 bg-yellow-50 px-6 py-2.5 rounded-lg transition-colors"
            >
              + Create New Question
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((q, index) => (
              <div key={q._id || index} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:border-gray-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-black uppercase tracking-widest border border-gray-200">
                      {q.subject?.name || "General"}
                    </span>
                    {getDifficultyBadge(q.difficulty)}
                    <span className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-md text-[10px] font-black uppercase tracking-widest border border-gray-200">
                      {q.marks || 1} Marks
                    </span>
                  </div>
                  <p className="text-base font-bold text-gray-900">{q.text}</p>

                  {/* Options Preview */}
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`text-xs font-medium px-3 py-2 rounded-xl border ${opt.isCorrect
                            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900 font-bold'
                            : 'bg-gray-50 border-gray-100 text-gray-600'
                            }`}
                        >
                          {String.fromCharCode(65 + optIdx)}. {opt.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end md:self-center border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 w-full md:w-auto justify-end">
                  <button
                    onClick={() => navigate(`/trainer/questions/${q._id}/edit`)}
                    className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-gray-200"
                    title="Edit Question"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(q._id)}
                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-gray-200"
                    title="Delete Question"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TrainerLayout>
  );
};

export default ManageQuestions;