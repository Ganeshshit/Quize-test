import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Home, List, BookOpen, BarChart2, Clock, User,
    LogOut, Menu, Bell, ChevronDown, X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// --- Constants ---
const NAV_ITEMS = [
    { name: 'Dashboard', path: '/student/dashboard', icon: Home },
    { name: 'All Quizzes', path: '/student/quizzes', icon: List },
    { name: 'Enrolled Quizzes', path: '/student/enrolled', icon: BookOpen },
    { name: 'Results', path: '/student/results', icon: BarChart2 },
    { name: 'Attempt History', path: '/student/history', icon: Clock },
];

// --- Utilities ---
const getInitials = (name = '') => {
    if (!name.trim()) return 'ST';
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : parts[0].substring(0, 2).toUpperCase();
};

// --- Refined Sidebar Sub-Components ---

const SidebarBrand = ({ onClose }) => (
    <div className="px-6 py-6 flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-400 via-yellow-300 to-amber-400 flex items-center justify-center shadow-md shadow-yellow-400/10">
                <span className="text-gray-950 font-black text-sm tracking-tighter">Q</span>
            </div>
            <div>
                <h1 className="text-sm font-bold tracking-wider text-white uppercase">Student Panel</h1>
                <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-[10px] text-gray-400 font-medium tracking-wide">Online Test</p>
                </div>
            </div>
        </div>
        <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="lg:hidden text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
            <X size={18} />
        </button>
    </div>
);

const SidebarNavItem = ({ item, onClick }) => (
    <NavLink
        to={item.path}
        onClick={onClick}
        className={({ isActive }) =>
            `group relative flex items-center gap-3 mx-3 px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-all duration-150 ${isActive
                ? 'bg-yellow-400 text-gray-950 font-bold shadow-sm shadow-yellow-400/25'
                : 'text-gray-300 hover:bg-white/[0.04] hover:text-white'
            }`
        }
    >
        {({ isActive }) => (
            <>
                <item.icon
                    size={18}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'text-gray-950' : 'text-gray-400 group-hover:text-gray-200 transition-colors'}
                />
                <span className="flex-1 text-sm">{item.name}</span>
                {isActive && (
                    <span className="absolute right-2.5 w-1.5 h-3 rounded-full bg-gray-950/40" />
                )}
            </>
        )}
    </NavLink>
);

const SidebarProfileCard = ({ userName, initials, onNavigate }) => (
    <div
        onClick={onNavigate}
        role="button"
        tabIndex={0}
        className="mx-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3 cursor-pointer hover:bg-white/[0.06] hover:border-white/10 transition-all duration-200 group"
    >
        <div className="w-9 h-9 rounded-lg bg-gray-800 text-yellow-400 border border-white/10 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-yellow-400 group-hover:text-gray-950 transition-colors">
            {initials}
        </div>
        <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-gray-200 group-hover:text-white transition-colors">
                {userName}
            </p>
            <p className="text-xs text-gray-400 font-medium truncate flex items-center gap-1">
                <span>View Profile</span>
            </p>
        </div>
    </div>
);

const StudentSidebar = ({ isOpen, onClose, onLogout, user }) => {
    const navigate = useNavigate();
    const userName = user?.name || user?.username || 'Student';
    const initials = getInitials(userName);

    return (
        <aside
            className={`
                fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0c0c0e] border-r border-white/[0.08] text-white flex flex-col 
                transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
        >
            <SidebarBrand onClose={onClose} />

            <div className="px-3 pt-4 pb-2">
                <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Main Menu
                </p>
            </div>

            <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto">
                {NAV_ITEMS.map((item) => (
                    <SidebarNavItem
                        key={item.name}
                        item={item}
                        onClick={onClose}
                    />
                ))}
            </nav>

            <div className="p-3 border-t border-white/[0.06] flex flex-col gap-2 shrink-0 bg-black/20">
                <button
                    onClick={onLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-300 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-150 group"
                >
                    <LogOut size={18} className="text-gray-400 group-hover:text-red-400 transition-colors" />
                    <span>Sign out</span>
                </button>

                <SidebarProfileCard
                    userName={userName}
                    initials={initials}
                    onNavigate={() => navigate('/student/profile')}
                />
            </div>
        </aside>
    );
};

// --- Main Layout Component ---

const StudentLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const profileDropdownRef = useRef(null);

    useEffect(() => {
        setIsSidebarOpen(false);
        setIsProfileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsSidebarOpen(false);
                setIsProfileMenuOpen(false);
            }
        };

        const handleClickOutside = (e) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const userName = user?.name || user?.username || 'Student';
    const userEmail = user?.email || 'student@email.com';
    const initials = getInitials(userName);

    return (
        <div className="flex h-screen bg-gray-50/70 overflow-hidden font-sans text-gray-900">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            <StudentSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onLogout={handleLogout}
                user={user}
            />

            <div className="flex-1 flex flex-col w-full h-full min-w-0">
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/80 flex items-center justify-between px-4 lg:px-8 shrink-0 sticky top-0 z-30">
                    <div className="flex items-center gap-3 lg:hidden">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            aria-label="Open sidebar"
                            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                            <Menu size={18} />
                        </button>
                        <span className="font-bold text-sm tracking-tight">Student Panel</span>
                    </div>

                    <div className="hidden lg:block" />

                    <div className="flex items-center gap-3 sm:gap-4">
                        <button
                            aria-label="View notifications"
                            className="relative p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                        >
                            <Bell size={18} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
                        </button>

                        <div className="h-5 w-px bg-gray-200 hidden sm:block"></div>

                        <div className="relative" ref={profileDropdownRef}>
                            <button
                                onClick={() => setIsProfileMenuOpen(prev => !prev)}
                                aria-expanded={isProfileMenuOpen}
                                className="flex items-center gap-2.5 p-1.5 pr-2.5 hover:bg-gray-100/80 rounded-xl border border-transparent hover:border-gray-200 transition-all text-left"
                            >
                                <div className="w-7 h-7 rounded-lg bg-yellow-400 text-gray-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                                    {initials}
                                </div>
                                <span className="text-xs font-semibold text-gray-800 hidden sm:block truncate max-w-[120px]">
                                    {userName}
                                </span>
                                <ChevronDown size={13} className={`text-gray-400 hidden sm:block transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                                    <div className="px-3 py-2.5 border-b border-gray-100 mb-1">
                                        <p className="text-xs font-bold text-gray-900 truncate">{userName}</p>
                                        <p className="text-[11px] text-gray-500 truncate mt-0.5">{userEmail}</p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/student/profile')}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                                    >
                                        <User size={15} className="text-gray-400" />
                                        Profile Settings
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-600 hover:bg-red-50 font-medium transition-colors mt-0.5"
                                    >
                                        <LogOut size={15} className="text-red-400" />
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-8 flex flex-col justify-between">
                    <div className="max-w-6xl w-full mx-auto pb-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;