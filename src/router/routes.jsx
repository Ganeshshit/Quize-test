import Login from "../pages/auth/Login";

// ADMIN
import AdminDashboard from "../pages/admin/AdminDashboard";

// TRAINER
import TrainerDashboard from "../pages/trainer/Dashboard";
import CreateQuiz from "../pages/trainer/CreateQuiz";
import EditQuiz from "../pages/trainer/EditQuiz";
import CreateQuestion from "../pages/trainer/CreateQuestion";
import EditQuestion from "../pages/trainer/EditQuestion";
import QuizList from "../pages/trainer/QuizList";
import QuestionList from "../pages/trainer/QuestionList";
import ReviewAttempts from "../pages/trainer/ReviewAttempts";
import QuizDetails from "../pages/trainer/QuizDetails";

// STUDENT pages

import StudentDashboard from "../pages/student/Dashboard";
import StudentQuizList from "../pages/student/QuizList";
import StudentHistory from "../pages/student/History";
import StudentProfile from "../pages/student/Profile";
import StudentLayout from "../components/Layout/StudentLayout";

export const routes = [
    // ------------------- AUTH --------------------
    {
        path: "/login",
        element: <Login />,
        protected: false,
    },

    // ------------------- TRAINER --------------------
    {
        path: "/trainer/dashboard",
        element: <TrainerDashboard />,
        protected: true,
        roles: ["trainer", "admin"],
    },
    {
        path: "/trainer/quizzes",
        element: <QuizList />,
        protected: true,
        roles: ["trainer", "admin"],
    },
    {
        path: "/trainer/quizzes/create",
        element: <CreateQuiz />,
        protected: true,
        roles: ["trainer", "admin"],
    },
    {
        path: "/trainer/quizzes/:id/details",
        element: <QuizDetails />,
        protected: true,
        roles: ["trainer", "admin"],
    },
    {
        path: "/trainer/quizzes/:id/edit",
        element: <EditQuiz />,
        protected: true,
        roles: ["trainer", "admin"],
    },
    {
        path: "/trainer/questions",
        element: <QuestionList />,
        protected: true,
        roles: ["trainer", "admin"],
    },
    {
        path: "/trainer/questions/create",
        element: <CreateQuestion />,
        protected: true,
        roles: ["trainer", "admin"],
    },
    {
        path: "/trainer/questions/:id/edit",
        element: <EditQuestion />,
        protected: true,
        roles: ["trainer", "admin"],
    },
    {
        path: "/trainer/attempts",
        element: <ReviewAttempts />,
        protected: true,
        roles: ["trainer", "admin"],
    },

    // ------------------- ADMIN --------------------
    {
        path: "/admin/dashboard",
        element: <AdminDashboard />,
        protected: true,
        roles: ["admin", "trainer"],
    },

    // ------------------- STUDENT (NESTED) --------------------
    {
        path: "/student",
        element: <StudentLayout />,
        protected: true,
        roles: ["student", "admin"],
        children: [
            {
                path: "dashboard",
                element: <StudentDashboard />,
                protected: true,
                roles: ["student", "admin"],
            },
            {
                path: "quizzes",
                element: <StudentQuizList />,
                protected: true,
                roles: ["student", "admin"],
            },
            {
                path: "history",
                element: <StudentHistory />,
                protected: true,
                roles: ["student", "admin"],
            },
            {
                path: "profile",
                element: <StudentProfile />,
                protected: true,
                roles: ["student", "admin"],
            },
        ],
    },
];
