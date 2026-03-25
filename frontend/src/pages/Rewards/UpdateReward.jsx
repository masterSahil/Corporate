import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Menu, Gift, Tag, AlignLeft, UserCheck, ShieldCheck, CheckCircle2, Mail, ArrowLeft, Loader2, Coins, RefreshCw } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/Theme";
import axios from "axios";
import { toast } from "../../ui/Toaster"; 

const UpdateReward = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validEmail, setValidEmail] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    points: "",
    description: "",
    email: "", 
  });

  const fetchReward = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_KEY}/reward`, { withCredentials: true });
      const reward = res.data.reward?.find(r => r._id === id);

      if (reward) {
        setFormData({
          title: reward.title || "",
          category: reward.category || "",
          points: reward.points || "", 
          description: reward.description || "",
          email: reward.email || "",
        });
        if (reward.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reward.email)) {
          setValidEmail(true);
        }
      } else {
        toast.error("Reward not found");
        navigate(-1);
      }
    } catch (error) {
      console.error("Failed to fetch reward:", error);
      toast.error("Failed to load reward details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReward();
  }, []);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData({ ...formData, [field]: value });
    
    if (field === "email") {
      setValidEmail(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) return "Title is required";
    if (!formData.category.trim()) return "Category is required";
    if (!formData.description.trim()) return "Description is required";
    
    // Optional, but if provided must be valid
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Invalid email format";
    }
    if (formData.points && isNaN(formData.points)) {
      return "Points must be a valid number";
    }
    return null;
  };

  const handleSubmit = async () => {
    try {
      const err = validateForm();
      if (err) { toast.warning(err); return; }
      setIsSubmitting(true);
      await axios.put(`${import.meta.env.VITE_API_KEY}/reward/${id}`, formData, { withCredentials: true });

      toast.success("Reward updated successfully!");
      navigate(-1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update reward");
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tailwind arbitrary variants for custom scrollbar
  const customScrollbarClasses = "overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";

  return (
    <div className={`flex h-dvh w-full ${theme.appBg} ${theme.textMain} font-sans overflow-hidden selection:bg-zinc-200 selection:text-zinc-900`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`flex-1 bg-slate-50 ${customScrollbarClasses} flex flex-col`}>
        
        {isLoading && (
          <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-999">
            <div className="rounded-xl bg-white/70 shadow-xl px-6 py-5 flex items-center gap-3">
              <RefreshCw className="animate-spin text-slate-700" size={22} />
              <span className="text-sm font-semibold text-slate-800"> Loading... </span>
            </div>
          </div>
        )}

        {/* Mobile Header */}
        <div className="lg:hidden p-4 pb-0 flex justify-between items-center shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className={`flex items-center gap-2 ${theme.textMuted} hover:text-black hover:bg-zinc-100 ${theme.cardBg} border ${theme.border} px-3 py-2 rounded-lg shadow-sm transition-all`}>
            <Menu size={20} /> <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        <div className="p-6 max-w-7xl mx-auto w-full flex-1 flex flex-col">
          
          {/* Header Block */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => navigate(-1)} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors hidden sm:block">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">Edit Reward</h1>
                <p className={`text-sm ${theme.textMuted} mt-1`}>Update incentive details and assignment for this reward.</p>
              </div>
            </div>
            
            <div className="flex gap-4 w-full sm:w-auto mt-2 sm:mt-0">
              <button type="button" onClick={() => navigate(-1)} 
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold border ${theme.border} bg-white hover:bg-zinc-50 transition-colors`}>
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={isSubmitting}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 ${isSubmitting ? "bg-slate-400 cursor-not-allowed" : "bg-black hover:bg-zinc-800 shadow-lg"} transition-colors`}>
                {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                {isSubmitting ? "Updating..." : "Update Reward"}
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
                      Reward Title <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Gift size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />
                      <input type="text" value={formData.title} onChange={handleChange("title")}
                        placeholder="e.g. $100 Amazon Gift Card, Weekend Getaway..."
                        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}/>
                    </div>
                  </div>

                  {/* Category Text Input */}
                  <div className="flex flex-col gap-2 mb-6">
                    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>
                      Reward Category <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Tag size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />
                      <input type="text" value={formData.category} onChange={handleChange("category")}
                        placeholder="e.g. Bonus, Voucher"
                        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}/>
                    </div>
                  </div>

                  {/* Points Number Input (Added) */}
                  <div className="flex flex-col gap-2 mb-6">
                    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>
                      Reward Points <span className="text-slate-400 normal-case tracking-normal">(Optional)</span>
                    </label>
                    <div className="relative flex items-center">
                      <Coins size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />
                      <input type="number" value={formData.points} onChange={handleChange("points")}
                        placeholder="e.g. 500"
                        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}/>
                    </div>
                  </div>
                </div>

                {/* Description Textarea */}
                <div className="flex flex-col gap-2">
                  <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>
                    Short Description <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <AlignLeft size={18} className={`absolute left-4 top-3.5 ${theme.textMuted} pointer-events-none`} />
                    <textarea value={formData.description} onChange={handleChange("description")}
                      placeholder="Briefly describe the reward, redemption rules, and value..."
                      className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all min-h-30 resize-y`}/>
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
                  Enter the unique Email ID of the employee who will receive this reward. Leave blank to keep it unassigned.
                </p>
                
                <div className="flex flex-col gap-2">
                  <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>
                    Reward Email ID <span className="text-slate-400 normal-case tracking-normal">(Optional)</span>
                  </label>
                  <div className="relative flex items-center">
                    <Mail size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />
                    <input type="email" value={formData.email} onChange={handleChange("email")} placeholder="e.g. employee@company.com" className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}/>
                  </div>
                </div>
              </div>

              {/* Premium Issuance Badge */}
              <div className="bg-linear-to-br from-zinc-800 to-black rounded-xl p-8 text-white shadow-xl shadow-black/20 relative overflow-hidden flex flex-col justify-center min-h-65">
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                
                <ShieldCheck size={32} className="text-zinc-400 mb-5 relative z-10" />
                <h3 className="text-lg font-bold mb-3 relative z-10">Issuance Protocol</h3>
                <p className="text-sm text-zinc-400 relative z-10 mb-6 leading-relaxed flex-1">
                  Modifying this assignment will transfer the reward. Enterprise audit logs will record this update. 
                </p>

                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest border-t border-zinc-700/50 pt-5 relative z-10 mt-auto">
                  <span className="text-zinc-400">Targeting Status</span>
                  
                  {/* Dynamic Status Badge based on optional email */}
                  <span className={`${!formData.email.trim() ? 'text-zinc-400' : validEmail ? 'text-emerald-400' : 'text-rose-400'} flex items-center gap-1.5 transition-colors`}>
                    {!formData.email.trim() ? (
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full"></span>
                    ) : validEmail ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <span className="w-1.5 h-1.5 bg-rose-400 rounded-full"></span>
                    )}
                    {!formData.email.trim() ? "Unassigned" : validEmail ? "Valid Email" : "Invalid Email"}
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

export default UpdateReward;