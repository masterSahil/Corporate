import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Menu, ArrowLeft, User, UploadCloud, Eye, EyeOff, Lock, Mail, Phone, Key, Camera, Users, Loader2, RefreshCw } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/Theme";
import axios from "axios";
import { toast } from "../../ui/Toaster";

const UpdateAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [preview, setPreview] = useState(null); // For new image preview
  const [existingImage, setExistingImage] = useState(null); // For DB image URL

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    gender: "",
    phoneNumber: "",
    password: "",
    role: "admin",
    profileImage: null,
  });

  const fetchAdmin = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_KEY}/fetch-all-user`, { withCredentials: true });
      const admin = res.data.users?.find(u => u._id === id);

      if (admin) {
        setFormData({
          username: admin.username || "",
          email: admin.email || "",
          phoneNumber: admin.phoneNumber || "",
          gender: admin.gender || "",
          role: admin.role || "admin",
          password: "",
          profileImage: null,
        });
        setExistingImage(admin.profile?.imageUrl || null);
      } else {
        toast.error("Admin not found");
        navigate(-1);
      }
    } catch (error) {
      toast.error("Failed to fetch admin");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, []);

  const validateForm = () => {
    if (!formData.username.trim()) return "Full name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Invalid email format";
    if (!formData.phoneNumber.trim()) return "Phone number is required";
    if (!/^[0-9]{10}$/.test(formData.phoneNumber)) return "Phone number must be 10 digits";
    if (formData.password && formData.password.length < 6) return "Password must be at least 6 characters";
    if (!formData.gender) return "Please select gender";
    if (!formData.role) return "Please select role";
    return null; 
  };

  const handleChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });
  const handleRoleSelect = (role) => setFormData({ ...formData, role });

  // Inlined Image Handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
      setFormData({ ...formData, profileImage: file });
    }
  };

  const displayImage = preview || existingImage;

  const handleSubmit = async () => {
    try {
      const error = validateForm();
      if (error) { toast.warning(error);  return; }
      setIsSubmitting(true);

      const data = new FormData();
      data.append("username", formData.username);
      data.append("email", formData.email);
      data.append("gender", formData.gender);
      data.append("phoneNumber", formData.phoneNumber);
      data.append("role", formData.role);
      
      if (formData.password) {
        data.append("password", formData.password);
      }
      if (formData.profileImage) {
        data.append("file", formData.profileImage);
      }
      await axios.put(`${import.meta.env.VITE_API_KEY}/${id}`, data, { withCredentials: true});
      
      toast.success("Admin updated successfully!");
      navigate(-1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update admin");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const customScrollbarClasses = "overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400";
  return (
    <div className={`flex h-screen w-full ${theme.appBg} ${theme.textMain} font-sans overflow-hidden selection:bg-zinc-200 selection:text-zinc-900`}>
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
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-10">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">Edit Admin</h1>
                <p className={`text-sm ${theme.textMuted} mt-1`}>Update details and manage permissions.</p>
              </div>
            </div>
            
            <div className="flex gap-4 w-full sm:w-auto">
              <button onClick={() => navigate(-1)} className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold border ${theme.border} bg-white hover:bg-zinc-50 transition-colors`}>
                Cancel
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting} 
                className={`flex-1 sm:flex-none px-6 py-3 flex items-center justify-center gap-2 rounded-xl text-sm font-bold text-white ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-zinc-800'} shadow-lg transition-colors`}
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
                {isSubmitting ? "Saving..." : "Update Admin"}
              </button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Left Column: Form Fields & Roles */}
            <div className="xl:col-span-2 space-y-8">
              
              {/* Personal Information Inline Card */}
              <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 lg:p-8 shadow-sm`}>
                <div className={`flex items-center gap-2 mb-6 pb-4 border-b ${theme.border}`}>
                  <User size={20} className="text-slate-900" />
                  <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-x-8">
                  {/* Full Name Input */}
                  <div className="flex flex-col gap-2 mb-6">
                    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <User size={18} className={`absolute left-4 ${theme.textMuted}`} />
                      <input
                        type="text"
                        value={formData.username}
                        onChange={handleChange("username")}
                        placeholder="e.g. Alex Morgan"
                        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
                      />
                    </div>
                  </div>

                  {/* Email Address Input */}
                  <div className="flex flex-col gap-2 mb-6">
                    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail size={18} className={`absolute left-4 ${theme.textMuted}`} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={handleChange("email")}
                        placeholder="alex@enterprise.com"
                        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
                      />
                    </div>
                  </div>

                  {/* Phone Number Input */}
                  <div className="flex flex-col gap-2 mb-6">
                    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>
                      Phone Number
                    </label>
                    <div className="relative flex items-center">
                      <Phone size={18} className={`absolute left-4 ${theme.textMuted}`} />
                      <input
                        type="text"
                        value={formData.phoneNumber}
                        onChange={handleChange("phoneNumber")}
                        placeholder="+1 (555) 000-0000"
                        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
                      />
                    </div>
                  </div>

                  {/* Secure Password Input */}
                  <div className="flex flex-col gap-2 mb-6">
                    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>
                      New Password (Optional)
                    </label>
                    <div className="relative flex items-center">
                      <Lock size={18} className={`absolute left-4 ${theme.textMuted}`} />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange("password")}
                        placeholder="Leave blank to keep current"
                        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-11 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
                      />
                      <div className="absolute right-4">
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)} 
                          className={`${theme.textMuted} hover:text-black transition-colors`}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Gender Select */}
                  <div className="md:col-span-1">
                    <div className="flex flex-col gap-2 mb-6">
                      <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>
                        Gender
                      </label>
                      <div className="relative flex items-center">
                        <Users size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />
                        <select
                          value={formData.gender}
                          onChange={handleChange("gender")}
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
              </div>

              {/* Role & Permissions Inline Card */}
              <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 lg:p-8 shadow-sm`}>
                <div className={`flex items-center gap-2 mb-6 pb-4 border-b ${theme.border}`}>
                  <Key size={20} className="text-slate-900" />
                  <h2 className="text-lg font-bold text-slate-900">Role & Permissions</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Role Card: Admin */}
                  <div 
                    onClick={() => handleRoleSelect("admin")}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${formData.role === "admin" ? 'border-black bg-zinc-50 shadow-md' : `${theme.border} hover:border-zinc-400`}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-base font-bold text-slate-900">Admin</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.role === "admin" ? 'border-black' : theme.border}`}>
                        {formData.role === "admin" && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                      </div>
                    </div>
                    <p className={`text-sm ${theme.textMuted} leading-relaxed`}>Standard access to manage users, view analytics, and update general content.</p>
                  </div>

                  {/* Role Card: super_admin */}
                  <div 
                    onClick={() => handleRoleSelect("super_admin")}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${formData.role === "super_admin" ? 'border-black bg-zinc-50 shadow-md' : `${theme.border} hover:border-zinc-400`}`} >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-base font-bold text-slate-900">Super Admin</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.role === "super_admin" ? 'border-black' : theme.border}`}>
                        {formData.role === "super_admin" && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                      </div>
                    </div>
                    <p className={`text-sm ${theme.textMuted} leading-relaxed`}>Unrestricted access. Can manage billing, security settings, and other admins.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Image Inline Component */}
            <div className="space-y-8">
              <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 lg:p-8 shadow-sm`}>
                <div className={`flex items-center gap-2 mb-6 pb-4 border-b ${theme.border}`}>
                  <Camera size={20} className="text-slate-900" />
                  <h2 className="text-lg font-bold text-slate-900">Profile Photo</h2>
                </div>

                <label className={`border-2 border-dashed ${displayImage ? 'border-black' : theme.border} rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-black hover:bg-zinc-50 transition-all cursor-pointer group relative overflow-hidden min-h-62.5`}>
                  {displayImage ? (
                    <img src={displayImage} alt="Profile Preview" className="w-full h-full object-cover rounded-lg absolute inset-0" />
                  ) : (
                    <>
                      <div className="bg-slate-100 p-5 rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud size={28} className="text-slate-600" />
                      </div>
                      <p className="text-base font-bold text-slate-900 mb-1">Click to upload new photo</p>
                      <p className={`text-sm ${theme.textMuted}`}>JPG, PNG up to 5MB</p>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>

                {displayImage && (
                  <p className="text-xs text-center text-slate-500 mt-3">Click the image to upload a replacement.</p>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
};

export default UpdateAdmin;