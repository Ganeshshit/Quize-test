// src/pages/trainer/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TrainerLayout from "../../components/Layout/TrainerLayout";
import {
  BookOpen,
  Activity,
  Users,
  PlusCircle,
  Database,
  ArrowRight,
  Clock,
  LayoutDashboard,
  Loader2,
  AlertCircle
} from "lucide-react";

const TrainerDashboard = () => {
  // --- DYNAMIC STATE ---
  const [stats, setStats] = useState({ totalQuizzes: 0, activeQuizzes: 0, totalAttempts: 0 });
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- DATA FETCHING (Ready for Backend) ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // TODO: BACKEND DEVELOPER
        // 1. Uncomment and add actual API endpoints here:
        // const statsRes = await dashboardAPI.getTrainerStats();
        // const quizzesRes = await dashboardAPI.getRecentQuizzes();
        // 
        // 2. Set the state with real data:
        // setStats(statsRes.data);
        // setRecentQuizzes(quizzesRes.data);

        // --- SIMULATED API DELAY & MOCK DATA (Remove once API is connected) ---
        await new Promise(resolve => setTimeout(resolve, 800));
        setStats({
          totalQuizzes: 12,
          activeQuizzes: 3,
          totalAttempts: 145
        });
        setRecentQuizzes([
          { _id: 1, title: "JavaScript Basics", status: "Active", time: "Closes today", attempts: 42 },
          { _id: 2, title: "Data Structures", status: "Scheduled", time: "Tomorrow", attempts: 0 }
        ]);
        // ----------------------------------------------------------------------

      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <TrainerLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full font-sans selection:bg-yellow-200">

        {/* Premium Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-yellow-400 rounded-lg text-black shadow-sm">
                <LayoutDashboard size={24} />
              </div>
              Overview
            </h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2">
              Welcome back, monitor your quiz performance
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            <AlertCircle size={20} />
            <span className="text-sm font-bold">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="text-yellow-400 animate-spin mb-4" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Quizzes */}
              <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm hover:border-gray-300 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-gray-50 rounded-xl text-gray-600 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                    <BookOpen size={24} />
                  </div>
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Quizzes</p>
                <p className="text-4xl font-black text-gray-900">{stats.totalQuizzes}</p>
              </div>

              {/* Active Quizzes */}
              <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm hover:border-yellow-400 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-yellow-50 rounded-xl text-yellow-600 group-hover:bg-yellow-400 group-hover:text-black transition-colors relative">
                    <Activity size={24} />
                    {stats.activeQuizzes > 0 && (
                      <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                    )}
                  </div>
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Quizzes</p>
                <p className="text-4xl font-black text-gray-900">{stats.activeQuizzes}</p>
              </div>

              {/* Total Attempts */}
              <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm hover:border-gray-300 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Users size={24} />
                  </div>
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Attempts</p>
                <p className="text-4xl font-black text-gray-900">{stats.totalAttempts}</p>
              </div>
            </div>

            {/* Bottom Section: Recent Quizzes & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Recent Quizzes List */}
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl shadow-sm p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <h3 className="text-lg font-black text-gray-900">Recent Quizzes</h3>
                  <Link to="/trainer/quizzes" className="text-xs font-bold text-gray-400 hover:text-black uppercase tracking-widest transition-colors flex items-center gap-1">
                    View All <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="space-y-4">
                  {recentQuizzes.length === 0 ? (
                    <p className="text-sm font-bold text-gray-500 text-center py-4">No recent quizzes found.</p>
                  ) : (
                    recentQuizzes.map((quiz) => (
                      <div key={quiz._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg mt-1 ${quiz.status === 'Active' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'}`}>
                            {quiz.status === 'Active' ? <Activity size={18} /> : <Clock size={18} />}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">{quiz.title}</h4>
                            <p className="text-xs font-medium text-gray-500 mt-0.5">{quiz.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 sm:gap-8 border-t sm:border-t-0 border-gray-200 pt-3 sm:pt-0">
                          <div className="text-left sm:text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attempts</p>
                            <p className="text-sm font-bold text-gray-900">{quiz.attempts}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${quiz.status === 'Active' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-100 border-gray-200 text-gray-600'
                            }`}>
                            {quiz.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="lg:col-span-1 bg-[#0A0A0A] rounded-3xl shadow-lg p-6 sm:p-8 text-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

                <h3 className="text-lg font-black text-white mb-2">Quick Actions</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Streamline your workflow</p>

                <div className="space-y-3 relative z-10">
                  <Link
                    to="/trainer/quizzes/create"
                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-400 text-black rounded-lg">
                        <PlusCircle size={18} />
                      </div>
                      <span className="text-sm font-bold">Create New Quiz</span>
                    </div>
                    <ArrowRight size={16} className="text-gray-500 group-hover:text-yellow-400 transition-colors" />
                  </Link>

                  <Link
                    to="/trainer/questions"
                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white text-black rounded-lg">
                        <Database size={18} />
                      </div>
                      <span className="text-sm font-bold">Question Bank</span>
                    </div>
                    <ArrowRight size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                  </Link>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </TrainerLayout>
  );
};

export default TrainerDashboard;