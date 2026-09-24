// src/components/trainer/AIQuestionGenerator.jsx
import React, { useState } from 'react';
import { questionsAPI } from '../../api/questions.api';
import { subjectsAPI } from '../../api/subjects.api';
import toast from 'react-hot-toast';
import {
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Target,
  BarChart3,
  FileText,
  Hash
} from 'lucide-react';

const AIQuestionGenerator = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    difficulty: 'medium',
    type: 'mcq_single',
    count: 5
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Load subjects on mount
  React.useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const response = await subjectsAPI.getAll();
      console.log('Subjects API response:', response);
      
      // Handle different response structures
      let subjectsData = [];
      if (response && response.success) {
        if (Array.isArray(response.data)) {
          subjectsData = response.data;
        } else if (response.data && Array.isArray(response.data.subjects)) {
          subjectsData = response.data.subjects;
        } else if (response.data && Array.isArray(response.data.data)) {
          subjectsData = response.data.data;
        }
      } else if (Array.isArray(response)) {
        // If response is directly an array
        subjectsData = response;
      } else if (response && Array.isArray(response.subjects)) {
        // If response has subjects property
        subjectsData = response.subjects;
      }
      
      console.log('Processed subjects data:', subjectsData);
      setSubjects(subjectsData);
    } catch (err) {
      console.error('Failed to load subjects:', err);
      toast.error('Failed to load subjects');
      setSubjects([]); // Ensure subjects is always an array
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await questionsAPI.generateAIQuestions(formData);

      if (response.success) {
        toast.success(`${response.data.length} AI questions generated successfully!`);
        if (onSuccess) {
          onSuccess(response.data);
        }
        // Reset form
        setFormData({
          subject: '',
          topic: '',
          difficulty: 'medium',
          type: 'mcq_single',
          count: 5
        });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to generate questions';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all";
  const labelClasses = "block text-xs font-black text-gray-500 uppercase tracking-widest mb-2";

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white shadow-lg">
          <Sparkles size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900">AI Question Generator</h2>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Generate questions using AI
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-bold text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="subject" className={labelClasses}>
              <BookOpen size={14} className="inline mr-1" />
              Subject *
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              disabled={loadingSubjects}
              className={inputClasses}
            >
              <option value="">Select Subject</option>
              {Array.isArray(subjects) && subjects.map(subject => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="topic" className={labelClasses}>
              <Target size={14} className="inline mr-1" />
              Topic *
            </label>
            <input
              type="text"
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="e.g., Arrays, Linked Lists, Trees"
              required
              minLength={2}
              maxLength={200}
              className={inputClasses}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label htmlFor="difficulty" className={labelClasses}>
              <BarChart3 size={14} className="inline mr-1" />
              Difficulty
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label htmlFor="type" className={labelClasses}>
              <FileText size={14} className="inline mr-1" />
              Question Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="mcq_single">Single Choice MCQ</option>
              <option value="mcq_multi">Multiple Choice MCQ</option>
              <option value="short_answer">Short Answer</option>
              <option value="numeric">Numeric</option>
              <option value="true_false">True/False</option>
            </select>
          </div>

          <div>
            <label htmlFor="count" className={labelClasses}>
              <Hash size={14} className="inline mr-1" />
              Number of Questions
            </label>
            <input
              type="number"
              id="count"
              name="count"
              value={formData.count}
              onChange={handleChange}
              min={1}
              max={50}
              className={inputClasses}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || loadingSubjects}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Generating Questions... (This may take up to 2 minutes)
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate AI Questions
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AIQuestionGenerator;