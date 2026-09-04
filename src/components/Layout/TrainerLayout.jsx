// src/components/Layout/TrainerLayout.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LayoutDashboard, ClipboardList, Plus, Database, Eye, LogOut } from "lucide-react";

const TrainerLayout = ({ children }) => {
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const navLinks = [
        {
            label: "Dashboard",
            path: "/trainer/dashboard",
            icon: <LayoutDashboard size={18} />
        },
        {
            label: "All Quizzes",
            path: "/trainer/quizzes",
            icon: <ClipboardList size={18} />
        },
        {
            label: "Create Quiz",
            path: "/trainer/quizzes/create",
            icon: <Plus size={18} />
        },
        {
            label: "Question Bank",
            path: "/trainer/questions",
            icon: <Database size={18} />
        },
        {
            label: "Review Attempts",
            path: "/trainer/attempts",
            icon: <Eye size={18} />
        },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">

            {/* HEADER */}
            <header className="sticky top-0 z-50 bg-white shadow-sm border-b flex justify-between items-center px-6 py-4">
                <div className="flex items-center gap-4">
                    <button
                        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition"
                        onClick={() => setOpen(true)}
                    >
                        <Menu size={22} className="text-slate-700" />
                    </button>

                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Trainer Panel</h1>
                        <p className="text-xs text-slate-500">Quiz Management System</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:block text-right">
                        <p className="text-sm font-medium text-gray-800">John Trainer</p>
                        <p className="text-xs text-slate-500">trainer@example.com</p>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center font-bold shadow-md">
                        JT
                    </div>

                    <button className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition">
                        <LogOut size={18} />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </header>

            {/* MAIN WRAPPER */}
            <div className="flex flex-1">

                {/* SIDEBAR */}
                <aside
                    className={`
                        fixed lg:sticky lg:top-[73px] left-0 
                        h-full lg:h-[calc(100vh-73px)] w-72 bg-white 
                        shadow-xl lg:shadow-none border-r p-6 
                        transform transition-transform duration-300 z-40
                        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    `}
                >
                    {/* Close button for mobile */}
                    <div className="lg:hidden flex justify-between items-center mb-6">
                        <h2 className="font-bold text-gray-800">Navigation</h2>
                        <button
                            onClick={() => setOpen(false)}
                            className="p-2 rounded-lg hover:bg-slate-100"
                        >
                            <X size={22} />
                        </button>
                    </div>

                    <nav className="space-y-2">
                        {navLinks.map((link) => {
                            const active = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all
                                        ${active
                                            ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700 shadow-sm"
                                            : "text-gray-700 hover:bg-slate-50 hover:text-gray-900"
                                        }
                                    `}
                                >
                                    {link.icon}
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* QUICK STATS */}
                    <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Stats</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Active Quizzes</span>
                                <span className="font-bold text-blue-700">12</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Total Attempts</span>
                                <span className="font-bold text-green-700">245</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Pending Reviews</span>
                                <span className="font-bold text-orange-700">8</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* OVERLAY for mobile */}
                {open && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
                        onClick={() => setOpen(false)}
                    />
                )}

                {/* CONTENT */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>

            {/* FOOTER */}
            <footer className="p-4 text-center text-sm text-slate-500 bg-white border-t">
                © {new Date().getFullYear()} Online Quiz Platform • Trainer Dashboard
            </footer>
        </div>
    );
};

export default TrainerLayout;