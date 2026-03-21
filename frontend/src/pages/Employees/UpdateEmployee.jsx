import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Menu, ShieldCheck, User, UploadCloud, Mail, Briefcase, Users, Camera, Lock, Phone, ArrowLeft, Loader2 } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/Theme";
import axios from "axios";
import { toast } from "../../ui/Toaster";

const UpdateEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    username: "", email: "", gender: "", phoneNumber: "",
    password: "", department: "", employment: "Full-time", role: "employee"
  });

  const fetchEmployee = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_KEY}/fetch-all-user`, { withCredentials: true });

      const employee = res.data.users?.find(emp => emp._id === id);
      if (employee) {
        setFormData({
          username: employee.username || "",
          email: employee.email || "",
          gender: employee.gender || "",
          phoneNumber: employee.phoneNumber || "",
          department: employee.department || "",
          employment: employee.employment || "Full-time",
          role: employee.role || "employee",
          password: "",
        });

        if (employee.profile) {
          setPreview(employee.profile.imageUrl);
        }
      } else {
        toast.error("Employee not found");
        navigate(-1);
      }
    } catch (error) {
      toast.error(error);
      console.error("Failed to fetch employee:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, []);

  /* Generic change handlers */
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleEmploymentSelect = (employment) => setFormData(prev => ({ ...prev, employment }));

  /* Image handler */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfileImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  /* Form Validation */
  const validateForm = () => {
    if (!formData.username.trim()) return "Full name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Invalid email format";
    if (!formData.phoneNumber.trim()) return "Phone number is required";
    if (!/^[0-9]{10}$/.test(formData.phoneNumber)) return "Phone number must be 10 digits";
    // Password check is skipped for updates unless they are trying to type one
    if (formData.password && formData.password.length < 6) return "Password must be at least 6 characters";
    if (!formData.gender) return "Please select gender";
    return null;
  };

  /* Submit Update */
  const handleSubmit = async () => {
    try {
      const error = validateForm();
      if (error) { toast.warning(error); return;}
      setIsSubmitting(true);

      const submitData = new FormData();
      
      submitData.append("username", formData.username);
      submitData.append("email", formData.email);
      submitData.append("gender", formData.gender);
      submitData.append("phoneNumber", formData.phoneNumber);
      submitData.append("department", formData.department);
      submitData.append("employment", formData.employment);
      submitData.append("role", formData.role);

      // Only append password if the user typed a new one
      if (formData.password) {
        submitData.append("password", formData.password);
      }

      // Append new image if one was selected
      if (newProfileImage) {
        submitData.append("file", newProfileImage);
      }
      await axios.put(`${import.meta.env.VITE_API_KEY}/${id}`, submitData, { withCredentials: true });

      toast.success("Employee updated successfully!");
      navigate(-1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update employee");
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

        <div className="p-6 max-w-7xl mx-auto pb-12 w-full flex-1 flex flex-col">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-10">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors hidden sm:block">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Edit Employee</h1>
                <p className={`text-base ${theme.textMuted} mt-2`}>Update the professional profile and employment details.</p>
              </div>
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <button onClick={() => navigate(-1)} className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold border ${theme.border} bg-white hover:bg-zinc-50 transition-colors`}>
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold text-white ${isSubmitting ? "bg-slate-400 cursor-not-allowed" : "bg-black hover:bg-zinc-800"} shadow-lg transition-colors flex items-center justify-center gap-2`}
              >
                {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                {isSubmitting ? "Saving..." : "Update Employee"}
              </button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

            {/* Left Column */}
            <div className="xl:col-span-2 space-y-8">

              {/* Personal Info Box */}
              <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 lg:p-8 shadow-sm`}>
                <div className={`flex items-center gap-2 mb-6 pb-4 border-b ${theme.border}`}>
                  <User size={20} className="text-slate-900" />
                  <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-x-8">
                  {[
                    { label: "Full Name", name: "username", icon: User, type: "text", placeholder: "e.g. Jonathan Smith" },
                    { label: "Email Address", name: "email", icon: Mail, type: "email", placeholder: "j.smith@enterprise.com" },
                    { label: "Phone Number", name: "phoneNumber", icon: Phone, type: "text", placeholder: "+1 (555) 000-0000" },
                    { label: "Change Password (Optional)", name: "password", icon: Lock, type: "password", placeholder: "Leave blank to keep current" }
                  ].map((field) => (
                    <div key={field.name} className="flex flex-col gap-2 mb-6">
                      <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>{field.label}</label>
                      <div className="relative flex items-center">
                        <field.icon size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />
                        <input
                          type={field.type}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          placeholder={field.placeholder}
                          className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg pl-11 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
                        />
                      </div>
                    </div>
                  ))}

                  {/* Gender */}
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
                        {["Male","Female","Non-binary","Prefer not to say"].map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employment Details Box */}
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
                      {["Engineering","HR","Marketing","Sales","Operations","Finance"].map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className={`block text-[11px] font-bold uppercase tracking-wide ${theme.textMuted} mb-3`}>Employment Type</label>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {["Full-time","Part-time","Contract"].map((type) => (
                      <div
                        key={type}
                        onClick={() => handleEmploymentSelect(type)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center ${formData.employment === type ? 'border-black bg-zinc-50 shadow-md' : `${theme.border} hover:border-zinc-400`}`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.employment === type ? 'border-black' : theme.border}`}>
                          {formData.employment === type && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                        </div>
                        <span className="text-sm font-bold text-slate-900 ml-3">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="space-y-8">
              
              {/* Profile Photo Box */}
              <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 lg:p-8 shadow-sm`}>
                <div className={`flex items-center gap-2 mb-6 pb-4 border-b ${theme.border}`}>
                  <Camera size={20} className="text-slate-900" />
                  <h2 className="text-lg font-bold text-slate-900">Profile Photo</h2>
                </div>
                <label className={`border-2 border-dashed ${preview ? 'border-black' : theme.border} rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-black hover:bg-zinc-50 transition-all cursor-pointer relative overflow-hidden min-h-62.5`}>
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

              {/* Onboarding Badge */}
              <div className="bg-linear-to-br from-zinc-800 to-black rounded-xl p-8 text-white shadow-xl shadow-black/20 relative overflow-hidden flex flex-col justify-center">
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <ShieldCheck size={32} className="text-zinc-400 mb-5 relative z-10" />
                <h3 className="text-lg font-bold mb-3 relative z-10">Update Protocol</h3>
                <p className="text-sm text-zinc-400 relative z-10 mb-8 leading-relaxed flex-1">
                  Modifying this profile logs changes in the enterprise audit trail. Security protocols remain active for this user account.
                </p>
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest border-t border-zinc-700/50 pt-5 relative z-10 mt-auto">
                  <span className="text-zinc-400">Status</span>
                  <span className="text-blue-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                    Verified
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

export default UpdateEmployee;