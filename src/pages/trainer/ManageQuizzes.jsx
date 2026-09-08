// src/pages/trainer/ManageQuizzes.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TrainerLayout from '../../components/Layout/TrainerLayout';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  Eye,
  Clock,
  Users,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

const ManageQuizzes = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // --- DATA FETCHING (Dynamic Ready) ---
  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);

      // TODO: BACKEND DEVELOPER - Replace with actual API call
      // const res = await quizzesAPI.getAllByTrainer();
      // setQuizzes(res.data);

      // SIMULATED API DELAY & MOCK DATA
      await new Promise(resolve => setTimeout(resolve, 800));
      setQuizzes([
        { _id: "1", title: "Advanced JavaScript Concepts", subject: { name: "Frontend Dev" }, durationMinutes: 45, totalMarks: 100, status: "Active", attemptCount: 142 },
        { _id: "2", title: "React State Management", subject: { name: "Frontend Dev" }, durationMinutes: 60, totalMarks: 50, status: "Draft", attemptCount: 0 },
        { _id: "3", title: "Data Structures & Algorithms", subject: { name: "Computer Science" }, durationMinutes: 90, totalMarks: 150, status: "Scheduled", attemptCount: 0 },
        { _id: "4", title: "CSS Grid & Flexbox Mastery", subject: { name: "Web Design" }, durationMinutes: 30, totalMarks: 40, status: "Active", attemptCount: 89 },
      ]);
    } catch (err) {
      console.error(err);
      setError("Failed to load quizzes.");
      toast.error("Failed to load quizzes.");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) return;

    try {
      // TODO: BACKEND DEVELOPER - Replace with actual API call
      // await quizzesAPI.delete(id);

      setQuizzes(prev => prev.filter(q => q._id !== id));
      toast.success("Quiz deleted successfully");
    } catch (err) {
      toast.error("Failed to delete quiz");
    }
  };

  // --- HELPERS ---
  const getStatusBadge = (status) => {
    const styles = {
      Active: "bg-emerald-50 border-emerald-200 text-emerald-700",
      Draft: "bg-gray-100 border-gray-200 text-gray-600",
      Scheduled: "bg-blue-50 border-blue-200 text-blue-700",
    };
    return (
      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${styles[status] || styles.Draft}`}>
        {status}
      </span>
    );
  };

  // --- FILTERING ---
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || quiz.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const inputClasses = "w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all";

  return (
    <TrainerLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full font-sans selection:bg-yellow-200">

        {/* Premium Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-yellow-400 rounded-lg text-black shadow-sm">
                <BookOpen size={24} />
              </div>
              Quiz Management
            </h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2">
              Create, monitor, and manage your assessments
            </p>
          </div>

          <button
            onClick={() => navigate('/trainer/quizzes/create')}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0A0A0A] hover:bg-black text-white text-sm font-bold rounded-xl shadow-md transition-all whitespace-nowrap"
          >
            <Plus size={18} /> Create New Quiz
          </button>
        </div>

        {/* Toolbar (Search & Filter) */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-4 sm:p-5 mb-8 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search quizzes by title or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={inputClasses}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Scheduled">Scheduled</option>
          </select>

          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest sm:ml-auto">
            Showing {filteredQuizzes.length} Quizzes
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 min-h-[40vh]">
            <Loader2 size={40} className="text-yellow-400 animate-spin mb-4" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Quizzes...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 min-h-[40vh] text-center">
            <AlertCircle size={48} className="text-red-400 mb-4" />
            <h3 className="text-lg font-black text-gray-900">Failed to load</h3>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">{error}</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 min-h-[40vh] bg-white border border-gray-200 rounded-3xl border-dashed">
            <div className="p-4 bg-gray-50 rounded-full text-gray-400 mb-4">
              <BookOpen size={32} />
            </div>
            <h3 className="text-lg font-black text-gray-900">No Quizzes Found</h3>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1 mb-6">You haven't created any quizzes matching this criteria yet.</p>
            <button
              onClick={() => navigate('/trainer/quizzes/create')}
              className="text-sm font-bold text-yellow-600 hover:text-yellow-700 bg-yellow-50 px-6 py-2.5 rounded-lg transition-colors"
            >
              + Build Your First Quiz
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredQuizzes.map(quiz => (
              <div key={quiz._id} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:border-yellow-400 hover:shadow-md transition-all group flex flex-col h-full relative overflow-hidden">

                {/* Status Banner/Badge */}
                <div className="flex justify-between items-start mb-4">
                  {getStatusBadge(quiz.status)}

                  {/* Action Buttons (Visible on hover) */}
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={`/trainer/quizzes/${quiz._id}/edit`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Quiz"
                    >
                      <Edit2 size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(quiz._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Quiz"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Quiz Info */}
                <h3 className="text-xl font-black text-gray-900 mb-1 leading-tight">{quiz.title}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                  {quiz.subject?.name || "No Subject"}
                </p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6 mt-auto">
                  <div className="bg-gray-50 rounded-xl p-3 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      <Clock size={12} /> Duration
                    </div>
                    <span className="text-sm font-bold text-gray-900">{quiz.durationMinutes} Mins</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      <Activity size={12} /> Marks
                    </div>
                    <span className="text-sm font-bold text-gray-900">{quiz.totalMarks} Total</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Users size={16} />
                    <span className="text-xs font-bold">{quiz.attemptCount} Attempts</span>
                  </div>

                  <Link
                    to={`/trainer/quizzes/${quiz._id}/monitor`}
                    className="text-xs font-bold text-yellow-700 hover:text-yellow-800 bg-yellow-50 hover:bg-yellow-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 uppercase tracking-widest"
                  >
                    <Eye size={14} /> Monitor
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TrainerLayout>
  );
};

export default ManageQuizzes;