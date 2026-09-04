import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// --- Helper Functions ---
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// --- Sub-Components ---
const CategoryBadge = ({ category }) => (
  <span className="text-[10px] font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200 uppercase tracking-wider">
    {category || 'General'}
  </span>
);

const StatCard = ({ title, value, subtitle, actionText, actionLink }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</span>
    <div className="mt-4 flex items-end justify-between">
      <span className="text-4xl font-black tracking-tight text-gray-900">{value}</span>
      {actionLink ? (
        <Link to={actionLink} className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1 group">
          {actionText}
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      ) : (
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
          {subtitle}
        </span>
      )}
    </div>
  </div>
);

const SkeletonLoader = () => (
  <div className="space-y-6 animate-pulse p-2">
    <div className="h-28 bg-gray-200 rounded-2xl w-full" />
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
      ))}
    </div>
    <div className="h-72 bg-gray-200 rounded-2xl w-full" />
  </div>
);

// --- Main Dashboard Component ---
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dashboardState, setDashboardState] = useState({
    loading: true,
    quizzes: [],
    stats: { completed: 0, averageScore: 0, passedCount: 0 }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

        if (!token) {
          throw new Error('Authentication required');
        }

        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${baseUrl}/student/dashboard`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          logout();
          navigate('/login');
          return;
        }

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        setDashboardState({
          loading: false,
          quizzes: data.assignedQuizzes || data.quizzes || [],
          stats: {
            completed: data.stats?.completed || 0,
            averageScore: data.stats?.successRate || data.stats?.averageScore || 0,
            passedCount: data.stats?.passedCount || 0
          }
        });
      } catch (err) {
        console.error('Dashboard Data Fetch Error:', err);
        setDashboardState(prev => ({
          ...prev,
          loading: false,
          quizzes: [],
        }));
      }
    };

    fetchDashboardData();
  }, [logout, navigate]);

  const { loading, quizzes, stats } = dashboardState;

  const { firstName, currentDate, greeting } = useMemo(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const displayName = user?.name || storedUser?.name || 'Student';
    return {
      firstName: displayName.trim().split(' ')[0],
      currentDate: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date()),
      greeting: getGreeting()
    };
  }, [user]);

  if (loading) return <SkeletonLoader />;

  return (
    <div className="space-y-8 pb-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="bg-white rounded-2xl p-8 border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 mb-2">
            {greeting}, {firstName}
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            {quizzes.length > 0
              ? `You have ${quizzes.length} active training modules ready to be completed.`
              : "You're all caught up for today. New modules will appear here when published."}
          </p>
        </div>
        <div className="text-sm font-bold text-gray-600 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200/60">
          {currentDate}
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Active Modules"
          value={quizzes.length}
          subtitle="Trainer Published"
        />
        <StatCard
          title="Completed Quizzes"
          value={stats.completed}
          actionText="View History"
          actionLink="/student/history"
        />
        <StatCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          subtitle={`${stats.passedCount} Passed`}
        />
      </div>

      {/* Assessment List */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Assigned Assessments</h2>
          <span className="text-xs font-bold text-gray-500 bg-white px-2.5 py-1 rounded-md border border-gray-200">
            Total: {quizzes.length}
          </span>
        </div>

        {quizzes.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900">No Pending Assessments</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-sm leading-relaxed">
              You're all caught up. New modules published by your trainer will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {quizzes.map((quiz) => {
              const quizId = quiz._id || quiz.id;
              const qCount = quiz.questionsCount || quiz.totalQuestions || quiz.questions?.length || 0;
              const duration = quiz.durationMinutes || quiz.timeLimit || 15;

              return (
                <div key={quizId} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors group">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-gray-900">{quiz.title}</h3>
                      <CategoryBadge category={quiz.category || quiz.subject} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {qCount} Questions
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {duration} Minutes
                      </span>
                      {quiz.trainerName && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="text-gray-600">Trainer: <strong className="text-gray-900">{quiz.trainerName}</strong></span>
                        </>
                      )}
                    </div>
                  </div>

                  <Link
                    to={`/student/quiz/${quizId}`}
                    className="w-full sm:w-auto px-6 py-3 bg-black text-white hover:bg-yellow-400 hover:text-black text-sm font-bold rounded-xl transition-all text-center shrink-0 shadow-sm"
                  >
                    Start Assessment
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;