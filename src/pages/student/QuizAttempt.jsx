import React, { useEffect, useState, useRef } from "react";
import { Clock, CheckCircle, Circle, AlertCircle, BookOpen, BarChart3 } from "lucide-react";

const QuizAttempt = () => {
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  const questionRefs = useRef({});

  // Comprehensive dummy data
  const mockAttempt = {
    attemptId: "ATT-2024-001",
    quizTitle: "Java Spring Boot Certification Assessment",
    description: "Comprehensive evaluation covering Core Java, Spring Framework, and RESTful API development",
    organization: "TechCorp Learning Academy",
    durationSeconds: 3600, // 60 minutes
    totalMarks: 100,
    passingMarks: 60,
    instructor: "Dr. Sarah Johnson",
    sections: [
      {
        id: "s1",
        name: "Core Java Fundamentals",
        description: "Basic concepts and syntax",
        questions: [
          {
            _id: "q1",
            prompt: "Which company originally developed the Java programming language?",
            type: "mcq_single",
            marks: 5,
            difficulty: "easy",
            choices: [
              { id: "c1", text: "Microsoft Corporation" },
              { id: "c2", text: "Sun Microsystems" },
              { id: "c3", text: "Oracle Corporation" },
              { id: "c4", text: "IBM" }
            ],
          },
          {
            _id: "q2",
            prompt: "Which of the following are key features of Java?",
            type: "mcq_multi",
            marks: 10,
            difficulty: "medium",
            choices: [
              { id: "c1", text: "Platform Independent" },
              { id: "c2", text: "Object Oriented" },
              { id: "c3", text: "Multi-threaded" },
              { id: "c4", text: "Compiled Language Only" },
              { id: "c5", text: "Automatic Memory Management" }
            ],
          },
          {
            _id: "q3",
            prompt: "What is the default value of a boolean variable in Java?",
            type: "mcq_single",
            marks: 5,
            difficulty: "easy",
            choices: [
              { id: "c1", text: "true" },
              { id: "c2", text: "false" },
              { id: "c3", text: "null" },
              { id: "c4", text: "0" }
            ],
          },
        ]
      },
      {
        id: "s2",
        name: "Object-Oriented Programming",
        description: "OOP principles and design patterns",
        questions: [
          {
            _id: "q4",
            prompt: "Which of the following are pillars of Object-Oriented Programming?",
            type: "mcq_multi",
            marks: 10,
            difficulty: "medium",
            choices: [
              { id: "c1", text: "Encapsulation" },
              { id: "c2", text: "Inheritance" },
              { id: "c3", text: "Polymorphism" },
              { id: "c4", text: "Compilation" },
              { id: "c5", text: "Abstraction" }
            ],
          },
          {
            _id: "q5",
            prompt: "Which keyword is used to prevent method overriding in Java?",
            type: "mcq_single",
            marks: 5,
            difficulty: "medium",
            choices: [
              { id: "c1", text: "static" },
              { id: "c2", text: "final" },
              { id: "c3", text: "abstract" },
              { id: "c4", text: "const" }
            ],
          },
        ]
      },
      {
        id: "s3",
        name: "Spring Framework",
        description: "Spring Boot and dependency injection",
        questions: [
          {
            _id: "q6",
            prompt: "What is the primary purpose of the @Autowired annotation in Spring?",
            type: "mcq_single",
            marks: 5,
            difficulty: "medium",
            choices: [
              { id: "c1", text: "To define a bean" },
              { id: "c2", text: "To inject dependencies automatically" },
              { id: "c3", text: "To configure application properties" },
              { id: "c4", text: "To handle HTTP requests" }
            ],
          },
          {
            _id: "q7",
            prompt: "Which of the following are valid Spring Bean scopes?",
            type: "mcq_multi",
            marks: 10,
            difficulty: "hard",
            choices: [
              { id: "c1", text: "Singleton" },
              { id: "c2", text: "Prototype" },
              { id: "c3", text: "Request" },
              { id: "c4", text: "Static" },
              { id: "c5", text: "Session" }
            ],
          },
          {
            _id: "q8",
            prompt: "Which annotation is used to create a RESTful controller in Spring Boot?",
            type: "mcq_single",
            marks: 5,
            difficulty: "easy",
            choices: [
              { id: "c1", text: "@Controller" },
              { id: "c2", text: "@RestController" },
              { id: "c3", text: "@Service" },
              { id: "c4", text: "@Component" }
            ],
          },
        ]
      },
      {
        id: "s4",
        name: "Advanced Topics",
        description: "Collections, streams, and best practices",
        questions: [
          {
            _id: "q9",
            prompt: "Which collection interface does NOT allow duplicate elements?",
            type: "mcq_single",
            marks: 5,
            difficulty: "medium",
            choices: [
              { id: "c1", text: "List" },
              { id: "c2", text: "Set" },
              { id: "c3", text: "Queue" },
              { id: "c4", text: "Map" }
            ],
          },
          {
            _id: "q10",
            prompt: "Which of the following are thread-safe collections in Java?",
            type: "mcq_multi",
            marks: 10,
            difficulty: "hard",
            choices: [
              { id: "c1", text: "ConcurrentHashMap" },
              { id: "c2", text: "ArrayList" },
              { id: "c3", text: "CopyOnWriteArrayList" },
              { id: "c4", text: "HashMap" },
              { id: "c5", text: "Vector" }
            ],
          },
        ]
      }
    ]
  };

  // Initialize attempt
  useEffect(() => {
    setAttempt(mockAttempt);
    setTimeLeft(mockAttempt.durationSeconds);
  }, []);

  // Timer with warning
  useEffect(() => {
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    if (timeLeft === 300 && !showWarning) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 5000);
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleAutoSubmit = () => {
    alert("Time's up! Quiz submitted automatically.");
  };

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h > 0 ? h + ":" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSelect = (qId, choiceId, type) => {
    setAnswers((prev) => {
      if (type === "mcq_single") return { ...prev, [qId]: choiceId };

      const arr = prev[qId] || [];
      const updated = arr.includes(choiceId)
        ? arr.filter((i) => i !== choiceId)
        : [...arr, choiceId];
      return { ...prev, [qId]: updated };
    });
  };

  const handleSubmit = () => {
    const unanswered = getAllQuestions().filter(q => !isAnswered(q._id));

    if (unanswered.length > 0) {
      if (!window.confirm(`You have ${unanswered.length} unanswered question(s). Submit anyway?`)) {
        return;
      }
    }

    if (!window.confirm("Are you sure you want to submit the quiz? This action cannot be undone.")) return;

    alert("Quiz submitted successfully!");
  };

  const getAllQuestions = () => {
    if (!attempt) return [];
    return attempt.sections.flatMap(s => s.questions);
  };

  const isAnswered = (qId) => {
    return Array.isArray(answers[qId])
      ? answers[qId].length > 0
      : Boolean(answers[qId]);
  };

  const getProgress = () => {
    const total = getAllQuestions().length;
    const answered = getAllQuestions().filter(q => isAnswered(q._id)).length;
    return { answered, total, percentage: (answered / total) * 100 };
  };

  const scrollToQuestion = (qId) => {
    questionRefs.current[qId]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy": return "text-green-600 bg-green-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "hard": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  const progress = getProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      {/* Warning Banner */}
      {showWarning && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white px-4 py-3 z-50 flex items-center justify-center gap-2">
          <AlertCircle size={20} />
          <span className="font-semibold">Warning: Only 5 minutes remaining!</span>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 bg-white shadow-md z-40 border-b-2 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BookOpen className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{attempt.quizTitle}</h1>
                <p className="text-sm text-gray-600">{attempt.organization} • {attempt.instructor}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Progress */}
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Progress</div>
                <div className="flex items-center gap-2">
                  <BarChart3 size={16} className="text-blue-600" />
                  <span className="font-bold text-gray-800">{progress.answered}/{progress.total}</span>
                </div>
              </div>

              {/* Timer */}
              <div className={`px-4 py-2 rounded-lg font-semibold shadow-sm ${timeLeft < 300 ? 'bg-red-600 animate-pulse' : 'bg-blue-600'
                } text-white`}>
                <div className="flex items-center gap-2">
                  <Clock size={20} />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="bg-white border-b sticky top-[108px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {attempt.sections.map((section, idx) => {
              const sectionQuestions = section.questions;
              const answeredInSection = sectionQuestions.filter(q => isAnswered(q._id)).length;

              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setCurrentSection(idx);
                    scrollToQuestion(section.questions[0]._id);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${currentSection === idx
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <div>{section.name}</div>
                  <div className="text-xs opacity-75">{answeredInSection}/{sectionQuestions.length}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Sidebar - Question Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4 sticky top-[168px]">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Circle size={16} />
                Question Overview
              </h3>

              <div className="space-y-4">
                {attempt.sections.map((section, sIdx) => (
                  <div key={section.id}>
                    <div className="text-xs font-semibold text-gray-600 mb-2">{section.name}</div>
                    <div className="grid grid-cols-5 gap-2">
                      {section.questions.map((q, qIdx) => {
                        const answered = isAnswered(q._id);
                        const globalIdx = attempt.sections
                          .slice(0, sIdx)
                          .reduce((acc, s) => acc + s.questions.length, 0) + qIdx + 1;

                        return (
                          <button
                            key={q._id}
                            onClick={() => scrollToQuestion(q._id)}
                            className={`aspect-square rounded-lg text-xs font-bold flex items-center justify-center transition ${answered
                                ? 'bg-green-600 text-white shadow-md'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                          >
                            {globalIdx}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span className="text-gray-600">Not Answered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="lg:col-span-3 space-y-6">
            {attempt.sections.map((section, sIdx) => (
              <div key={section.id} className="space-y-4">
                {/* Section Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-5 shadow-lg">
                  <h2 className="text-2xl font-bold mb-1">Section {sIdx + 1}: {section.name}</h2>
                  <p className="text-blue-100 text-sm">{section.description}</p>
                </div>

                {/* Questions */}
                {section.questions.map((q, qIdx) => {
                  const globalIdx = attempt.sections
                    .slice(0, sIdx)
                    .reduce((acc, s) => acc + s.questions.length, 0) + qIdx + 1;

                  return (
                    <div
                      key={q._id}
                      ref={(el) => (questionRefs.current[q._id] = el)}
                      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-gray-100"
                    >
                      <div className="p-6">
                        {/* Question Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                Q{globalIdx}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(q.difficulty)}`}>
                                {q.difficulty?.toUpperCase()}
                              </span>
                              {q.type === "mcq_multi" && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-600">
                                  MULTIPLE ANSWERS
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 leading-relaxed">
                              {q.prompt}
                            </h3>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-blue-600">{q.marks}</div>
                            <div className="text-xs text-gray-500">marks</div>
                          </div>
                        </div>

                        {/* Choices */}
                        <div className="space-y-3">
                          {q.choices.map((ch) => {
                            const isSelected = q.type === "mcq_single"
                              ? answers[q._id] === ch.id
                              : answers[q._id]?.includes(ch.id);

                            return (
                              <label
                                key={ch.id}
                                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${isSelected
                                    ? 'border-blue-600 bg-blue-50 shadow-md'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                  }`}
                              >
                                <input
                                  type={q.type === "mcq_single" ? "radio" : "checkbox"}
                                  name={q._id}
                                  value={ch.id}
                                  checked={isSelected}
                                  onChange={() => handleSelect(q._id, ch.id, q.type)}
                                  className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className={`flex-1 ${isSelected ? 'font-medium text-blue-900' : 'text-gray-700'}`}>
                                  {ch.text}
                                </span>
                                {isSelected && (
                                  <CheckCircle className="text-blue-600" size={20} />
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Submit Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to Submit?</h3>
                <p className="text-gray-600">
                  You have answered <span className="font-bold text-blue-600">{progress.answered}</span> out of{" "}
                  <span className="font-bold">{progress.total}</span> questions
                </p>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 text-lg font-bold rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Submit Assessment
              </button>

              <p className="text-center text-xs text-gray-500 mt-3">
                Make sure you have reviewed all your answers before submitting
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt;