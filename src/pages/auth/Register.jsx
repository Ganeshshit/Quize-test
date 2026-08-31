import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import JobHeroIllustration from "../../components/comon/JobHeroIllustration";

const Register = () => {
    const { register, isLoading } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phoneNo: "",
        usn: "",
        collegeName: "",
    });

    const [validationErrors, setValidationErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear validation error when user starts typing
        if (validationErrors[name]) {
            setValidationErrors({ ...validationErrors, [name]: "" });
        }
    };

    const validateForm = () => {
        const errors = {};

        // Name validation
        if (!formData.name.trim()) {
            errors.name = "Name is required";
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            errors.email = "Please enter a valid email";
        }

        // Password validation (strong password requirements)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!formData.password) {
            errors.password = "Password is required";
        } else if (!passwordRegex.test(formData.password)) {
            errors.password = "Password must be at least 8 characters with uppercase, lowercase, number, and special character";
        }

        // Phone number validation (10 digits)
        const phoneRegex = /^\d{10}$/;
        if (!formData.phoneNo.trim()) {
            errors.phoneNo = "Phone number is required";
        } else if (!phoneRegex.test(formData.phoneNo)) {
            errors.phoneNo = "Phone number must be exactly 10 digits";
        }

        // USN validation
        if (!formData.usn.trim()) {
            errors.usn = "USN is required";
        }

        // College name validation
        if (!formData.collegeName.trim()) {
            errors.collegeName = "College name is required";
        }

        setValidationErrors(errors);
        
        // Show toast for first validation error if any
        if (Object.keys(errors).length > 0) {
            const firstError = Object.values(errors)[0];
            toast.error(firstError);
        }
        
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phoneNo: formData.phoneNo,
            usn: formData.usn,
            collegeName: formData.collegeName,
        };

        const result = await register(payload);
        
        if (result.success) {
            toast.success(result.message || "Registration successful! Please verify your email.");
            setTimeout(() => {
                navigate("/dashboard");
            }, 2000);
        } else {
            toast.error(result.error || "Registration failed. Please try again.");
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
                    animation: fadeSlideUp 0.6s ease-out forwards;
                    opacity: 0;
                }
                .form-group:nth-child(1) { animation-delay: 0.1s; }
                .form-group:nth-child(2) { animation-delay: 0.2s; }
                .form-group:nth-child(3) { animation-delay: 0.3s; }
                .form-group:nth-child(4) { animation-delay: 0.4s; }
                .form-group:nth-child(5) { animation-delay: 0.5s; }
                .form-group:nth-child(6) { animation-delay: 0.6s; }
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
                    0%, 100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
                    50% { box-shadow: 0 0 0 8px rgba(37, 99, 235, 0); }
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
                    0%, 100% { box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3); }
                    50% { box-shadow: 0 4px 25px rgba(37, 99, 235, 0.5); }
                }
                .button-glow {
                    animation: button-glow 2s ease-in-out infinite;
                }
            `}</style>
            {/* Left Side - Illustration */}
            <JobHeroIllustration />

            {/* Right Side - Registration Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white">
                <div className="w-full max-w-md">
                    <div className="mb-8 content-animate">
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">
                            Create Your Account
                        </h1>
                        <p className="text-gray-600">
                            Join us to start your learning journey
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* NAME */}
                        <div className="form-group">
                            <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                                <span className="w-1 h-4 bg-blue-500 rounded-full mr-2"></span>
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    name="name"
                                    className={`w-full border ${validationErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'} rounded-xl px-4 py-3 pl-10 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400 hover:shadow-md`}
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.classList.add('input-focused')}
                                    onBlur={(e) => e.target.classList.remove('input-focused')}
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                            {validationErrors.name && (
                                <p className="text-red-600 text-xs mt-1 animate-shake">{validationErrors.name}</p>
                            )}
                        </div>

                        {/* EMAIL */}
                        <div className="form-group">
                            <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                                <span className="w-1 h-4 bg-blue-500 rounded-full mr-2"></span>
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    name="email"
                                    type="email"
                                    className={`w-full border ${validationErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'} rounded-xl px-4 py-3 pl-10 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400 hover:shadow-md`}
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.classList.add('input-focused')}
                                    onBlur={(e) => e.target.classList.remove('input-focused')}
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            {validationErrors.email && (
                                <p className="text-red-600 text-xs mt-1 animate-shake">{validationErrors.email}</p>
                            )}
                        </div>

                        {/* PASSWORD */}
                        <div className="form-group">
                            <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                                <span className="w-1 h-4 bg-blue-500 rounded-full mr-2"></span>
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type="password"
                                    className={`w-full border ${validationErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'} rounded-xl px-4 py-3 pl-10 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400 hover:shadow-md`}
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.classList.add('input-focused')}
                                    onBlur={(e) => e.target.classList.remove('input-focused')}
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            </div>
                            {validationErrors.password && (
                                <p className="text-red-600 text-xs mt-1 animate-shake">{validationErrors.password}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">
                                8+ chars with uppercase, lowercase, number & special character
                            </p>
                        </div>

                        {/* PHONE NUMBER */}
                        <div className="form-group">
                            <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                                <span className="w-1 h-4 bg-blue-500 rounded-full mr-2"></span>
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    name="phoneNo"
                                    type="tel"
                                    maxLength="10"
                                    className={`w-full border ${validationErrors.phoneNo ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'} rounded-xl px-4 py-3 pl-10 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400 hover:shadow-md`}
                                    placeholder="10-digit phone number"
                                    value={formData.phoneNo}
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.classList.add('input-focused')}
                                    onBlur={(e) => e.target.classList.remove('input-focused')}
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13 2.257a1 1 0 001.21.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 012 2h3.28a1 1 0 01.948-.684l1.498-4.493a1 1 0 00-.502-1.21l-2.257-1.13a11.042 11.042 0 00-5.516-5.516l-1.13-2.257a1 1 0 00-1.21-.502l-4.493-1.498a1 1 0 01-.684-.949V5a2 2 0 012-2z" />
                                    </svg>
                                </div>
                            </div>
                            {validationErrors.phoneNo && (
                                <p className="text-red-600 text-xs mt-1 animate-shake">{validationErrors.phoneNo}</p>
                            )}
                        </div>

                        {/* USN */}
                        <div className="form-group">
                            <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                                <span className="w-1 h-4 bg-blue-500 rounded-full mr-2"></span>
                                USN <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    name="usn"
                                    className={`w-full border ${validationErrors.usn ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'} rounded-xl px-4 py-3 pl-10 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400 hover:shadow-md`}
                                    placeholder="Enter your USN"
                                    value={formData.usn}
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.classList.add('input-focused')}
                                    onBlur={(e) => e.target.classList.remove('input-focused')}
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 14 7 14s2.832-5.477 4-6.253z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 6.253v1.5a3.5 3.5 0 11-7 0v-1.5a3.5 3.5 0 017 0z" />
                                    </svg>
                                </div>
                            </div>
                            {validationErrors.usn && (
                                <p className="text-red-600 text-xs mt-1 animate-shake">{validationErrors.usn}</p>
                            )}
                        </div>

                        {/* COLLEGE NAME */}
                        <div className="form-group">
                            <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                                <span className="w-1 h-4 bg-blue-500 rounded-full mr-2"></span>
                                College Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    name="collegeName"
                                    className={`w-full border ${validationErrors.collegeName ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'} rounded-xl px-4 py-3 pl-10 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400 hover:shadow-md`}
                                    placeholder="Enter your college name"
                                    value={formData.collegeName}
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.classList.add('input-focused')}
                                    onBlur={(e) => e.target.classList.remove('input-focused')}
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 14l9-5-9-5V7a2 2 0 012-2h10a2 2 0 012 2v7z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 14l-10-2-10 2" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 14l10-2 10 2" />
                                    </svg>
                                </div>
                            </div>
                            {validationErrors.collegeName && (
                                <p className="text-red-600 text-xs mt-1 animate-shake">{validationErrors.collegeName}</p>
                            )}
                        </div>

                        {/* SUBMIT BUTTON */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl font-semibold text-base hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6 transform hover:scale-[1.02] active:scale-[0.98] button-glow flex items-center justify-center"
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    Create Account
                                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </span>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-gray-600 mt-8 text-sm content-animate">
                        Already have an account?{" "}
                        <Link className="text-blue-600 hover:text-blue-700 font-semibold transition-colors hover:underline" to="/login">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
