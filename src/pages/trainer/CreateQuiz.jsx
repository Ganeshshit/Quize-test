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

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    questionMode: "fixed_list",
    questionIds: [],
    durationSeconds: 1800,
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
  });
  // AUTO-CALCULATED VALUES
  const autoCalculatedMarks = (() => {
    if (formData.questionMode === "fixed_list") {
      const selected = questions.filter((q) =>
        formData.questionIds.includes(q._id)
      );
      return selected.reduce((sum, q) => sum + (q.marks || 1), 0);
    }

    if (formData.questionMode === "pool_random") {
      return (formData.questionPoolFilter?.count || 10) * 1; // 1 mark per question
    }

    return 0;
  })();

  const selectedQuestionCount =
    formData.questionMode === "fixed_list"
      ? formData.questionIds.length
      : formData.questionPoolFilter?.count || 0;

  // ------------------------------
  // Load subjects + questions
  // ------------------------------
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const subjectRes = await subjectsAPI.getAll();
      setSubjects(subjectRes.data || []);

      const questionRes = await questionsAPI.getAll();
      setQuestions(questionRes.data || []);
    } catch (err) {
      console.log("Failed to load subjects/questions", err);
    }
  };

  // ------------------------------
  // Helpers
  // ------------------------------
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

  // ------------------------------
  // Submit
  // ------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let payload = { ...formData };

      // ====================================================
      // FIXED LIST — AUTO CALCULATE TOTAL MARKS
      // ====================================================
      if (payload.questionMode === "fixed_list") {
        const selectedQuestions = questions.filter(q =>
          payload.questionIds.includes(q._id)
        );

        const autoTotal = selectedQuestions.reduce(
          (sum, q) => sum + (q.marks || 1),
          0
        );

        payload.totalMarks = autoTotal;
      }

      // ====================================================
      // POOL RANDOM — AUTO CREATE FILTER + MARKS
      // ====================================================
      if (payload.questionMode === "pool_random") {
        payload.questionPoolFilter = {
          subject: payload.subject,
          count: payload.questionPoolFilter?.count || 10,
          difficulty: payload.questionPoolFilter?.difficulty || [],
          tags: payload.questionPoolFilter?.tags || []
        };

        // Auto-calc marks (each question = 1 mark default)
        payload.totalMarks =
          (payload.questionPoolFilter?.count || 10) * 1;

        // pool_random does not send questionIds
        payload.questionIds = [];
      }

      // ====================================================
      // Prevent invalid passing marks
      // ====================================================
      if (payload.passingMarks > payload.totalMarks) {
        payload.passingMarks = payload.totalMarks;
      }

      // ====================================================
      // SEND TO API
      // ====================================================
      const res = await quizzesAPI.create(payload);

      alert("Quiz created successfully!");
      navigate("/trainer/quizzes");
    } catch (err) {
      console.error("QUIZ CREATE ERROR", err);
      alert("Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };



  return (
    <TrainerLayout>
      <h1 className="text-2xl font-bold mb-6">Create New Quiz</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* LEFT SIDE */}
        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="font-semibold">Quiz Title</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.title}
              required
              onChange={(e) => update("title", e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold">Description</label>
            <textarea
              className="w-full border p-2 rounded"
              rows="3"
              value={formData.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>

          {/* Subject */}
          <div>
            <label className="font-semibold">Subject</label>
            <select
              className="w-full border p-2 rounded"
              value={formData.subject}
              onChange={(e) => update("subject", e.target.value)}
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Question Mode */}
          {/* Question Mode */}
          <div>
            <label className="font-semibold">Question Mode</label>
            <select
              className="w-full border p-2 rounded"
              value={formData.questionMode}
              onChange={(e) => update("questionMode", e.target.value)}
            >
              <option value="fixed_list">Fixed List</option>
              <option value="pool_random">Random From Pool</option>
            </select>
          </div>
          {/* Pool Random Settings */}
          {formData.questionMode === "pool_random" && (
            <div className="border p-4 rounded space-y-3 mt-3">
              <h2 className="font-semibold text-lg">Random Pool Settings</h2>

              {/* Count */}
              <div>
                <label className="font-semibold">Number of Questions to Pick</label>
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

              {/* Difficulty */}
              <div>
                <label className="font-semibold">Difficulty (optional)</label>
                <select
                  multiple
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
              </div>

              {/* Tags */}
              <div>
                <label className="font-semibold">Tags (optional)</label>
                <input
                  type="text"
                  placeholder="comma separated e.g. loops,arrays"
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


          {/* Question Selector */}
          {formData.questionMode === "fixed_list" && (
            <div>
              <label className="font-semibold block">Select Questions</label>

              <div className="max-h-40 overflow-y-scroll border rounded p-3 space-y-2">
                {questions.map((q) => (
                  <label
                    key={q._id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.questionIds.includes(q._id)}
                      onChange={() => toggleQuestion(q._id)}
                    />
                    {q.prompt}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Duration */}
          <div>
            <label>Duration (seconds)</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={formData.durationSeconds}
              onChange={(e) =>
                update("durationSeconds", Number(e.target.value))
              }
            />
          </div>

          {/* Attempts */}
          <div>
            <label>Attempts Allowed</label>
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

          {/* Schedule */}
          <div>
            <label>Start Time</label>
            <input
              type="datetime-local"
              className="w-full border p-2 rounded"
              value={formData.startTime}
              onChange={(e) => update("startTime", e.target.value)}
            />
          </div>

          <div>
            <label>End Time</label>
            <input
              type="datetime-local"
              className="w-full border p-2 rounded"
              value={formData.endTime}
              onChange={(e) => update("endTime", e.target.value)}
            />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          {/* Shuffle */}
          <div className="border p-4 rounded space-y-3">
            <h2 className="font-semibold text-lg">Shuffle Settings</h2>

            <label className="flex gap-2">
              <input
                type="checkbox"
                checked={formData.shuffleQuestions}
                onChange={(e) =>
                  update("shuffleQuestions", e.target.checked)
                }
              />
              Shuffle Questions
            </label>

            <label className="flex gap-2">
              <input
                type="checkbox"
                checked={formData.shuffleChoices}
                onChange={(e) =>
                  update("shuffleChoices", e.target.checked)
                }
              />
              Shuffle Choices
            </label>
          </div>
          {/* LIVE TOTAL MARKS PREVIEW */}
          <div className="border p-4 rounded bg-yellow-50">
            <h2 className="font-semibold text-lg">Live Quiz Summary</h2>

            <p className="mt-2">
              <strong>Total Questions:</strong> {selectedQuestionCount}
            </p>

            <p>
              <strong>Total Marks (Auto):</strong> {autoCalculatedMarks}
            </p>

            {formData.passingMarks > autoCalculatedMarks && (
              <p className="text-red-600 font-semibold">
                ⚠ Passing marks cannot exceed total marks!
              </p>
            )}
          </div>

          {/* Marks */}
          <div className="border p-4 rounded space-y-3">
            <h2 className="font-semibold text-lg">Marks</h2>

            <label>Total Marks</label>
            <input
              type="number"
              min="1"
              className="w-full border p-2 rounded"
              value={formData.totalMarks}
              onChange={(e) =>
                update("totalMarks", Math.max(1, Number(e.target.value) || 1))
              }
            />


            <label>Passing Marks</label>
            <input
              type="number"
              min="0"
              className="w-full border p-2 rounded"
              value={formData.passingMarks}
              onChange={(e) =>
                update("passingMarks", Math.max(0, Number(e.target.value) || 0))
              }
            />
          </div>

          {/* Result Visibility */}
          <div className="border p-4 rounded space-y-3">
            <h2 className="font-semibold text-lg">
              Result & Answer Visibility
            </h2>

            <label className="flex gap-2">
              <input
                type="checkbox"
                checked={formData.showResultsImmediately}
                onChange={(e) =>
                  update("showResultsImmediately", e.target.checked)
                }
              />
              Show results immediately
            </label>

            <label className="flex gap-2">
              <input
                type="checkbox"
                checked={formData.showCorrectAnswers}
                onChange={(e) =>
                  update("showCorrectAnswers", e.target.checked)
                }
              />
              Show correct answers to students
            </label>
          </div>

          {/* Anti-cheat */}
          <div className="border p-4 rounded space-y-3">
            <h2 className="font-semibold text-lg">Anti-Cheat Settings</h2>

            {Object.entries(formData.antiCheatSettings).map(
              ([key, value]) =>
                typeof value === "boolean" ? (
                  <label key={key} className="flex gap-2 capitalize">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) =>
                        updateDeep(
                          "antiCheatSettings",
                          key,
                          e.target.checked
                        )
                      }
                    />
                    {key.replace(/([A-Z])/g, " $1")}
                  </label>
                ) : (
                  <div key={key}>
                    <label className="capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </label>
                    <input
                      type="number"
                      className="w-full border p-2 rounded"
                      value={value}
                      onChange={(e) =>
                        updateDeep(
                          "antiCheatSettings",
                          key,
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                )
            )}
          </div>

          {/* Instructions */}
          <div className="border p-4 rounded">
            <h2 className="font-semibold text-lg">Instructions</h2>
            <textarea
              className="w-full border p-2 rounded mt-2"
              rows="4"
              value={formData.instructions}
              onChange={(e) => update("instructions", e.target.value)}
            />
          </div>

          {/* Submit */}
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Quiz"}
          </button>
        </div>
      </form>
    </TrainerLayout>
  );
};

export default CreateQuiz;
