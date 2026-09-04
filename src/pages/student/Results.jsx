import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, BarChart2, Calendar, Target,
  CheckCircle, XCircle, AlertCircle, ArrowRight
} from 'lucide-react';

const StatCard = ({ title, value, subtitle }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</span>
    <div className="mt-4 flex items-end justify-between">
      <span className="text-4xl font-black tracking-tight text-gray-900">{value}</span>
      <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
        {subtitle}
      </span>
    </div>
  </div>
);

const SkeletonLoader = () => (
  <div className="space-y-6 animate-pulse max-w-7xl mx-auto pb-8">
    <div className="h-28 bg-gray-200 rounded-2xl w-full" />
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl" />)}
    </div>
    <div className="h-96 bg-gray-200 rounded-2xl w-full" />
  </div>
);

const Results = () => {
  const navigate = useNavigate();
  const [state, setState] = useState({
    loading: true,
    error: null,
    results: [],
    summary: { totalAttempts: 0, passedCount: 0, averageScore: 0 }
  });

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        if (!token) throw new Error("No authentication token found");

        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${baseUrl}/student/results`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401 || response.status === 404) {
          throw new Error("Endpoint not found or unauthorized. Check backend routes.");
        }

        if (!response.ok) throw new Error("Failed to fetch results data");

        const data = await response.json();

        setState({
          loading: false,
          error: null,
          results: data.results || [],
          summary: data.summary || { totalAttempts: 0, passedCount: 0, averageScore: 0 }
        });
      } catch (error) {
        console.error("Results fetch error:", error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message || "Failed to load results."
        }));
      }
    };

    fetchResults();
  }, []);

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    }).format(new Date(dateString));
  };

  if (state.loading) return <SkeletonLoader />;

  return (
    <div className="space-y-8 pb-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">My Results</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Review your past assessments and performance metrics.
          </p>
        </div>
      </header>

      {/* Error Banner */}
      {state.error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-sm text-red-900 shadow-sm">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <span className="font-medium">{state.error}</span>
        </div>
      )}

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Assessments"
          value={state.summary.totalAttempts}
          subtitle="Completed"
        />
        <StatCard
          title="Average Score"
          value={`${state.summary.averageScore}%`}
          subtitle="Overall Performance"
        />
        <StatCard
          title="Modules Passed"
          value={state.summary.passedCount}
          subtitle="Successful Attempts"
        />
      </div>

      {/* Results Table/List */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Attempt History</h2>
        </div>

        {state.results.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
              <BarChart2 size={32} />
            </div>
            <h3 className="text-base font-bold text-gray-900">No results available yet</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-sm">
              Complete an assigned assessment to see your performance metrics appear here.
            </p>
            <button
              onClick={() => navigate('/student/quizzes')}
              className="mt-6 px-6 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-yellow-400 hover:text-black transition-colors"
            >
              Find Quizzes
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {state.results.map((result) => {
              // Assuming passing mark is 40 if not provided by backend
              const passingMark = result.quiz?.passingMarks || 40;
              const isPassed = result.score >= passingMark;

              return (
                <div key={result._id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors group">

                  {/* Quiz Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-gray-900">
                        {result.quiz?.title || 'Untitled Assessment'}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${isPassed
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                        {isPassed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDate(result.createdAt)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="flex items-center gap-1.5">
                        <Target size={14} className="text-gray-400" />
                        Total Marks: {result.quiz?.totalMarks || 100}
                      </span>
                    </div>
                  </div>

                  {/* Score & Action */}
                  <div className="flex items-center gap-6 w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0">
                    <div className="text-right flex-1 sm:flex-none">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Score</p>
                      <p className={`text-2xl font-black leading-none ${isPassed ? 'text-emerald-600' : 'text-red-600'}`}>
                        {result.score}%
                      </p>
                    </div>

                    {/* Optional: Link to detailed result view if you have one */}
                    <button
                      onClick={() => navigate(`/student/result/${result._id}`)}
                      className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-black hover:border-black hover:text-white transition-all group-hover:shadow-md"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Results;