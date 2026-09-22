
// src/pages/trainer/EditQuiz.jsx

import React, { useEffect, useState } from 'react';
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
  AlertCircle,
  Lock,
  Calendar,
  FileText,
  Tag
} from 'lucide-react';

import toast from 'react-hot-toast';

import { quizzesAPI } from '../../api/quizzes.api';
import { subjectsAPI } from '../../api/subjects.api';

const EditQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [subjects, setSubjects] = useState([]);

  // Backend information
  const [hasAttempts, setHasAttempts] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // =========================================================
  // FORM STATE
  // =========================================================

  const [formData, setFormData] = useState({
    // Descriptive fields
    title: '',
    description: '',
    instructions: '',
    category: '',
    tags: [],

    // Restricted fields - displayed only
    subjectId: '',
    subjectName: '',
    durationMinutes: 60,
    totalMarks: 0,
    passingMarks: 0,
    passingPercentage: 0,
    status: 'draft',
    shuffleQuestions: false,
    strictMode: false,

    // Editable fields when attempts exist
    endTime: '',
    showResultsImmediately: true,
    showCorrectAnswers: false
  });

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    if (!id) {
      setError('Quiz ID is missing.');
      setLoading(false);
      return;
    }

    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load quiz and subjects
      const [quizRes, subjectsRes] = await Promise.all([
        quizzesAPI.getById(id),
        subjectsAPI.getAll()
      ]);

      // =====================================================
      // SUBJECTS
      // =====================================================

      const subjectList = subjectsRes?.data?.subjects || [];

      if (Array.isArray(subjectList)) {
        setSubjects(subjectList);
      } else {
        setSubjects([]);
      }

      // =====================================================
      // QUIZ
      // =====================================================

      const quiz = quizRes?.data;

      if (!quiz) {
        throw new Error('Quiz data not found.');
      }

      // =====================================================
      // ATTEMPT / PUBLISHED STATE
      // =====================================================

      const quizHasAttempts =
        Boolean(quiz.totalAttempts > 0) ||
        Boolean(quiz.hasAttempts);

      const quizIsPublished =
        Boolean(quiz.isPublished) ||
        String(quiz.status || '').toLowerCase() === 'published';

      setHasAttempts(quizHasAttempts);
      setIsPublished(quizIsPublished);

      // =====================================================
      // PASSING PERCENTAGE
      // =====================================================

      let passingPercentage = 0;

      if (Number(quiz.totalMarks) > 0) {
        passingPercentage = Math.round(
          (Number(quiz.passingMarks || 0) /
            Number(quiz.totalMarks)) *
            100
        );
      }

      // =====================================================
      // STATUS
      // =====================================================

      const normalizedStatus =
        String(quiz.status || 'draft').toLowerCase();

      // =====================================================
      // END TIME
      // =====================================================

      let formattedEndTime = '';

      if (quiz.endTime) {
        const date = new Date(quiz.endTime);

        if (!Number.isNaN(date.getTime())) {
          // datetime-local expects:
          // YYYY-MM-DDTHH:mm
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');

          formattedEndTime =
            `${ year } -${ month } -${ day }T${ hours }:${ minutes } `;
        }
      }

      // =====================================================
      // TAGS
      // =====================================================

      let quizTags = [];

      if (Array.isArray(quiz.tags)) {
        quizTags = quiz.tags;
      }

      // =====================================================
      // SET FORM DATA
      // =====================================================

      setFormData({
        // ---------------------------------------------------
        // Descriptive
        // ---------------------------------------------------

        title: quiz.title || '',

        description: quiz.description || '',

        instructions: quiz.instructions || '',

        category: quiz.category || '',

        tags: quizTags,

        // ---------------------------------------------------
        // Restricted
        // ---------------------------------------------------

        subjectId: quiz.subject?._id || '',

        subjectName: quiz.subject?.name || '',

        durationMinutes: Number(
          quiz.durationMinutes || 0
        ),

        totalMarks: Number(
          quiz.totalMarks || 0
        ),

        passingMarks: Number(
          quiz.passingMarks || 0
        ),

        passingPercentage,

        status: normalizedStatus,

        shuffleQuestions:
          quiz.shuffleQuestions ??
          quiz.antiCheatSettings?.randomizeQuestionOrder ??
          false,

        strictMode:
          quiz.antiCheatSettings
            ?.enableTabSwitchDetection ??
          false,

        // ---------------------------------------------------
        // Allowed
        // ---------------------------------------------------

        endTime: formattedEndTime,

        showResultsImmediately:
          quiz.showResultsImmediately ?? true,

        showCorrectAnswers:
          quiz.showCorrectAnswers ?? false
      });
    } catch (err) {
      console.error('Failed to load quiz:', err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to load quiz details.';

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : value
    }));
  };

  // =========================================================
  // TAG HANDLING
  // =========================================================

  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    const tag = tagInput.trim();

    if (!tag) {
      return;
    }

    const alreadyExists = formData.tags.some(
      (existingTag) =>
        String(existingTag).toLowerCase() ===
        tag.toLowerCase()
    );

    if (alreadyExists) {
      setTagInput('');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, tag]
    }));

    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter(
        (tag) => tag !== tagToRemove
      )
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  // =========================================================
  // FORMAT END TIME FOR API
  // =========================================================

  const getEndTimeForApi = () => {
    if (!formData.endTime) {
      return null;
    }

    const date = new Date(formData.endTime);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString();
  };

  // =========================================================
  // SUBMIT / UPDATE QUIZ
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) {
      return;
    }

    // -------------------------------------------------------
    // Description is optional
    // -------------------------------------------------------

    // -------------------------------------------------------
    // END TIME VALIDATION
    // -------------------------------------------------------

    if (formData.endTime) {
      const endDate = new Date(formData.endTime);

      if (Number.isNaN(endDate.getTime())) {
        toast.error('Please enter a valid end time.');
        return;
      }
    }

    try {
      setSaving(true);
      setError(null);

      // =====================================================
      // IMPORTANT
      //
      // This quiz already has attempts.
      //
      // Backend allows ONLY:
      //
      // description
      // instructions
      // endTime
      // showResultsImmediately
      // showCorrectAnswers
      // tags
      // category
      //
      // DO NOT send:
      //
      // title
      // subjectId
      // durationMinutes
      // totalMarks
      // passingMarks
      // status
      // shuffleQuestions
      // antiCheatSettings
      // =====================================================

      const payload = {
        description: formData.description.trim(),

        instructions: formData.instructions.trim(),

        endTime: getEndTimeForApi(),

        showResultsImmediately:
          Boolean(formData.showResultsImmediately),

        showCorrectAnswers:
          Boolean(formData.showCorrectAnswers),

        tags: Array.isArray(formData.tags)
          ? formData.tags
          : [],

        category: formData.category.trim()
      };

      console.log('Updating quiz:', id);
      console.log('Allowed update payload:', payload);

      // IMPORTANT:
      // Only ONE update request.
      await quizzesAPI.update(id, payload);

      toast.success(
        'Quiz updated successfully!'
      );

      navigate('/trainer/quizzes');
    } catch (err) {
      console.error(
        'Failed to update quiz:',
        err
      );

      const responseData =
        err?.response?.data;

      const message =
        responseData?.message ||
        responseData?.error ||
        err?.message ||
        'Failed to update quiz.';

      setError(message);

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // CSS CLASSES
  // =========================================================

  const inputClasses =
    'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all';

  const disabledInputClasses =
    'w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-not-allowed';

  const labelClasses =
    'block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2';

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <TrainerLayout>
        <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
          <Loader2
            size={40}
            className="text-yellow-400 animate-spin mb-4"
          />

          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Loading Quiz Data...
          </p>
        </div>
      </TrainerLayout>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <TrainerLayout>
        <div className="flex flex-col items-center justify-center py-20 min-h-[60vh] text-center px-6">
          <AlertCircle
            size={48}
            className="text-red-400 mb-4"
          />

          <h3 className="text-lg font-black text-gray-900">
            Failed to load
          </h3>

          <p className="text-sm font-bold text-gray-500 mt-2 max-w-xl">
            {error}
          </p>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={loadData}
              className="px-6 py-2 bg-[#0A0A0A] hover:bg-black text-white text-sm font-bold rounded-xl transition-all"
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/trainer/quizzes')
              }
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </TrainerLayout>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <TrainerLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1000px] mx-auto w-full font-sans selection:bg-yellow-200 pb-32">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="mb-8">

          <Link
            to="/trainer/quizzes"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black uppercase tracking-widest mb-4 transition-colors"
          >
            <ArrowLeft size={14} />

            Back to Quizzes
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">

                <div className="p-2 bg-[#0A0A0A] rounded-lg text-white shadow-sm">
                  <Settings
                    size={24}
                    className="text-yellow-400"
                  />
                </div>

                Edit Quiz Settings
              </h1>

              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2">
                Modify the fields permitted by the quiz lifecycle
              </p>
            </div>

            {/* ATTEMPT STATUS */}

            <div
              className={`inline - flex items - center gap - 2 px - 4 py - 2 rounded - xl text - xs font - black uppercase tracking - widest ${
  hasAttempts
    ? 'bg-orange-50 text-orange-700 border border-orange-200'
    : 'bg-green-50 text-green-700 border border-green-200'
} `}
            >
              <Lock size={14} />

              {hasAttempts
                ? 'Existing Attempts'
                : 'No Attempts'}
            </div>
          </div>

          {/* IMPORTANT BACKEND RULE */}

          {hasAttempts && (
            <div className="mt-6 p-4 rounded-2xl bg-orange-50 border border-orange-200 flex items-start gap-3">

              <AlertCircle
                size={20}
                className="text-orange-500 mt-0.5 shrink-0"
              />

              <div>
                <p className="text-sm font-black text-orange-800">
                  Restricted editing
                </p>

                <p className="text-xs font-medium text-orange-700 mt-1 leading-relaxed">
                  This quiz already has student attempts
                  {isPublished
                    ? ' and is published'
                    : ''}.
                  Question structure, scoring, title,
                  subject, duration, status, shuffle and
                  security settings cannot be changed.
                  Only descriptive and result-display
                  settings can be updated.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ===================================================
            FORM
        =================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* =================================================
              SECTION 1 — QUIZ INFORMATION
          ================================================= */}

          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">

            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">

              <BookOpen
                size={18}
                className="text-gray-400"
              />

              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                Quiz Information
              </h2>
            </div>

            <div className="space-y-5">

              {/* TITLE — LOCKED */}

              <div>
                <label className={labelClasses}>
                  Quiz Title
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={formData.title}
                    disabled
                    className={disabledInputClasses}
                  />

                  <Lock
                    size={15}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>

                <p className="text-[10px] font-bold text-gray-400 mt-2">
                  Title cannot be changed after attempts exist.
                </p>
              </div>

              {/* DESCRIPTION — ALLOWED */}

              <div>
                <label className={labelClasses}>
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter quiz description..."
                  className={`${ inputClasses } resize - none`}
                />
              </div>

              {/* INSTRUCTIONS — ALLOWED */}

              <div>
                <label className={labelClasses}>
                  Instructions
                </label>

                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Enter instructions for students..."
                  className={`${ inputClasses } resize - none`}
                />
              </div>

              {/* CATEGORY — ALLOWED */}

              <div>
                <label className={labelClasses}>
                  Category
                </label>

                <div className="relative">
                  <Tag
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g. Examination, Practice, Assessment"
                    className={`${ inputClasses } pl - 11`}
                  />
                </div>
              </div>

              {/* TAGS — ALLOWED */}

              <div>
                <label className={labelClasses}>
                  Tags
                </label>

                <div className="flex gap-2">

                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) =>
                      setTagInput(e.target.value)
                    }
                    onKeyDown={handleTagKeyDown}
                    placeholder="Type a tag and press Enter"
                    className={inputClasses}
                  />

                  <button
                    type="button"
                    onClick={addTag}
                    className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold"
                  >
                    Add
                  </button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">

                    {formData.tags.map((tag, index) => (
                      <button
                        key={`${ tag } -${ index } `}
                        type="button"
                        onClick={() =>
                          removeTag(tag)
                        }
                        className="px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg text-xs font-bold transition-colors"
                        title="Remove tag"
                      >
                        {tag}
                        <span className="ml-2">
                          ×
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <p className="text-[10px] font-bold text-gray-400 mt-2">
                  Press Enter or click Add to create a tag.
                </p>
              </div>

            </div>
          </div>

          {/* =================================================
              SECTION 2 — LOCKED ASSESSMENT STRUCTURE
          ================================================= */}

          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">

            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">

              <div className="flex items-center gap-2">

                <Clock
                  size={18}
                  className="text-blue-500"
                />

                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                  Assessment Structure
                </h2>

              </div>

              <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <Lock size={13} />
                Locked
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* DURATION */}

              <div>
                <label className={labelClasses}>
                  Duration (Minutes)
                </label>

                <input
                  type="number"
                  value={formData.durationMinutes}
                  disabled
                  className={disabledInputClasses}
                />
              </div>

              {/* TOTAL MARKS */}

              <div>
                <label className={labelClasses}>
                  Total Marks
                </label>

                <input
                  type="number"
                  value={formData.totalMarks}
                  disabled
                  className={disabledInputClasses}
                />
              </div>

              {/* PASSING MARKS */}

              <div>
                <label className={labelClasses}>
                  Passing Marks
                </label>

                <input
                  type="number"
                  value={formData.passingMarks}
                  disabled
                  className={disabledInputClasses}
                />
              </div>

            </div>

            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">

              <p className="text-xs font-bold text-gray-500 leading-relaxed">
                These values are determined by the selected
                questions and scoring configuration. They
                cannot be modified because this quiz has
                existing attempts.
              </p>

            </div>
          </div>

          {/* =================================================
              SECTION 3 — SUBJECT
          ================================================= */}

          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">

            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">

              <div className="flex items-center gap-2">

                <BookOpen
                  size={18}
                  className="text-gray-400"
                />

                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                  Subject
                </h2>

              </div>

              <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <Lock size={13} />
                Locked
              </div>

            </div>

            <div>

              <label className={labelClasses}>
                Subject Category
              </label>

              <input
                type="text"
                value={
                  formData.subjectName ||
                  'No subject assigned'
                }
                disabled
                className={disabledInputClasses}
              />

              <p className="text-[10px] font-bold text-gray-400 mt-2">
                Subject cannot be changed after attempts exist.
              </p>

            </div>

          </div>

          {/* =================================================
              SECTION 4 — END TIME
          ================================================= */}

          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">

            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">

              <Calendar
                size={18}
                className="text-blue-500"
              />

              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                Schedule
              </h2>

            </div>

            <div>

              <label className={labelClasses}>
                End Time
              </label>

              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className={inputClasses}
              />

              <p className="text-[10px] font-bold text-gray-400 mt-2">
                The end time can be changed even when the
                quiz already has attempts.
              </p>

            </div>
          </div>

          {/* =================================================
              SECTION 5 — RESULT SETTINGS
          ================================================= */}

          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">

            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">

              <FileText
                size={18}
                className="text-blue-500"
              />

              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                Result Settings
              </h2>

            </div>

            <div className="space-y-5">

              {/* SHOW RESULTS */}

              <label className="flex items-center justify-between gap-5 cursor-pointer">

                <div>
                  <span className="text-sm font-bold text-gray-900 block">
                    Show Results Immediately
                  </span>

                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Students can see their result after submission
                  </span>
                </div>

                <div className="relative shrink-0">

                  <input
                    type="checkbox"
                    name="showResultsImmediately"
                    checked={
                      formData.showResultsImmediately
                    }
                    onChange={handleChange}
                    className="sr-only peer"
                  />

                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>

                </div>

              </label>

              {/* SHOW CORRECT ANSWERS */}

              <label className="flex items-center justify-between gap-5 cursor-pointer">

                <div>
                  <span className="text-sm font-bold text-gray-900 block">
                    Show Correct Answers
                  </span>

                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Students can see correct answers after submission
                  </span>
                </div>

                <div className="relative shrink-0">

                  <input
                    type="checkbox"
                    name="showCorrectAnswers"
                    checked={
                      formData.showCorrectAnswers
                    }
                    onChange={handleChange}
                    className="sr-only peer"
                  />

                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>

                </div>

              </label>

            </div>
          </div>

          {/* =================================================
              SECTION 6 — LOCKED SECURITY
          ================================================= */}

          <div className="bg-[#0A0A0A] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-lg text-white relative overflow-hidden">

            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-400 rounded-full blur-3xl opacity-10 pointer-events-none"></div>

            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10 relative z-10">

              <div className="flex items-center gap-2">

                <Shield
                  size={18}
                  className="text-yellow-400"
                />

                <h2 className="text-sm font-black text-white uppercase tracking-widest">
                  Security Settings
                </h2>

              </div>

              <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                <Lock size={13} />
                Locked
              </div>

            </div>

            <div className="space-y-5 relative z-10">

              {/* SHUFFLE */}

              <div className="flex items-center justify-between gap-5">

                <div>
                  <span className="text-sm font-bold text-white block">
                    Shuffle Questions
                  </span>

                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Randomize question order per student
                  </span>
                </div>

                <div
                  className={`w - 11 h - 6 rounded - full relative ${
  formData.shuffleQuestions
    ? 'bg-yellow-400'
    : 'bg-gray-700'
} `}
                >
                  <div
                    className={`absolute top - [2px] h - 5 w - 5 rounded - full bg - white border border - gray - 300 transition - all ${
  formData.shuffleQuestions
    ? 'translate-x-[22px]'
    : 'translate-x-[2px]'
} `}
                  />
                </div>

              </div>

              {/* STRICT MODE */}

              <div className="flex items-center justify-between gap-5">

                <div>
                  <span className="text-sm font-bold text-white block">
                    Strict Mode
                  </span>

                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Track tab switches and exits
                  </span>
                </div>

                <div
                  className={`w - 11 h - 6 rounded - full relative ${
  formData.strictMode
    ? 'bg-yellow-400'
    : 'bg-gray-700'
} `}
                >
                  <div
                    className={`absolute top - [2px] h - 5 w - 5 rounded - full bg - white border border - gray - 300 transition - all ${
  formData.strictMode
    ? 'translate-x-[22px]'
    : 'translate-x-[2px]'
} `}
                  />
                </div>

              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">

                <p className="text-xs text-gray-400 leading-relaxed">
                  Security settings are locked because this
                  quiz has existing attempts. Changing them
                  could affect the consistency of existing
                  attempts.
                </p>

              </div>

            </div>
          </div>

          {/* =================================================
              FIXED ACTION BAR
          ================================================= */}

          <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 px-6 z-40 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">

            {/* CANCEL */}

            <button
              type="button"
              onClick={() =>
                navigate('/trainer/quizzes')
              }
              disabled={saving}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-all disabled:opacity-50"
            >
              Cancel
            </button>

            {/* SAVE */}

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 px-8 py-2.5 bg-[#0A0A0A] hover:bg-black text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />

                  Save Changes
                </>
              )}
            </button>

          </div>

        </form>
      </div>
    </TrainerLayout>
  );
};

export default EditQuiz;

