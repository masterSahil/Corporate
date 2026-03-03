import React, { useState } from "react";
import { Menu, ShieldCheck, User, UploadCloud, Mail, Phone, Calendar, Briefcase, Users, Camera, Shield } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { theme } from "../../components/theme";

/*  Reusable Components  */

const Card = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 lg:p-8 shadow-sm ${className}`}>
    {title && (
      <div className={`flex items-center gap-2 mb-6 pb-4 border-b ${theme.border}`}>
        {Icon && <Icon size={20} className="text-slate-900" />}
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
    )}
    {children}
  </div>
);

const Input = ({ label, type = "text", icon: Icon, rightElement, ...props }) => (
  <div className="flex flex-col gap-2 mb-6">
    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>
      {label}
    </label>
    <div className="relative flex items-center">
      {Icon && <Icon size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />}
      <input
        type={type}
        placeholder="******"
        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg ${Icon ? 'pl-11' : 'pl-4'} ${rightElement ? 'pr-11' : 'pr-4'} py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all`}
        {...props}
      />
      {rightElement && <div className="absolute right-4">{rightElement}</div>}
    </div>
  </div>
);

const Select = ({ label, icon: Icon, options, ...props }) => (
  <div className="flex flex-col gap-2 mb-6">
    <label className={`text-[11px] font-bold uppercase tracking-wide ${theme.textMuted}`}>
      {label}
    </label>
    <div className="relative flex items-center">
      {Icon && <Icon size={18} className={`absolute left-4 ${theme.textMuted} pointer-events-none`} />}
      <select
        className={`w-full bg-zinc-50 border ${theme.border} text-slate-900 text-sm rounded-lg ${Icon ? 'pl-11' : 'pl-4'} pr-10 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none cursor-pointer`}
        {...props}
      >
        <option value="" disabled hidden>Select an option</option>
        {options.map((opt, i) => (
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
);

const ImageDropzone = ({ onFileSelect }) => {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onFileSelect(file);
    }
  };

  return (
    <Card title="Profile Photo" icon={Camera}>
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
    </Card>
  );
};

/* Main Component */

const AddEmployee = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const handleChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });
  const handleTypeSelect = (type) => setFormData({ ...formData, employmentType: type });

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

        <div className="p-6 max-w-7xl mx-auto">
          
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
              
              <Card title="Personal Information" icon={User}>
                <div className="grid md:grid-cols-2 gap-x-8">
                  <Input label="Full Name" icon={User} value={formData.fullName} onChange={handleChange("fullName")} placeholder="e.g. Jonathan Smith" />
                  <Input label="Email Address" type="email" icon={Mail} value={formData.email} onChange={handleChange("email")} placeholder="j.smith@enterprise.com" />
                  <Input label="Phone Number" icon={Phone} value={formData.phone} onChange={handleChange("phone")} placeholder="+1 (555) 000-0000" />
                  <Input label="Password" type="password" icon={Shield} value={formData.password} onChange={handleChange("password")} />
                  
                  {/* Gender spans 1 column in md view */}
                  <div className="md:col-span-1">
                    <Select 
                      label="Gender" 
                      icon={Users} 
                      value={formData.gender} 
                      onChange={handleChange("gender")} 
                      options={["Male", "Female", "Non-binary", "Prefer not to say"]} 
                    />
                  </div>
                </div>
              </Card>

              <Card title="Employment Details" icon={Briefcase}>
                <div className="mb-2">
                  <Select 
                    label="Department" 
                    icon={Briefcase} 
                    value={formData.department} 
                    onChange={handleChange("department")} 
                    options={["Engineering", "Human Resources", "Marketing", "Sales", "Operations", "Finance"]} 
                  />
                </div>

                <div className="mt-2">
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
              </Card>

            </div>

            {/* Right Column: Image & Security Info */}
            <div className="space-y-8">
              
              <ImageDropzone onFileSelect={(file) => setFormData({ ...formData, profileImage: file })} />

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