// src/components/Layout/TrainerLayout.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const TrainerLayout = ({ children }) => {
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const navLinks = [
        { label: "Dashboard", path: "/trainer/dashboard" },
        { label: "All Quizzes", path: "/trainer/quizzes" },
        { label: "Create Quiz", path: "/trainer/quizzes/create" },
        { label: "Question Bank", path: "/trainer/questions" },
        { label: "Results", path: "/trainer/results" },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-slate-100">

            {/* HEADER */}
            <header className="sticky top-0 z-50 bg-white shadow flex justify-between items-center px-6 py-4">
                <div className="flex items-center gap-4">
                    <button
                        className="lg:hidden p-2 rounded-md hover:bg-slate-200"
                        onClick={() => setOpen(true)}
                    >
                        <Menu size={22} />
                    </button>

                    <h1 className="text-xl font-bold text-gray-800">Trainer Panel</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        T
                    </div>

                    <button className="text-red-600 hover:text-red-700 font-medium">
                        Logout
                    </button>
                </div>
            </header>

            {/* MAIN WRAPPER */}
            <div className="flex flex-1">

                {/* SIDEBAR */}
                <aside
                    className={`
                        fixed lg:sticky lg:top-16 left-0 
                        h-full lg:h-[calc(100vh-4rem)] w-64 bg-white 
                        shadow-md lg:shadow-none p-6 
                        transform transition-transform duration-300 z-40
                        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    `}
                >
                    {/* Close button for mobile */}
                    <div className="lg:hidden flex justify-end mb-4">
                        <button
                            onClick={() => setOpen(false)}
                            className="p-2 rounded-md hover:bg-slate-200"
                        >
                            <X size={22} />
                        </button>
                    </div>

                    <nav className="space-y-3">
                        {navLinks.map((link) => {
                            const active = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setOpen(false)}
                                    className={`
                                        block px-4 py-2 rounded-md font-medium transition border
                                        ${active
                                            ? "border-black text-black font-semibold bg-white"
                                            : "border-transparent text-gray-700 hover:border-black hover:bg-gray-50"
                                        }
                                    `}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* CONTENT */}
                <main className="flex-1 p-6">
                    <div className="bg-white rounded-xl shadow-sm p-5 min-h-[calc(100vh-150px)]">
                        {children}
                    </div>
                </main>
            </div>

            {/* FOOTER */}
            <footer className="p-4 text-center text-sm text-slate-500 bg-white border-t">
                © {new Date().getFullYear()} Online Quiz Platform
            </footer>
        </div>
    );
};

export default TrainerLayout;
