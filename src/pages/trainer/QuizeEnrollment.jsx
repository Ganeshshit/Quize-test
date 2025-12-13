import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users, UserPlus, UserMinus, Filter, Search, Calendar,
  CheckSquare, Square, AlertCircle, TrendingUp, Award
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
      alert('Student enrolled successfully');
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
      const response = await enrollmentAPI.enrollMultiple(quizId, selectedStudents);
      loadStudents();
      loadStatistics();
      setSelectedStudents([]);
      alert(response.message);
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
      const response = await enrollmentAPI.enrollByCriteria(quizId, criteria);
      loadStudents();
      loadStatistics();
      alert(response.message);
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
      alert('Student unenrolled successfully');
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
      const response = await enrollmentAPI.unenrollMultiple(quizId, selectedStudents);
      loadStudents();
      loadStatistics();
      setSelectedStudents([]);
      alert(response.message);
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

  if (!quiz) {
    return (
      <TrainerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading quiz data...</div>
        </div>
      </TrainerLayout>
    );
  }

  return (
    <TrainerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-gray-600 mt-1">Manage student enrollments</p>
            </div>
            <button
              onClick={() => navigate(`/trainer/quizzes/${quizId}/details`)}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              Back to Quiz
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.overall.totalStudents}
                  </p>
                </div>
                <Users className="text-gray-400" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Enrolled</p>
                  <p className="text-2xl font-bold text-green-600">
                    {statistics.overall.enrolled}
                  </p>
                  <p className="text-xs text-gray-500">
                    {statistics.overall.enrollmentRate}% enrollment rate
                  </p>
                </div>
                <CheckSquare className="text-green-400" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Attempted</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {statistics.attempts.studentsAttempted}
                  </p>
                  <p className="text-xs text-gray-500">
                    {statistics.attempts.attemptRate}% attempt rate
                  </p>
                </div>
                <TrendingUp className="text-blue-400" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Not Enrolled</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {statistics.overall.notEnrolled}
                  </p>
                </div>
                <AlertCircle className="text-orange-400" size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b flex">
            <button
              onClick={() => {
                setActiveTab('not-enrolled');
                setSelectedStudents([]);
              }}
              className={`px-6 py-3 font-medium ${activeTab === 'not-enrolled'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Not Enrolled Students
            </button>
            <button
              onClick={() => {
                setActiveTab('enrolled');
                setSelectedStudents([]);
              }}
              className={`px-6 py-3 font-medium ${activeTab === 'enrolled'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Enrolled Students
            </button>
          </div>

          {/* Filters */}
          <div className="p-4 border-b bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={filters.semester}
                onChange={(e) => setFilters({ ...filters, semester: e.target.value, page: 1 })}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="date"
                placeholder="Registered From"
                value={filters.registeredFrom}
                onChange={(e) => setFilters({ ...filters, registeredFrom: e.target.value, page: 1 })}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="date"
                placeholder="Registered To"
                value={filters.registeredTo}
                onChange={(e) => setFilters({ ...filters, registeredTo: e.target.value, page: 1 })}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-white"
              >
                {selectedStudents.length === students.length ? (
                  <CheckSquare size={18} />
                ) : (
                  <Square size={18} />
                )}
                Select All ({selectedStudents.length})
              </button>
            </div>

            <div className="flex gap-2">
              {activeTab === 'not-enrolled' && (
                <>
                  <button
                    onClick={handleEnrollByCriteria}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Filter size={18} />
                    Enroll by Criteria
                  </button>
                  <button
                    onClick={handleEnrollMultiple}
                    disabled={selectedStudents.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus size={18} />
                    Enroll Selected ({selectedStudents.length})
                  </button>
                </>
              )}

              {activeTab === 'enrolled' && (
                <button
                  onClick={handleUnenrollMultiple}
                  disabled={selectedStudents.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserMinus size={18} />
                  Unenroll Selected ({selectedStudents.length})
                </button>
              )}
            </div>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Loading students...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-red-600">{error}</div>
              </div>
            ) : students.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">
                  {activeTab === 'enrolled'
                    ? 'No enrolled students'
                    : 'No students available for enrollment'}
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedStudents.length === students.length}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Roll No</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Semester</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                    {activeTab === 'enrolled' ? (
                      <>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Enrolled</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Attempts</th>
                      </>
                    ) : (
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Registered</th>
                    )}
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student._id)}
                          onChange={() => handleSelectStudent(student._id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {student.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {student.rollNo || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {student.semester || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {student.department || 'N/A'}
                      </td>
                      {activeTab === 'enrolled' ? (
                        <>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(student.enrolledAt)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {student.attempts && (
                              <span className={`px-2 py-1 rounded-full text-xs ${student.attempts.completed > 0
                                  ? 'bg-green-100 text-green-800'
                                  : student.attempts.inProgress > 0
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                {student.attempts.total} attempts
                              </span>
                            )}
                          </td>
                        </>
                      ) : (
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(student.createdAt)}
                        </td>
                      )}
                      <td className="px-4 py-3 text-right">
                        {activeTab === 'not-enrolled' ? (
                          <button
                            onClick={() => handleEnrollSingle(student._id)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                          >
                            Enroll
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnenrollSingle(student._id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                          >
                            Unenroll
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="p-4 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} students
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFilters({ ...filters, page: i + 1 })}
                      className={`px-3 py-2 rounded-lg ${pagination.page === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-50'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </TrainerLayout>
  );
};

export default QuizEnrollment;