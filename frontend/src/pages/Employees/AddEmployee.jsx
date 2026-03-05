import React, { useState } from "react";
import { Menu, ShieldCheck, User, UploadCloud, Mail, Phone, Calendar, Briefcase, Users, Camera, Shield } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/theme";

const AddEmployee = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    department: "",
    employmentType: "Full-time",
    profileImage: null,
  });

  // Unified change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (type) => setFormData(prev => ({ ...prev, employmentType: type }));

  // Image upload handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, profileImage: file }));
    }
  };

  const handleSubmit = () => {
    console.log("Submitting employee:", formData);
    // TODO: connect to backend API
  };

  // Tailwind arbitrary variants to style the scrollbar
  const customScrollbarClasses = "overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  return (
    <div className={`flex h-screen w-full ${theme.appBg} ${theme.textMain} font-sans overflow-hidden selection:bg-zinc-200 selection:text-zinc-900`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`flex-1 bg-slate-50 ${customScrollbarClasses}`}>
        
        {/* Mobile Header */}
        <div className="lg:hidden p-4 pb-0 flex justify-between items-center shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className={`flex items-center gap-2 ${theme.textMuted} hover:text-black hover:bg-zinc-100 ${theme.cardBg} border ${theme.border} px-3 py-2 rounded-lg shadow-sm transition-all`}>
            <Menu size={20} /> <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        <div className="p-6 max-w-7xl mx-auto pb-12">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-10">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Add New Employee</h1>
              <p className={`text-base ${theme.textMuted} mt-2`}>Configure the professional profile and employment details.</p>
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <button className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold border ${theme.border} bg-white hover:bg-zinc-50 transition-colors`}>
                Cancel
              </button>
              <button onClick={handleSubmit} className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold text-white bg-black hover:bg-zinc-800 shadow-lg transition-colors">
                Save Employee
              </button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Left Column: Form Fields & Details */}
            <div className="xl:col-span-2 space-y-8">
              
              {/* Personal Information Block */}
              <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 lg:p-8 shadow-sm`}>
                <div className={`flex items-center gap-2 mb-6 pb-4 border-b ${theme.border}`}>
                  <User size={20} className="text-slate-900" />
                  <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-x-8">
                  {/* Full Name */}
                  <div className="flex flex-col gap-2 mb-6">
                    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>Full Name</label>
                    <div className="relative flex items-center">
                      <User size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="e.g. Jonathan Smith"
                        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="flex flex-col gap-2 mb-6">
                    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>Email Address</label>
                    <div className="relative flex items-center">
                      <Mail size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="j.smith@enterprise.com"
                        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="flex flex-col gap-2 mb-6">
                    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>Phone Number</label>
                    <div className="relative flex items-center">
                      <Phone size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-2 mb-6">
                    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>Password</label>
                    <div className="relative flex items-center">
                      <Shield size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="******"
                        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
                      />
                    </div>
                  </div>
                  
                  {/* Gender spans 1 column in md view */}
                  <div className="md:col-span-1 flex flex-col gap-2 mb-6">
                    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>Gender</label>
                    <div className="relative flex items-center">
                      <Users size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-10 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none cursor-pointer`}
                      >
                        <option value="" disabled hidden>Select an option</option>
                        {["Male", "Female", "Non-binary", "Prefer not to say"].map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 pointer-events-none text-slate-400">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employment Details Block */}
              <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 lg:p-8 shadow-sm`}>
                <div className={`flex items-center gap-2 mb-6 pb-4 border-b ${theme.border}`}>
                  <Briefcase size={20} className="text-slate-900" />
                  <h2 className="text-lg font-bold text-slate-900">Employment Details</h2>
                </div>

                <div className="mb-2 flex flex-col gap-2">
                  <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>Department</label>
                  <div className="relative flex items-center">
                    <Briefcase size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-10 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none cursor-pointer`}
                    >
                      <option value="" disabled hidden>Select an option</option>
                      {["Engineering", "Human Resources", "Marketing", "Sales", "Operations", "Finance"].map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 pointer-events-none text-slate-400">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className={`block text-[11px] font-bold uppercase tracking-wide ${theme.textMuted} mb-3`}>
                    Employment Type
                  </label>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {["Full-time", "Part-time", "Contract"].map((type) => (
                      <div 
                        key={type}
                        onClick={() => handleTypeSelect(type)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center ${formData.employmentType === type ? 'border-black bg-zinc-50 shadow-md' : `${theme.border} hover:border-zinc-400`}`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.employmentType === type ? 'border-black' : theme.border}`}>
                          {formData.employmentType === type && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                        </div>
                        <span className="text-sm font-bold text-slate-900 ml-3">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Image & Security Info */}
            <div className="space-y-8">
              
              {/* Profile Photo Block */}
              <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 lg:p-8 shadow-sm`}>
                <div className={`flex items-center gap-2 mb-6 pb-4 border-b ${theme.border}`}>
                  <Camera size={20} className="text-slate-900" />
                  <h2 className="text-lg font-bold text-slate-900">Profile Photo</h2>
                </div>
                <label className={`border-2 border-dashed ${preview ? 'border-black' : theme.border} rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-black hover:bg-zinc-50 transition-all cursor-pointer group relative overflow-hidden min-h-62.5`}>
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg absolute inset-0" />
                  ) : (
                    <>
                      <div className="bg-slate-100 p-5 rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud size={28} className="text-slate-600" />
                      </div>
                      <p className="text-base font-bold text-slate-900 mb-1">Click to upload photo</p>
                      <p className={`text-sm ${theme.textMuted}`}>JPG, PNG up to 5MB</p>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              {/* Premium Onboarding Badge */}
              <div className="bg-linear-to-br from-zinc-800 to-black rounded-xl p-8 text-white shadow-xl shadow-black/20 relative overflow-hidden flex flex-col justify-center">
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <ShieldCheck size={32} className="text-zinc-400 mb-5 relative z-10" />
                <h3 className="text-lg font-bold mb-3 relative z-10">Onboarding Protocol</h3>
                <p className="text-sm text-zinc-400 relative z-10 mb-8 leading-relaxed flex-1">
                  Adding this employee confirms compliance with enterprise privacy policies. Initial login credentials and onboarding documents will be dispatched securely via email.
                </p>
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest border-t border-zinc-700/50 pt-5 relative z-10 mt-auto">
                  <span className="text-zinc-400">Status</span>
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    Secure
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default AddEmployee;