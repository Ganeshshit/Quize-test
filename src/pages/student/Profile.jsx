import React, { useState, useEffect } from "react";
import { User, Mail, Lock, Shield, Save, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

// Utility for Avatar Initials
const getInitials = (name = '') => {
    if (!name.trim()) return 'ST';
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : parts[0].substring(0, 2).toUpperCase();
};

const Profile = () => {
    // 1. Pull dynamic user data from authentication state
    const { user, login } = useAuth(); // Assuming 'login' or an 'updateUser' function updates local auth state

    // 2. Separate states for Profile Info and Password updates
    const [profileForm, setProfileForm] = useState({ name: "", email: "" });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    // 3. Populate form with actual user data on load
    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name || user.username || "",
                email: user.email || ""
            });
        }
    }, [user]);

    // --- Handlers ---
    const handleProfileChange = (e) => {
        setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    // --- Profile Update API Call ---
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsSavingProfile(true);

        try {
            const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            const response = await fetch(`${baseUrl}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: profileForm.name })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Failed to update profile");

            toast.success("Profile updated successfully!");

            // Optional: If your backend returns the updated user, refresh the local auth state
            // login(data.user, token); 

        } catch (error) {
            console.error("Profile update error:", error);
            toast.error(error.message || "Something went wrong.");
        } finally {
            setIsSavingProfile(false);
        }
    };

    // --- Password Update API Call ---
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return toast.error("New passwords do not match!");
        }
        if (passwordForm.newPassword.length < 6) {
            return toast.error("Password must be at least 6 characters long.");
        }

        setIsSavingPassword(true);

        try {
            const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            const response = await fetch(`${baseUrl}/users/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Failed to change password");

            toast.success("Password changed successfully!");
            // Clear password form on success
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });

        } catch (error) {
            console.error("Password update error:", error);
            toast.error(error.message || "Failed to update password.");
        } finally {
            setIsSavingPassword(false);
        }
    };

    const initials = getInitials(profileForm.name);

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-8">
            {/* Header */}
            <header className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-gray-900">Profile Settings</h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                        Manage your account details and security preferences.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Avatar & Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center">
                        <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-300 text-gray-950 flex items-center justify-center text-4xl font-black shadow-lg shadow-yellow-400/20 mb-4 border-4 border-white">
                            {initials}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{profileForm.name}</h2>
                        <p className="text-sm font-medium text-gray-500 flex items-center justify-center gap-1.5 mt-1">
                            <Shield size={14} className="text-emerald-500" />
                            Student Account
                        </p>
                    </div>
                </div>

                {/* Right Column: Forms */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Personal Information Form */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/50">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <User size={16} className="text-gray-400" />
                                Personal Information
                            </h3>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <User size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                                        value={profileForm.name}
                                        onChange={handleProfileChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Mail size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 cursor-not-allowed"
                                        value={profileForm.email}
                                        disabled
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5 font-medium">
                                    <AlertCircle size={14} /> Email addresses cannot be changed after registration.
                                </p>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSavingProfile}
                                    className="bg-[#0A0A0A] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                                >
                                    {isSavingProfile ? (
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                        <Save size={16} />
                                    )}
                                    {isSavingProfile ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Security & Password Form */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/50">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <Lock size={16} className="text-gray-400" />
                                Security Settings
                            </h3>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    placeholder="Enter your current password"
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                                    value={passwordForm.currentPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        placeholder="Min. 6 characters"
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Repeat new password"
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                                        value={passwordForm.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSavingPassword || !passwordForm.newPassword}
                                    className="bg-white border-2 border-gray-200 text-gray-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:border-black hover:bg-black hover:text-white transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
                                >
                                    {isSavingPassword ? (
                                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                        <CheckCircle size={16} />
                                    )}
                                    {isSavingPassword ? "Updating..." : "Update Password"}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;