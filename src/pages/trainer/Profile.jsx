// src/pages/trainer/Profile.jsx
import React, { useState, useEffect } from 'react';
import TrainerLayout from '../../components/Layout/TrainerLayout';
import { Mail, Shield, Key, Save, Lock, Edit2, X, User, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const TrainerProfile = () => {
    const [loading, setLoading] = useState(false);

    // --- PROFILE EDIT STATE ---
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);

    const [trainerData, setTrainerData] = useState({
        name: "Umesh",
        email: "trainer@example.com",
        role: "Trainer",
    });

    // Extract initials dynamically based on the current name
    const getInitials = (name) => {
        if (!name) return "TR";
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // 1. Fetch actual user data on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setTrainerData({
                    name: user.name || user.username || "Umesh",
                    email: user.email || "trainer@example.com",
                    role: user.role || "Trainer"
                });
            } catch (e) {
                console.error("Failed to parse user data from localStorage");
            }
        }
    }, []);

    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // --- PASSWORD VISIBILITY STATE ---
    const [showPasswords, setShowPasswords] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
    });

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // --- HANDLERS ---
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setTrainerData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const storedUser = JSON.parse(localStorage.getItem('user')) || {};
            localStorage.setItem('user', JSON.stringify({ ...storedUser, name: trainerData.name, email: trainerData.email }));

            toast.success("Profile details updated successfully!");
            setIsEditingProfile(false);
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("New passwords do not match!");
            return;
        }
        if (passwords.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API
            toast.success("Password updated successfully!");
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <TrainerLayout>
            <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto w-full font-sans selection:bg-yellow-200">

                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Trainer Profile</h1>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Manage your account & security</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Profile Details */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 sm:p-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-24 bg-[#0A0A0A]"></div>

                            {/* Edit Toggle Button */}
                            <button
                                onClick={() => setIsEditingProfile(!isEditingProfile)}
                                className="absolute top-4 right-4 z-20 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                                title={isEditingProfile ? "Cancel" : "Edit Profile"}
                            >
                                {isEditingProfile ? <X size={16} /> : <Edit2 size={16} />}
                            </button>

                            <div className="relative z-10 flex flex-col items-center mt-6">
                                <div className="w-24 h-24 rounded-full bg-yellow-400 text-black flex items-center justify-center text-3xl font-black shadow-[0_0_20px_rgba(250,204,21,0.3)] border-4 border-white mb-4">
                                    {getInitials(trainerData.name)}
                                </div>

                                {!isEditingProfile ? (
                                    <>
                                        <h2 className="text-xl font-black text-gray-900">{trainerData.name}</h2>
                                        <span className="text-[10px] font-bold bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md border border-yellow-200 mt-2 uppercase tracking-widest">
                                            {trainerData.role}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-md border border-blue-200 mt-2 uppercase tracking-widest">
                                        Edit Mode Active
                                    </span>
                                )}
                            </div>

                            {isEditingProfile ? (
                                /* EDIT FORM */
                                <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4 text-left">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Full Name</label>
                                        <div className="relative">
                                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                name="name"
                                                value={trainerData.name}
                                                onChange={handleProfileChange}
                                                required
                                                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-yellow-400 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address</label>
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={trainerData.email}
                                                onChange={handleProfileChange}
                                                required
                                                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-yellow-400 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={savingProfile}
                                        className="w-full py-2.5 mt-2 bg-[#0A0A0A] hover:bg-black text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                                    >
                                        {savingProfile ? "Saving..." : <><Save size={16} /> Save Changes</>}
                                    </button>
                                </form>
                            ) : (
                                /* VIEW MODE DETAILS */
                                <div className="mt-8 space-y-4 text-left">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <Mail size={18} className="text-gray-400" />
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                                            <p className="text-sm font-bold text-gray-900">{trainerData.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <Shield size={18} className="text-gray-400" />
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account Status</p>
                                            <p className="text-sm font-bold text-emerald-600">Active Verified</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Security & Password */}
                    <div className="lg:col-span-2">
                        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                                <div className="p-3 bg-gray-100 rounded-xl text-gray-600">
                                    <Key size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-gray-900">Change Password</h2>
                                    <p className="text-xs font-medium text-gray-500">Ensure your account is using a long, random password to stay secure.</p>
                                </div>
                            </div>

                            <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-md">
                                {/* Current Password */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Current Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock size={16} className="text-gray-400" />
                                        </div>
                                        <input
                                            type={showPasswords.currentPassword ? "text" : "password"}
                                            name="currentPassword"
                                            value={passwords.currentPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            placeholder="Enter current password"
                                            className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none font-medium"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('currentPassword')}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                            aria-label={showPasswords.currentPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPasswords.currentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">New Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock size={16} className="text-gray-400" />
                                        </div>
                                        <input
                                            type={showPasswords.newPassword ? "text" : "password"}
                                            name="newPassword"
                                            value={passwords.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            placeholder="Create new password"
                                            className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none font-medium"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('newPassword')}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                            aria-label={showPasswords.newPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPasswords.newPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm New Password */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Confirm New Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock size={16} className="text-gray-400" />
                                        </div>
                                        <input
                                            type={showPasswords.confirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={passwords.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            placeholder="Confirm new password"
                                            className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none font-medium"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirmPassword')}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                            aria-label={showPasswords.confirmPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPasswords.confirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-[#0A0A0A] hover:bg-black text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <><Save size={18} /> Update Password</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </TrainerLayout>
    );
};

export default TrainerProfile;