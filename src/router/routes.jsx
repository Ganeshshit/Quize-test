import { lazy, Suspense } from 'react';

// AUTH
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));

// ADMIN
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));

// TRAINER
const TrainerDashboard = lazy(() => import("../pages/trainer/Dashboard"));
const TrainerProfile = lazy(() => import("../pages/trainer/Profile"));
const CreateQuiz = lazy(() => import("../pages/trainer/CreateQuiz"));
const EditQuiz = lazy(() => import("../pages/trainer/EditQuiz"));
const CreateQuestion = lazy(() => import("../pages/trainer/CreateQuestion"));
const EditQuestion = lazy(() => import("../pages/trainer/EditQuestion"));
const QuizList = lazy(() => import("../pages/trainer/QuizList"));
const QuestionList = lazy(() => import("../pages/trainer/QuestionList"));
const ReviewAttempts = lazy(() => import("../pages/trainer/ReviewAttempts"));
const QuizDetails = lazy(() => import("../pages/trainer/QuizDetails"));
const QuizMonitor = lazy(() => import("../pages/trainer/QuizMonitor"));
const AttemptDetails = lazy(() => import("../pages/trainer/AttemptDetails"));
const QuizEnrollment = lazy(() => import("../pages/trainer/QuizeEnrollment"));
const TrainerQuizAttempts = lazy(() => import("../pages/trainer/TrainerQuizAttempts"));
const AIQuestionManagement = lazy(() => import("../pages/trainer/AIQuestionManagement"));

// STUDENT pages
const StudentDashboard = lazy(() => import("../pages/student/Dashboard"));
const StudentQuizList = lazy(() => import("../pages/student/QuizList"));
const StudentHistory = lazy(() => import("../pages/student/History"));
const StudentProfile = lazy(() => import("../pages/student/Profile"));
const StudentLayout = lazy(() => import("../components/Layout/StudentLayout"));
const QuizAttempt = lazy(() => import("../pages/student/QuizAttempt"));
const EnrolledQuizList = lazy(() => import("../pages/student/EnrolledQuizList"));
const QuizStart = lazy(() => import("../pages/student/QuizStart"));
const QuizResult = lazy(() => import("../pages/student/QuizResult"));
const QuizStartInstructions = lazy(() => import("../pages/student/QuizStartInstructions"));
const StudentResults = lazy(() => import("../pages/student/Results"));

// Loading component for lazy loaded routes
const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading...</p>
        </div>
    </div>
);

// Wrap lazy components with Suspense
const withSuspense = (Component) => (
    <Suspense fallback={<LoadingFallback />}>
        <Component />
    </Suspense>
);

export const routes = [
    // ------------------- AUTH --------------------
    {
        path: "/login",
        element: withSuspense(Login),
        protected: false,
    },
    {
        path: "/register",
        element: withSuspense(Register),
        protected: false,
    },
    {
        path: "/forgot-password",
        element: withSuspense(ForgotPassword),
        protected: false,
    },
    {
        path: "/reset-password",
        element: withSuspense(ResetPassword),
        protected: false,
    },

    // ------------------- TRAINER --------------------
    {
        path: "/trainer/dashboard",
        element: withSuspense(TrainerDashboard),
        protected: true,
        roles: ["trainer", "admin"],
    },
    {
        path: "/trainer/profile",
        element: withSuspense(TrainerProfile),
        protected: true,
        roles: ["trainer", "admin"],
    },
    {
        path: "/trainer/quizzes",
        element: withSuspense(QuizList),
        protected: true,
        roles: ["trainer", "admin"],
    },
    {
        path: "/trainer/quizzes/create",
        element: withSuspense(CreateQuiz),
        protected: true,
        roles: ["trainer", "admin"],
    },
    {
        path: "/trainer/quizzes/:id/details",
        element: withSuspense(QuizDetails),
        protected: true,
        roles: ["trainer", "admin"],
    },
    {
        path: "/trainer/quizzes/:id/edit",
        element: withSuspense(EditQuiz),
        protected: true,
        roles: ["trainer", "admin"],
    },
    {
        path: "/trainer/quizzes/:id/monitor",
        element: withSuspense(QuizMonitor),
        protected: true,
        roles: ["trainer", "admin"],
    },
    {
        path: "/trainer/quizzes/:quizId/enrollment",
        element: withSuspense(QuizEnrollment),
        protected: true,
        roles: ["trainer", "admin"],
    },
    {
        path: "/trainer/quizzes/:quizId/attempts/:attemptId/details",
        element: withSuspense(AttemptDetails),
        protected: true,
        roles: ["trainer", "admin"],
    },
    {
        path: "/trainer/quiz/:quizId/attempts",
        element: withSuspense(TrainerQuizAttempts),
        protected: true,
        roles: ["trainer", "admin"],
    },
    {
        path: "/trainer/questions",
        element: withSuspense(QuestionList),
        protected: true,
        roles: ["trainer", "admin"],
    },
    {
        path: "/trainer/questions/create",
        element: withSuspense(CreateQuestion),
        protected: true,
        roles: ["trainer", "admin"],
    },
    {
        path: "/trainer/questions/:id/edit",
        element: withSuspense(EditQuestion),
        protected: true,
        roles: ["trainer", "admin"],
    },
    {
        path: "/trainer/questions/ai",
        element: withSuspense(AIQuestionManagement),
        protected: true,
        roles: ["trainer", "admin"],
    },
    {
        path: "/trainer/attempts",
        element: withSuspense(ReviewAttempts),
        protected: true,
        roles: ["trainer", "admin"],
    },

    // ------------------- ADMIN --------------------
    {
        path: "/admin/dashboard",
        element: withSuspense(AdminDashboard),
        protected: true,
        roles: ["admin", "trainer"],
    },

    // ------------------- STUDENT (NESTED) --------------------
    {
        path: "/student",
        element: (
            <Suspense fallback={<LoadingFallback />}>
                <StudentLayout />
            </Suspense>
        ),
        protected: true,
        roles: ["student", "admin"],
        children: [
            {
                path: "dashboard",
                element: withSuspense(StudentDashboard),
                protected: true,
                roles: ["student", "admin"],
            },
            {
                path: "quizzes",
                element: withSuspense(StudentQuizList),
                protected: true,
                roles: ["student", "admin"],
            },
            {
                path: "enrolled",
                element: withSuspense(EnrolledQuizList),
                protected: true,
                roles: ["student", "admin"],
            },
            {
                path: "results",
                element: withSuspense(StudentResults),
                protected: true,
                roles: ["student", "admin"],
            },
            {
                path: "history",
                element: withSuspense(StudentHistory),
                protected: true,
                roles: ["student", "admin"],
            },
            {
                path: "profile",
                element: withSuspense(StudentProfile),
                protected: true,
                roles: ["student", "admin"],
            },
        ],
    },

    // ------------------- STUDENT QUIZ FLOW --------------------
    {
        path: "/student/quiz/:id/start",
        element: withSuspense(QuizStartInstructions),
        protected: true,
        roles: ["student", "admin"],
    },
    {
        path: "/student/attempt/:attemptId",
        element: withSuspense(QuizAttempt),
        protected: true,
        roles: ["student", "admin"],
    },
    {
        path: "/student/result/:attemptId",
        element: withSuspense(QuizResult),
        protected: true,
        roles: ["student", "admin"],
    },
];