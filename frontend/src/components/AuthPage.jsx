import React, { useContext, useState } from 'react';
import { Sparkles, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/ContextApi';

const CorporateLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [toast, setToast] = useState({ message: '', type: 'error', visible: false });

  const navigate = useNavigate();

  const auth_context = useContext(AuthContext);

  const showToast = (message, type = 'error') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim() || !formData.password.trim()) {
      showToast("All fields are required");
      return false;
    }

    if (!emailRegex.test(formData.email)) {
      showToast("Please enter a valid email address");
      return false;
    }

    if (formData.password.length <= 5) {
      showToast("Please enter 6 Digits Password");
      return false;
    }
    return true;
  };

  const loginSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!validate()) return;

      const res = await axios.post(`${import.meta.env.VITE_API_KEY}/login-auth`, formData, {withCredentials: true})
      showToast("Registration Sucessfull", "success");
      console.log(res.data.users.role);
      setFormData({ email: '', password: '' })
      auth_context.setLoggedIn(true);
      auth_context.setRole(res.data.users.role);
      navigate('/dashboard')
    } catch (error) {
      showToast(
        error.response?.data?.message || "Something went wrong"
      );
      console.log(error);
    }
  };

  const signupSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!validate()) return;

      await axios.post(import.meta.env.VITE_API_KEY, formData, {withCredentials: true});
      showToast("Registration Sucessfull", "success");

      setFormData({ email: '', password: '' })
      auth_context.setLoggedIn(true);
      navigate('/dashboard')
    } catch (error) {
      showToast(
        error.response?.data?.message || "Something went wrong"
      );
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-[#0a0e17] text-gray-200 font-sans">

      {/* Custom Simple Toast */}
      {toast.visible && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-md shadow-2xl border backdrop-blur-md text-sm font-medium transition-all duration-300 flex items-center gap-2.5 
          ${toast.type === 'error'
              ? 'bg-red-900/10 border-red-900/50 text-red-400'
              : 'bg-green-900/10 border-green-900/50 text-green-400'
            }`}
        >
          {/* Status Dot */}
          <span className={`w-2 h-2 rounded-full ${toast.type === 'error' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]'}`}></span>
          {toast.message}
        </div>
      )}

      {/* Left Side: Auth Form */}
      <div className="flex flex-col w-full lg:w-1/2 p-8 lg:p-16 xl:p-24 justify-between relative z-10">

        {/* Header/Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-white text-lg font-semibold tracking-wide">MidNightCorp</h2>
        </div>

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-12">

          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Create an Account'}
            </h1>
            <p className="text-sm text-gray-400">
              {isLogin
                ? 'Enter your corporate credentials to access your dashboard.'
                : 'Register your corporate email to set up your workspace.'}
            </p>
          </div>

          {/* Minimalist Tab Navigation */}
          <div className="flex space-x-6 mb-6 border-b border-gray-800">
            <button
              onClick={() => setIsLogin(true)}
              className={`pb-2 text-sm font-medium transition-colors relative ${isLogin ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              Sign In
              {isLogin && (
                <span className="absolute -bottom-px left-0 w-full h-0.5 bg-blue-500 rounded-t-sm"></span>
              )}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`pb-2 text-sm font-medium transition-colors relative ${!isLogin ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              Sign Up
              {!isLogin && (
                <span className="absolute -bottom-px left-0 w-full h-0.5 bg-blue-500 rounded-t-sm"></span>
              )}
            </button>
          </div>

          <form className="space-y-4">

            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#111827] border border-gray-800 rounded-md py-2.5 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-gray-600"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Password
                </label>
                {/* Only show "Forgot password?" on Login tab */}
                {isLogin && (
                  <p className="text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors">
                    Forgot password?
                  </p>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-[#111827] border border-gray-800 rounded-md py-2.5 pl-10 pr-10 text-sm text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-gray-600"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Main Action Button */}
            <button
              onClick={isLogin ? loginSubmit : signupSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0a0e17] mt-2 shadow-sm"
            >
              {isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          {/* Google Single Sign-On */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-gray-800 rounded-md hover:bg-[#111827] text-gray-300 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 focus:ring-offset-[#0a0e17]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <p>© 2026 MidnightCorp. All rights reserved.</p>
          <div className="flex gap-4">
            <p className="hover:text-gray-300 transition-colors">Privacy Policy</p>
            <p className="hover:text-gray-300 transition-colors">Terms of Service</p>
          </div>
        </div>
      </div>

      {/* Right Side: Brand Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#05080f] items-center justify-center">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-125 h-125 bg-blue-900/20 rounded-full blur-[120px]"></div>

        {/* Abstract Grid Background */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-lg px-12">

          {/* Glassmorphic Panel */}
          <div className="bg-[#111827]/60 backdrop-blur-md border border-gray-800 p-8 rounded-lg shadow-2xl">

            <div className="mb-6">
              <span className="inline-block px-2.5 py-1 rounded-md bg-blue-900/30 border border-blue-800/50 text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-4">
                Enterprise Edition
              </span>
              <h2 className="text-white text-3xl font-bold leading-tight mb-4">
                Manage your enterprise rewards seamlessly.
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Experience the next generation of corporate management with our premium secure interface and deep-learning insights.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[#0a0e17]/50 border border-gray-800 p-4 rounded-md">
                <div className="text-blue-500 font-semibold text-xl mb-1">99.9%</div>
                <div className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">Uptime SLA</div>
              </div>
              <div className="bg-[#0a0e17]/50 border border-gray-800 p-4 rounded-md">
                <div className="text-blue-500 font-semibold text-xl mb-1">256-bit</div>
                <div className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">AES Encryption</div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-3 border-t border-gray-800/50 pt-6">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#111827] flex items-center justify-center text-xs font-bold text-gray-300">A</div>
                <div className="w-8 h-8 rounded-full bg-gray-600 border-2 border-[#111827] flex items-center justify-center text-xs font-bold text-gray-200">M</div>
                <div className="w-8 h-8 rounded-full bg-blue-900 border-2 border-[#111827] flex items-center justify-center text-xs font-bold text-blue-300">P</div>
              </div>
              <p className="text-gray-400 text-xs">Join <span className="text-white font-semibold">500+</span> industry leaders</p>
            </div>

          </div>

          {/* Abstract Bar Chart Visual */}
          <div className="mt-12 flex items-end gap-2 h-24 opacity-30 justify-center">
            <div className="bg-blue-600 w-12 h-1/4 rounded-sm"></div>
            <div className="bg-blue-500 w-12 h-2/4 rounded-sm"></div>
            <div className="bg-blue-400 w-12 h-full rounded-sm"></div>
            <div className="bg-blue-500 w-12 h-3/4 rounded-sm"></div>
            <div className="bg-blue-600 w-12 h-2/4 rounded-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateLogin;