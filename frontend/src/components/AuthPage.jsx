import React, { useContext, useState } from 'react';
import { Sparkles, Mail, Lock, Eye, EyeOff, ShieldCheck, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/ContextApi';
import { toast } from '../ui/Toaster'; 

const CorporateLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const auth_context = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim() || !formData.password.trim()) {
      toast.warning("All fields are required");
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      toast.warning("Please enter a valid email address");
      return false;
    }
    if (formData.password.length < 6) {
      toast.warning("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const loginSubmit = async (e) => {
    try {
      setLoading(true);
      e.preventDefault();
      if (!validate()) return;

      const res = await axios.post(`${import.meta.env.VITE_API_KEY}/login-auth`, formData, { withCredentials: true });
      
      toast.success("Login Successful"); 
      setFormData({ email: '', password: '' });
      auth_context.setLoggedIn(true);
      auth_context.setRole(res.data.users.role);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong"); 
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const signupSubmit = async (e) => {
    try {
      setLoading(true);
      e.preventDefault();
      if (!validate()) return;
      await axios.post(`${import.meta.env.VITE_API_KEY}`, formData, { withCredentials: true });
      
      toast.success("Registration Successful");
      setFormData({ email: '', password: '' });
      auth_context.setLoggedIn(true);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white text-slate-900 font-sans selection:bg-zinc-200 selection:text-zinc-900">

      {loading && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-999">
          <div className="rounded-xl bg-white/70 shadow-xl px-6 py-5 flex items-center gap-3">
            <RefreshCw className="animate-spin text-slate-700" size={22} />
            <span className="text-sm font-semibold text-slate-800">
              Loading...
            </span>
          </div>
        </div>
      )}

      {/* Left Side: Auth Form */}
      <div className="flex flex-col w-full lg:w-1/2 p-8 lg:p-12 overflow-y-auto lg:overflow-y-hidden h-screen">
        
        {/* Header/Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-black rounded-md flex items-center justify-center text-white shadow-md">
            <Sparkles size={18} />
          </div>
          <h2 className="text-slate-900 text-xl font-bold tracking-tight">Corporate</h2>
        </div>

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-12">
          
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Create an Account'}
            </h1>
            <p className="text-sm text-slate-500">
              {isLogin
                ? 'Enter your corporate credentials to access your workspace.'
                : 'Register your corporate email to set up your enterprise workspace.'}
            </p>
          </div>

          {/* Minimalist Pill Toggle Navigation */}
          <div className="flex p-1 bg-zinc-100 rounded-lg mb-8 border border-zinc-200/60">
            <button onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-all ${
                isLogin ? 'bg-white text-slate-900 shadow-sm border-slate-200/50' : 'text-slate-500 hover:text-slate-700' }`}>
              Sign In
            </button>
            <button onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-all ${
                !isLogin ? 'bg-white text-slate-900 shadow-sm border-slate-200/50' : 'text-slate-500 hover:text-slate-700' }`}>
              Sign Up
            </button>
          </div>

          <form className="space-y-6">
            
            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Work Email
              </label>
              <div className="relative flex items-center">
                <Mail size={18} className="absolute left-4 text-black pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-zinc-50 border border-slate-200 text-slate-900 text-sm rounded-md pl-11 pr-4 py-3.5 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Password
                </label>
                {isLogin && (
                  <p className="text-[11px] font-bold text-slate-400 hover:text-slate-900 cursor-pointer transition-colors">
                    Forgot password?
                  </p>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock size={18} className="absolute left-4 text-black pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-zinc-50 border border-slate-200 text-slate-900 text-sm rounded-md pl-11 pr-11 py-3.5 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Main Action Button */}
            <button onClick={isLogin ? loginSubmit : signupSubmit}
              className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-3.5 rounded-md transition-colors shadow-lg mt-2 flex items-center justify-center gap-2" >
              {isLogin ? 'Sign In to Workspace' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-slate-400 font-semibold uppercase tracking-wider">Or continue with</span>
            </div>
          </div>

          {/* Google Single Sign-On */}
          <div className="mt-8">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-slate-200 bg-white hover:bg-zinc-50 rounded-md text-slate-700 font-bold text-sm transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-medium text-slate-400 gap-2">
          <p>© 2026 Corporate.</p>
          <div className="flex gap-4">
            <p className="hover:text-slate-900 cursor-pointer transition-colors">Privacy Policy</p>
            <p className="hover:text-slate-900 cursor-pointer transition-colors">Terms of Service</p>
          </div>
        </div>
      </div>

      {/* Right Side: Premium Brand Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-linear-to-br from-zinc-900 to-black items-center justify-center p-12">
        
        {/* Abstract Light Glows */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-[120px]"></div>
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-white/5 rounded-full blur-[100px]"></div>

        {/* Glassmorphic Panel */}
        <div className="relative z-10 w-full max-w-lg bg-white/5 border border-white/10 backdrop-blur-2xl p-10 rounded-lg shadow-2xl">
          
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white/10 border border-white/20 text-white text-[10px] font-bold tracking-widest uppercase mb-6">
              <ShieldCheck size={14} /> Enterprise Edition
            </span>
            <h2 className="text-white text-3xl font-bold leading-tight mb-4">
              Secure Corporate Management & Insights.
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Experience the next generation of corporate management with our premium secure interface, real-time analytics, and enterprise-grade data protection.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 p-5 rounded-md">
              <div className="flex items-center gap-2 text-white font-bold text-2xl mb-1">
                99.9%
              </div>
              <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Uptime SLA</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-md">
              <div className="flex items-center gap-2 text-white font-bold text-2xl mb-1">
                256-bit
              </div>
              <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">AES Encryption</div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-4 border-t border-white/10 pt-6">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-xs font-bold text-white shadow-sm">A</div>
              <div className="w-10 h-10 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center text-xs font-bold text-white shadow-sm">M</div>
              <div className="w-10 h-10 rounded-full bg-black border-2 border-zinc-900 flex items-center justify-center text-xs font-bold text-white shadow-sm">P</div>
            </div>
            <p className="text-zinc-400 text-sm font-medium">Join <span className="text-white font-bold">500+</span> industry leaders</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CorporateLogin;