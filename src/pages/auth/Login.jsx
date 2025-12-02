import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock } from "react-icons/fi";
import ParticlesBackground from "../../components/ParticlesBackground";

const Login = () => {
    const { login, isLoading, error } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: "", password: "" });

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(formData);

        if (res?.success && res?.user?.role) {
            const role = res.user.role;

            // Redirect according to role
            if (role === "trainer") navigate("/trainer/dashboard");
            else if (role === "student") navigate("/student/dashboard");
            else if (role === "admin") navigate("/admin/dashboard");
            else navigate("/dashboard"); // fallback
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#080c1b] relative overflow-hidden">
            <ParticlesBackground />

            <div className="relative w-full max-w-md">
                <div className="absolute inset-0 rounded-3xl animate-pulse bg-gradient-to-r from-purple-600 to-blue-600 blur-xl opacity-40"></div>

                <div className="relative bg-white/10 backdrop-blur-xl border border-purple-500/20 shadow-[0_0_20px_#4f46e5] rounded-3xl p-8 text-white">

                    <h2 className="typing-title text-3xl font-extrabold text-center mb-6 text-purple-300">
                        Login to Continue
                    </h2>

                    {error && (
                        <p className="bg-red-800/40 text-red-400 p-2 rounded mb-4 text-center border border-red-500">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div>
                            <label className="text-gray-300 mb-1 block">Email</label>
                            <div className="flex items-center gap-3 bg-[#0c1024] px-3 py-2 rounded-lg border border-purple-500/30 hover:border-purple-400 transition">
                                <FiMail className="text-purple-400 text-xl" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter email"
                                    className="w-full bg-transparent outline-none text-gray-100 placeholder-gray-500"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-gray-300 mb-1 block">Password</label>
                            <div className="flex items-center gap-3 bg-[#0c1024] px-3 py-2 rounded-lg border border-blue-500/30 hover:border-blue-400 transition">
                                <FiLock className="text-blue-400 text-xl" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Enter password"
                                    className="w-full bg-transparent outline-none text-gray-100 placeholder-gray-500"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="text-right">
                            <Link className="text-purple-400 hover:underline" to="/forgot-password">
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-lg font-bold text-lg shadow-[0_0_20px_#4f46e5] hover:opacity-90 transition disabled:opacity-40"
                        >
                            {isLoading ? "Logging in..." : "Enter"}
                        </button>
                    </form>

                    <p className="text-center text-gray-400 text-sm mt-6">
                        New user?{" "}
                        <Link className="text-blue-400 hover:underline" to="/register">
                            Create Account
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
};

export default Login;
