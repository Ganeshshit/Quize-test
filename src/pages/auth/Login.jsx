import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";
import JobHeroIllustration from "../../components/comon/JobHeroIllustration";

const Login = () => {
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.email || !formData.password) {
            toast.error("Please fill in all fields");
            return;
        }

        const res = await login(formData);

        if (res?.success && res?.user?.role) {
            toast.success(res.message || "Login successful!");
            const role = res.user.role;

            // Redirect according to role
            setTimeout(() => {
                if (role === "trainer") navigate("/trainer/dashboard");
                else if (role === "student") navigate("/student/dashboard");
                else if (role === "admin") navigate("/admin/dashboard");
                else navigate("/dashboard"); // fallback
            }, 1000);
        } else {
            toast.error(res?.error || "Login failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
                .form-group {
                    animation: fadeSlideUp 0.6s cubic-bezier(.22,.61,.36,1) forwards;
                    opacity: 0;
                }
                .form-group:nth-child(1) { animation-delay: 0.1s; }
                .form-group:nth-child(2) { animation-delay: 0.2s; }
                .form-group:nth-child(3) { animation-delay: 0.3s; }
                .form-group:nth-child(4) { animation-delay: 0.4s; }
                @keyframes fadeSlideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes pulse-border {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(240, 193, 92, 0.4); }
                    50% { box-shadow: 0 0 0 8px rgba(240, 193, 92, 0); }
                }
                .input-focused {
                    animation: pulse-border 2s infinite;
                }
                @keyframes slide-up-content {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .content-animate {
                    animation: slide-up-content 0.8s ease-out 0.5s forwards;
                    opacity: 0;
                }
                @keyframes button-glow {
                    0%, 100% { box-shadow: 0 4px 15px rgba(240, 193, 92, 0.3); }
                    50% { box-shadow: 0 4px 25px rgba(240, 193, 92, 0.5); }
                }
                .button-glow {
                    animation: button-glow 2s ease-in-out infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .shimmer-effect {
                    background: linear-gradient(90deg, transparent 0%, rgba(240, 193, 92, 0.1) 50%, transparent 100%);
                    background-size: 200% 100%;
                    animation: shimmer 3s infinite;
                }
            `}</style>
            {/* Left Side - Illustration */}
            <JobHeroIllustration />

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8" style={{
                background: "radial-gradient(120% 100% at 30% 15%, #FBF8EF 0%, #F3EDDB 55%, #ECE3C9 100%)"
            }}>
                <div className="w-full max-w-md">
                    <div className="mb-8 content-animate">
                        <h1 className="text-4xl font-bold mb-2" style={{ color: "#1F6B4F", fontFamily: "'Fraunces', serif" }}>
                            Welcome Back
                        </h1>
                        <p className="text-gray-600" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Login to access your dashboard and continue your learning journey
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div className="form-group">
                            <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                                <span className="w-1 h-4 rounded-full mr-2" style={{ background: "linear-gradient(180deg, #3FA383 0%, #1F6B4F 100%)" }}></span>
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    className="w-full border border-gray-300 bg-white rounded-xl px-4 py-3 pl-10 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 hover:shadow-md"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onFocus={(e) => { e.target.classList.add('input-focused'); e.target.style.borderColor = '#3FA383'; e.target.style.boxShadow = '0 0 0 3px rgba(63, 163, 131, 0.2)'; }}
                                    onBlur={(e) => { e.target.classList.remove('input-focused'); e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                                    required
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                                <span className="w-1 h-4 rounded-full mr-2" style={{ background: "linear-gradient(180deg, #F0C15C 0%, #D99A2B 100%)" }}></span>
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className="w-full border border-gray-300 bg-white rounded-xl px-4 py-3 pl-10 pr-12 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 hover:shadow-md"
                                    placeholder="Please enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={(e) => { e.target.classList.add('input-focused'); e.target.style.borderColor = '#F0C15C'; e.target.style.boxShadow = '0 0 0 3px rgba(240, 193, 92, 0.2)'; }}
                                    onBlur={(e) => { e.target.classList.remove('input-focused'); e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                                    required
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors"
                                    style={{ hoverColor: "#F0C15C" }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#F0C15C'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                                >
                                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group flex justify-between items-center">
                            <label className="flex items-center cursor-pointer group">
                                <div className="relative">
                                    <input type="checkbox" className="sr-only peer"/>
                                    <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-gradient-to-b peer-checked:from-[#F0C15C] peer-checked:to-[#D99A2B] peer-checked:border-[#D99A2B] transition-all duration-200 group-hover:border-[#D99A2B]"></div>
                                    <svg className="w-3 h-3 text-white absolute top-1 left-1 opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Remember me</span>
                            </label>
                            <Link className="text-sm font-medium transition-colors hover:underline" to="/forgot-password" style={{ color: "#1F6B4F" }}>
                                Forget password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full text-white py-3.5 rounded-xl font-semibold text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6 transform hover:scale-[1.02] active:scale-[0.98] button-glow flex items-center justify-center shimmer-effect"
                            style={{
                                background: "linear-gradient(135deg, #F0C15C 0%, #D99A2B 100%)"
                            }}
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Logging in...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    LOGIN
                                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 content-animate">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <button className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:shadow-md group">
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Google
                            </button>
                            <button className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:shadow-md group">
                                <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v3.47h3.047c-.26 1.336-.795 2.417-1.487 3.108v2.258h2.406c1.457-1.457 2.417-3.605 2.417-6.405z"/>
                                </svg>
                                Facebook
                            </button>
                        </div>
                    </div>

                    <p className="text-center text-gray-600 mt-8 text-sm content-animate">
                        Don't have account?{" "}
                        <Link className="font-semibold transition-colors hover:underline" to="/register" style={{ color: "#1F6B4F" }}>
                            Sign up
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
};

export default Login;
