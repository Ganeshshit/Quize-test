// src/pages/trainer/QuizEnrollment.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Users, UserPlus, UserMinus, Filter, Search,
  CheckSquare, Square, AlertCircle, TrendingUp,
  ArrowLeft, Loader2, ChevronLeft, ChevronRight,
  BookOpen
} from 'lucide-react';
import { enrollmentAPI } from '../../api/enrollment.api';
import { quizzesAPI } from '../../api/quizzes.api';
import TrainerLayout from '../../components/Layout/TrainerLayout';

const QuizEnrollment = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  // State
  const [quiz, setQuiz] = useState(null);
  const [activeTab, setActiveTab] = useState('not-enrolled'); // 'enrolled' | 'not-enrolled'
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    semester: '',
    department: '',
    registeredFrom: '',
    registeredTo: '',
    page: 1,
    limit: 20
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Load quiz and statistics
  useEffect(() => {
    loadQuizData();
    loadStatistics();
  }, [quizId]);

  // Load students when tab or filters change
  useEffect(() => {
    loadStudents();
  }, [activeTab, filters]);

  const loadQuizData = async () => {
    try {
      const response = await quizzesAPI.getById(quizId);
      setQuiz(response.data);
    } catch (err) {
      setError('Failed to load quiz data');
      console.error(err);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await enrollmentAPI.getStatistics(quizId);
      setStatistics(response.data);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
        search: filters.search || undefined,
        semester: filters.semester || undefined,
        department: filters.department || undefined,
        registeredFrom: filters.registeredFrom || undefined,
        registeredTo: filters.registeredTo || undefined
      };

      let response;
      if (activeTab === 'enrolled') {
        response = await enrollmentAPI.getEnrolledStudents(quizId, params);
        setStudents(response.data.map(e => ({
          ...e.student,
          enrolledAt: e.enrolledAt,
          attempts: e.attempts
        })));
      } else {
        response = await enrollmentAPI.getNotEnrolledStudents(quizId, params);
        setStudents(response.data);
      }

      setPagination(response.pagination);
    } catch (err) {
      setError('Failed to load students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollSingle = async (studentId) => {
    try {
      await enrollmentAPI.enrollSingle(quizId, studentId);
      loadStudents();
      loadStatistics();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to enroll student');
    }
  };

  const handleEnrollMultiple = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select students to enroll');
      return;
    }

    try {
      await enrollmentAPI.enrollMultiple(quizId, selectedStudents);
      loadStudents();
      loadStatistics();
      setSelectedStudents([]);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to enroll students');
    }
  };

  const handleEnrollByCriteria = async () => {
    const criteria = {};
    if (filters.semester) criteria.semester = parseInt(filters.semester);
    if (filters.department) criteria.department = filters.department;
    if (filters.registeredFrom) criteria.registeredFrom = filters.registeredFrom;
    if (filters.registeredTo) criteria.registeredTo = filters.registeredTo;

    if (Object.keys(criteria).length === 0) {
      const confirmAll = window.confirm('No filters applied. Enroll ALL students?');
      if (!confirmAll) return;
      criteria.enrollAll = true;
    }

    try {
      await enrollmentAPI.enrollByCriteria(quizId, criteria);
      loadStudents();
      loadStatistics();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to enroll students');
    }
  };

  const handleUnenrollSingle = async (studentId) => {
    if (!window.confirm('Are you sure you want to unenroll this student?')) return;

    try {
      await enrollmentAPI.unenrollSingle(quizId, studentId);
      loadStudents();
      loadStatistics();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to unenroll student');
    }
  };

  const handleUnenrollMultiple = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select students to unenroll');
      return;
    }

    if (!window.confirm(`Unenroll ${selectedStudents.length} students?`)) return;

    try {
      await enrollmentAPI.unenrollMultiple(quizId, selectedStudents);
      loadStudents();
      loadStatistics();
      setSelectedStudents([]);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to unenroll students');
    }
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s._id));
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Premium Input Classes
  const inputClasses = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all";

  if (!quiz) {
    return (
      <TrainerLayout>
        <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
          <Loader2 size={40} className="text-yellow-400 animate-spin mb-4" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Enrollment Data...</p>
        </div>
      </TrainerLayout>
    );
  }

  return (
    <TrainerLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full font-sans selection:bg-yellow-200">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              to={`/trainer/quizzes/${quizId}/details`}
              className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black uppercase tracking-widest mb-3 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Quiz Details
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-[#0A0A0A] rounded-lg text-white shadow-sm">
                <Users size={24} className="text-yellow-400" />
              </div>
              {quiz.title}
            </h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2">
              Manage Student Enrollments
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<Users size={24} />}
              iconBg="bg-gray-100 text-gray-600 group-hover:bg-gray-900 group-hover:text-white"
              label="Total Students"
              value={statistics.overall.totalStudents}
            />
            <div className="bg-[#0A0A0A] border border-gray-800 p-6 rounded-3xl shadow-lg relative overflow-hidden group text-white">
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-30"></div>
              <div className="p-3 bg-yellow-400 text-black rounded-xl w-fit mb-4 relative z-10">
                <CheckSquare size={24} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 relative z-10">Enrolled</p>
              <div className="flex items-end gap-3 relative z-10">
                <p className="text-4xl font-black text-white">{statistics.overall.enrolled}</p>
                <span className="text-xs font-bold text-yellow-400 mb-1.5">{statistics.overall.enrollmentRate}% Rate</span>
              </div>
            </div>
            <StatCard
              icon={<TrendingUp size={24} />}
              iconBg="bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
              label="Attempted"
              value={statistics.attempts.studentsAttempted}
              subtitle={`${statistics.attempts.attemptRate}% attempt rate`}
            />
            <StatCard
              icon={<AlertCircle size={24} />}
              iconBg="bg-orange-50 text-orange-600 group-hover:bg-orange-500 group-hover:text-white"
              label="Not Enrolled"
              value={statistics.overall.notEnrolled}
            />
          </div>
        )}

        {/* Custom Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl inline-flex overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => { setActiveTab('not-enrolled'); setSelectedStudents([]); }}
            className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'not-enrolled'
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
              }`}
          >
            Not Enrolled
          </button>
          <button
            onClick={() => { setActiveTab('enrolled'); setSelectedStudents([]); }}
            className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'enrolled'
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
              }`}
          >
            Enrolled
          </button>
        </div>

        {/* Control Panel (Filters & Actions) */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden mb-8">
          {/* Filters Row */}
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  className={`${inputClasses} pl-11`}
                />
              </div>
              <select
                value={filters.semester}
                onChange={(e) => setFilters({ ...filters, semester: e.target.value, page: 1 })}
                className={inputClasses}
              >
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Department"
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value, page: 1 })}
                className={inputClasses}
              />
              <input
                type="date"
                title="Registered From"
                value={filters.registeredFrom}
                onChange={(e) => setFilters({ ...filters, registeredFrom: e.target.value, page: 1 })}
                className={inputClasses}
              />
              <input
                type="date"
                title="Registered To"
                value={filters.registeredTo}
                onChange={(e) => setFilters({ ...filters, registeredTo: e.target.value, page: 1 })}
                className={inputClasses}
              />
            </div>
          </div>

          {/* Actions Row */}
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-100">
            <button
              onClick={handleSelectAll}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-bold text-gray-700 transition-colors"
            >
              {selectedStudents.length === students.length && students.length > 0 ? (
                <CheckSquare size={18} className="text-black" />
              ) : (
                <Square size={18} className="text-gray-400" />
              )}
              Select All ({selectedStudents.length})
            </button>

            <div className="flex w-full sm:w-auto gap-3">
              {activeTab === 'not-enrolled' && (
                <>
                  <button
                    onClick={handleEnrollByCriteria}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-gray-900 text-sm font-bold text-gray-700 hover:text-black transition-colors"
                  >
                    <Filter size={18} /> Enroll via Filters
                  </button>
                  <button
                    onClick={handleEnrollMultiple}
                    disabled={selectedStudents.length === 0}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0A0A0A] hover:bg-black text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:hover:bg-[#0A0A0A]"
                  >
                    <UserPlus size={18} /> Enroll Selected
                  </button>
                </>
              )}
              {activeTab === 'enrolled' && (
                <button
                  onClick={handleUnenrollMultiple}
                  disabled={selectedStudents.length === 0}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-sm font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  <UserMinus size={18} /> Unenroll Selected
                </button>
              )}
            </div>
          </div>

          {/* Table Area */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 w-16 text-center"></th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Academics</th>
                  {activeTab === 'enrolled' ? (
                    <>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Enrolled Date</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Attempts</th>
                    </>
                  ) : (
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Registered Date</th>
                  )}
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <Loader2 size={32} className="text-yellow-400 animate-spin mx-auto mb-3" />
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Records...</p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-sm font-bold text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                        {activeTab === 'enrolled' ? 'No enrolled students found' : 'No students available for enrollment'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student._id)}
                          onChange={() => handleSelectStudent(student._id)}
                          className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm text-gray-900">{student.name}</div>
                        <div className="text-xs font-medium text-gray-500">{student.email}</div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Roll: {student.rollNo || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-700">Sem {student.semester || 'N/A'}</div>
                        <div className="text-xs font-medium text-gray-500">{student.department || 'N/A'}</div>
                      </td>

                      {activeTab === 'enrolled' ? (
                        <>
                          <td className="px-6 py-4 text-sm font-bold text-gray-700">
                            {formatDate(student.enrolledAt)}
                          </td>
                          <td className="px-6 py-4">
                            {student.attempts && (
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${student.attempts.completed > 0
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : student.attempts.inProgress > 0
                                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                                  : 'bg-gray-100 border-gray-200 text-gray-600'
                                }`}>
                                {student.attempts.total} Attempts
                              </span>
                            )}
                          </td>
                        </>
                      ) : (
                        <td className="px-6 py-4 text-sm font-bold text-gray-700">
                          {formatDate(student.createdAt)}
                        </td>
                      )}

                      <td className="px-6 py-4 text-right">
                        {activeTab === 'not-enrolled' ? (
                          <button
                            onClick={() => handleEnrollSingle(student._id)}
                            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-black uppercase tracking-widest rounded-lg transition-colors"
                          >
                            Enroll
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnenrollSingle(student._id)}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-black uppercase tracking-widest rounded-lg transition-colors"
                          >
                            Unenroll
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="p-4 sm:p-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} students
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={pagination.page === 1}
                  className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFilters({ ...filters, page: i + 1 })}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${pagination.page === i + 1
                        ? 'bg-[#0A0A0A] text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                  className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </TrainerLayout>
  );
};

// Helper Component for Stats
const StatCard = ({ icon, iconBg, label, value, subtitle }) => (
  <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm hover:border-gray-300 hover:shadow-md transition-all group">
    <div className={`p-3 rounded-xl w-fit mb-4 transition-colors ${iconBg}`}>
      {icon}
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-end gap-3">
      <p className="text-4xl font-black text-gray-900">{value}</p>
      {subtitle && <span className="text-xs font-bold text-gray-500 mb-1.5">{subtitle}</span>}
    </div>
  </div>
);

export default QuizEnrollment;