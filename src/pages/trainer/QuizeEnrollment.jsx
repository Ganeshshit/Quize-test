// src/pages/trainer/QuizEnrollment.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users, UserPlus, UserMinus, Filter, Search,
  CheckSquare, Square, AlertCircle, TrendingUp,
  ArrowLeft, Loader2, ChevronLeft, ChevronRight,
  CheckCircle, AlertTriangle, X, RefreshCw
} from 'lucide-react';
import { enrollmentAPI } from '../../api/enrollment.api';
import { quizzesAPI } from '../../api/quizzes.api';
import TrainerLayout from '../../components/Layout/TrainerLayout';

const QuizEnrollment = () => {
  const { quizId } = useParams();

  // State
  const [quiz, setQuiz] = useState(null);
  const [activeTab, setActiveTab] = useState('not-enrolled'); // 'enrolled' | 'not-enrolled'
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null); // single-row action in flight
  const [bulkBusy, setBulkBusy] = useState(false);
  const [toast, setToast] = useState(null); // { type, message }
  const [confirmDialog, setConfirmDialog] = useState(null); // { title, message, confirmLabel, danger, onConfirm }

  // Filters
  const [searchInput, setSearchInput] = useState('');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  // Load students when tab or filters change
  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filters]);

  // debounce search -> filters.search
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => (f.search === searchInput ? f : { ...f, search: searchInput, page: 1 }));
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

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
        const enrolledData = Array.isArray(response.data)
          ? response.data
          : (response.data?.students || []);
        setStudents(enrolledData.map(e => ({
          ...e.student,
          enrolledAt: e.enrolledAt,
          attempts: e.attempts
        })));
      } else {
        response = await enrollmentAPI.getNotEnrolledStudents(quizId, params);
        const studentsData = Array.isArray(response.data)
          ? response.data
          : (response.data?.students || []);
        setStudents(studentsData);
      }

      setPagination(response.pagination || response.data?.pagination || {});
    } catch (err) {
      setError('Failed to load students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([loadStudents(), loadStatistics()]);
  };

  const handleEnrollSingle = async (studentId) => {
    setBusyId(studentId);
    try {
      await enrollmentAPI.enrollSingle(quizId, studentId);
      await refreshAll();
      setToast({ type: 'success', message: 'Student enrolled.' });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.error || 'Failed to enroll student.' });
    } finally {
      setBusyId(null);
    }
  };

  const handleEnrollMultiple = async () => {
    if (selectedStudents.length === 0) {
      setToast({ type: 'error', message: 'Select at least one student to enroll.' });
      return;
    }
    setBulkBusy(true);
    try {
      await enrollmentAPI.enrollMultiple(quizId, selectedStudents);
      await refreshAll();
      setToast({ type: 'success', message: `${selectedStudents.length} student(s) enrolled.` });
      setSelectedStudents([]);
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.error || 'Failed to enroll students.' });
    } finally {
      setBulkBusy(false);
    }
  };

  const runEnrollByCriteria = async (criteria) => {
    setBulkBusy(true);
    try {
      await enrollmentAPI.enrollByCriteria(quizId, criteria);
      await refreshAll();
      setToast({ type: 'success', message: 'Students enrolled by criteria.' });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.error || 'Failed to enroll students.' });
    } finally {
      setBulkBusy(false);
    }
  };

  const handleEnrollByCriteria = () => {
    const criteria = {};
    if (filters.semester) criteria.semester = parseInt(filters.semester);
    if (filters.department) criteria.department = filters.department;
    if (filters.registeredFrom) criteria.registeredFrom = filters.registeredFrom;
    if (filters.registeredTo) criteria.registeredTo = filters.registeredTo;

    if (Object.keys(criteria).length === 0) {
      setConfirmDialog({
        title: 'Enroll all students?',
        message: 'No filters are applied, so this will enroll every not-yet-enrolled student in the quiz.',
        confirmLabel: 'Enroll All',
        danger: false,
        onConfirm: () => runEnrollByCriteria({ enrollAll: true }),
      });
      return;
    }

    runEnrollByCriteria(criteria);
  };

  const handleUnenrollSingle = (studentId, studentName) => {
    setConfirmDialog({
      title: 'Unenroll this student?',
      message: `${studentName || 'This student'} will lose access to the quiz. This can be reversed by re-enrolling them later.`,
      confirmLabel: 'Unenroll',
      danger: true,
      onConfirm: async () => {
        setBusyId(studentId);
        try {
          await enrollmentAPI.unenrollSingle(quizId, studentId);
          await refreshAll();
          setToast({ type: 'success', message: 'Student unenrolled.' });
        } catch (err) {
          setToast({ type: 'error', message: err.response?.data?.error || 'Failed to unenroll student.' });
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const handleUnenrollMultiple = () => {
    if (selectedStudents.length === 0) {
      setToast({ type: 'error', message: 'Select at least one student to unenroll.' });
      return;
    }
    setConfirmDialog({
      title: `Unenroll ${selectedStudents.length} student(s)?`,
      message: 'They will lose access to this quiz. This can be reversed by re-enrolling them later.',
      confirmLabel: 'Unenroll All Selected',
      danger: true,
      onConfirm: async () => {
        setBulkBusy(true);
        try {
          await enrollmentAPI.unenrollMultiple(quizId, selectedStudents);
          await refreshAll();
          setToast({ type: 'success', message: `${selectedStudents.length} student(s) unenrolled.` });
          setSelectedStudents([]);
        } catch (err) {
          setToast({ type: 'error', message: err.response?.data?.error || 'Failed to unenroll students.' });
        } finally {
          setBulkBusy(false);
        }
      },
    });
  };

  const handleSelectAll = () => {
    const studentsLength = Array.isArray(students) ? students.length : 0;
    if (selectedStudents.length === studentsLength) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(Array.isArray(students) ? students.map(s => s._id) : []);
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const hasActiveFilters = filters.search || filters.semester || filters.department || filters.registeredFrom || filters.registeredTo;

  const resetFilters = () => {
    setSearchInput('');
    setFilters({ search: '', semester: '', department: '', registeredFrom: '', registeredTo: '', page: 1, limit: 20 });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Condensed page list: 1 ... p-1 p p+1 ... last
  const pageNumbers = useMemo(() => {
    const total = pagination.pages || 0;
    const current = pagination.page || 1;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages = new Set([1, total, current, current - 1, current + 1]);
    const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

    const result = [];
    let prev = 0;
    for (const p of sorted) {
      if (prev && p - prev > 1) result.push('…');
      result.push(p);
      prev = p;
    }
    return result;
  }, [pagination.pages, pagination.page]);

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

  const allSelected = selectedStudents.length === (Array.isArray(students) ? students.length : 0) && students.length > 0;

  return (
    <TrainerLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full font-sans selection:bg-yellow-200">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="min-w-0">
            <Link
              to={`/trainer/quizzes/${quizId}/details`}
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black uppercase tracking-widest mb-3 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Quiz Details
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 truncate">
              <div className="p-2 bg-[#0A0A0A] rounded-lg text-white shadow-sm flex-shrink-0">
                <Users size={24} className="text-yellow-400" />
              </div>
              <span className="truncate">{quiz.title}</span>
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
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
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
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
              >
                <X size={13} /> Clear all filters
              </button>
            )}
          </div>

          {/* Actions Row */}
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-100">
            <button
              onClick={handleSelectAll}
              disabled={students.length === 0}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-bold text-gray-700 transition-colors disabled:opacity-50"
            >
              {allSelected ? (
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
                    disabled={bulkBusy}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-gray-900 text-sm font-bold text-gray-700 hover:text-black transition-colors disabled:opacity-50"
                  >
                    <Filter size={18} /> Enroll via Filters
                  </button>
                  <button
                    onClick={handleEnrollMultiple}
                    disabled={selectedStudents.length === 0 || bulkBusy}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0A0A0A] hover:bg-black text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:hover:bg-[#0A0A0A]"
                  >
                    {bulkBusy ? <RefreshCw size={18} className="animate-spin" /> : <UserPlus size={18} />}
                    Enroll Selected
                  </button>
                </>
              )}
              {activeTab === 'enrolled' && (
                <button
                  onClick={handleUnenrollMultiple}
                  disabled={selectedStudents.length === 0 || bulkBusy}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-sm font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  {bulkBusy ? <RefreshCw size={18} className="animate-spin" /> : <UserMinus size={18} />}
                  Unenroll Selected
                </button>
              )}
            </div>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-x-auto">
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
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-4">
                        <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-sm font-bold text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : (Array.isArray(students) ? students.length : 0) === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                        {activeTab === 'enrolled' ? 'No enrolled students found' : 'No students available for enrollment'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  Array.isArray(students) && students.map((student) => (
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
                            disabled={busyId === student._id}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-black uppercase tracking-widest rounded-lg transition-colors disabled:opacity-60"
                          >
                            {busyId === student._id && <RefreshCw size={12} className="animate-spin" />}
                            Enroll
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnenrollSingle(student._id, student.name)}
                            disabled={busyId === student._id}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-black uppercase tracking-widest rounded-lg transition-colors disabled:opacity-60"
                          >
                            {busyId === student._id && <RefreshCw size={12} className="animate-spin" />}
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

          {/* MOBILE CARDS */}
          <div className="md:hidden divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-5">
                  <div className="h-4 bg-gray-100 rounded w-2/3 mb-2 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
                </div>
              ))
            ) : error ? (
              <div className="p-8 text-center text-sm font-bold text-red-600">{error}</div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center text-sm font-bold text-gray-500 uppercase tracking-widest">
                {activeTab === 'enrolled' ? 'No enrolled students found' : 'No students available for enrollment'}
              </div>
            ) : (
              students.map((student) => (
                <div key={student._id} className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student._id)}
                      onChange={() => handleSelectStudent(student._id)}
                      className="w-4 h-4 mt-1 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 cursor-pointer flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-gray-900 truncate">{student.name}</div>
                      <div className="text-xs font-medium text-gray-500 truncate">{student.email}</div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                        Roll: {student.rollNo || 'N/A'} • Sem {student.semester || 'N/A'} • {student.department || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pl-7">
                    <span className="text-xs font-bold text-gray-500">
                      {activeTab === 'enrolled'
                        ? `Enrolled ${formatDate(student.enrolledAt)}`
                        : `Registered ${formatDate(student.createdAt)}`}
                    </span>
                    {activeTab === 'not-enrolled' ? (
                      <button
                        onClick={() => handleEnrollSingle(student._id)}
                        disabled={busyId === student._id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-black uppercase tracking-widest rounded-lg transition-colors disabled:opacity-60"
                      >
                        {busyId === student._id && <RefreshCw size={12} className="animate-spin" />}
                        Enroll
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnenrollSingle(student._id, student.name)}
                        disabled={busyId === student._id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-black uppercase tracking-widest rounded-lg transition-colors disabled:opacity-60"
                      >
                        {busyId === student._id && <RefreshCw size={12} className="animate-spin" />}
                        Unenroll
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
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
                  {pageNumbers.map((p, i) =>
                    p === '…' ? (
                      <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs font-bold text-gray-400">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setFilters({ ...filters, page: p })}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${pagination.page === p
                          ? 'bg-[#0A0A0A] text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {p}
                      </button>
                    )
                  )}
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

      {/* CONFIRM MODAL */}
      {confirmDialog && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setConfirmDialog(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-3 rounded-2xl w-fit mb-4 ${confirmDialog.danger ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-700'}`}>
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">{confirmDialog.title}</h3>
            <p className="text-sm font-medium text-gray-500 mb-6">{confirmDialog.message}</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const action = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  await action();
                }}
                className={`flex-1 px-4 py-3 rounded-xl text-white font-bold text-sm transition-colors ${confirmDialog.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0A0A0A] hover:bg-black'
                  }`}
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-lg border font-bold text-sm ${toast.type === 'success'
              ? 'bg-[#0A0A0A] text-white border-black'
              : 'bg-red-50 text-red-700 border-red-200'
              }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle size={18} className="text-yellow-400 flex-shrink-0" />
            ) : (
              <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
            )}
            {toast.message}
            <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
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