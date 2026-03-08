import React, { useState } from "react";
import { Menu, Gift, Tag, AlignLeft, UserCheck, Hash, ShieldCheck, CheckCircle2 } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/theme";
import axios from "axios";

const AddReward = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [validEmail, setValidEmail] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    emailId: "", 
  });

  const handleChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const resetForm = () => {
    setFormData({ title: "", category: "", description: "", emailId: "" })
  }

  const validateForm = () => {
    if (!formData.emailId.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId)) return "Invalid email format";
    setValidEmail(true);
  }
  const handleSubmit = async() => {
    try {
      const err = validateForm();
      err && alert(err);
      await axios.post(`${import.meta.env.VITE_API_KEY}/reward`, formData, {withCredentials: true});

      resetForm();
    } catch (error) {
      console.log(error);
    }
  };

  // Tailwind arbitrary variants for custom scrollbar
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

        <div className="p-6 max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-10">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Assign Reward</h1>
              <p className={`text-base ${theme.textMuted} mt-2`}>Create and assign incentives directly to specific employees.</p>
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <button onClick={resetForm} className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold border ${theme.border} bg-white hover:bg-zinc-50 transition-colors`}>
                Discard
              </button>
              <button onClick={handleSubmit} className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold text-white bg-black hover:bg-zinc-800 shadow-lg transition-colors">
                Assign Reward
              </button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Left Column: Form Fields */}
            <div className="xl:col-span-2 space-y-8">
              
              {/* Reward Details Card */}
              <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 lg:p-8 shadow-sm`}>
                <div className={`flex items-center gap-2 mb-6 pb-4 border-b ${theme.border}`}>
                  <Gift size={20} className="text-slate-900" />
                  <h2 className="text-lg font-bold text-slate-900">Reward Details</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-x-8">
                  {/* Title Input */}
                  <div className="md:col-span-2 flex flex-col gap-2 mb-6">
                    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>
                      Reward Title
                    </label>
                    <div className="relative flex items-center">
                      <Gift size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />
                      <input
                        type="text"
                        value={formData.title}
                        onChange={handleChange("title")}
                        placeholder="e.g. $100 Amazon Gift Card, Weekend Getaway..."
                        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
                      />
                    </div>
                  </div>

                  {/* Category Select */}
                  <div className="md:col-span-2 flex flex-col gap-2 mb-6">
                    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>
                      Reward Category
                    </label>
                    <div className="relative flex items-center">
                      <Tag size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />
                      <select
                        value={formData.category}
                        onChange={handleChange("category")}
                        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-10 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none cursor-pointer`}
                      >
                        <option value="" disabled hidden>Select an option</option>
                        {["Gift Card", "Merchandise", "Experience", "Digital", "Travel", "Bonus"].map((opt, i) => (
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

                {/* Description Textarea */}
                <div className="flex flex-col gap-2 mb-6">
                  <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>
                    Short Description
                  </label>
                  <div className="relative">
                    <AlignLeft size={18} className={`absolute left-4 top-3.5 ${theme.textMuted} pointer-events-none`} />
                    <textarea
                      value={formData.description}
                      onChange={handleChange("description")}
                      placeholder="Briefly describe the reward, redemption rules, and value..."
                      className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all min-h-35 resize-y`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: User Assignment & Security */}
            <div className="space-y-8">
              
              {/* Assignment Card */}
              <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 lg:p-8 shadow-sm`}>
                <div className={`flex items-center gap-2 mb-6 pb-4 border-b ${theme.border}`}>
                  <UserCheck size={20} className="text-slate-900" />
                  <h2 className="text-lg font-bold text-slate-900">Recipient Assignment</h2>
                </div>
                <p className={`text-sm ${theme.textMuted} mb-6`}>
                  Enter the unique Email ID of the employee who will receive this reward.
                </p>
                
                <div className="flex flex-col gap-2 mb-6">
                  <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>
                    Reward Email ID
                  </label>
                  <div className="relative flex items-center">
                    <Hash size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />
                    <input
                      type="text"
                      value={formData.emailId}
                      onChange={handleChange("emailId")}
                      placeholder="e.g. employee@company.com"
                      className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
                    />
                  </div>
                </div>
              </div>

              {/* Premium Issuance Badge */}
              <div className="bg-linear-to-br from-zinc-800 to-black rounded-xl p-8 text-white shadow-xl shadow-black/20 relative overflow-hidden flex flex-col justify-center min-h-65">
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                
                <ShieldCheck size={32} className="text-zinc-400 mb-5 relative z-10" />
                <h3 className="text-lg font-bold mb-3 relative z-10">Issuance Protocol</h3>
                <p className="text-sm text-zinc-400 relative z-10 mb-6 leading-relaxed flex-1">
                  This reward will be permanently credited to the specified user's profile.
                </p>

                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest border-t border-zinc-700/50 pt-5 relative z-10 mt-auto">
                  <span className="text-zinc-400">Targeting Status</span>
                  <span className={`${formData.emailId ? 'text-emerald-400' : 'text-zinc-500'} flex items-center gap-1.5 transition-colors`}>
                    {validEmail === true ? <CheckCircle2 size={14} /> : <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full"></span>}
                    {validEmail === true ? "Valid Email" : "Pending Email"}
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

export default AddReward;