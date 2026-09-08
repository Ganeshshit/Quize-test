// src/pages/trainer/EditQuiz.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import TrainerLayout from '../../components/Layout/TrainerLayout';
import {
  Settings,
  BookOpen,
  Clock,
  Shield,
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
// import { quizzesAPI } from '../../api/quizzes.api';
// import { subjectsAPI } from '../../api/subjects.api';

const EditQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subjectId: "",
    durationMinutes: 60,
    totalMarks: 100,
    passingPercentage: 40,
    status: "Draft",
    shuffleQuestions: false,
    strictMode: false
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // TODO: BACKEND DEVELOPER - Replace with actual API calls
      // const [quizRes, subjectsRes] = await Promise.all([
      //     quizzesAPI.getById(id),
      //     subjectsAPI.getAll()
      // ]);
      // setSubjects(subjectsRes.data);
      // setFormData(quizRes.data);

      // SIMULATED API DELAY & MOCK DATA
      await new Promise(resolve => setTimeout(resolve, 800));
      setSubjects([
        { _id: "sub_1", name: "Frontend Development" },
        { _id: "sub_2", name: "Backend Architecture" },
        { _id: "sub_3", name: "System Design" }
      ]);

      setFormData({
        title: "Advanced JavaScript Concepts",
        description: "A comprehensive assessment covering closures, prototypes, async/await, and ES6+ features.",
        subjectId: "sub_1",
        durationMinutes: 45,
        totalMarks: 100,
        passingPercentage: 60,
        status: "Active",
        shuffleQuestions: true,
        strictMode: true
      });

    } catch (err) {
      console.error(err);
      setError("Failed to load quiz details.");
      toast.error("Failed to load quiz details.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.subjectId) {
      toast.error("Title and Subject are required.");
      return;
    }

    try {
      setSaving(true);

      // TODO: BACKEND DEVELOPER - Replace with actual API call
      // await quizzesAPI.update(id, formData);

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate save

      toast.success("Quiz updated successfully!");
      navigate('/trainer/quizzes');
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update quiz.");
    } finally {
      setSaving(false);
    }
  };

  // Premium Input Classes
  const inputClasses = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all";
  const labelClasses = "block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2";

  if (loading) {
    return (
      <TrainerLayout>
        <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
          <Loader2 size={40} className="text-yellow-400 animate-spin mb-4" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Quiz Data...</p>
        </div>
      </TrainerLayout>
    );
  }

  if (error) {
    return (
      <TrainerLayout>
        <div className="flex flex-col items-center justify-center py-20 min-h-[60vh] text-center">
          <AlertCircle size={48} className="text-red-400 mb-4" />
          <h3 className="text-lg font-black text-gray-900">Failed to load</h3>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">{error}</p>
          <button
            onClick={() => navigate('/trainer/quizzes')}
            className="mt-6 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-all"
          >
            Go Back
          </button>
        </div>
      </TrainerLayout>
    );
  }

  return (
    <TrainerLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1000px] mx-auto w-full font-sans selection:bg-yellow-200 pb-24">

        {/* Header */}
        <div className="mb-8">
          <Link
            to="/trainer/quizzes"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black uppercase tracking-widest mb-4 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Quizzes
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-[#0A0A0A] rounded-lg text-white shadow-sm">
              <Settings size={24} className="text-yellow-400" />
            </div>
            Edit Quiz Settings
          </h1>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2">
            Modify configuration, parameters, and security rules
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section 1: Basic Details */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <BookOpen size={18} className="text-gray-400" />
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Basic Details</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className={labelClasses}>Quiz Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Mid-Term Evaluation"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Instructions or overview for students..."
                  className={`${inputClasses} resize-none`}
                />
              </div>

              <div>
                <label className={labelClasses}>Subject Category <span className="text-red-500">*</span></label>
                <select
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                >
                  <option value="" disabled>Select a subject</option>
                  {subjects.map(sub => (
                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Assessment Parameters */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <Clock size={18} className="text-blue-500" />
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Assessment Rules</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className={labelClasses}>Duration (Minutes)</label>
                <input
                  type="number"
                  name="durationMinutes"
                  value={formData.durationMinutes}
                  onChange={handleChange}
                  min="1"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Total Marks</label>
                <input
                  type="number"
                  name="totalMarks"
                  value={formData.totalMarks}
                  onChange={handleChange}
                  min="1"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Passing %</label>
                <input
                  type="number"
                  name="passingPercentage"
                  value={formData.passingPercentage}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Status & Security */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Status */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <Settings size={18} className="text-gray-400" />
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Lifecycle Status</h2>
              </div>

              <label className={labelClasses}>Current Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputClasses}
              >
                <option value="Draft">Draft (Hidden from students)</option>
                <option value="Scheduled">Scheduled (Upcoming)</option>
                <option value="Active">Active (Ready to take)</option>
              </select>

              <p className="text-xs font-bold text-gray-500 mt-3">
                Active quizzes will immediately be available to enrolled students.
              </p>
            </div>

            {/* Security */}
            <div className="bg-[#0A0A0A] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-lg text-white relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-400 rounded-full blur-3xl opacity-10 pointer-events-none"></div>

              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10 relative z-10">
                <Shield size={18} className="text-yellow-400" />
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Security Settings</h2>
              </div>

              <div className="space-y-6 relative z-10">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <span className="text-sm font-bold text-white block">Shuffle Questions</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Randomize order per student</span>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="shuffleQuestions"
                      checked={formData.shuffleQuestions}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <span className="text-sm font-bold text-white block">Strict Mode</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Track tab switches & exits</span>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="strictMode"
                      checked={formData.strictMode}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Fixed Bottom Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 px-6 z-40 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button
              type="button"
              onClick={() => navigate('/trainer/quizzes')}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 px-8 py-2.5 bg-[#0A0A0A] hover:bg-black text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <><Save size={18} /> Save Changes</>
              )}
            </button>
          </div>
        </form>

      </div>
    </TrainerLayout>
  );
};

export default EditQuiz;