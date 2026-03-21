import React, { useContext, useEffect, useState } from 'react';
import { Menu, User, Lock, Mail, Eye, EyeOff, ShieldCheck, Save, LogOut, Camera, Phone, Briefcase, Hash, RefreshCw } from 'lucide-react';
import Sidebar from './Sidebar';
import { theme } from './Theme';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/ContextApi';
import { toast } from '../ui/Toaster';

const Settings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [role, setRole] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    profile: null,
    username: "",
    email: "",
    phoneNumber: "",
    gender: "",
    department: "",
    employment: "",
    currentPassword: "",
    newPassword: ""
  });

  const loggedIn = useContext(AuthContext);
  const navigate = useNavigate();

  // Unified change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Profile photo handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profile: { file: file, imageUrl: URL.createObjectURL(file), imagePublicId: file.name }
      }));
    }
  };

  const getData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_KEY}/check-role`, { withCredentials: true });
      setFormData({
        profile: res.data.user.profile ?? null,
        username: res.data.user.username ?? "",
        email: res.data.user.email ?? "",
        phoneNumber: res.data.user.phoneNumber ?? "",
        gender: res.data.user.gender ?? "",
        department: res.data.user.department ?? "",
        employment: res.data.user.employment ?? "",
        currentPassword: "",
        newPassword: ""
      });
      setRole(res.data.user.role);
      setCurrentUserId(res.data.user._id);
    } catch (error) {
      toast.error(error)
      console.log(error)
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getData();
  }, [])

  const submit = async () => {
    try {
      if (loading) return;
      if (formData.phoneNumber.length !== 10) {
        toast.info("Phone number must be exactly 10 digits");
        return;
      }
      setLoading(true);

      const data = new FormData();
      data.append("username", formData.username);
      data.append("email", formData.email);
      data.append("phoneNumber", formData.phoneNumber);
      data.append("gender", formData.gender);
      data.append("department", formData.department);
      data.append("employment", formData.employment);

      if (formData.profile?.file) {
        data.append("file", formData.profile.file);
      }
      await axios.put(`${import.meta.env.VITE_API_KEY}/${currentUserId}`, data, { withCredentials: true, });

      getData();
      toast.success("Profile Info Updated")
    } catch (error) {
      toast.error(error);
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const updatePassword = async () => {
    try {
      setLoading(true);
      if (!formData.currentPassword || !formData.newPassword) {
        toast.warning("Please fill both password fields");
        return;
      }

      await axios.patch(`${import.meta.env.VITE_API_KEY}/password-change`,
        { email: formData.email, currentPassword: formData.currentPassword, newPassword: formData.newPassword },
        { withCredentials: true });

      toast.success("Updated Successfully ...");
      setFormData({ newPassword: "", currentPassword: "" });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something Went Wrong");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    try {
      setLoading(true);
      await axios.get(`${import.meta.env.VITE_API_KEY}/remove-auth`, { withCredentials: true });
      navigate('/');
      loggedIn.setLoggedIn(false);
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const customScrollbarClasses = "overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  return (
    <div className={`flex h-screen w-full ${theme.appBg} ${theme.textMain} font-sans overflow-hidden selection:bg-zinc-200 selection:text-zinc-900`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`flex-1 flex flex-col bg-slate-50 ${customScrollbarClasses}`}>
        {loading && (
          <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-999">
            <div className="rounded-xl bg-white/70 shadow-xl px-6 py-5 flex items-center gap-3">
              <RefreshCw className="animate-spin text-slate-700" size={22} />
              <span className="text-sm font-semibold text-slate-800"> Loading... </span>
            </div>
          </div>
        )}

        {/* Mobile Header */}
        <div className="lg:hidden p-4 pb-0 flex justify-between items-center shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`flex items-center gap-2 ${theme.textMuted} hover:text-black hover:bg-zinc-100 ${theme.cardBg} border ${theme.border} px-3 py-2 rounded-lg shadow-sm transition-all`}
          >
            <Menu size={20} /> <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        {/* Settings Content Area */}
        <div className="p-6 max-w-7xl w-full mx-auto pb-12">

          <div className="mb-10">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Settings</h1>
            <p className={`text-base ${theme.textMuted} mt-2`}>Manage your personal profile, work details, and security.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* --- PROFILE & WORK INFORMATION CARD --- */}
            <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 lg:p-8 shadow-sm`}>
              <div className={`flex items-center gap-2 mb-6 pb-4 border-b ${theme.border}`}>
                <User size={20} className="text-slate-900" />
                <h2 className="text-lg font-bold text-slate-900">Profile & Work Details</h2>
              </div>

              {/* Photo Upload */}
              <div className="flex items-center gap-5 mb-8">
                <div className="relative w-20 h-20 rounded-full bg-zinc-200 border border-zinc-300 overflow-hidden shrink-0 flex items-center justify-center group cursor-pointer shadow-sm">
                  {formData.profile ? (
                    <img src={formData.profile?.imageUrl || "https://static.vecteezy.com/system/resources/thumbnails/032/176/191/small/business-avatar-profile-black-icon-man-of-user-symbol-in-trendy-flat-style-isolated-on-male-profile-people-diverse-face-for-social-network-or-web-vector.jpg"}
                      alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-zinc-400" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={20} className="text-white" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Profile Photo</h3>
                  <p className={`text-xs ${theme.textMuted} mt-1`}>Click the avatar to upload a new photo.</p>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* Username */}
                <div className="flex flex-col gap-2">
                  <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>Username</label>
                  <div className="relative flex items-center">
                    <Hash size={18} className={`absolute left-4 ${theme.textMuted}`} />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder='Username'
                      className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>Email</label>
                    <span className="text-[11px] text-slate-400 italic">Ask admin to change</span>
                  </div>
                  
                  <div className="relative flex items-center">
                    <Mail size={18} className={`absolute left-4 ${theme.textMuted}`} />
                    <input
                      type="email"
                      name="email"
                      readOnly 
                      value={formData.email} 
                      onChange={handleChange}
                      className={`w-full bg-zinc-50 border ${theme.border} text-slate-500 text-sm rounded-lg pl-11 pr-4 py-3 outline-none cursor-not-allowed transition-all`} 
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="flex flex-col gap-2">
                  <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>Phone Number</label>
                  <div className="relative flex items-center">
                    <Phone size={18} className={`absolute left-4 ${theme.textMuted}`} />
                    <input
                      type="number"
                      name="phoneNumber"
                      placeholder='Phone Number'
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="flex flex-col gap-2">
                  <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>Gender</label>
                  <select
                    name="gender"
                    value={formData.gender || ""}
                    onChange={handleChange}
                    className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                {
                  role === "employee" &&
                  <>
                    {/* Department */}
                    <div className="flex flex-col gap-2">
                      <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>Department</label>
                      <div className="relative flex items-center">
                        <Briefcase size={18} className={`absolute left-4 ${theme.textMuted}`} />
                        <input
                          type="text"
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
                        />
                      </div>
                    </div>

                    {/* Employment */}
                    <div className="flex flex-col gap-2">
                      <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>Employment Type</label>
                      <select
                        name="employment"
                        value={formData.employment}
                        onChange={handleChange}
                        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                  </>
                }

                <div className="pt-6">
                  <button
                    onClick={submit}
                    disabled={loading}
                    className={`flex items-center justify-center gap-2 text-white text-sm font-bold py-3 px-6 rounded-lg shadow-md transition-colors w-full
                  ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-black hover:bg-zinc-800"}`}
                  >
                    {loading ? "Saving..." : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* --- RIGHT COLUMN: SECURITY & ACTIONS --- */}
            <div className="flex flex-col gap-8">

              {/* Security Card */}
              <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 lg:p-8 shadow-sm`}>
                <div className={`flex items-center gap-2 mb-6 pb-4 border-b ${theme.border}`}>
                  <ShieldCheck size={20} className="text-slate-900" />
                  <h2 className="text-lg font-bold text-slate-900">Security</h2>
                </div>

                {/* Current Password */}
                <div className="flex flex-col gap-2 mb-5">
                  <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>Current Password</label>
                  <div className="relative flex items-center">
                    <Lock size={18} className={`absolute left-4 ${theme.textMuted}`} />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="Enter current password"
                      className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-11 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className={`absolute right-4 ${theme.textMuted} hover:text-black`}>
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="flex flex-col gap-2 mb-6">
                  <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>New Password</label>
                  <div className="relative flex items-center">
                    <Lock size={18} className={`absolute left-4 ${theme.textMuted}`} />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Enter new secure password"
                      className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-11 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className={`absolute right-4 ${theme.textMuted} hover:text-black`}>
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button onClick={updatePassword} className={`flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-slate-900 border ${theme.border} text-sm font-bold py-3 px-6 rounded-xl transition-colors w-full sm:w-auto`}>
                    <Lock size={16} />
                    Update Password
                  </button>
                </div>
              </div>

              {/* Logout Card */}
              <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 lg:p-8 shadow-sm`}>
                <div className={`flex items-center gap-2 mb-6 pb-4 border-b ${theme.border}`}>
                  <LogOut size={20} className="text-red-600" />
                  <h2 className="text-lg font-bold text-slate-900">Account Actions</h2>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">End Current Session</h3>
                    <p className={`text-sm ${theme.textMuted}`}>
                      Securely log out of your account on this device.
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-bold py-3 px-8 rounded-xl transition-colors w-full sm:w-auto shrink-0"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;