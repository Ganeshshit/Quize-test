import React, { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";

const StudentLayout = ({ children }) => {
    const [open, setOpen] = useState(false);

    const menuItems = [
        { name: "Dashboard", path: "/student/dashboard" },
        { name: "My Quizzes", path: "/student/quizzes" },
        { name: "Attempt History", path: "/student/history" },
        { name: "Profile", path: "/student/profile" },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-40
                ${open ? "translate-x-0" : "-translate-x-64"} md:translate-x-0`}
            >
                <div className="p-5 border-b">
                    <h2 className="text-xl font-bold text-blue-700">Student Panel</h2>
                </div>

                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `block px-4 py-2 rounded-md font-medium transition 
                                ${isActive
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-blue-100"
                                }`
                            }
                            onClick={() => setOpen(false)}
                        >
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Mobile Topbar */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white shadow w-full fixed top-0 z-30">
                <h1 className="text-lg font-semibold text-blue-700">Student Panel</h1>
                <button onClick={() => setOpen(!open)}>
                    {open ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 md:ml-64 p-6 mt-14 md:mt-0">
                <div className="bg-white shadow rounded-lg p-6 min-h-[80vh]">

                    {/* If children exist → render children, else render outlet */}
                    {children ? children : <Outlet />}

                </div>

                {/* Footer */}
                <footer className="text-center text-sm text-gray-500 mt-6">
                    © {new Date().getFullYear()} Quiz App — Student Portal
                </footer>
            </div>
        </div>
    );
};

export default StudentLayout;

