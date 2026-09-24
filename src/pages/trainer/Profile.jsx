// src/pages/trainer/Profile.jsx
import React, { useState, useEffect, useMemo } from 'react';
import TrainerLayout from '../../components/Layout/TrainerLayout';
import {
    Mail, Shield, Key, Save, Lock, Edit2, X, User, Eye, EyeOff,
    CheckCircle2, Circle, AlertCircle, ShieldCheck, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';

const PASSWORD_RULES = [
    { key: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
    { key: 'upper', label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
    { key: 'number', label: 'One number', test: (v) => /\d/.test(v) },
    { key: 'special', label: 'One special character', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const TrainerProfile = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // --- PROFILE EDIT STATE ---
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);

    const [trainerData, setTrainerData] = useState({
        name: "Umesh",
        email: "trainer@example.com",
        role: "Trainer",
    });
    const [draftData, setDraftData] = useState(trainerData);

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
                const loaded = {
                    name: user.name || user.username || "Umesh",
                    email: user.email || "trainer@example.com",
                    role: user.role || "Trainer"
                };
                setTrainerData(loaded);
                setDraftData(loaded);
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

    // --- PASSWORD STRENGTH ---
    const passedRules = useMemo(
        () => PASSWORD_RULES.filter((r) => r.test(passwords.newPassword)),
        [passwords.newPassword]
    );
    const strengthScore = passwords.newPassword ? passedRules.length : 0;
    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strengthScore] || '';
    const strengthColor = [
        'bg-gray-200',
        'bg-red-400',
        'bg-amber-400',
        'bg-yellow-400',
        'bg-emerald-500',
    ][strengthScore];

    const confirmMatches = passwords.confirmPassword.length > 0 && passwords.confirmPassword === passwords.newPassword;
    const confirmMismatch = passwords.confirmPassword.length > 0 && passwords.confirmPassword !== passwords.newPassword;

    // --- HANDLERS ---
    const startEditingProfile = () => {
        setDraftData(trainerData);
        setIsEditingProfile(true);
    };

    const cancelEditingProfile = () => {
        setDraftData(trainerData);
        setIsEditingProfile(false);
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setDraftData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const storedUser = JSON.parse(localStorage.getItem('user')) || {};
            localStorage.setItem('user', JSON.stringify({ ...storedUser, name: draftData.name, email: draftData.email }));

            setTrainerData(draftData);
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
            const response = await authService.changePassword(
                passwords.currentPassword,
                passwords.newPassword
            );

            if (response.success) {
                toast.success(response.message || "Password updated successfully!");
                setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
                // Redirect to login after successful password change
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                toast.error(response.error || "Failed to update password");
            }
        } catch (error) {
            toast.error(error.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    const passwordFormValid =
        passwords.currentPassword.length > 0 &&
        passwords.newPassword.length >= 6 &&
        passwords.newPassword === passwords.confirmPassword;

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
                            <div className="absolute top-0 left-0 w-full h-24 bg-[#0A0A0A]">
                                <div className="absolute -top-6 -right-6 w-28 h-28 bg-yellow-400 rounded-full blur-3xl opacity-20 pointer-events-none" />
                            </div>

                            {/* Edit Toggle Button */}
                            <button
                                onClick={() => (isEditingProfile ? cancelEditingProfile() : startEditingProfile())}
                                className="absolute top-4 right-4 z-20 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                                title={isEditingProfile ? "Cancel" : "Edit Profile"}
                            >
                                {isEditingProfile ? <X size={16} /> : <Edit2 size={16} />}
                            </button>

                            <div className="relative z-10 flex flex-col items-center mt-6">
                                <div className="w-24 h-24 rounded-full bg-yellow-400 text-black flex items-center justify-center text-3xl font-black shadow-[0_0_20px_rgba(250,204,21,0.3)] border-4 border-white mb-4">
                                    {getInitials(isEditingProfile ? draftData.name : trainerData.name)}
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
                                                value={draftData.name}
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
                                                value={draftData.email}
                                                onChange={handleProfileChange}
                                                required
                                                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-yellow-400 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={cancelEditingProfile}
                                            className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={savingProfile}
                                            className="flex-1 py-2.5 bg-[#0A0A0A] hover:bg-black text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                        >
                                            {savingProfile ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <><Save size={16} /> Save</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                /* VIEW MODE DETAILS */
                                <div className="mt-8 space-y-4 text-left">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <Mail size={18} className="text-gray-400 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                                            <p className="text-sm font-bold text-gray-900 truncate">{trainerData.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <Shield size={18} className="text-gray-400 flex-shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account Status</p>
                                            <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active Verified
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Security Tips Card */}
                        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <ShieldCheck size={18} className="text-yellow-500" />
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Security Tips</h3>
                            </div>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2.5 text-xs font-medium text-gray-600">
                                    <Info size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                    Use a unique password you don't reuse on other sites.
                                </li>
                                <li className="flex items-start gap-2.5 text-xs font-medium text-gray-600">
                                    <Info size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                    Changing your password will sign you out everywhere.
                                </li>
                                <li className="flex items-start gap-2.5 text-xs font-medium text-gray-600">
                                    <Info size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                    Never share your credentials, even with support staff.
                                </li>
                            </ul>
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

                                    {/* Strength meter */}
                                    {passwords.newPassword && (
                                        <div className="mt-3">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strengthScore ? strengthColor : "bg-gray-100"
                                                            }`}
                                                    />
                                                ))}
                                                <span
                                                    className={`ml-2 text-[10px] font-black uppercase tracking-widest ${strengthScore <= 1
                                                            ? "text-red-500"
                                                            : strengthScore === 2
                                                                ? "text-amber-500"
                                                                : strengthScore === 3
                                                                    ? "text-yellow-600"
                                                                    : "text-emerald-600"
                                                        }`}
                                                >
                                                    {strengthLabel}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                                {PASSWORD_RULES.map((rule) => {
                                                    const passed = rule.test(passwords.newPassword);
                                                    return (
                                                        <div
                                                            key={rule.key}
                                                            className={`flex items-center gap-1.5 text-[11px] font-bold ${passed ? "text-emerald-600" : "text-gray-400"
                                                                }`}
                                                        >
                                                            {passed ? (
                                                                <CheckCircle2 size={12} />
                                                            ) : (
                                                                <Circle size={12} />
                                                            )}
                                                            {rule.label}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
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
                                            className={`w-full pl-11 pr-11 py-3 bg-gray-50 border rounded-xl text-sm focus:ring-2 outline-none font-medium transition-colors ${confirmMismatch
                                                    ? "border-red-300 focus:ring-red-300 focus:border-red-400"
                                                    : confirmMatches
                                                        ? "border-emerald-300 focus:ring-emerald-300 focus:border-emerald-400"
                                                        : "border-gray-200 focus:ring-yellow-400 focus:border-yellow-400"
                                                }`}
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
                                    {confirmMismatch && (
                                        <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-red-500">
                                            <AlertCircle size={12} /> Passwords do not match
                                        </p>
                                    )}
                                    {confirmMatches && (
                                        <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                                            <CheckCircle2 size={12} /> Passwords match
                                        </p>
                                    )}
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading || !passwordFormValid}
                                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-[#0A0A0A] hover:bg-black text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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