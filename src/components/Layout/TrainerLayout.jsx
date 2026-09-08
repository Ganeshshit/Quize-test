// src/components/Layout/TrainerLayout.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Menu, X, LayoutDashboard, ClipboardList, Plus,
    Database, Eye, LogOut, ShieldCheck
} from "lucide-react";

// --- CONSTANTS ---
// Hoisted outside the component to prevent recreation on every render
const NAV_ITEMS = [
    { label: "Dashboard", path: "/trainer/dashboard", icon: LayoutDashboard },
    { label: "All Quizzes", path: "/trainer/quizzes", icon: ClipboardList },
    { label: "Create Quiz", path: "/trainer/quizzes/create", icon: Plus },
    { label: "Question Bank", path: "/trainer/questions", icon: Database },
    { label: "Review Attempts", path: "/trainer/attempts", icon: Eye },
];

// --- SUB-COMPONENTS ---
const NavItem = React.memo(({ item, isActive, onClick }) => {
    const Icon = item.icon;

    return (
        <Link
            to={item.path}
            onClick={onClick}
            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group
                ${isActive
                    ? "bg-gray-900 text-white shadow-md shadow-gray-900/10"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }
            `}
            aria-current={isActive ? "page" : undefined}
        >
            <Icon
                size={18}
                className={`transition-colors duration-200 ${isActive ? "text-yellow-400" : "text-gray-400 group-hover:text-gray-900"
                    }`}
            />
            <span>{item.label}</span>
        </Link>
    );
});
NavItem.displayName = "NavItem";

const QuickStatsWidget = React.memo(({ stats }) => (
    <div className="p-5 border-t border-gray-100 bg-gray-50/60">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Quick Stats
            </h3>
            <ShieldCheck size={14} className="text-gray-300" />
        </div>
        <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-500 uppercase tracking-wider">Active Quizzes</span>
                <span className="font-black bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-md border border-yellow-200/60">
                    {stats.activeQuizzes}
                </span>
            </div>
            <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-500 uppercase tracking-wider">Total Attempts</span>
                <span className="font-black bg-gray-200 text-gray-800 px-2 py-0.5 rounded-md">
                    {stats.totalAttempts}
                </span>
            </div>
            <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-500 uppercase tracking-wider">Pending Reviews</span>
                <span className="font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-md border border-red-200/60">
                    {stats.pendingReviews}
                </span>
            </div>
        </div>
    </div>
));
QuickStatsWidget.displayName = "QuickStatsWidget";

// --- MAIN COMPONENT ---
const TrainerLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // --- LOGOUT FUNCTION ---
    const handleLogout = () => {
        // Clear all authentication tokens from local storage
        localStorage.clear();
        sessionStorage.clear();
        // Redirect to the login page
        navigate("/login");
    };

    const [quickStats, setQuickStats] = useState({
        activeQuizzes: 0,
        totalAttempts: 0,
        pendingReviews: 0
    });

    // Handle scroll locking when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
        return () => { document.body.style.overflow = "unset"; };
    }, [isMobileMenuOpen]);

    // Fetch Sidebar Stats
    useEffect(() => {
        let isMounted = true;

        const fetchQuickStats = async () => {
            try {
                // TODO: Replace with actual API call
                // const res = await trainerAPI.getSidebarStats();
                // if (res.success && isMounted) setQuickStats(res.data);

                // Simulated Response
                if (isMounted) {
                    setQuickStats({
                        activeQuizzes: 3,
                        totalAttempts: 145,
                        pendingReviews: 8
                    });
                }
            } catch (error) {
                console.error("Failed to fetch sidebar stats:", error);
            }
        };

        fetchQuickStats();

        return () => { isMounted = false; };
    }, []);

    const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

    // Active route matching logic
    const checkIsActive = useCallback((path) => {
        return location.pathname.includes(path);
    }, [location.pathname]);

    return (
        <div className="min-h-screen flex flex-col font-sans bg-[#F8F9FA] selection:bg-yellow-200">

            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0A0A0A] shadow-xl border-b border-gray-800 flex justify-between items-center px-4 sm:px-6 h-20">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        aria-label="Toggle navigation menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div className="flex flex-col">
                        <h1 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                            Trainer Panel <span className="w-2 h-2 rounded-full bg-yellow-400 hidden sm:block animate-pulse"></span>
                        </h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                            Quiz Management System
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                    {/* 1. PROFILE LINK (Strictly wraps only the text and avatar) */}
                    <Link to="/trainer/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-bold text-white">John Trainer</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">trainer@example.com</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-yellow-400 text-black flex items-center justify-center font-black shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                            JT
                        </div>
                    </Link>

                    {/* Divider */}
                    <div className="w-px h-8 bg-gray-800 hidden sm:block"></div>

                    {/* 2. LOGOUT BUTTON (Uses the new handleLogout function) */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg font-bold transition-colors"
                    >
                        <LogOut size={18} />
                        <span className="hidden sm:inline text-sm uppercase tracking-widest">Logout</span>
                    </button>
                </div>
            </header>

            {/* Main Layout Container */}
            <div className="flex flex-1 max-w-[1600px] w-full mx-auto relative">

                {/* Sidebar Menu */}
                <aside
                    className={`
                        fixed lg:sticky lg:top-[80px] left-0 
                        h-[calc(100vh-80px)] w-72 bg-white 
                        border-r border-gray-200/80 flex flex-col justify-between
                        transition-transform duration-300 ease-in-out z-50
                        ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
                    `}
                >
                    <div className="lg:hidden flex justify-between items-center p-5 border-b border-gray-100">
                        <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Navigation</span>
                        <button
                            onClick={closeMobileMenu}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                            aria-label="Close menu"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
                        {NAV_ITEMS.map((item) => (
                            <NavItem
                                key={item.path}
                                item={item}
                                isActive={checkIsActive(item.path)}
                                onClick={closeMobileMenu}
                            />
                        ))}
                    </nav>

                    <QuickStatsWidget stats={quickStats} />
                </aside>

                {/* Mobile Drawer Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
                        onClick={closeMobileMenu}
                        aria-hidden="true"
                    />
                )}

                {/* Dynamic Content Area */}
                <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default TrainerLayout;