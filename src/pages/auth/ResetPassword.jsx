import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "../../services/auth.service"; // Import the service!

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Missing reset token. Please use the link from your email.");
      return;
    }
    if (passwords.new.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords do not match. Please try again.");
      return;
    }

    setStatus("loading");

    // Use the existing service! We pass an object because the backend expects req.body.token and req.body.newPassword
    const response = await authService.resetPassword(token, passwords.new);

    if (response.success) {
      setStatus("success");
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 3000);
    } else {
      setStatus("idle");
      toast.error(response.error || "Invalid or expired token.");
    }
  };

  if (!token && status !== "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md text-center border border-gray-100">
          <h2 className="text-xl font-black text-gray-900 mb-2">Invalid Link</h2>
          <p className="text-sm text-gray-500 mb-6">No reset token was found in the URL.</p>
          <Link to="/forgot-password" className="text-sm font-bold text-[#0A0A0A] underline">Request new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
        <div className="h-2 w-full bg-gradient-to-r from-yellow-400 to-yellow-500"></div>

        <div className="p-8">
          {status === "success" ? (
            <div className="text-center animate-in fade-in duration-300">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Password Updated</h2>
              <p className="text-sm font-medium text-gray-500 mb-8">Redirecting you to the login page...</p>
              <Link to="/login" className="block w-full py-4 bg-[#0A0A0A] hover:bg-black text-white text-sm font-black uppercase tracking-widest rounded-xl">Go to Login Now</Link>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Create New Password</h2>

              <form onSubmit={handleSubmit} className="space-y-5 mt-6">
                <div>
                  <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2">New Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-yellow-400 outline-none"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-yellow-400 outline-none"
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={status === "loading"} className="w-full mt-2 py-4 bg-[#0A0A0A] hover:bg-black text-white text-sm font-black uppercase tracking-widest rounded-xl shadow-md flex items-center justify-center gap-2">
                  {status === "loading" ? <><Loader2 size={18} className="animate-spin" /> Updating...</> : "Secure My Account"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;