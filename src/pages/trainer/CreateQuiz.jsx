// src/pages/trainer/CreateQuiz.jsx
import React, { useState, useEffect } from "react";
import TrainerLayout from "../../components/Layout/TrainerLayout";
import { quizzesAPI } from "../../api/quizzes.api";
import { subjectsAPI } from "../../api/subjects.api";
import { questionsAPI } from "../../api/questions.api";
import { useNavigate } from "react-router-dom";
import {
  Settings, Clock, Calendar, CheckCircle2,
  AlertTriangle, Save, Play, Shuffle,
  ListChecks, BookOpen, Layers, Info, ShieldAlert
} from "lucide-react";

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

  // ✅ CLEAN PAYLOAD HELPER
  const cleanPayload = (data) => {
    const cleaned = { ...data };

    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === "" || cleaned[key] === null) {
        delete cleaned[key];
      }
    });

    if (cleaned.questionPoolFilter) {
      const poolFilter = { ...cleaned.questionPoolFilter };
      if (!poolFilter.subject || poolFilter.subject === "") delete poolFilter.subject;
      if (Array.isArray(poolFilter.difficulty) && poolFilter.difficulty.length === 0) delete poolFilter.difficulty;
      if (Array.isArray(poolFilter.tags) && poolFilter.tags.length === 0) delete poolFilter.tags;
      cleaned.questionPoolFilter = poolFilter;
    }

    if (cleaned.targetAudience) {
      const audience = { ...cleaned.targetAudience };
      if (Array.isArray(audience.semesters) && audience.semesters.length === 0) delete audience.semesters;
      if (Array.isArray(audience.departments) && audience.departments.length === 0) delete audience.departments;
      if (Array.isArray(audience.specificStudents) && audience.specificStudents.length === 0) delete audience.specificStudents;

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

  // ✅ SAVE AS DRAFT
  const handleSaveDraft = async (e) => {
    e.preventDefault();

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

      if (formData.startTime) payload.startTime = formData.startTime;
      if (formData.endTime) payload.endTime = formData.endTime;

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
        payload.questionIds = [];
      }

      const hasTargetAudience =
        formData.targetAudience.semesters.length > 0 ||
        formData.targetAudience.departments.length > 0 ||
        formData.targetAudience.specificStudents.length > 0;

      if (hasTargetAudience) payload.targetAudience = formData.targetAudience;

      payload = cleanPayload(payload);
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

  // ✅ CREATE & PUBLISH
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

      if (formData.questionMode === "fixed_list") {
        payload.questionIds = formData.questionIds;
        const selectedQuestions = questions.filter(q => payload.questionIds.includes(q._id));
        payload.totalMarks = selectedQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);
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

      const hasTargetAudience =
        formData.targetAudience.semesters.length > 0 ||
        formData.targetAudience.departments.length > 0 ||
        formData.targetAudience.specificStudents.length > 0;

      if (hasTargetAudience) payload.targetAudience = formData.targetAudience;

      payload = cleanPayload(payload);
      const res = await quizzesAPI.create(payload);
      alert("✅ Quiz created successfully!");
      navigate("/trainer/quizzes");
    } catch (err) {
      console.error("Create quiz error:", err);
      const errorMsg = err.response?.data?.error || "Failed to create quiz";
      const details = err.response?.data?.details ? "\n\nDetails:\n" + JSON.stringify(err.response.data.details, null, 2) : "";
      alert(errorMsg + details);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-black transition-colors";
  const labelClass = "block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2";

  return (
    <TrainerLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full font-sans selection:bg-yellow-200">

        {/* Header & Progress */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Create New Quiz</h1>

          <div className="mt-6 max-w-2xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Setup Progress</span>
              <span className="text-sm font-black text-gray-900">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <form className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 relative items-start">

          {/* ================= LEFT COLUMN ================= */}
          <div className="xl:col-span-2 space-y-6">

            {/* General Info Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-4">
                <BookOpen size={20} className="text-yellow-500" />
                <h2 className="text-lg font-black text-gray-900">General Information</h2>
              </div>

              <div>
                <label className={labelClass}>Quiz Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={inputClass}
                  value={formData.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="e.g., Midterm Evaluation 2026"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  className={`${inputClass} min-h-[100px] resize-y`}
                  value={formData.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Brief description of the quiz objectives..."
                />
              </div>

              <div>
                <label className={labelClass}>Subject</label>
                <select
                  className={inputClass}
                  value={formData.subject}
                  onChange={(e) => update("subject", e.target.value)}
                >
                  <option value="">Select subject (optional)</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Questions Configuration Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-4">
                <Layers size={20} className="text-yellow-500" />
                <h2 className="text-lg font-black text-gray-900">Questions Setup</h2>
              </div>

              <div>
                <label className={labelClass}>Question Mode</label>
                <select
                  className={inputClass}
                  value={formData.questionMode}
                  onChange={(e) => {
                    update("questionMode", e.target.value);
                    if (e.target.value === "none") update("questionIds", []);
                  }}
                >
                  <option value="none">No questions yet (Add later)</option>
                  <option value="fixed_list">Fixed List (Manually Select)</option>
                  <option value="pool_random">Random From Pool</option>
                </select>
              </div>

              {/* POOL RANDOM SETTINGS */}
              {formData.questionMode === "pool_random" && (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-5 animate-in fade-in duration-300">
                  <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2 text-gray-900 mb-4">
                    <Shuffle size={16} /> Random Pool Settings
                  </h3>

                  <div>
                    <label className={labelClass}>Number of Questions <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min="1"
                      className={inputClass}
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
                    <label className={labelClass}>Pool Subject</label>
                    <select
                      className={inputClass}
                      value={formData.questionPoolFilter?.subject || ""}
                      onChange={(e) =>
                        update("questionPoolFilter", { ...formData.questionPoolFilter, subject: e.target.value })
                      }
                    >
                      <option value="">Any subject (Global Pool)</option>
                      {subjects.map((s) => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Difficulty filter</label>
                    <select
                      multiple
                      size="3"
                      className={`${inputClass} py-2`}
                      value={formData.questionPoolFilter?.difficulty || []}
                      onChange={(e) =>
                        update("questionPoolFilter", {
                          ...formData.questionPoolFilter,
                          difficulty: Array.from(e.target.selectedOptions, (o) => o.value)
                        })
                      }
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Hold Ctrl/Cmd to select multiple</p>
                  </div>

                  <div>
                    <label className={labelClass}>Tags filter</label>
                    <input
                      type="text"
                      placeholder="e.g. loops, arrays, functions"
                      className={inputClass}
                      onChange={(e) =>
                        update("questionPoolFilter", {
                          ...formData.questionPoolFilter,
                          tags: e.target.value.split(",").map((t) => t.trim()).filter((t) => t)
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* FIXED LIST SELECTOR */}
              {formData.questionMode === "fixed_list" && (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2 text-gray-900">
                      <ListChecks size={16} /> Select Questions
                    </h3>
                    <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-md border border-yellow-200">
                      {formData.questionIds.length} Selected
                    </span>
                  </div>

                  {questions.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
                      <p className="text-sm font-bold text-gray-500 mb-3">No questions available in the bank.</p>
                      <button
                        type="button"
                        onClick={() => navigate("/trainer/questions/create")}
                        className="text-xs font-bold text-[#0A0A0A] uppercase tracking-widest hover:text-yellow-600 transition-colors"
                      >
                        + Create questions first
                      </button>
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-xl bg-white custom-scrollbar divide-y divide-gray-100">
                      {questions.map((q) => {
                        const isSelected = formData.questionIds.includes(q._id);
                        return (
                          <label
                            key={q._id}
                            className={`flex items-start gap-4 p-4 cursor-pointer transition-colors ${isSelected ? 'bg-yellow-50/50' : 'hover:bg-gray-50'}`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleQuestion(q._id)}
                              className="mt-1 w-4 h-4 accent-black cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${isSelected ? 'text-black' : 'text-gray-700'}`}>
                                {q.prompt}
                              </p>
                              <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <span>Marks: {q.marks || 1}</span>
                                <span>Type: {q.type}</span>
                              </div>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Logistics & Schedule Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-4">
                <Calendar size={20} className="text-yellow-500" />
                <h2 className="text-lg font-black text-gray-900">Logistics & Schedule</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    className={inputClass}
                    value={formData.durationMinutes}
                    onChange={(e) => update("durationMinutes", Math.max(1, Number(e.target.value) || 1))}
                  />
                </div>
                <div>
                  <label className={labelClass}>Attempts Allowed</label>
                  <input
                    type="number"
                    min="1"
                    className={inputClass}
                    value={formData.attemptsAllowed}
                    onChange={(e) => update("attemptsAllowed", Math.max(1, Number(e.target.value) || 1))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                <div>
                  <label className={labelClass}>Start Time <span className="text-red-500">*</span></label>
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={formData.startTime}
                    onChange={(e) => update("startTime", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>End Time <span className="text-red-500">*</span></label>
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={formData.endTime}
                    onChange={(e) => update("endTime", e.target.value)}
                    required
                  />
                </div>
              </div>

              {formData.startTime && formData.endTime && new Date(formData.startTime) >= new Date(formData.endTime) && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold uppercase tracking-widest border border-red-100">
                  <AlertTriangle size={14} /> End time must be after start time
                </div>
              )}
            </div>

            {/* Instructions Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-4">
                <Info size={20} className="text-yellow-500" />
                <h2 className="text-lg font-black text-gray-900">Student Instructions</h2>
              </div>
              <div>
                <textarea
                  className={`${inputClass} min-h-[120px] resize-y`}
                  value={formData.instructions}
                  onChange={(e) => update("instructions", e.target.value)}
                  placeholder="Enter specific guidelines, rules, or prerequisites for the students before they start..."
                />
              </div>
            </div>

            {/* Security & Anti-Cheat Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between mb-2 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={20} className="text-yellow-500" />
                  <h2 className="text-lg font-black text-gray-900">Security & Anti-Cheat</h2>
                </div>
                <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-yellow-200">
                  Proctoring
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Browser Lockdown Options */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-3 text-gray-500">Browser Environment</h3>
                  
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 accent-black cursor-pointer" 
                      checked={formData.antiCheatSettings.enableFullScreen} 
                      onChange={(e) => updateDeep("antiCheatSettings", "enableFullScreen", e.target.checked)} 
                    />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-black transition-colors">Force Fullscreen Mode</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 accent-black cursor-pointer" 
                      checked={formData.antiCheatSettings.disableCopyPaste} 
                      onChange={(e) => updateDeep("antiCheatSettings", "disableCopyPaste", e.target.checked)} 
                    />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-black transition-colors">Disable Copy/Paste & Right-Click</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 accent-black cursor-pointer" 
                      checked={formData.antiCheatSettings.trackIPAddress} 
                      onChange={(e) => updateDeep("antiCheatSettings", "trackIPAddress", e.target.checked)} 
                    />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-black transition-colors">Track IP Address (Block Multi-Logins)</span>
                  </label>
                </div>

                {/* Tab Switch Detection */}
                <div className="space-y-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 accent-black cursor-pointer mt-1" 
                      checked={formData.antiCheatSettings.enableTabSwitchDetection} 
                      onChange={(e) => updateDeep("antiCheatSettings", "enableTabSwitchDetection", e.target.checked)} 
                    />
                    <div>
                      <span className="text-sm font-bold text-gray-900 block">Tab Switch Detection</span>
                      <span className="text-xs text-gray-500 font-medium">Auto-submits if students leave the quiz tab.</span>
                    </div>
                  </label>

                  {formData.antiCheatSettings.enableTabSwitchDetection && (
                    <div className="pl-7 pt-2 animate-in fade-in duration-200">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                        Max Tab Switches Allowed
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        className={`${inputClass} py-2`}
                        value={formData.antiCheatSettings.maxTabSwitches}
                        onChange={(e) => updateDeep("antiCheatSettings", "maxTabSwitches", Math.max(0, Number(e.target.value) || 0))}
                      />
                      <p className="text-[10px] font-bold text-gray-400 mt-1">Set to 0 for zero-tolerance (instant submit).</p>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>

          {/* ================= RIGHT COLUMN (Sticky) ================= */}
          <div className="xl:col-span-1 space-y-6 xl:sticky xl:top-[100px]">

            {/* Live Summary Card */}
            <div className="bg-[#0A0A0A] p-6 rounded-3xl border border-gray-800 shadow-xl text-white relative overflow-hidden">
              <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-yellow-400 rounded-full opacity-10 blur-3xl pointer-events-none"></div>

              <h2 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-yellow-400" /> Quiz Summary
              </h2>

              <div className="space-y-4 text-sm font-medium">
                <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                  <span className="text-gray-400">Mode</span>
                  <span className="capitalize font-bold bg-white/10 px-2 py-1 rounded">{formData.questionMode.replace("_", " ")}</span>
                </div>

                <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                  <span className="text-gray-400">Questions</span>
                  <span className="font-bold">{selectedQuestionCount} {formData.questionMode === "none" && "(Not set)"}</span>
                </div>

                <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                  <span className="text-gray-400">Total Marks</span>
                  <span className="font-bold text-yellow-400 text-base">{autoCalculatedMarks}</span>
                </div>

                <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                  <span className="text-gray-400">Passing Marks</span>
                  <span className="font-bold">{formData.passingMarks}</span>
                </div>

                {formData.passingMarks > autoCalculatedMarks && autoCalculatedMarks > 0 && (
                  <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                    ⚠️ Passing marks exceeds total
                  </div>
                )}
              </div>
            </div>

            {/* Grading & Options */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">

              {/* Grading */}
              <div>
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4">Grading Threshold</h3>
                <label className={labelClass}>Passing Marks</label>
                <input
                  type="number"
                  min="0"
                  max={autoCalculatedMarks || 100}
                  className={inputClass}
                  value={formData.passingMarks}
                  onChange={(e) => update("passingMarks", Math.max(0, Number(e.target.value) || 0))}
                />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                  {autoCalculatedMarks > 0 ? `Maximum possible: ${autoCalculatedMarks}` : "Will adjust based on questions"}
                </p>
              </div>

              <div className="w-full h-px bg-gray-100"></div>

              {/* Toggles */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-2">Quiz Behavior</h3>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 accent-black cursor-pointer" checked={formData.shuffleQuestions} onChange={(e) => update("shuffleQuestions", e.target.checked)} />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-black transition-colors">Shuffle Questions</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 accent-black cursor-pointer" checked={formData.shuffleChoices} onChange={(e) => update("shuffleChoices", e.target.checked)} />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-black transition-colors">Shuffle Choices</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 accent-black cursor-pointer" checked={formData.showResultsImmediately} onChange={(e) => update("showResultsImmediately", e.target.checked)} />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-black transition-colors">Show results instantly</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 accent-black cursor-pointer" checked={formData.showCorrectAnswers} onChange={(e) => update("showCorrectAnswers", e.target.checked)} />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-black transition-colors">Show correct answers</span>
                </label>
              </div>
            </div>

            {/* Validation Errors */}
            {getValidationErrors().length > 0 && (
              <div className="bg-red-50 border border-red-200 p-5 rounded-2xl animate-in fade-in duration-300">
                <p className="text-xs font-black text-red-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <AlertTriangle size={14} /> Action Required
                </p>
                <ul className="space-y-2">
                  {getValidationErrors().map((err, i) => (
                    <li key={i} className="text-xs font-bold text-red-600 flex items-start gap-2">
                      <span className="mt-0.5">•</span> {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={handleSubmit}
                disabled={loading || getValidationErrors().length > 0}
                type="button"
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black rounded-xl hover:from-yellow-500 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_4px_14px_0_rgba(250,204,21,0.2)] flex items-center justify-center gap-2"
              >
                {loading ? "Processing..." : <><Play size={18} /> Publish Quiz</>}
              </button>

              <button
                onClick={handleSaveDraft}
                disabled={loading || !formData.title}
                type="button"
                className="w-full py-4 bg-white border-2 border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <Save size={18} /> Save as Draft
              </button>
            </div>

          </div>
        </form>
      </div>
    </TrainerLayout>
  );
};

export default CreateQuiz;