import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

const PasswordInput = ({ value, onChange, placeholder = "Enter password", name = "password", className = "", ...props }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className={`relative w-full max-w-sm ${className}`}>
            {/* Password Field Icon */}
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
            </div>

            {/* Input Field */}
            <input
                type={showPassword ? "text" : "password"}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                {...props}
            />

            {/* Show/Hide Toggle Button */}
            <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 transition-colors focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    );
};

export default PasswordInput;
