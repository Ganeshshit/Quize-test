import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "../../services/auth.service"; // Import the service!

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setStatus("loading");

    // Use the existing service (it automatically uses the live URL)
    // Note: passing { email } as an object since backend expects req.body.email
    const response = await authService.forgotPassword(email);

    if (response.success) {
      setStatus("success");
      toast.success("Reset link sent successfully!");
    } else {
      setStatus("idle");
      toast.error(response.error || "Failed to send reset link.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
        <div className="h-2 w-full bg-gradient-to-r from-yellow-400 to-yellow-500"></div>

        <div className="p-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest transition-colors mb-8">
            <ArrowLeft size={14} /> Back to Login
          </Link>

          {status === "success" ? (
            <div className="text-center animate-in fade-in duration-300">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Check Your Inbox</h2>
              <p className="text-sm font-medium text-gray-500 leading-relaxed mb-8">
                If an account exists for <span className="font-bold text-gray-900">{email}</span>, we have sent a password reset link.
              </p>
              <Link to="/login" className="block w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-black uppercase tracking-widest rounded-xl transition-colors">
                Return to Login
              </Link>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Reset Password</h2>
              <p className="text-sm font-bold text-gray-500 mb-8">
                Enter your email address and we'll send you a link to securely reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-2">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      disabled={status === "loading"}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-yellow-400 outline-none transition-all disabled:opacity-60"
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={status === "loading"} className="w-full py-4 bg-[#0A0A0A] hover:bg-black text-white text-sm font-black uppercase tracking-widest rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
                  {status === "loading" ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : "Send Reset Link"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;