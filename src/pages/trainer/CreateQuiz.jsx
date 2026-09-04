import React, { useState, useEffect } from "react";
import TrainerLayout from "../../components/Layout/TrainerLayout";
import { quizzesAPI } from "../../api/quizzes.api";
import { subjectsAPI } from "../../api/subjects.api";
import { questionsAPI } from "../../api/questions.api";
import { useNavigate } from "react-router-dom";

const CreateQuiz = () => {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    questionMode: "none",
    questionIds: [],

    questionPoolFilter: {
      subject: "",
      count: 10,
      difficulty: [],
      tags: []
    },

    durationMinutes: 60,
    attemptsAllowed: 1,
    startTime: "",
    endTime: "",
    shuffleQuestions: true,
    shuffleChoices: true,
    totalMarks: 0,
    passingMarks: 0,
    showResultsImmediately: true,
    showCorrectAnswers: false,

    targetAudience: {
      semesters: [],
      departments: [],
      specificStudents: [],
    },

    antiCheatSettings: {
      enableTabSwitchDetection: true,
      maxTabSwitches: 3,
      trackIPAddress: true,
      allowIPChange: false,
      enableFullScreen: false,
      disableCopyPaste: true,
      randomizeQuestionOrder: true,
    },

    instructions: "",
    status: "draft",
    isDraft: true,
    tags: [],
    category: ""
  });

  // ✅ AUTO-CALCULATED VALUES
  const autoCalculatedMarks = (() => {
    if (formData.questionMode === "fixed_list") {
      const selected = questions.filter((q) =>
        formData.questionIds.includes(q._id)
      );
      return selected.reduce((sum, q) => sum + (q.marks || 1), 0);
    }

    if (formData.questionMode === "pool_random") {
      return (formData.questionPoolFilter?.count || 10) * 1;
    }

    return 0;
  })();

  const selectedQuestionCount =
    formData.questionMode === "fixed_list"
      ? formData.questionIds.length
      : formData.questionMode === "pool_random"
        ? formData.questionPoolFilter?.count || 0
        : 0;

  // ✅ COMPLETION TRACKING
  useEffect(() => {
    let completed = 0;
    const total = 10;

    if (formData.title) completed++;
    if (formData.description) completed++;
    if (formData.subject) completed++;
    if (formData.questionIds.length > 0 || formData.questionPoolFilter.count > 0) completed++;
    if (formData.durationMinutes) completed++;
    if (autoCalculatedMarks > 0) completed++;
    if (formData.startTime) completed++;
    if (formData.endTime) completed++;
    if (formData.instructions) completed++;
    if (formData.passingMarks >= 0) completed++;

    setCompletionPercentage(Math.round((completed / total) * 100));
  }, [formData, autoCalculatedMarks]);

  // ✅ LOAD INITIAL DATA
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [subjectRes, questionRes] = await Promise.all([
        subjectsAPI.getAll(),
        questionsAPI.getAll()
      ]);

      setSubjects(subjectRes.data || []);
      setQuestions(questionRes.data || []);
    } catch (err) {
      console.log("Failed to load data", err);
    }
  };

  // ✅ HELPERS
  const update = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const updateDeep = (parent, field, value) =>
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));

  const toggleQuestion = (id) => {
    setFormData((prev) => {
      const exists = prev.questionIds.includes(id);
      return {
        ...prev,
        questionIds: exists
          ? prev.questionIds.filter((q) => q !== id)
          : [...prev.questionIds, id],
      };
    });
  };

  // ✅ CLEAN PAYLOAD HELPER - Removes empty strings
  const cleanPayload = (data) => {
    const cleaned = { ...data };

    // Clean top-level empty strings
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === "" || cleaned[key] === null) {
        delete cleaned[key];
      }
    });

    // Clean questionPoolFilter
    if (cleaned.questionPoolFilter) {
      const poolFilter = { ...cleaned.questionPoolFilter };

      // Remove empty subject
      if (!poolFilter.subject || poolFilter.subject === "") {
        delete poolFilter.subject;
      }

      // Remove empty arrays
      if (Array.isArray(poolFilter.difficulty) && poolFilter.difficulty.length === 0) {
        delete poolFilter.difficulty;
      }
      if (Array.isArray(poolFilter.tags) && poolFilter.tags.length === 0) {
        delete poolFilter.tags;
      }

      cleaned.questionPoolFilter = poolFilter;
    }

    // Clean targetAudience
    if (cleaned.targetAudience) {
      const audience = { ...cleaned.targetAudience };
      if (Array.isArray(audience.semesters) && audience.semesters.length === 0) {
        delete audience.semesters;
      }
      if (Array.isArray(audience.departments) && audience.departments.length === 0) {
        delete audience.departments;
      }
      if (Array.isArray(audience.specificStudents) && audience.specificStudents.length === 0) {
        delete audience.specificStudents;
      }

      // If targetAudience is now empty, remove it
      if (Object.keys(audience).length === 0) {
        delete cleaned.targetAudience;
      } else {
        cleaned.targetAudience = audience;
      }
    }

    return cleaned;
  };

  // ✅ VALIDATION HELPER
  const getValidationErrors = () => {
    const errors = [];

    if (!formData.title) errors.push("Title is required");
    if (!formData.startTime) errors.push("Start time is required");
    if (!formData.endTime) errors.push("End time is required");

    if (formData.startTime && formData.endTime) {
      if (new Date(formData.startTime) >= new Date(formData.endTime)) {
        errors.push("End time must be after start time");
      }
    }

    if (formData.questionMode === "fixed_list" && formData.questionIds.length === 0) {
      errors.push("Select at least one question");
    }

    if (formData.questionMode === "pool_random") {
      if (!formData.questionPoolFilter.count || formData.questionPoolFilter.count < 1) {
        errors.push("Specify number of questions for pool mode");
      }
    }

    if (autoCalculatedMarks > 0 && formData.passingMarks > autoCalculatedMarks) {
      errors.push("Passing marks cannot exceed total marks");
    }

    return errors;
  };

  // ✅ SAVE AS DRAFT - More flexible validation
  const handleSaveDraft = async (e) => {
    e.preventDefault();

    // Only require title for draft
    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }

    setLoading(true);

    try {
      let payload = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject || undefined,
        questionMode: formData.questionMode,
        durationMinutes: formData.durationMinutes,
        attemptsAllowed: formData.attemptsAllowed,
        shuffleQuestions: formData.shuffleQuestions,
        shuffleChoices: formData.shuffleChoices,
        totalMarks: autoCalculatedMarks,
        passingMarks: formData.passingMarks > autoCalculatedMarks ? autoCalculatedMarks : formData.passingMarks,
        showResultsImmediately: formData.showResultsImmediately,
        showCorrectAnswers: formData.showCorrectAnswers,
        antiCheatSettings: formData.antiCheatSettings,
        instructions: formData.instructions,
        status: "draft",
        isDraft: true,
        tags: formData.tags,
        category: formData.category || undefined
      };

      // Add scheduling if provided
      if (formData.startTime) payload.startTime = formData.startTime;
      if (formData.endTime) payload.endTime = formData.endTime;

      // Handle question mode specific fields
      if (formData.questionMode === "fixed_list") {
        payload.questionIds = formData.questionIds;
      } else if (formData.questionMode === "pool_random") {
        payload.questionPoolFilter = {
          subject: formData.questionPoolFilter.subject || undefined,
          count: formData.questionPoolFilter.count,
          difficulty: formData.questionPoolFilter.difficulty,
          tags: formData.questionPoolFilter.tags
        };
        payload.questionIds = [];
      } else {
        // questionMode: "none"
        payload.questionIds = [];
      }

      // Add targetAudience if any values are set
      const hasTargetAudience =
        formData.targetAudience.semesters.length > 0 ||
        formData.targetAudience.departments.length > 0 ||
        formData.targetAudience.specificStudents.length > 0;

      if (hasTargetAudience) {
        payload.targetAudience = formData.targetAudience;
      }

      // Clean the payload
      payload = cleanPayload(payload);

      console.log("Draft payload:", payload);

      const res = await quizzesAPI.create(payload);

      alert("✅ Quiz saved as draft!");
      navigate("/trainer/quizzes");
    } catch (err) {
      console.error("Save draft error:", err);
      alert(err.response?.data?.error || "Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  // ✅ CREATE & PUBLISH - Full validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = getValidationErrors();
    if (errors.length > 0) {
      alert("Please fix the following errors:\n\n" + errors.join("\n"));
      return;
    }

    setLoading(true);

    try {
      let payload = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject || undefined,
        questionMode: formData.questionMode,
        durationMinutes: formData.durationMinutes,
        attemptsAllowed: formData.attemptsAllowed,
        startTime: formData.startTime,
        endTime: formData.endTime,
        shuffleQuestions: formData.shuffleQuestions,
        shuffleChoices: formData.shuffleChoices,
        totalMarks: autoCalculatedMarks,
        passingMarks: formData.passingMarks > autoCalculatedMarks ? autoCalculatedMarks : formData.passingMarks,
        showResultsImmediately: formData.showResultsImmediately,
        showCorrectAnswers: formData.showCorrectAnswers,
        antiCheatSettings: formData.antiCheatSettings,
        instructions: formData.instructions,
        status: "ready",
        isDraft: false,
        tags: formData.tags,
        category: formData.category || undefined
      };

      // Handle question mode specific fields
      if (formData.questionMode === "fixed_list") {
        payload.questionIds = formData.questionIds;

        // Recalculate totalMarks based on selected questions
        const selectedQuestions = questions.filter(q =>
          payload.questionIds.includes(q._id)
        );
        payload.totalMarks = selectedQuestions.reduce(
          (sum, q) => sum + (q.marks || 1),
          0
        );
      } else if (formData.questionMode === "pool_random") {
        payload.questionPoolFilter = {
          subject: formData.subject || undefined,
          count: formData.questionPoolFilter.count,
          difficulty: formData.questionPoolFilter.difficulty,
          tags: formData.questionPoolFilter.tags
        };
        payload.totalMarks = formData.questionPoolFilter.count * 1;
        payload.questionIds = [];
      }

      // Add targetAudience if any values are set
      const hasTargetAudience =
        formData.targetAudience.semesters.length > 0 ||
        formData.targetAudience.departments.length > 0 ||
        formData.targetAudience.specificStudents.length > 0;

      if (hasTargetAudience) {
        payload.targetAudience = formData.targetAudience;
      }

      // Clean the payload
      payload = cleanPayload(payload);

      console.log("Create quiz payload:", payload);

      const res = await quizzesAPI.create(payload);

      alert("✅ Quiz created successfully!");
      navigate("/trainer/quizzes");
    } catch (err) {
      console.error("Create quiz error:", err);
      const errorMsg = err.response?.data?.error || "Failed to create quiz";
      const details = err.response?.data?.details
        ? "\n\nDetails:\n" + JSON.stringify(err.response.data.details, null, 2)
        : "";
      alert(errorMsg + details);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TrainerLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Quiz</h1>

        {/* ✅ PROGRESS BAR */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Setup Progress</span>
            <span className="font-semibold">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT SIDE */}
        <div className="space-y-5">
          {/* ✅ TITLE - REQUIRED */}
          <div>
            <label className="font-semibold text-red-600">Quiz Title *</label>
            <input
              type="text"
              className="w-full border p-2 rounded mt-1"
              value={formData.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Enter quiz title"
              required
            />
          </div>

          {/* ✅ DESCRIPTION - OPTIONAL */}
          <div>
            <label className="font-semibold block mb-1">Description</label>
            <textarea
              className="w-full border p-2 rounded"
              rows="3"
              value={formData.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Brief description of the quiz (optional)"
            />
          </div>

          {/* ✅ SUBJECT - OPTIONAL */}
          <div>
            <label className="font-semibold block mb-1">Subject</label>
            <select
              className="w-full border p-2 rounded"
              value={formData.subject}
              onChange={(e) => update("subject", e.target.value)}
            >
              <option value="">Select subject (optional)</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Can be added later
            </p>
          </div>

          {/* ✅ QUESTION MODE */}
          <div>
            <label className="font-semibold block mb-1">Question Mode</label>
            <select
              className="w-full border p-2 rounded"
              value={formData.questionMode}
              onChange={(e) => {
                update("questionMode", e.target.value);
                // Reset related fields when mode changes
                if (e.target.value === "none") {
                  update("questionIds", []);
                }
              }}
            >
              <option value="none">No questions yet (add later)</option>
              <option value="fixed_list">Fixed List</option>
              <option value="pool_random">Random From Pool</option>
            </select>
          </div>

          {/* POOL RANDOM SETTINGS */}
          {formData.questionMode === "pool_random" && (
            <div className="border p-4 rounded space-y-3 bg-blue-50">
              <h2 className="font-semibold text-lg">📝 Random Pool Settings</h2>

              <div>
                <label className="font-semibold block mb-1">
                  Number of Questions *
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full border p-2 rounded"
                  value={formData.questionPoolFilter?.count || 10}
                  onChange={(e) =>
                    update("questionPoolFilter", {
                      ...formData.questionPoolFilter,
                      count: Math.max(1, Number(e.target.value) || 1)
                    })
                  }
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  Pool Subject (optional)
                </label>
                <select
                  className="w-full border p-2 rounded"
                  value={formData.questionPoolFilter?.subject || ""}
                  onChange={(e) =>
                    update("questionPoolFilter", {
                      ...formData.questionPoolFilter,
                      subject: e.target.value
                    })
                  }
                >
                  <option value="">Any subject</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to pull from all subjects
                </p>
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  Difficulty (optional)
                </label>
                <select
                  multiple
                  size="3"
                  className="w-full border p-2 rounded"
                  value={formData.questionPoolFilter?.difficulty || []}
                  onChange={(e) =>
                    update("questionPoolFilter", {
                      ...formData.questionPoolFilter,
                      difficulty: Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      )
                    })
                  }
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Hold Ctrl/Cmd to select multiple
                </p>
              </div>

              <div>
                <label className="font-semibold block mb-1">Tags (optional)</label>
                <input
                  type="text"
                  placeholder="comma separated: loops,arrays,functions"
                  className="w-full border p-2 rounded"
                  onChange={(e) =>
                    update("questionPoolFilter", {
                      ...formData.questionPoolFilter,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter((t) => t)
                    })
                  }
                />
              </div>
            </div>
          )}

          {/* FIXED LIST SELECTOR */}
          {formData.questionMode === "fixed_list" && (
            <div className="border p-4 rounded bg-green-50">
              <label className="font-semibold block mb-2">
                📋 Select Questions
              </label>

              {questions.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p className="mb-2">No questions available</p>
                  <button
                    type="button"
                    onClick={() => navigate("/trainer/questions/create")}
                    className="text-blue-600 underline text-sm"
                  >
                    Create questions first
                  </button>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-scroll border rounded p-3 space-y-2 bg-white">
                  {questions.map((q) => (
                    <label
                      key={q._id}
                      className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.questionIds.includes(q._id)}
                        onChange={() => toggleQuestion(q._id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <span className="text-sm">{q.prompt}</span>
                        <div className="text-xs text-gray-500 mt-1">
                          Marks: {q.marks || 1} | Type: {q.type}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {questions.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {formData.questionIds.length} question(s)
                </p>
              )}
            </div>
          )}

          {/* DURATION */}
          <div>
            <label className="font-semibold block mb-1">Duration (minutes)</label>
            <input
              type="number"
              min="1"
              className="w-full border p-2 rounded"
              value={formData.durationMinutes}
              onChange={(e) =>
                update("durationMinutes", Math.max(1, Number(e.target.value) || 1))
              }
            />
          </div>

          {/* ATTEMPTS */}
          <div>
            <label className="font-semibold block mb-1">Attempts Allowed</label>
            <input
              type="number"
              min="1"
              className="w-full border p-2 rounded"
              value={formData.attemptsAllowed}
              onChange={(e) =>
                update("attemptsAllowed", Math.max(1, Number(e.target.value) || 1))
              }
            />
          </div>

          {/* ✅ SCHEDULE */}
          <div className="border p-4 rounded space-y-3 bg-yellow-50">
            <h2 className="font-semibold text-lg">📅 Schedule</h2>

            <div>
              <label className="font-semibold text-red-600 block mb-1">
                Start Time *
              </label>
              <input
                type="datetime-local"
                className="w-full border p-2 rounded"
                value={formData.startTime}
                onChange={(e) => update("startTime", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="font-semibold text-red-600 block mb-1">
                End Time *
              </label>
              <input
                type="datetime-local"
                className="w-full border p-2 rounded"
                value={formData.endTime}
                onChange={(e) => update("endTime", e.target.value)}
                required
              />
            </div>

            {formData.startTime && formData.endTime &&
              new Date(formData.startTime) >= new Date(formData.endTime) && (
                <p className="text-red-600 text-sm font-semibold">
                  ⚠️ End time must be after start time
                </p>
              )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          {/* ✅ LIVE SUMMARY */}
          <div className="border p-4 rounded bg-blue-50 sticky top-4">
            <h2 className="font-semibold text-lg mb-3">📊 Quiz Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <strong>Mode:</strong>
                <span className="capitalize">
                  {formData.questionMode.replace("_", " ")}
                </span>
              </div>

              <div className="flex justify-between">
                <strong>Questions:</strong>
                <span>
                  {selectedQuestionCount}
                  {formData.questionMode === "none" && " (not set)"}
                </span>
              </div>

              <div className="flex justify-between">
                <strong>Total Marks:</strong>
                <span className="font-semibold text-blue-700">
                  {autoCalculatedMarks}
                </span>
              </div>

              <div className="flex justify-between">
                <strong>Passing Marks:</strong>
                <span>{formData.passingMarks}</span>
              </div>

              {formData.passingMarks > autoCalculatedMarks && autoCalculatedMarks > 0 && (
                <p className="text-red-600 font-semibold text-xs mt-2 p-2 bg-red-50 rounded">
                  ⚠️ Passing marks exceeds total marks!
                </p>
              )}

              <div className="flex justify-between">
                <strong>Duration:</strong>
                <span>{formData.durationMinutes} min</span>
              </div>

              <div className="flex justify-between">
                <strong>Attempts:</strong>
                <span>{formData.attemptsAllowed}</span>
              </div>

              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <strong>Completion:</strong>
                  <span className="font-semibold">{completionPercentage}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* SHUFFLE SETTINGS */}
          <div className="border p-4 rounded space-y-3">
            <h2 className="font-semibold text-lg">🔀 Shuffle Settings</h2>

            <label className="flex gap-2 items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.shuffleQuestions}
                onChange={(e) =>
                  update("shuffleQuestions", e.target.checked)
                }
              />
              <span>Shuffle Questions</span>
            </label>

            <label className="flex gap-2 items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.shuffleChoices}
                onChange={(e) =>
                  update("shuffleChoices", e.target.checked)
                }
              />
              <span>Shuffle Choices</span>
            </label>
          </div>

          {/* MARKS */}
          <div className="border p-4 rounded space-y-3">
            <h2 className="font-semibold text-lg">📝 Grading</h2>

            <div>
              <label className="font-semibold block mb-1">Passing Marks</label>
              <input
                type="number"
                min="0"
                max={autoCalculatedMarks || 100}
                className="w-full border p-2 rounded"
                value={formData.passingMarks}
                onChange={(e) =>
                  update("passingMarks", Math.max(0, Number(e.target.value) || 0))
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                {autoCalculatedMarks > 0
                  ? `Max: ${autoCalculatedMarks}`
                  : "Will be set based on questions"}
              </p>
            </div>
          </div>

          {/* RESULT VISIBILITY */}
          <div className="border p-4 rounded space-y-3">
            <h2 className="font-semibold text-lg">👁️ Result Settings</h2>

            <label className="flex gap-2 items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showResultsImmediately}
                onChange={(e) =>
                  update("showResultsImmediately", e.target.checked)
                }
              />
              <span>Show results immediately</span>
            </label>

            <label className="flex gap-2 items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showCorrectAnswers}
                onChange={(e) =>
                  update("showCorrectAnswers", e.target.checked)
                }
              />
              <span>Show correct answers</span>
            </label>
          </div>

          {/* INSTRUCTIONS */}
          <div className="border p-4 rounded">
            <h2 className="font-semibold text-lg mb-2">📋 Instructions</h2>
            <textarea
              className="w-full border p-2 rounded"
              rows="4"
              value={formData.instructions}
              onChange={(e) => update("instructions", e.target.value)}
              placeholder="Add instructions for students (optional)..."
            />
          </div>

          {/* ✅ ACTION BUTTONS */}
          <div className="space-y-3">
            <button
              onClick={handleSaveDraft}
              disabled={loading || !formData.title}
              type="button"
              className="w-full bg-gray-600 text-white p-3 rounded font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Saving..." : "💾 Save as Draft"}
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading || getValidationErrors().length > 0}
              type="button"
              className="w-full bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Creating..." : "✅ Create Quiz"}
            </button>

            {/* Validation Errors Display */}
            {getValidationErrors().length > 0 && (
              <div className="bg-red-50 border border-red-200 p-3 rounded text-sm">
                <p className="font-semibold text-red-700 mb-2">
                  ⚠️ Please fix these issues:
                </p>
                <ul className="list-disc list-inside space-y-1 text-red-600">
                  {getValidationErrors().map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Help Text */}
            <div className="bg-gray-50 border p-3 rounded text-xs text-gray-600">
              <p className="font-semibold mb-1">💡 Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Save as Draft:</strong> Only title required</li>
                <li><strong>Create Quiz:</strong> All required fields must be filled</li>
                <li>Total marks are auto-calculated from questions</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </TrainerLayout>
  );
};

export default CreateQuiz;